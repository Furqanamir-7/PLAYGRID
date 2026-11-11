import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { formatMatchDate } from "@/lib/formatters";
import { 
  Trophy, 
  MapPin, 
  Calendar, 
  Award, 
  Flame, 
  Shield, 
  Clock, 
  CheckCircle, 
  Users,
  ChevronLeft
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  const db = getDb();
  const { id } = await params;

  const match = db.matches.find((m) => m.id === id);
  if (!match) notFound();

  const tournament = db.tournaments.find((t) => t.id === match.tournamentId);
  const stage = db.stages.find((s) => s.id === match.stageId);
  const homeTeam = db.teams.find((t) => t.id === match.homeTeamId);
  const awayTeam = db.teams.find((t) => t.id === match.awayTeamId);
  const venue = db.venues.find((v) => v.id === match.venueId);
  const city = venue ? db.cities.find((c) => c.id === venue.cityId) : null;
  const result = db.matchResults.find((r) => r.matchId === match.id);

  const officials = db.matchOfficials
    .filter((mo) => mo.matchId === match.id)
    .map((mo) => ({
      ...mo,
      referee: db.referees.find((rf) => rf.id === mo.refereeId),
    }));

  const events = db.matchEvents
    .filter((e) => e.matchId === match.id)
    .sort((a, b) => a.minute - b.minute)
    .map((e) => ({
      ...e,
      player: db.players.find((p) => p.id === e.playerId),
      team: db.teams.find((t) => t.id === e.teamId),
    }));

  const motm = result?.manOfTheMatchPlayerId
    ? db.players.find((p) => p.id === result.manOfTheMatchPlayerId)
    : null;

  const isCompleted = match.status === "COMPLETED";

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)]">
      <Navbar user={user} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 w-full space-y-8 flex-1">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
          <Link href="/matches" className="hover:text-white flex items-center gap-1">
            <ChevronLeft className="w-3.5 h-3.5" /> All Matches
          </Link>
          <span>/</span>
          {tournament && (
            <Link href={`/tournaments/${tournament.slug}`} className="hover:text-white">
              {tournament.name}
            </Link>
          )}
          <span>/</span>
          <span className="text-[var(--plum-300)] font-semibold">Match Details</span>
        </div>

        {/* Broadcast Scoreboard Header */}
        <div className="rounded-3xl border border-[var(--border)] bg-gradient-to-b from-[var(--surface-2)] to-[var(--surface)] p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 px-4 py-1 rounded-b-xl bg-[var(--plum-900)] text-[11px] font-bold uppercase tracking-wider text-[var(--plum-100)] border border-t-0 border-[var(--plum-700)]">
            {stage?.name || "Match"} · Round {match.roundNumber}
          </div>

          <div className="grid grid-cols-3 items-center gap-4 text-center mt-6">
            {/* Home Team */}
            <div className="space-y-3 flex flex-col items-center">
              <span
                className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-white text-xl sm:text-2xl font-black shadow-lg"
                style={{ backgroundColor: homeTeam?.primaryColor || "#8E4585" }}
              >
                {homeTeam?.shortName || "H"}
              </span>
              <div>
                <Link
                  href={`/teams/${homeTeam?.id}`}
                  className="text-base sm:text-2xl font-bold text-white hover:text-[var(--plum-300)] transition-colors block font-['Space_Grotesk']"
                >
                  {homeTeam?.name}
                </Link>
                <span className="text-xs text-[var(--text-muted)]">Home Team</span>
              </div>
            </div>

            {/* Score Centerpiece */}
            <div className="space-y-2">
              {isCompleted ? (
                <div className="space-y-1">
                  <div className="text-4xl sm:text-6xl font-black text-white font-['Space_Grotesk'] tabular-nums tracking-wider">
                    {result?.homeScore} : {result?.awayScore}
                  </div>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-[var(--surface-2)] text-[var(--plum-300)] font-bold uppercase tracking-wider">
                    Full Time
                  </span>
                  {result?.homePenalties != null && (
                    <div className="text-xs text-[var(--plum-300)] font-semibold pt-1">
                      Penalties ({result.homePenalties} - {result.awayPenalties})
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-1">
                  <span className="text-2xl sm:text-4xl font-extrabold text-[var(--text-muted)] font-['Space_Grotesk']">
                    VS
                  </span>
                  <div className="text-xs font-semibold text-[var(--warning)] uppercase tracking-wider">
                    {match.status}
                  </div>
                </div>
              )}
            </div>

            {/* Away Team */}
            <div className="space-y-3 flex flex-col items-center">
              <span
                className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-white text-xl sm:text-2xl font-black shadow-lg"
                style={{ backgroundColor: awayTeam?.primaryColor || "#5E2A59" }}
              >
                {awayTeam?.shortName || "A"}
              </span>
              <div>
                <Link
                  href={`/teams/${awayTeam?.id}`}
                  className="text-base sm:text-2xl font-bold text-white hover:text-[var(--plum-300)] transition-colors block font-['Space_Grotesk']"
                >
                  {awayTeam?.name || "TBD"}
                </Link>
                <span className="text-xs text-[var(--text-muted)]">Away Team</span>
              </div>
            </div>
          </div>

          {/* Match Meta Footer */}
          <div className="mt-8 pt-6 border-t border-[var(--border)] flex flex-wrap items-center justify-around gap-4 text-xs text-[var(--text-muted)]">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[var(--plum-300)]" />
              <span>{formatMatchDate(match.scheduledAt)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[var(--plum-300)]" />
              <span>{venue?.name}, {city?.name}</span>
            </div>
          </div>
        </div>

        {/* Fouls & Man of the Match Bar */}
        {isCompleted && result && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Fouls Counter */}
            <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Accumulated Fouls
              </h4>
              <div className="flex items-center justify-between text-2xl font-black text-white font-['Space_Grotesk']">
                <span className="text-[var(--plum-300)]">{result.homeFouls}</span>
                <span className="text-xs text-[var(--text-muted)] font-normal">Fouls</span>
                <span className="text-[var(--plum-300)]">{result.awayFouls}</span>
              </div>
              <div className="w-full bg-[var(--surface-2)] h-2 rounded-full overflow-hidden flex">
                <div
                  className="bg-[var(--plum-500)] h-full"
                  style={{
                    width: `${
                      (result.homeFouls / Math.max(1, result.homeFouls + result.awayFouls)) * 100
                    }%`,
                  }}
                />
                <div
                  className="bg-[var(--plum-900)] h-full"
                  style={{
                    width: `${
                      (result.awayFouls / Math.max(1, result.homeFouls + result.awayFouls)) * 100
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* Man of the Match */}
            {motm && (
              <div className="p-5 rounded-2xl border border-[var(--plum-700)] bg-[var(--surface)] space-y-2 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--plum-900)] border border-[var(--plum-500)] flex items-center justify-center text-[var(--warning)] shrink-0">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--plum-300)] block">
                    Man of the Match
                  </span>
                  <h5 className="text-base font-extrabold text-white">
                    {motm.fullName}
                  </h5>
                  <span className="text-xs text-[var(--text-muted)] uppercase">
                    {motm.preferredPosition}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Goal & Card Timeline */}
        {isCompleted && (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-6">
            <h3 className="text-lg font-bold text-white font-['Space_Grotesk'] flex items-center gap-2">
              <Clock className="w-5 h-5 text-[var(--plum-300)]" />
              Match Timeline
            </h3>

            {events.length === 0 ? (
              <div className="text-center py-6 text-xs text-[var(--text-muted)]">
                No events recorded for this match.
              </div>
            ) : (
              <div className="relative border-l border-[var(--border)] ml-4 space-y-4 py-2">
                {events.map((e) => {
                  const isHome = e.teamId === match.homeTeamId;
                  const isGoal = e.eventType === "GOAL";
                  const isRed = e.eventType === "RED_CARD";

                  return (
                    <div key={e.id} className="relative pl-6">
                      <span className="absolute -left-2 top-1 w-4 h-4 rounded-full bg-[var(--surface-2)] border-2 border-[var(--plum-500)]" />
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-[var(--plum-300)] tabular-nums">
                            {e.minute}'
                          </span>
                          <span
                            className={`font-bold ${
                              isGoal
                                ? "text-white"
                                : isRed
                                ? "text-[var(--danger)]"
                                : "text-[var(--warning)]"
                            }`}
                          >
                            {e.eventType.replace("_", " ")}
                          </span>
                          <span className="text-white font-semibold">
                            {e.player?.fullName}
                          </span>
                          <span className="text-[var(--text-muted)]">
                            ({e.team?.shortName})
                          </span>
                        </div>
                        {e.notes && (
                          <span className="text-[10px] text-[var(--text-muted)] italic">
                            {e.notes}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Match Officials */}
        {officials.length > 0 && (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white font-['Space_Grotesk']">
              Match Officials
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              {officials.map((mo, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-[var(--surface-2)] space-y-1">
                  <div className="text-[10px] text-[var(--plum-300)] uppercase font-semibold">
                    {mo.role.replace("_", " ")}
                  </div>
                  <div className="font-bold text-white">{mo.referee?.fullName}</div>
                  <div className="text-[10px] text-[var(--text-muted)]">
                    {mo.referee?.certificationLevel} Official
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

