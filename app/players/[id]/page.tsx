import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { formatShortDate } from "@/lib/formatters";
import { User, Award, Shield, Flame, AlertTriangle, ChevronLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PlayerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  const db = getDb();
  const { id } = await params;

  const player = db.players.find((p) => p.id === id);
  if (!player) notFound();

  // Find teams player plays for
  const teamPlayerEntries = db.teamPlayers.filter((tp) => tp.playerId === player.id);
  const teams = teamPlayerEntries.map((tp) => ({
    ...tp,
    team: db.teams.find((t) => t.id === tp.teamId),
    tournament: db.tournaments.find((tr) => tr.id === tp.tournamentId),
  }));

  // Match events
  const playerEvents = db.matchEvents.filter((e) => e.playerId === player.id);
  const goals = playerEvents.filter((e) => e.eventType === "GOAL").length;
  const yellowCards = playerEvents.filter((e) => e.eventType === "YELLOW_CARD").length;
  const redCards = playerEvents.filter((e) => e.eventType === "RED_CARD").length;

  // MOTM count
  const motmCount = db.matchResults.filter((r) => r.manOfTheMatchPlayerId === player.id).length;

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)]">
      <Navbar user={user} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 w-full space-y-8 flex-1">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
          <Link href="/teams" className="hover:text-white flex items-center gap-1">
            <ChevronLeft className="w-3.5 h-3.5" /> Back to Teams
          </Link>
          <span>/</span>
          <span className="text-[var(--plum-300)] font-semibold">{player.fullName}</span>
        </div>

        {/* Player Profile Card */}
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-[var(--plum-900)] border-2 border-[var(--plum-500)] flex items-center justify-center text-white text-3xl font-extrabold font-['Space_Grotesk']">
              {player.fullName.charAt(0)}
            </div>
            <div className="space-y-1">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[var(--plum-700)] text-white uppercase font-bold tracking-wider">
                {player.preferredPosition}
              </span>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white font-['Space_Grotesk']">
                {player.fullName}
              </h1>
              <p className="text-xs text-[var(--text-muted)]">
                Born: {formatShortDate(player.dateOfBirth)} · CNIC: {player.cnic || "Verified Athlete"}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] text-center">
            <div className="text-3xl font-extrabold text-[var(--plum-300)] font-['Space_Grotesk'] tabular-nums">
              {goals}
            </div>
            <div className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-semibold mt-1">
              Goals Scored
            </div>
          </div>
          <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] text-center">
            <div className="text-3xl font-extrabold text-white font-['Space_Grotesk'] tabular-nums">
              {motmCount}
            </div>
            <div className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-semibold mt-1">
              Man of the Match
            </div>
          </div>
          <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] text-center">
            <div className="text-3xl font-extrabold text-[var(--warning)] font-['Space_Grotesk'] tabular-nums">
              {yellowCards}
            </div>
            <div className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-semibold mt-1">
              Yellow Cards
            </div>
          </div>
          <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] text-center">
            <div className="text-3xl font-extrabold text-[var(--danger)] font-['Space_Grotesk'] tabular-nums">
              {redCards}
            </div>
            <div className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-semibold mt-1">
              Red Cards
            </div>
          </div>
        </div>

        {/* Clubs & Tournament Squads */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-4">
          <h3 className="text-lg font-bold text-white font-['Space_Grotesk'] flex items-center gap-2">
            <Shield className="w-5 h-5 text-[var(--plum-300)]" />
            Registered Club & Tournament
          </h3>
          <div className="space-y-3">
            {teams.map((t) => (
              <div
                key={t.id}
                className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-white text-base">
                    {t.team?.name}
                  </div>
                  <div className="text-xs text-[var(--text-muted)]">
                    {t.tournament?.name} · Jersey #{t.jerseyNumber}
                  </div>
                </div>
                {t.isCaptain && (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-[var(--warning)]/20 text-[var(--warning)] font-bold">
                    Club Captain
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

