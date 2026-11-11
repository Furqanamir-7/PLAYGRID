"use client";

import React from "react";
import Link from "next/link";
import { Shield } from "lucide-react";

export interface StandingRow {
  teamId: string;
  teamName: string;
  shortName: string;
  primaryColor?: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form?: ("W" | "D" | "L")[];
  rank?: number;
}

interface StandingsTableProps {
  standings: StandingRow[];
  tournamentName?: string;
}

export function StandingsTable({ standings, tournamentName }: StandingsTableProps) {
  // Sort by points DESC, GD DESC, GF DESC
  const sorted = [...standings].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return a.teamName.localeCompare(b.teamName);
  });

  return (
    <div className="w-full space-y-4">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-md">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--surface-2)] text-[11px] uppercase font-bold tracking-wider text-[var(--text-muted)] border-b border-[var(--border)]">
            <tr>
              <th className="py-3 px-4 w-12 text-center">Pos</th>
              <th className="py-3 px-4">Club</th>
              <th className="py-3 px-3 text-center">MP</th>
              <th className="py-3 px-3 text-center">W</th>
              <th className="py-3 px-3 text-center">D</th>
              <th className="py-3 px-3 text-center">L</th>
              <th className="py-3 px-3 text-center">GF</th>
              <th className="py-3 px-3 text-center">GA</th>
              <th className="py-3 px-3 text-center">GD</th>
              <th className="py-3 px-4 text-center font-extrabold text-[var(--plum-300)]">Pts</th>
              <th className="py-3 px-4 text-center">Form</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)] font-medium">
            {sorted.map((row, idx) => {
              const pos = idx + 1;
              const isChampionship = pos === 1;
              const isTopFour = pos <= 4;

              return (
                <tr
                  key={row.teamId}
                  className="hover:bg-[var(--surface-2)]/80 transition-colors group"
                >
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                        isChampionship
                          ? "bg-[var(--plum-500)] text-white shadow-sm"
                          : isTopFour
                          ? "bg-[var(--plum-900)] text-[var(--plum-300)]"
                          : "text-[var(--text-muted)]"
                      }`}
                    >
                      {pos}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <Link
                      href={`/teams/${row.teamId}`}
                      className="flex items-center gap-3 font-semibold text-white group-hover:text-[var(--plum-300)] transition-colors"
                    >
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: row.primaryColor || "#8E4585" }}
                      />
                      <span>{row.teamName}</span>
                      <span className="text-xs px-1.5 py-0.5 rounded bg-[var(--surface-2)] text-[var(--text-muted)] font-normal">
                        {row.shortName}
                      </span>
                    </Link>
                  </td>
                  <td className="py-3 px-3 text-center tabular-nums text-white">{row.played}</td>
                  <td className="py-3 px-3 text-center tabular-nums text-[var(--text-muted)]">{row.won}</td>
                  <td className="py-3 px-3 text-center tabular-nums text-[var(--text-muted)]">{row.drawn}</td>
                  <td className="py-3 px-3 text-center tabular-nums text-[var(--text-muted)]">{row.lost}</td>
                  <td className="py-3 px-3 text-center tabular-nums text-[var(--text-muted)]">{row.goalsFor}</td>
                  <td className="py-3 px-3 text-center tabular-nums text-[var(--text-muted)]">{row.goalsAgainst}</td>
                  <td className="py-3 px-3 text-center tabular-nums font-semibold">
                    <span
                      className={
                        row.goalDifference > 0
                          ? "text-[var(--success)]"
                          : row.goalDifference < 0
                          ? "text-[var(--danger)]"
                          : "text-[var(--text-muted)]"
                      }
                    >
                      {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center tabular-nums text-base font-extrabold text-[var(--plum-300)]">
                    {row.points}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {(row.form || ["W", "W", "D", "L", "W"]).slice(-5).map((res, fIdx) => (
                        <span
                          key={fIdx}
                          className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold ${
                            res === "W"
                              ? "bg-[var(--success)]/20 text-[var(--success)]"
                              : res === "D"
                              ? "bg-[var(--warning)]/20 text-[var(--warning)]"
                              : "bg-[var(--danger)]/20 text-[var(--danger)]"
                          }`}
                        >
                          {res}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View (360px+) */}
      <div className="md:hidden space-y-3">
        {sorted.map((row, idx) => (
          <div
            key={row.teamId}
            className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[var(--plum-900)] text-[var(--plum-300)] flex items-center justify-center text-xs font-bold">
                  {idx + 1}
                </span>
                <Link href={`/teams/${row.teamId}`} className="font-semibold text-white text-sm">
                  {row.teamName}
                </Link>
              </div>
              <div className="flex items-baseline gap-1 text-right">
                <span className="text-xs text-[var(--text-muted)]">Pts</span>
                <span className="text-lg font-extrabold text-[var(--plum-300)]">{row.points}</span>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-1 py-1.5 px-2 rounded-lg bg-[var(--surface-2)] text-center text-xs text-[var(--text-muted)] tabular-nums">
              <div>
                <span className="block text-[10px] uppercase">MP</span>
                <span className="font-semibold text-white">{row.played}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase">W</span>
                <span>{row.won}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase">D</span>
                <span>{row.drawn}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase">L</span>
                <span>{row.lost}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase">GD</span>
                <span className={row.goalDifference > 0 ? "text-[var(--success)]" : "text-[var(--danger)]"}>
                  {row.goalDifference}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

