import { PrismaClient } from "@prisma/client";
import { generateSeedData, DBData } from "./mock-data";

declare global {
  // eslint-disable-next-line no-var
  var prismaClient: PrismaClient | undefined;
  // eslint-disable-next-line no-var
  var inMemoryDb: DBData | undefined;
}

export const prisma =
  globalThis.prismaClient ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaClient = prisma;
}

if (!globalThis.inMemoryDb) {
  globalThis.inMemoryDb = generateSeedData();
}

export function getDb(): DBData {
  if (!globalThis.inMemoryDb) {
    globalThis.inMemoryDb = generateSeedData();
  }
  return globalThis.inMemoryDb;
}

export function resetDb(): DBData {
  globalThis.inMemoryDb = generateSeedData();
  return globalThis.inMemoryDb;
}

// Database helper functions that mirror SQL stored procedures and triggers
export const dbService = {
  // Standings update simulation (Trigger trg_update_standings)
  recordMatchResult(params: {
    matchId: string;
    homeScore: number;
    awayScore: number;
    homePenalties?: number | null;
    awayPenalties?: number | null;
    homeFouls: number;
    awayFouls: number;
    manOfTheMatchPlayerId?: string | null;
    recordedById: string;
    events?: Array<{
      teamId: string;
      playerId: string;
      eventType: "GOAL" | "OWN_GOAL" | "YELLOW_CARD" | "RED_CARD" | "FOUL";
      minute: number;
      notes?: string;
    }>;
  }) {
    const db = getDb();
    const match = db.matches.find((m) => m.id === params.matchId);
    if (!match) throw new Error("Match not found");

    // Determine winner
    let winnerTeamId: string | null = null;
    if (params.homeScore > params.awayScore) {
      winnerTeamId = match.homeTeamId;
    } else if (params.awayScore > params.homeScore) {
      winnerTeamId = match.awayTeamId;
    } else if (params.homePenalties != null && params.awayPenalties != null) {
      winnerTeamId = params.homePenalties > params.awayPenalties ? match.homeTeamId : match.awayTeamId;
    }

    // Upsert MatchResult
    const existingIdx = db.matchResults.findIndex((r) => r.matchId === params.matchId);
    const resultObj = {
      matchId: params.matchId,
      homeScore: params.homeScore,
      awayScore: params.awayScore,
      homePenalties: params.homePenalties || null,
      awayPenalties: params.awayPenalties || null,
      winnerTeamId,
      homeFouls: params.homeFouls,
      awayFouls: params.awayFouls,
      manOfTheMatchPlayerId: params.manOfTheMatchPlayerId || null,
      recordedById: params.recordedById,
      recordedAt: new Date(),
    };

    if (existingIdx >= 0) {
      db.matchResults[existingIdx] = resultObj;
    } else {
      db.matchResults.push(resultObj);
    }

    match.status = "COMPLETED";

    // Add match events if provided
    if (params.events && params.events.length > 0) {
      params.events.forEach((evt, idx) => {
        db.matchEvents.push({
          id: `evt_dyn_${Date.now()}_${idx}`,
          matchId: params.matchId,
          teamId: evt.teamId,
          playerId: evt.playerId,
          eventType: evt.eventType,
          minute: evt.minute,
          notes: evt.notes || null,
        });
      });
    }

    // Trigger: Advance Knockout Winner
    if (match.nextMatchId && winnerTeamId) {
      const nextMatch = db.matches.find((m) => m.id === match.nextMatchId);
      if (nextMatch) {
        if (match.nextMatchSlot === "HOME") {
          nextMatch.homeTeamId = winnerTeamId;
        } else {
          nextMatch.awayTeamId = winnerTeamId;
        }
      }
    }

    // Trigger: Recalculate Standings
    this.recalculateStandings(match.tournamentId);

    // Trigger: Audit Log
    db.auditLogs.unshift({
      id: `aud_${Date.now()}`,
      userId: params.recordedById,
      action: "RECORD_RESULT",
      entity: "matches",
      entityId: params.matchId,
      details: {
        homeScore: params.homeScore,
        awayScore: params.awayScore,
        winnerTeamId,
      },
      createdAt: new Date(),
    });

    return resultObj;
  },

  recalculateStandings(tournamentId: string) {
    const db = getDb();
    const tournament = db.tournaments.find((t) => t.id === tournamentId);
    if (!tournament) return;

    // Filter relevant non-knockout stages
    const nonKnockoutStages = db.stages
      .filter((s) => s.tournamentId === tournamentId && !s.isKnockout)
      .map((s) => s.id);

    const relevantMatches = db.matches.filter(
      (m) =>
        m.tournamentId === tournamentId &&
        nonKnockoutStages.includes(m.stageId) &&
        m.status === "COMPLETED"
    );

    // Reset standings
    const tournStandings = db.standings.filter((s) => s.tournamentId === tournamentId);
    tournStandings.forEach((s) => {
      s.played = 0;
      s.won = 0;
      s.drawn = 0;
      s.lost = 0;
      s.goalsFor = 0;
      s.goalsAgainst = 0;
      s.goalDifference = 0;
      s.points = 0;
    });

    relevantMatches.forEach((m) => {
      const res = db.matchResults.find((r) => r.matchId === m.id);
      if (!res) return;

      let homeStanding = tournStandings.find((s) => s.teamId === m.homeTeamId);
      if (!homeStanding) {
        homeStanding = {
          tournamentId,
          teamId: m.homeTeamId,
          groupId: m.groupId,
          played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          goalDifference: 0,
          points: 0,
        };
        db.standings.push(homeStanding);
        tournStandings.push(homeStanding);
      }

      let awayStanding = m.awayTeamId ? tournStandings.find((s) => s.teamId === m.awayTeamId) : null;
      if (!awayStanding && m.awayTeamId) {
        awayStanding = {
          tournamentId,
          teamId: m.awayTeamId,
          groupId: m.groupId,
          played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          goalDifference: 0,
          points: 0,
        };
        db.standings.push(awayStanding);
        tournStandings.push(awayStanding);
      }

      if (homeStanding) {
        homeStanding.played++;
        homeStanding.goalsFor += res.homeScore;
        homeStanding.goalsAgainst += res.awayScore;
        if (res.homeScore > res.awayScore) {
          homeStanding.won++;
          homeStanding.points += 3;
        } else if (res.homeScore === res.awayScore) {
          homeStanding.drawn++;
          homeStanding.points += 1;
        } else {
          homeStanding.lost++;
        }
        homeStanding.goalDifference = homeStanding.goalsFor - homeStanding.goalsAgainst;
      }

      if (awayStanding) {
        awayStanding.played++;
        awayStanding.goalsFor += res.awayScore;
        awayStanding.goalsAgainst += res.homeScore;
        if (res.awayScore > res.homeScore) {
          awayStanding.won++;
          awayStanding.points += 3;
        } else if (res.homeScore === res.awayScore) {
          awayStanding.drawn++;
          awayStanding.points += 1;
        } else {
          awayStanding.lost++;
        }
        awayStanding.goalDifference = awayStanding.goalsFor - awayStanding.goalsAgainst;
      }
    });
  },

  // Stored Procedure sp_approve_registration
  approveRegistration(registrationId: string, adminId: string) {
    const db = getDb();
    const reg = db.registrations.find((r) => r.id === registrationId);
    if (!reg) throw new Error("Registration not found");

    const tournament = db.tournaments.find((t) => t.id === reg.tournamentId);
    if (!tournament) throw new Error("Tournament not found");

    const approvedCount = db.registrations.filter(
      (r) => r.tournamentId === reg.tournamentId && r.status === "APPROVED"
    ).length;

    // Trigger: Check Registration Capacity
    if (approvedCount >= tournament.maxTeams) {
      throw new Error(`Tournament capacity reached! Maximum allowed teams is ${tournament.maxTeams}`);
    }

    reg.status = "APPROVED";
    reg.reviewedById = adminId;
    reg.reviewedAt = new Date();
    reg.rejectionReason = null;

    // Ensure standings row exists
    let standing = db.standings.find(
      (s) => s.tournamentId === reg.tournamentId && s.teamId === reg.teamId
    );
    if (!standing) {
      standing = {
        tournamentId: reg.tournamentId,
        teamId: reg.teamId,
        groupId: null,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0,
      };
      db.standings.push(standing);
    }

    db.auditLogs.unshift({
      id: `aud_${Date.now()}`,
      userId: adminId,
      action: "APPROVE_REGISTRATION",
      entity: "registrations",
      entityId: registrationId,
      details: { tournamentId: reg.tournamentId, teamId: reg.teamId },
      createdAt: new Date(),
    });

    return reg;
  },

  // Trigger trg_check_squad_limit
  addPlayerToSquad(params: {
    tournamentId: string;
    teamId: string;
    playerId: string;
    jerseyNumber: number;
    isCaptain?: boolean;
  }) {
    const db = getDb();
    const tournament = db.tournaments.find((t) => t.id === params.tournamentId);
    if (!tournament) throw new Error("Tournament not found");

    const currentSquad = db.teamPlayers.filter(
      (tp) => tp.tournamentId === params.tournamentId && tp.teamId === params.teamId
    );

    if (currentSquad.length >= tournament.maxSquadSize) {
      throw new Error(
        `Squad limit reached! Maximum permitted squad size for this tournament is ${tournament.maxSquadSize}`
      );
    }

    // Constraint check: unique jersey in squad
    const duplicateJersey = currentSquad.find((tp) => tp.jerseyNumber === params.jerseyNumber);
    if (duplicateJersey) {
      throw new Error(`Jersey #${params.jerseyNumber} is already taken in this tournament squad`);
    }

    // Constraint check: player cannot play for another team in the same tournament
    const playerInOtherTeam = db.teamPlayers.find(
      (tp) => tp.tournamentId === params.tournamentId && tp.playerId === params.playerId
    );
    if (playerInOtherTeam) {
      throw new Error("A player can play for only one team per tournament");
    }

    const tpObj = {
      id: `tp_${Date.now()}`,
      teamId: params.teamId,
      playerId: params.playerId,
      tournamentId: params.tournamentId,
      jerseyNumber: params.jerseyNumber,
      isCaptain: !!params.isCaptain,
      joinedAt: new Date(),
    };

    db.teamPlayers.push(tpObj);
    return tpObj;
  },

  // Generate round-robin fixtures (Function fn_generate_round_robin)
  generateRoundRobinFixtures(tournamentId: string, doubleRound = false) {
    const db = getDb();
    const tournament = db.tournaments.find((t) => t.id === tournamentId);
    if (!tournament) throw new Error("Tournament not found");

    const approvedRegs = db.registrations.filter(
      (r) => r.tournamentId === tournamentId && r.status === "APPROVED"
    );
    const teamIds = approvedRegs.map((r) => r.teamId);
    if (teamIds.length < 2) throw new Error("Need at least 2 approved teams to generate fixtures");

    // Clear existing scheduled matches if not completed
    db.matches = db.matches.filter(
      (m) => !(m.tournamentId === tournamentId && m.status === "SCHEDULED")
    );

    const stage = db.stages.find((s) => s.tournamentId === tournamentId && !s.isKnockout);
    const stageId = stage ? stage.id : "stg_default";

    const venues = db.venues.filter((v) => v.cityId === tournament.cityId);
    const defaultVenueId = venues.length > 0 ? venues[0].id : db.venues[0].id;

    const n = teamIds.length;
    const teams = [...teamIds];
    const hasBye = n % 2 !== 0;
    if (hasBye) {
      teams.push("BYE");
    }
    const numTeams = teams.length;
    const roundsCount = numTeams - 1;
    const matchesPerRound = numTeams / 2;

    const newMatches: any[] = [];
    const baseDate = new Date(tournament.startDate);

    for (let r = 0; r < roundsCount; r++) {
      const roundDate = new Date(baseDate.getTime() + r * 7 * 24 * 60 * 60 * 1000);

      for (let m = 0; m < matchesPerRound; m++) {
        const homeIdx = (r + m) % (numTeams - 1);
        let awayIdx = (numTeams - 1 - m + r) % (numTeams - 1);
        if (m === 0) {
          awayIdx = numTeams - 1;
        }

        const home = teams[homeIdx];
        const away = teams[awayIdx];

        if (home === "BYE" || away === "BYE") continue;

        const matchTime = new Date(roundDate);
        matchTime.setHours(19 + (m % 4), 0, 0, 0);

        const mObj = {
          id: `mat_gen_${tournamentId}_r${r + 1}_m${m + 1}`,
          tournamentId,
          stageId,
          groupId: null,
          roundNumber: r + 1,
          homeTeamId: home,
          awayTeamId: away,
          venueId: venues[m % venues.length]?.id || defaultVenueId,
          scheduledAt: matchTime,
          status: "SCHEDULED",
          nextMatchId: null,
          nextMatchSlot: null,
        };
        newMatches.push(mObj);
        db.matches.push(mObj);
      }
    }

    return newMatches;
  },
};

