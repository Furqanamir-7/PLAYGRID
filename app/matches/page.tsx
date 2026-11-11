import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { formatMatchDate } from "@/lib/formatters";
import { Calendar, MapPin, ChevronRight, Trophy } from "lucide-react";


export default async function MatchesListPage({
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
      const city = ven ? db.cities.find((c) => c.id === ven.cityId) : null;
      const tourn = db.tournaments.find((t) => t.id === m.tournamentId);
      const res = db.matchResults.find((r) => r.matchId === m.id);
      return {
        ...m,
        homeTeam: ht,
        awayTeam: at,
        venue: ven,
        city,
        tournament: tourn,
        result: res,
      };
    });

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)]">
      <Navbar user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8 flex-1">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--plum-900)] text-xs font-semibold text-[var(--plum-100)]">
            <Calendar className="w-3.5 h-3.5 text-[var(--plum-300)]" />
            Pakistan Futsal Fixtures
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-['Space_Grotesk']">
            Match Schedule & Results
          </h1>
          <p className="text-sm text-[var(--text-muted)] max-w-2xl">
            Real-time schedule of Pakistani futsal league rounds, knockout eliminations, and completed scorecards.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 border-b border-[var(--border)] pb-4 text-xs">
          <Link
            href="/matches"
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              !params.status
                ? "bg-[var(--plum-500)] text-white"
                : "bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-white"
            }`}
          >
            All Matches ({db.matches.length})
          </Link>
          <Link
            href="/matches?status=SCHEDULED"
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              params.status === "SCHEDULED"
                ? "bg-[var(--plum-500)] text-white"
                : "bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-white"
            }`}
          >
            Upcoming Scheduled
          </Link>
          <Link
            href="/matches?status=COMPLETED"
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              params.status === "COMPLETED"
                ? "bg-[var(--plum-500)] text-white"
                : "bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-white"
            }`}
          >
            Completed Results
          </Link>
        </div>

        {/* Matches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {matches.map((m) => {
            const isCompleted = m.status === "COMPLETED";

            return (
              <Link
                key={m.id}
                href={`/matches/${m.id}`}
                className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)] hover:border-[var(--plum-500)]/60 transition-all space-y-3"
              >
                <div className="flex items-center justify-between text-[11px] text-[var(--plum-300)] font-semibold">
                  <span>{m.tournament?.name} · Round {m.roundNumber}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] ${
                    isCompleted ? "bg-[var(--surface-2)] text-white font-bold" : "bg-[var(--warning)]/20 text-[var(--warning)]"
                  }`}>
                    {isCompleted ? "FT" : "SCHEDULED"}
                  </span>
                </div>

                <div className="flex items-center justify-between font-bold text-white text-sm">
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: m.homeTeam?.primaryColor || "#8E4585" }}
                    />
                    <span className="truncate">{m.homeTeam?.name}</span>
                  </div>

                  {isCompleted ? (
                    <div className="px-3 py-0.5 rounded bg-[var(--bg)] border border-[var(--border)] text-[var(--plum-300)] text-base font-extrabold tabular-nums shrink-0 mx-2">
                      {m.result?.homeScore} - {m.result?.awayScore}
                    </div>
                  ) : (
                    <span className="text-xs px-2 py-0.5 rounded bg-[var(--surface-2)] text-[var(--text-muted)] font-normal mx-2">
                      VS
                    </span>
                  )}

                  <div className="flex items-center gap-2 truncate text-right">
                    <span className="truncate">{m.awayTeam?.name || "TBD"}</span>
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: m.awayTeam?.primaryColor || "#5E2A59" }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] border-t border-[var(--border)] pt-2">
                  <span>{formatMatchDate(m.scheduledAt)}</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[var(--plum-300)]" />
                    {m.venue?.name}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
}

