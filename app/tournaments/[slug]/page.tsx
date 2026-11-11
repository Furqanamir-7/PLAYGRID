import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { TournamentBracket } from "@/components/bracket/TournamentBracket";
import { StandingsTable } from "@/components/standings/StandingsTable";
import { getDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { formatMatchDate, formatPKR, formatShortDate } from "@/lib/formatters";
import { 
  Trophy, 
  Calendar, 
  MapPin, 
  Shield, 
  Award, 
  AlertTriangle, 
  CheckCircle2, 
  Users, 
  Clock, 
  ArrowRight,
  Flame
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TournamentDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const user = await getCurrentUser();
  const db = getDb();
  const { slug } = await params;
  const { tab = "overview" } = await searchParams;

  const tournament = db.tournaments.find((t) => t.slug === slug);
  if (!tournament) notFound();

  const city = db.cities.find((c) => c.id === tournament.cityId);
  const sport = db.sports.find((s) => s.id === tournament.sportId);
  const allocatedVenues = db.tournamentVenues
    .filter((tv) => tv.tournamentId === tournament.id)
    .map((tv) => db.venues.find((v) => v.id === tv.venueId))
    .filter(Boolean);

  // Teams registered in this tournament
  const registrations = db.registrations.filter((r) => r.tournamentId === tournament.id);
  const approvedTeams = registrations
    .filter((r) => r.status === "APPROVED")
    .map((r) => db.teams.find((t) => t.id === r.teamId))
    .filter(Boolean);

  // Matches
  const matches = db.matches
    .filter((m) => m.tournamentId === tournament.id)
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
    .map((m) => {
      const ht = db.teams.find((t) => t.id === m.homeTeamId);
      const at = db.teams.find((t) => t.id === m.awayTeamId);
      const res = db.matchResults.find((r) => r.matchId === m.id);
      const ven = db.venues.find((v) => v.id === m.venueId);
      const stage = db.stages.find((s) => s.id === m.stageId);
      return {
        ...m,
        homeTeam: ht || { id: m.homeTeamId, name: "TBD", shortName: "TBD" },
        awayTeam: at || null,
        result: res,
        venue: ven,
        stageName: stage?.name || "Match",
        homeScore: res?.homeScore,
        awayScore: res?.awayScore,
        homePenalties: res?.homePenalties,
        awayPenalties: res?.awayPenalties,
        winnerTeamId: res?.winnerTeamId,
      };
    });

  const scheduledMatches = matches.filter((m) => m.status === "SCHEDULED");
  const completedMatches = matches.filter((m) => m.status === "COMPLETED");

  // Standings data
  const rawStandings = db.standings.filter((s) => s.tournamentId === tournament.id);
  const standingsRows = rawStandings.map((s) => {
    const t = db.teams.find((tm) => tm.id === s.teamId);
    return {
      teamId: s.teamId,
      teamName: t?.name || "Unknown Team",
      shortName: t?.shortName || "UNK",
      primaryColor: t?.primaryColor,
      played: s.played,
      won: s.won,
      drawn: s.drawn,
      lost: s.lost,
      goalsFor: s.goalsFor,
      goalsAgainst: s.goalsAgainst,
      goalDifference: s.goalDifference,
      points: s.points,
    };
  });

  // Top Scorers for this tournament
  const goalEvents = db.matchEvents.filter(
    (e) => e.eventType === "GOAL" && matches.some((m) => m.id === e.matchId)
  );

  const goalCounts: Record<string, { count: number; teamId: string }> = {};
  goalEvents.forEach((e) => {
    if (!goalCounts[e.playerId]) {
      goalCounts[e.playerId] = { count: 0, teamId: e.teamId };
    }
    goalCounts[e.playerId].count++;
  });

  const topScorers = Object.entries(goalCounts)
    .map(([playerId, data]) => {
      const p = db.players.find((pl) => pl.id === playerId);
      const tm = db.teams.find((t) => t.id === data.teamId);
      return {
        player: p,
        team: tm,
        goals: data.count,
      };
    })
    .sort((a, b) => b.goals - a.goals);

  // Discipline: Cards
  const cardEvents = db.matchEvents.filter(
    (e) => (e.eventType === "YELLOW_CARD" || e.eventType === "RED_CARD") && matches.some((m) => m.id === e.matchId)
  );

  // Champion (if completed knockout)
  let championTeam: any = null;
  if (tournament.format === "KNOCKOUT" && tournament.status === "COMPLETED") {
    const finalM = matches.find((m) => m.stageName.toLowerCase().includes("final"));
    if (finalM?.winnerTeamId) {
      championTeam = db.teams.find((t) => t.id === finalM.winnerTeamId);
    }
  }

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "fixtures", label: `Fixtures (${scheduledMatches.length})` },
    { id: "results", label: `Results (${completedMatches.length})` },
    { id: "standings", label: "Standings" },
    ...(tournament.format !== "LEAGUE" ? [{ id: "bracket", label: "Bracket" }] : []),
    { id: "scorers", label: "Top Scorers" },
    { id: "discipline", label: "Discipline" },
    { id: "teams", label: `Teams (${approvedTeams.length})` },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)]">
      <Navbar user={user} />

      {/* Header Banner */}
      <section className="border-b border-[var(--border)] bg-gradient-to-b from-[var(--surface-2)] to-[var(--bg)] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[var(--plum-900)] text-[var(--plum-100)] border border-[var(--plum-700)]">
                  {tournament.format.replace("_", " ")}
                </span>
                <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[var(--plum-300)]" />
                  {city?.name}, {city?.province}
                </span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold text-white font-['Space_Grotesk']">
                {tournament.name}
              </h1>
            </div>

            {tournament.status === "REGISTRATION_OPEN" && (
              <Link
                href="/register"
                className="px-6 py-3 rounded-xl bg-[var(--plum-500)] hover:bg-[var(--plum-300)] hover:text-[var(--bg)] text-white text-sm font-bold transition-all shadow-lg"
              >
                Register Your Team
              </Link>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-4 text-xs text-[var(--text-muted)] border-t border-[var(--border)]">
            <div>
              <span className="text-[10px] uppercase block">Dates</span>
              <strong className="text-white">{formatShortDate(tournament.startDate)} – {formatShortDate(tournament.endDate)}</strong>
            </div>
            <div>
              <span className="text-[10px] uppercase block">Prize Pool</span>
              <strong className="text-[var(--plum-300)]">{formatPKR(tournament.prizePoolPkr)}</strong>
            </div>
            <div>
              <span className="text-[10px] uppercase block">Entry Fee</span>
              <strong className="text-white">{formatPKR(tournament.entryFeePkr)}</strong>
            </div>
            <div>
              <span className="text-[10px] uppercase block">Squad Requirements</span>
              <strong className="text-white">{tournament.minSquadSize} – {tournament.maxSquadSize} Players</strong>
            </div>
            <div>
              <span className="text-[10px] uppercase block">Registered Squads</span>
              <strong className="text-white">{approvedTeams.length} / {tournament.maxTeams} Teams</strong>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Navigation */}
      <section className="border-b border-[var(--border)] bg-[var(--surface)] sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto py-2">
            {tabs.map((t) => (
              <Link
                key={t.id}
                href={`/tournaments/${tournament.slug}?tab=${t.id}`}
                className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider shrink-0 transition-colors ${
                  tab === t.id
                    ? "bg-[var(--plum-500)] text-white shadow-sm"
                    : "text-[var(--text-muted)] hover:text-white hover:bg-[var(--surface-2)]"
                }`}
              >
                {t.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Main Tab Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">
        {/* TAB 1: OVERVIEW */}
        {tab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-4">
                <h3 className="text-xl font-bold text-white font-['Space_Grotesk']">
                  About the Championship
                </h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed whitespace-pre-line">
                  {tournament.description}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-[var(--border)] text-xs">
                  <div>
                    <span className="text-[10px] uppercase text-[var(--text-muted)] block">Format</span>
                    <strong className="text-white">{tournament.format.replace("_", " ")}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-[var(--text-muted)] block">Sport & Rules</span>
                    <strong className="text-white">5v5 Futsal (Rolling Subs)</strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-[var(--text-muted)] block">Match Duration</span>
                    <strong className="text-white">2 Halves × 20 Mins</strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-[var(--text-muted)] block">Points Allocation</span>
                    <strong className="text-white">Win: 3 · Draw: 1 · Loss: 0</strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-[var(--text-muted)] block">Registration Deadline</span>
                    <strong className="text-[var(--warning)]">{formatShortDate(tournament.registrationDeadline)}</strong>
                  </div>
                </div>
              </div>

              {/* Venues Allocated */}
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-4">
                <h3 className="text-lg font-bold text-white font-['Space_Grotesk'] flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[var(--plum-300)]" />
                  Official Venues
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {allocatedVenues.map((v: any) => (
                    <div
                      key={v.id}
                      className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] space-y-1.5"
                    >
                      <h4 className="font-bold text-white text-sm">{v.name}</h4>
                      <p className="text-xs text-[var(--text-muted)]">{v.address}</p>
                      <div className="flex items-center gap-2 text-[10px] text-[var(--plum-300)] font-semibold pt-1">
                        <span className="capitalize">{v.surfaceType.replace("_", " ")}</span>
                        <span>·</span>
                        <span>{v.hasFloodlights ? "Night Floodlights" : "Daylight Only"}</span>
                        <span>·</span>
                        <span>Cap: {v.capacity}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Side summary card */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-4">
                <h4 className="text-base font-bold text-white font-['Space_Grotesk']">
                  Tournament Status
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--text-muted)]">Current Phase:</span>
                    <span className="font-bold text-[var(--plum-300)]">{tournament.status}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--text-muted)]">Matches Scheduled:</span>
                    <span className="font-bold text-white">{scheduledMatches.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--text-muted)]">Matches Completed:</span>
                    <span className="font-bold text-white">{completedMatches.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--text-muted)]">Approved Clubs:</span>
                    <span className="font-bold text-white">{approvedTeams.length} / {tournament.maxTeams}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-[var(--border)]">
                  <Link
                    href={`/tournaments/${tournament.slug}?tab=standings`}
                    className="block w-full text-center py-2.5 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--plum-900)] text-xs font-bold text-white border border-[var(--border)] transition-colors"
                  >
                    View Live Points Table
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: FIXTURES */}
        {tab === "fixtures" && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white font-['Space_Grotesk']">
              Upcoming Fixtures
            </h3>
            {scheduledMatches.length === 0 ? (
              <div className="text-center py-12 text-[var(--text-muted)]">
                All scheduled matches for this tournament have been completed or are pending generation.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {scheduledMatches.map((m) => (
                  <Link
                    key={m.id}
                    href={`/matches/${m.id}`}
                    className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)] transition-all space-y-3"
                  >
                    <div className="flex items-center justify-between text-[11px] text-[var(--plum-300)] font-semibold">
                      <span>Round {m.roundNumber} · {m.stageName}</span>
                      <span>{formatMatchDate(m.scheduledAt)}</span>
                    </div>

                    <div className="flex items-center justify-between font-bold text-white text-sm">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: m.homeTeam?.primaryColor || "#8E4585" }}
                        />
                        <span>{m.homeTeam?.name}</span>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded bg-[var(--surface-2)] text-[var(--text-muted)] font-normal">
                        VS
                      </span>
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: m.awayTeam?.primaryColor || "#5E2A59" }}
                        />
                        <span>{m.awayTeam?.name}</span>
                      </div>
                    </div>

                    <div className="text-[11px] text-[var(--text-muted)] flex items-center gap-1 border-t border-[var(--border)] pt-2">
                      <MapPin className="w-3 h-3 text-[var(--plum-300)]" />
                      {m.venue?.name}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: RESULTS */}
        {tab === "results" && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white font-['Space_Grotesk']">
              Completed Match Results
            </h3>
            {completedMatches.length === 0 ? (
              <div className="text-center py-12 text-[var(--text-muted)]">
                No matches have been completed in this tournament yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {completedMatches.map((m) => (
                  <Link
                    key={m.id}
                    href={`/matches/${m.id}`}
                    className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)] transition-all space-y-3"
                  >
                    <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                      <span>Round {m.roundNumber} · {m.stageName}</span>
                      <span className="px-2 py-0.5 rounded bg-[var(--surface-2)] text-white font-bold text-[10px]">
                        FT
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm font-bold text-white">
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: m.homeTeam?.primaryColor || "#8E4585" }}
                        />
                        <span className="truncate">{m.homeTeam?.name}</span>
                      </div>
                      <div className="px-3 py-1 rounded bg-[var(--bg)] border border-[var(--border)] text-[var(--plum-300)] text-base font-extrabold tabular-nums shrink-0 mx-2">
                        {m.result?.homeScore} - {m.result?.awayScore}
                      </div>
                      <div className="flex items-center gap-2 truncate text-right">
                        <span className="truncate">{m.awayTeam?.name}</span>
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: m.awayTeam?.primaryColor || "#5E2A59" }}
                        />
                      </div>
                    </div>

                    {m.result?.homePenalties != null && (
                      <div className="text-[10px] text-center text-[var(--plum-300)] font-semibold">
                        Penalties: {m.result.homePenalties} - {m.result.awayPenalties}
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: STANDINGS */}
        {tab === "standings" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white font-['Space_Grotesk']">
                Standings & Form Table
              </h3>
              <span className="text-xs text-[var(--text-muted)]">
                Ranked: Points → Goal Difference → Goals Scored → Alphabetical
              </span>
            </div>
            {standingsRows.length === 0 ? (
              <div className="text-center py-12 text-[var(--text-muted)]">
                No standings data available for this tournament yet.
              </div>
            ) : (
              <StandingsTable standings={standingsRows} tournamentName={tournament.name} />
            )}
          </div>
        )}

        {/* TAB 5: BRACKET */}
        {tab === "bracket" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white font-['Space_Grotesk']">
                Knockout Bracket
              </h3>
              <span className="text-xs text-[var(--text-muted)]">
                Automatic Progression with Penalty Shootout Support
              </span>
            </div>
            <TournamentBracket matches={matches as any} championTeam={championTeam} />
          </div>
        )}

        {/* TAB 6: TOP SCORERS */}
        {tab === "scorers" && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white font-['Space_Grotesk']">
              Top Scorers (Golden Boot)
            </h3>
            {topScorers.length === 0 ? (
              <div className="text-center py-12 text-[var(--text-muted)]">
                No goals recorded in this tournament yet.
              </div>
            ) : (
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[var(--surface-2)] text-[11px] uppercase font-bold text-[var(--text-muted)] border-b border-[var(--border)]">
                    <tr>
                      <th className="py-3 px-4 w-12 text-center">Rank</th>
                      <th className="py-3 px-4">Player</th>
                      <th className="py-3 px-4">Club</th>
                      <th className="py-3 px-4">Position</th>
                      <th className="py-3 px-4 text-center font-extrabold text-[var(--plum-300)]">Goals</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)] font-medium">
                    {topScorers.map((s, idx) => (
                      <tr key={idx} className="hover:bg-[var(--surface-2)]/60 transition-colors">
                        <td className="py-3 px-4 text-center font-bold text-white">{idx + 1}</td>
                        <td className="py-3 px-4 font-bold text-white">{s.player?.fullName}</td>
                        <td className="py-3 px-4 text-[var(--text-muted)]">{s.team?.name}</td>
                        <td className="py-3 px-4 text-xs uppercase text-[var(--plum-300)]">{s.player?.preferredPosition}</td>
                        <td className="py-3 px-4 text-center font-extrabold text-[var(--plum-300)] text-base tabular-nums">
                          {s.goals}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 7: DISCIPLINE */}
        {tab === "discipline" && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white font-['Space_Grotesk']">
              Disciplinary Record
            </h3>
            {cardEvents.length === 0 ? (
              <div className="text-center py-12 text-[var(--text-muted)]">
                No cards or infractions recorded in this tournament. Fair play!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cardEvents.map((e) => {
                  const p = db.players.find((pl) => pl.id === e.playerId);
                  const t = db.teams.find((tm) => tm.id === e.teamId);
                  const isRed = e.eventType === "RED_CARD";

                  return (
                    <div
                      key={e.id}
                      className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-4 h-6 rounded-sm ${
                            isRed ? "bg-[var(--danger)]" : "bg-[var(--warning)]"
                          }`}
                        />
                        <div>
                          <div className="text-sm font-bold text-white">{p?.fullName}</div>
                          <div className="text-xs text-[var(--text-muted)]">{t?.name}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-semibold text-white">Min {e.minute}'</div>
                        <div className="text-[10px] text-[var(--text-muted)] capitalize">{e.notes || e.eventType}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 8: TEAMS */}
        {tab === "teams" && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white font-['Space_Grotesk']">
              Participating Teams & Squads
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {approvedTeams.map((team: any) => {
                const squad = db.teamPlayers
                  .filter((tp) => tp.tournamentId === tournament.id && tp.teamId === team.id)
                  .map((tp) => ({
                    ...tp,
                    player: db.players.find((p) => p.id === tp.playerId),
                  }));

                return (
                  <Link
                    key={team.id}
                    href={`/teams/${team.id}`}
                    className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)] hover:border-[var(--plum-500)] transition-all space-y-3 group"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: team.primaryColor || "#8E4585" }}
                      />
                      <span className="text-xs px-2 py-0.5 rounded bg-[var(--surface-2)] text-[var(--plum-300)] font-bold">
                        {team.shortName}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-white text-base group-hover:text-[var(--plum-300)] transition-colors">
                        {team.name}
                      </h4>
                      <p className="text-xs text-[var(--text-muted)]">
                        {squad.length} Players Rostered
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between text-[11px] text-[var(--plum-100)]">
                      <span>View Full Squad</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

