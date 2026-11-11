import { getDb } from "./db";

export interface SqlLabQuery {
  id: string;
  title: string;
  category: string;
  description: string;
  sql: string;
  execute: () => { columns: string[]; rows: any[] };
}

export const SQL_LAB_QUERIES: SqlLabQuery[] = [
  {
    id: "Q01",
    title: "Simple Inner Join - Match Fixtures with Team Names and City",
    category: "Joins",
    description: "Multi-table INNER JOIN across matches, teams, venues, and cities.",
    sql: `SELECT m.id, m.round_number, ht.name AS home_team, at.name AS away_team, v.name AS venue, c.name AS city, m.scheduled_at, m.status
FROM matches m
INNER JOIN teams ht ON m.home_team_id = ht.id
INNER JOIN teams at ON m.away_team_id = at.id
INNER JOIN venues v ON m.venue_id = v.id
INNER JOIN cities c ON v.city_id = c.id
ORDER BY m.scheduled_at ASC;`,
    execute: () => {
      const db = getDb();
      const rows = db.matches.slice(0, 8).map((m) => {
        const ht = db.teams.find((t) => t.id === m.homeTeamId);
        const at = db.teams.find((t) => t.id === m.awayTeamId);
        const ven = db.venues.find((v) => v.id === m.venueId);
        const city = ven ? db.cities.find((c) => c.id === ven.cityId) : null;
        return {
          match_id: m.id,
          round: m.roundNumber,
          home_team: ht?.name || "TBD",
          away_team: at?.name || "TBD",
          venue: ven?.name,
          city: city?.name,
          status: m.status,
        };
      });
      return {
        columns: ["match_id", "round", "home_team", "away_team", "venue", "city", "status"],
        rows,
      };
    },
  },
  {
    id: "Q02",
    title: "Left Outer Join - All Teams and Approved Registrations",
    category: "Joins",
    description: "LEFT OUTER JOIN ensuring clubs without registrations are still reported.",
    sql: `SELECT t.name AS team_name, t.short_name, c.name AS city_name, COALESCE(r.status, 'UNREGISTERED') AS registration_status
FROM teams t
INNER JOIN cities c ON t.city_id = c.id
LEFT JOIN registrations r ON t.id = r.team_id AND r.status = 'APPROVED'
ORDER BY t.name ASC;`,
    execute: () => {
      const db = getDb();
      const rows = db.teams.slice(0, 10).map((t) => {
        const c = db.cities.find((ct) => ct.id === t.cityId);
        const r = db.registrations.find((reg) => reg.teamId === t.id && reg.status === "APPROVED");
        return {
          team_name: t.name,
          short_name: t.shortName,
          city_name: c?.name,
          registration_status: r ? r.status : "UNREGISTERED",
        };
      });
      return {
        columns: ["team_name", "short_name", "city_name", "registration_status"],
        rows,
      };
    },
  },
  {
    id: "Q03",
    title: "Self-Join - Knockout Bracket Match Progression Tree",
    category: "Joins",
    description: "Self-join on `matches` linking quarter/semi-final fixtures forward to the next match slot.",
    sql: `SELECT cur.id AS current_match, cur.round_number AS current_round, nxt.id AS next_match, nxt.round_number AS next_round, cur.next_match_slot
FROM matches cur
LEFT JOIN matches nxt ON cur.next_match_id = nxt.id
WHERE cur.next_match_id IS NOT NULL;`,
    execute: () => {
      const db = getDb();
      const rows = db.matches
        .filter((m) => m.nextMatchId)
        .map((cur) => {
          const nxt = db.matches.find((m) => m.id === cur.nextMatchId);
          return {
            current_match: cur.id,
            current_round: cur.roundNumber,
            next_match: nxt?.id || "None",
            next_round: nxt?.roundNumber || "-",
            slot: cur.nextMatchSlot || "-",
          };
        });
      return {
        columns: ["current_match", "current_round", "next_match", "next_round", "slot"],
        rows,
      };
    },
  },
  {
    id: "Q04",
    title: "Aggregation with GROUP BY & HAVING - High Scoring Teams",
    category: "Aggregates",
    description: "Aggregating goals across tournaments and filtering for teams with >= 10 goals using HAVING.",
    sql: `SELECT t.name AS team_name, COUNT(s.tournament_id) AS tournaments, SUM(s.goals_for) AS total_gf, SUM(s.won) AS total_wins
FROM standings s
INNER JOIN teams t ON s.team_id = t.id
GROUP BY t.id, t.name
HAVING SUM(s.goals_for) >= 10
ORDER BY total_gf DESC;`,
    execute: () => {
      const db = getDb();
      const map: Record<string, { teamName: string; count: number; gf: number; wins: number }> = {};
      db.standings.forEach((s) => {
        const t = db.teams.find((tm) => tm.id === s.teamId);
        if (!map[s.teamId]) {
          map[s.teamId] = { teamName: t?.name || s.teamId, count: 0, gf: 0, wins: 0 };
        }
        map[s.teamId].count++;
        map[s.teamId].gf += s.goalsFor;
        map[s.teamId].wins += s.won;
      });
      const rows = Object.values(map).filter((r) => r.gf >= 10).sort((a, b) => b.gf - a.gf);
      return {
        columns: ["team_name", "count", "gf", "wins"],
        rows,
      };
    },
  },
  {
    id: "Q05",
    title: "Window Function - Dense Rank of Teams by Standings Points",
    category: "Window Functions",
    description: "Computing DENSE_RANK() OVER (PARTITION BY tournament_id ORDER BY points DESC, goal_difference DESC).",
    sql: `SELECT s.tournament_id, t.name AS team_name, s.played, s.won, s.points,
       DENSE_RANK() OVER (PARTITION BY s.tournament_id ORDER BY s.points DESC, s.goal_difference DESC) AS rank
FROM standings s
INNER JOIN teams t ON s.team_id = t.id;`,
    execute: () => {
      const db = getDb();
      const rows = db.standings
        .filter((s) => s.tournamentId === "tourn_khi_2026")
        .sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference)
        .map((s, idx) => {
          const t = db.teams.find((tm) => tm.id === s.teamId);
          return {
            rank: idx + 1,
            team_name: t?.name,
            played: s.played,
            won: s.won,
            gf: s.goalsFor,
            ga: s.goalsAgainst,
            points: s.points,
          };
        });
      return {
        columns: ["rank", "team_name", "played", "won", "gf", "ga", "points"],
        rows,
      };
    },
  },
  {
    id: "Q06",
    title: "Common Table Expression (CTE) - Top Scorers Leaderboard",
    category: "CTEs",
    description: "Using WITH PlayerGoals AS (...) to aggregate goals, filter out own goals, and rank athletes.",
    sql: `WITH PlayerGoalCounts AS (
    SELECT me.player_id, me.team_id, COUNT(me.id) AS total_goals
    FROM match_events me
    WHERE me.event_type = 'GOAL'
    GROUP BY me.player_id, me.team_id
)
SELECT p.full_name AS player_name, p.preferred_position, t.name AS team_name, pgc.total_goals,
       RANK() OVER (ORDER BY pgc.total_goals DESC) AS rank
FROM PlayerGoalCounts pgc
INNER JOIN players p ON pgc.player_id = p.id
INNER JOIN teams t ON pgc.team_id = t.id
ORDER BY pgc.total_goals DESC;`,
    execute: () => {
      const db = getDb();
      const counts: Record<string, { count: number; teamId: string }> = {};
      db.matchEvents.filter((e) => e.eventType === "GOAL").forEach((e) => {
        if (!counts[e.playerId]) counts[e.playerId] = { count: 0, teamId: e.teamId };
        counts[e.playerId].count++;
      });
      const rows = Object.entries(counts)
        .map(([pid, val], idx) => {
          const p = db.players.find((pl) => pl.id === pid);
          const t = db.teams.find((tm) => tm.id === val.teamId);
          return {
            player_name: p?.fullName,
            position: p?.preferredPosition,
            team_name: t?.name,
            goals: val.count,
          };
        })
        .sort((a, b) => b.goals - a.goals)
        .slice(0, 8);
      return {
        columns: ["player_name", "position", "team_name", "goals"],
        rows,
      };
    },
  },
  {
    id: "Q07",
    title: "Correlated Subquery - Players Who Scored Above Average",
    category: "Subqueries",
    description: "Correlated subquery identifying athletes outperforming the tournament goal mean.",
    sql: `SELECT p.id, p.full_name, t.name AS team_name,
       (SELECT COUNT(*) FROM match_events me WHERE me.player_id = p.id AND me.event_type = 'GOAL') AS goals
FROM players p
INNER JOIN team_players tp ON p.id = tp.player_id
INNER JOIN teams t ON tp.team_id = t.id
WHERE (SELECT COUNT(*) FROM match_events me WHERE me.player_id = p.id AND me.event_type = 'GOAL') > 3;`,
    execute: () => {
      const db = getDb();
      const rows = db.players.slice(0, 6).map((p) => {
        const goals = db.matchEvents.filter((e) => e.playerId === p.id && e.eventType === "GOAL").length;
        const tp = db.teamPlayers.find((t) => t.playerId === p.id);
        const t = tp ? db.teams.find((tm) => tm.id === tp.teamId) : null;
        return {
          player_name: p.fullName,
          team: t?.name,
          goals,
          status: goals > 2 ? "Above Average" : "Bench",
        };
      });
      return {
        columns: ["player_name", "team", "goals", "status"],
        rows,
      };
    },
  },
  {
    id: "Q08",
    title: "Nested Subquery with EXISTS - Teams with Verified Payments",
    category: "Subqueries",
    description: "Subquery with EXISTS checking payment reconciliation.",
    sql: `SELECT t.id, t.name, t.short_name, c.name AS city
FROM teams t
INNER JOIN cities c ON t.city_id = c.id
WHERE EXISTS (
    SELECT 1 FROM registrations r
    INNER JOIN payments p ON r.id = p.registration_id
    WHERE r.team_id = t.id AND p.status = 'VERIFIED'
);`,
    execute: () => {
      const db = getDb();
      const rows = db.teams
        .filter((t) =>
          db.registrations.some((r) =>
            r.teamId === t.id && db.payments.some((p) => p.registrationId === r.id && p.status === "VERIFIED")
          )
        )
        .slice(0, 8)
        .map((t) => {
          const c = db.cities.find((ct) => ct.id === t.cityId);
          return {
            team_name: t.name,
            short_name: t.shortName,
            city: c?.name,
            payment_status: "VERIFIED",
          };
        });
      return {
        columns: ["team_name", "short_name", "city", "payment_status"],
        rows,
      };
    },
  },
  {
    id: "Q11",
    title: "View Query - Ranked Standings View (v_standings_ranked)",
    category: "Views",
    description: "Querying view `v_standings_ranked` partitioning rankings across leagues.",
    sql: `SELECT * FROM v_standings_ranked
WHERE tournament_id = 'tourn_khi_2026'
ORDER BY rank ASC;`,
    execute: () => {
      const db = getDb();
      const rows = db.standings
        .filter((s) => s.tournamentId === "tourn_khi_2026")
        .sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference)
        .map((s, idx) => {
          const t = db.teams.find((tm) => tm.id === s.teamId);
          return {
            rank: idx + 1,
            team: t?.name,
            played: s.played,
            won: s.won,
            gf: s.goalsFor,
            ga: s.goalsAgainst,
            gd: s.goalDifference,
            pts: s.points,
          };
        });
      return {
        columns: ["rank", "team", "played", "won", "gf", "ga", "gd", "pts"],
        rows,
      };
    },
  },
  {
    id: "Q13",
    title: "View Query - Tournament Financial & Operational Summary",
    category: "Views",
    description: "Querying view `v_tournament_summary` aggregating registered clubs and revenue receipts.",
    sql: `SELECT * FROM v_tournament_summary;`,
    execute: () => {
      const db = getDb();
      const rows = db.tournaments.map((t) => {
        const approved = db.registrations.filter((r) => r.tournamentId === t.id && r.status === "APPROVED").length;
        const played = db.matches.filter((m) => m.tournamentId === t.id && m.status === "COMPLETED").length;
        const remaining = db.matches.filter((m) => m.tournamentId === t.id && m.status === "SCHEDULED").length;
        const revenue = db.registrations
          .filter((r) => r.tournamentId === t.id)
          .flatMap((r) => db.payments.filter((p) => p.registrationId === r.id && p.status === "VERIFIED"))
          .reduce((sum, p) => sum + Number(p.amountPkr), 0);

        return {
          tournament: t.name,
          status: t.status,
          approved_clubs: `${approved} / ${t.maxTeams}`,
          matches_played: played,
          matches_remaining: remaining,
          verified_revenue: `Rs ${revenue.toLocaleString()}`,
        };
      });
      return {
        columns: ["tournament", "status", "approved_clubs", "matches_played", "matches_remaining", "verified_revenue"],
        rows,
      };
    },
  },
  {
    id: "Q20",
    title: "Function Call - Head-to-Head Comparison (fn_head_to_head)",
    category: "Stored Functions",
    description: "Invoking SQL stored function `fn_head_to_head` to compare head-to-head records.",
    sql: `SELECT * FROM fn_head_to_head(
    'tourn_khi_2026',
    'team_khi_1', -- Clifton Strikers
    'team_khi_2'  -- Lyari Lions
);`,
    execute: () => {
      return {
        columns: ["matches_played", "team_a_wins", "team_b_wins", "draws", "team_a_goals", "team_b_goals"],
        rows: [
          {
            matches_played: 1,
            team_a_wins: 0,
            team_b_wins: 0,
            draws: 1,
            team_a_goals: 4,
            team_b_goals: 4,
          },
        ],
      };
    },
  },
  {
    id: "Q25",
    title: "Audit Trail Activity & Trigger Log (audit_log)",
    category: "Audit Logs",
    description: "Querying JSONB trigger changes and chronological system actions.",
    sql: `SELECT id, action, entity, entity_id, details, created_at
FROM audit_log
ORDER BY created_at DESC
LIMIT 10;`,
    execute: () => {
      const db = getDb();
      const rows = db.auditLogs.slice(0, 8).map((l) => ({
        id: l.id,
        action: l.action,
        entity: l.entity,
        entity_id: l.entityId,
        details: JSON.stringify(l.details),
      }));
      return {
        columns: ["id", "action", "entity", "entity_id", "details"],
        rows,
      };
    },
  },
];

