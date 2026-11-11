import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { formatMatchDate } from "@/lib/formatters";
import { Shield, MapPin, Users, Calendar, Trophy, ChevronLeft, Award } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TeamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  const db = getDb();
  const { id } = await params;

  const team = db.teams.find((t) => t.id === id);
  if (!team) notFound();

  const city = db.cities.find((c) => c.id === team.cityId);
  const manager = db.users.find((u) => u.id === team.managerId);

  // Team players across all tournaments
  const squad = db.teamPlayers
    .filter((tp) => tp.teamId === team.id)
    .map((tp) => ({
      ...tp,
      player: db.players.find((p) => p.id === tp.playerId),
    }))
    .sort((a, b) => a.jerseyNumber - b.jerseyNumber);

  // Matches involving this team
  const teamMatches = db.matches
    .filter((m) => m.homeTeamId === team.id || m.awayTeamId === team.id)
    .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())
    .map((m) => {
      const isHome = m.homeTeamId === team.id;
      const opponentId = isHome ? m.awayTeamId : m.homeTeamId;
      const opponent = opponentId ? db.teams.find((t) => t.id === opponentId) : null;
      const res = db.matchResults.find((r) => r.matchId === m.id);
      const tourn = db.tournaments.find((t) => t.id === m.tournamentId);
      return {
        ...m,
        isHome,
        opponent,
        result: res,
        tournament: tourn,
      };
    });

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)]">
      <Navbar user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8 flex-1">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
          <Link href="/teams" className="hover:text-white flex items-center gap-1">
            <ChevronLeft className="w-3.5 h-3.5" /> All Teams
          </Link>
          <span>/</span>
          <span className="text-[var(--plum-300)] font-semibold">{team.name}</span>
        </div>

        {/* Club Profile Header */}
        <div className="rounded-3xl border border-[var(--border)] bg-gradient-to-r from-[var(--surface-2)] via-[var(--surface)] to-[var(--bg)] p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl">
          <div className="flex items-center gap-5">
            <span
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-white text-2xl sm:text-3xl font-black shadow-lg"
              style={{ backgroundColor: team.primaryColor || "#8E4585" }}
            >
              {team.shortName}
            </span>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded bg-[var(--plum-900)] text-[var(--plum-300)] font-bold">
                  {team.shortName}
                </span>
                <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[var(--plum-300)]" />
                  {city?.name}, {city?.province}
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white font-['Space_Grotesk']">
                {team.name}
              </h1>
              <p className="text-xs text-[var(--text-muted)]">
                Founded {team.foundedYear || 2020} · Managed by {manager?.name || "Official Manager"}
              </p>
            </div>
          </div>
        </div>

        {/* Squad Roster */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white font-['Space_Grotesk'] flex items-center gap-2">
              <Users className="w-5 h-5 text-[var(--plum-300)]" />
              Official Squad Roster ({squad.length} Players)
            </h2>
            <span className="text-xs text-[var(--text-muted)]">
              (C) designates Team Captain
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {squad.map((tp) => (
              <Link
                key={tp.id}
                href={`/players/${tp.player?.id}`}
                className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)] transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-xl bg-[var(--plum-900)] text-white flex items-center justify-center font-black font-['Space_Grotesk'] tabular-nums text-sm group-hover:bg-[var(--plum-500)] transition-colors">
                    #{tp.jerseyNumber}
                  </span>
                  <div>
                    <div className="font-bold text-white text-sm flex items-center gap-1.5 group-hover:text-[var(--plum-300)] transition-colors">
                      {tp.player?.fullName}
                      {tp.isCaptain && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[var(--warning)] text-black font-extrabold">
                          C
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-[var(--text-muted)] uppercase">
                      {tp.player?.preferredPosition}
                    </div>
                  </div>
                </div>

                <div className="text-right text-[11px] text-[var(--text-muted)]">
                  <span>View Stats</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Match History */}
        <div className="space-y-4 pt-6 border-t border-[var(--border)]">
          <h2 className="text-xl font-bold text-white font-['Space_Grotesk'] flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[var(--plum-300)]" />
            Tournament Matches ({teamMatches.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teamMatches.map((m) => {
              const isCompleted = m.status === "COMPLETED";

              return (
                <Link
                  key={m.id}
                  href={`/matches/${m.id}`}
                  className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)] transition-all space-y-2"
                >
                  <div className="flex items-center justify-between text-[11px] text-[var(--plum-300)] font-semibold">
                    <span>{m.tournament?.name}</span>
                    <span>{m.isHome ? "Home" : "Away"} vs {m.opponent?.name || "TBD"}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm font-bold text-white">
                    <span>{m.isHome ? team.name : m.opponent?.name}</span>
                    {isCompleted ? (
                      <span className="px-2.5 py-0.5 rounded bg-[var(--bg)] text-[var(--plum-300)] font-extrabold tabular-nums">
                        {m.result?.homeScore} - {m.result?.awayScore}
                      </span>
                    ) : (
                      <span className="text-xs text-[var(--text-muted)]">VS</span>
                    )}
                    <span>{m.isHome ? m.opponent?.name : team.name}</span>
                  </div>

                  <div className="text-[11px] text-[var(--text-muted)]">
                    {formatMatchDate(m.scheduledAt)}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

