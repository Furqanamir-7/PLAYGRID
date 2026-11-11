import React from "react";
import Link from "next/link";
import { getDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { formatShortDate } from "@/lib/formatters";
import { Users, Award, Shield } from "lucide-react";


export default async function AdminPlayersPage() {
  const user = await getCurrentUser();
  const db = getDb();

  const players = db.players.slice(0, 50).map((p) => {
    const tp = db.teamPlayers.find((t) => t.playerId === p.id);
    const team = tp ? db.teams.find((tm) => tm.id === tp.teamId) : null;
    const goals = db.matchEvents.filter((e) => e.playerId === p.id && e.eventType === "GOAL").length;
    return {
      ...p,
      team,
      jerseyNumber: tp?.jerseyNumber,
      isCaptain: tp?.isCaptain,
      goals,
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white font-['Space_Grotesk']">
            Registered Athletes & Squads
          </h1>
          <p className="text-xs text-[var(--text-muted)]">
            Total {db.players.length} verified players with unique CNICs and position specializations
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden shadow-lg">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--surface-2)] text-[11px] uppercase font-bold text-[var(--text-muted)] border-b border-[var(--border)]">
            <tr>
              <th className="py-3.5 px-4">Player</th>
              <th className="py-3.5 px-4">Club</th>
              <th className="py-3.5 px-4">Position</th>
              <th className="py-3.5 px-4">CNIC</th>
              <th className="py-3.5 px-4 text-center">Goals</th>
              <th className="py-3.5 px-4 text-right">Profile</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)] font-medium">
            {players.map((p) => (
              <tr key={p.id} className="hover:bg-[var(--surface-2)]/60 transition-colors">
                <td className="py-3.5 px-4">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    {p.fullName}
                    {p.isCaptain && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-[var(--warning)] text-black font-extrabold">
                        C
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-[var(--text-muted)]">
                    DOB: {formatShortDate(p.dateOfBirth)}
                  </div>
                </td>
                <td className="py-3.5 px-4 text-xs text-[var(--plum-100)]">
                  {p.team?.name || "Unassigned"} {p.jerseyNumber && `(#${p.jerseyNumber})`}
                </td>
                <td className="py-3.5 px-4 text-xs text-[var(--plum-300)] uppercase font-semibold">
                  {p.preferredPosition}
                </td>
                <td className="py-3.5 px-4 text-xs tabular-nums text-[var(--text-muted)] font-mono">
                  {p.cnic || "Pending"}
                </td>
                <td className="py-3.5 px-4 text-center text-xs font-bold text-white tabular-nums">
                  {p.goals}
                </td>
                <td className="py-3.5 px-4 text-right">
                  <Link
                    href={`/players/${p.id}`}
                    className="text-xs text-[var(--plum-300)] hover:underline font-semibold"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

