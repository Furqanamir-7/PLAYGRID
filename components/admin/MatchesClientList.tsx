"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ResultEntryModal } from "./ResultEntryModal";
import { formatMatchDate } from "@/lib/formatters";
import { Calendar, MapPin, Zap } from "lucide-react";

export function MatchesClientList({ matches }: { matches: any[] }) {
  const router = useRouter();
  const [selectedMatch, setSelectedMatch] = useState<any | null>(null);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {matches.map((m) => {
          const isCompleted = m.status === "COMPLETED";

          return (
            <div
              key={m.id}
              className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-3"
            >
              <div className="flex items-center justify-between text-[11px] text-[var(--plum-300)] font-semibold">
                <span>{m.tournament?.name} · Round {m.roundNumber}</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] ${
                    isCompleted
                      ? "bg-[var(--surface-2)] text-white font-bold"
                      : "bg-[var(--warning)]/20 text-[var(--warning)]"
                  }`}
                >
                  {isCompleted ? "COMPLETED" : "SCHEDULED"}
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
                  <div className="px-3 py-1 rounded bg-[var(--bg)] border border-[var(--border)] text-[var(--plum-300)] text-base font-extrabold tabular-nums shrink-0 mx-2">
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

              <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] border-t border-[var(--border)] pt-3">
                <span>{formatMatchDate(m.scheduledAt)}</span>
                <button
                  type="button"
                  onClick={() => setSelectedMatch(m)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--plum-500)] hover:bg-[var(--plum-300)] hover:text-[var(--bg)] text-white font-bold text-xs transition-all shadow-sm"
                >
                  <Zap className="w-3.5 h-3.5" />
                  {isCompleted ? "Edit Result" : "Record Result"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {selectedMatch && (
        <ResultEntryModal
          match={selectedMatch}
          homePlayers={selectedMatch.homePlayers}
          awayPlayers={selectedMatch.awayPlayers}
          onClose={() => setSelectedMatch(null)}
          onSuccess={() => {
            setSelectedMatch(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

