import React from "react";
import Link from "next/link";
import { getDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { formatMatchDate } from "@/lib/formatters";
import { MatchesClientList } from "@/components/admin/MatchesClientList";
import { Calendar, Filter, Plus, Shield } from "lucide-react";


export default async function AdminMatchesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; tournamentId?: string }>;
}) {
  const user = await getCurrentUser();
  const db = getDb();
  const params = await searchParams;

  const matches = db.matches
    .filter((m) => {
      if (params.status && m.status !== params.status) return false;
      if (params.tournamentId && m.tournamentId !== params.tournamentId) return false;
      return true;
    })
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
    .map((m) => {
      const ht = db.teams.find((t) => t.id === m.homeTeamId);
      const at = db.teams.find((t) => t.id === m.awayTeamId);
      const ven = db.venues.find((v) => v.id === m.venueId);
      const tourn = db.tournaments.find((t) => t.id === m.tournamentId);
      const stage = db.stages.find((s) => s.id === m.stageId);
      const res = db.matchResults.find((r) => r.matchId === m.id);

      // Home & Away Players for modal picker
      const homeSquad = db.teamPlayers
        .filter((tp) => tp.teamId === m.homeTeamId)
        .map((tp) => ({
          ...tp,
          fullName: db.players.find((p) => p.id === tp.playerId)?.fullName || "Player",
        }));

      const awaySquad = db.teamPlayers
        .filter((tp) => tp.teamId === m.awayTeamId)
        .map((tp) => ({
          ...tp,
          fullName: db.players.find((p) => p.id === tp.playerId)?.fullName || "Player",
        }));

      return {
        ...m,
        homeTeam: ht,
        awayTeam: at,
        venue: ven,
        tournament: tourn,
        stage,
        result: res,
        homePlayers: homeSquad,
        awayPlayers: awaySquad,
      };
    });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white font-['Space_Grotesk']">
            Match Management & Result Entry
          </h1>
          <p className="text-xs text-[var(--text-muted)]">
            Record official scores, fouls, and penalty shootouts. Database triggers execute instantly.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[var(--border)] pb-4 text-xs">
        <Link
          href="/admin/matches"
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
            !params.status
              ? "bg-[var(--plum-500)] text-white"
              : "bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-white"
          }`}
        >
          All Matches ({db.matches.length})
        </Link>
        <Link
          href="/admin/matches?status=SCHEDULED"
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
            params.status === "SCHEDULED"
              ? "bg-[var(--plum-500)] text-white"
              : "bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-white"
          }`}
        >
          Scheduled (Pending Result)
        </Link>
        <Link
          href="/admin/matches?status=COMPLETED"
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
            params.status === "COMPLETED"
              ? "bg-[var(--plum-500)] text-white"
              : "bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-white"
          }`}
        >
          Completed Scores
        </Link>
      </div>

      <MatchesClientList matches={matches} />
    </div>
  );
}

