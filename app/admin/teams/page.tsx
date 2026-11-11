import React from "react";
import Link from "next/link";
import { getDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Shield, Plus, MapPin } from "lucide-react";


export default async function AdminTeamsPage() {
  const user = await getCurrentUser();
  const db = getDb();

  const teams = db.teams.map((t) => {
    const city = db.cities.find((c) => c.id === t.cityId);
    const manager = db.users.find((u) => u.id === t.managerId);
    const squadCount = db.teamPlayers.filter((tp) => tp.teamId === t.id).length;
    return {
      ...t,
      cityName: city?.name || "Pakistan",
      managerName: manager?.name || "Manager",
      squadCount,
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white font-['Space_Grotesk']">
            Teams & Clubs Master
          </h1>
          <p className="text-xs text-[var(--text-muted)]">
            Registered Pakistani futsal clubs, kit colors, and squad rosters
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden shadow-lg">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--surface-2)] text-[11px] uppercase font-bold text-[var(--text-muted)] border-b border-[var(--border)]">
            <tr>
              <th className="py-3.5 px-4">Club</th>
              <th className="py-3.5 px-4">City</th>
              <th className="py-3.5 px-4">Manager</th>
              <th className="py-3.5 px-4">Squad Size</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)] font-medium">
            {teams.map((t) => (
              <tr key={t.id} className="hover:bg-[var(--surface-2)]/60 transition-colors">
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0"
                      style={{ backgroundColor: t.primaryColor || "#8E4585" }}
                    />
                    <span className="font-bold text-white">{t.name}</span>
                    <span className="text-xs text-[var(--plum-300)] font-bold">({t.shortName})</span>
                  </div>
                </td>
                <td className="py-3.5 px-4 text-xs text-[var(--text-muted)]">{t.cityName}</td>
                <td className="py-3.5 px-4 text-xs text-white">{t.managerName}</td>
                <td className="py-3.5 px-4 text-xs tabular-nums text-white">{t.squadCount} Players</td>
                <td className="py-3.5 px-4 text-right">
                  <Link
                    href={`/teams/${t.id}`}
                    className="text-xs text-[var(--plum-300)] hover:underline font-semibold"
                  >
                    View Roster
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

