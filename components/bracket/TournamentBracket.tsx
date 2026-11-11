"use client";

import React from "react";
import Link from "next/link";
import { Trophy, CheckCircle, Shield } from "lucide-react";

interface MatchNode {
  id: string;
  roundNumber: number;
  homeTeam: { id: string; name: string; shortName: string; primaryColor?: string };
  awayTeam: { id: string; name: string; shortName: string; primaryColor?: string } | null;
  homeScore?: number | null;
  awayScore?: number | null;
  homePenalties?: number | null;
  awayPenalties?: number | null;
  winnerTeamId?: string | null;
  status: string;
  stageName: string;
}

interface TournamentBracketProps {
  matches: MatchNode[];
  championTeam?: { id: string; name: string; shortName: string } | null;
}

export function TournamentBracket({ matches, championTeam }: TournamentBracketProps) {
  const qfMatches = matches.filter((m) => m.roundNumber === 1);
  const sfMatches = matches.filter((m) => m.roundNumber === 2);
  const finalMatch = matches.find((m) => m.roundNumber === 4 || m.stageName.toLowerCase().includes("final"));
  const thirdPlaceMatch = matches.find((m) => m.stageName.toLowerCase().includes("3rd"));

  return (
    <div className="w-full overflow-x-auto py-8">
      {/* Champion Banner if decided */}
      {championTeam && (
        <div className="mb-8 p-4 rounded-xl bg-gradient-to-r from-[var(--plum-900)] to-[var(--surface-2)] border border-[var(--plum-500)] flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[var(--plum-500)]/20 border border-[var(--plum-300)] flex items-center justify-center text-[var(--plum-300)]">
              <Trophy className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[var(--plum-300)] font-['Space_Grotesk']">
                Tournament Champion
              </span>
              <h3 className="text-xl font-extrabold text-white font-['Space_Grotesk'] flex items-center gap-2">
                {championTeam.name}
                <span className="text-xs px-2 py-0.5 rounded bg-[var(--plum-700)] text-white">
                  {championTeam.shortName}
                </span>
              </h3>
            </div>
          </div>
          <div className="hidden sm:block text-right">
            <span className="text-xs text-[var(--text-muted)]">Islamabad Championship</span>
            <div className="text-sm font-semibold text-[var(--success)] flex items-center gap-1 justify-end">
              <CheckCircle className="w-4 h-4" /> Crowned Winner
            </div>
          </div>
        </div>
      )}

      {/* Bracket Tree Columns */}
      <div className="min-w-[760px] grid grid-cols-3 gap-8 items-center relative">
        {/* Column 1: Quarter Finals */}
        <div className="space-y-6">
          <div className="text-center pb-2 border-b border-[var(--border)]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--plum-300)] font-['Space_Grotesk']">
              Quarter-Finals
            </h4>
          </div>
          <div className="space-y-4">
            {qfMatches.map((m) => (
              <BracketMatchCard key={m.id} match={m} />
            ))}
          </div>
        </div>

        {/* Column 2: Semi Finals */}
        <div className="space-y-12">
          <div className="text-center pb-2 border-b border-[var(--border)]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--plum-300)] font-['Space_Grotesk']">
              Semi-Finals
            </h4>
          </div>
          <div className="space-y-16">
            {sfMatches.map((m) => (
              <BracketMatchCard key={m.id} match={m} />
            ))}
          </div>
        </div>

        {/* Column 3: Grand Final */}
        <div className="space-y-6">
          <div className="text-center pb-2 border-b border-[var(--border)]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--plum-300)] font-['Space_Grotesk']">
              Grand Final
            </h4>
          </div>
          {finalMatch && (
            <div className="relative">
              <div className="absolute -inset-1 bg-[var(--plum-500)]/20 rounded-xl blur-sm" />
              <div className="relative">
                <BracketMatchCard match={finalMatch} isFinal />
              </div>
            </div>
          )}

          {/* 3rd Place Match Card */}
          {thirdPlaceMatch && (
            <div className="mt-8 pt-4 border-t border-[var(--border)]">
              <div className="text-center mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] font-['Space_Grotesk']">
                  3rd Place Playoff
                </span>
              </div>
              <BracketMatchCard match={thirdPlaceMatch} isSmall />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function BracketMatchCard({
  match,
  isFinal = false,
  isSmall = false,
}: {
  match: MatchNode;
  isFinal?: boolean;
  isSmall?: boolean;
}) {
  const isCompleted = match.status === "COMPLETED";
  const homeWon = isCompleted && match.winnerTeamId === match.homeTeam.id;
  const awayWon = isCompleted && match.awayTeam && match.winnerTeamId === match.awayTeam.id;

  const hasPenalties = match.homePenalties != null && match.awayPenalties != null;

  return (
    <Link
      href={`/matches/${match.id}`}
      className={`block rounded-xl border transition-all duration-200 overflow-hidden ${
        isFinal
          ? "bg-[var(--surface-2)] border-[var(--plum-500)] shadow-lg shadow-[var(--plum-900)]/40 hover:border-[var(--plum-300)]"
          : "bg-[var(--surface)] border-[var(--border)] hover:border-[var(--plum-500)]/60 hover:bg-[var(--surface-2)]"
      }`}
    >
      <div className="px-3.5 py-3 space-y-2">
        {/* Home Team Row */}
        <div
          className={`flex items-center justify-between text-sm ${
            homeWon ? "font-bold text-white" : "text-[var(--text-muted)] font-medium"
          }`}
        >
          <div className="flex items-center gap-2 truncate pr-2">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: match.homeTeam.primaryColor || "#8E4585" }}
            />
            <span className="truncate">{match.homeTeam.name}</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0 tabular-nums">
            {hasPenalties && (
              <span className="text-[10px] px-1 py-0.2 rounded bg-[var(--surface-2)] text-[var(--plum-300)] font-normal">
                ({match.homePenalties})
              </span>
            )}
            <span
              className={`w-6 text-center text-sm ${
                homeWon ? "text-[var(--plum-300)] font-extrabold" : "text-[var(--text-muted)]"
              }`}
            >
              {match.homeScore ?? "-"}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[var(--border)]/60" />

        {/* Away Team Row */}
        <div
          className={`flex items-center justify-between text-sm ${
            awayWon ? "font-bold text-white" : "text-[var(--text-muted)] font-medium"
          }`}
        >
          <div className="flex items-center gap-2 truncate pr-2">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: match.awayTeam?.primaryColor || "#5E2A59" }}
            />
            <span className="truncate">{match.awayTeam?.name || "TBD"}</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0 tabular-nums">
            {hasPenalties && (
              <span className="text-[10px] px-1 py-0.2 rounded bg-[var(--surface-2)] text-[var(--plum-300)] font-normal">
                ({match.awayPenalties})
              </span>
            )}
            <span
              className={`w-6 text-center text-sm ${
                awayWon ? "text-[var(--plum-300)] font-extrabold" : "text-[var(--text-muted)]"
              }`}
            >
              {match.awayScore ?? "-"}
            </span>
          </div>
        </div>
      </div>

      {/* Footer Pill: Penalty indicator or Live/Completed status */}
      {hasPenalties && (
        <div className="bg-[var(--plum-900)]/40 px-3 py-1 border-t border-[var(--border)] text-[10px] text-[var(--plum-100)] flex items-center justify-between">
          <span>Decided on Penalties</span>
          <span className="font-semibold">{match.homePenalties} - {match.awayPenalties}</span>
        </div>
      )}
    </Link>
  );
}

