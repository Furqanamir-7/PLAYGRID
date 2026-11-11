import React from "react";
import Link from "next/link";
import { getDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { formatPKR, formatShortDate } from "@/lib/formatters";
import { TournamentControls } from "@/components/admin/TournamentControls";
import { Trophy, Plus, MapPin, Users } from "lucide-react";


export default async function AdminTournamentsPage() {
  const user = await getCurrentUser();
  const db = getDb();

  const tournaments = db.tournaments.map((t) => {
    const city = db.cities.find((c) => c.id === t.cityId);
    const approvedCount = db.registrations.filter(
      (r) => r.tournamentId === t.id && r.status === "APPROVED"
    ).length;
    const matchesCount = db.matches.filter((m) => m.tournamentId === t.id).length;

    return {
      ...t,
      cityName: city?.name || "Pakistan",
      approvedCount,
      matchesCount,
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white font-['Space_Grotesk']">
            Tournament Management
          </h1>
          <p className="text-xs text-[var(--text-muted)]">
            Create leagues, invoke SQL fixture generators, and trigger standings recalculation
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {tournaments.map((t) => (
          <div
            key={t.id}
            className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--plum-900)] text-[var(--plum-300)]">
                    {t.status}
                  </span>
                  <span className="text-xs text-[var(--text-muted)]">
                    {t.cityName} · {t.format}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white font-['Space_Grotesk']">
                  {t.name}
                </h3>
              </div>

              <div className="text-left sm:text-right text-xs text-[var(--text-muted)]">
                <div>Prize Pool: <strong className="text-[var(--plum-300)]">{formatPKR(t.prizePoolPkr)}</strong></div>
                <div>Entry Fee: <strong className="text-white">{formatPKR(t.entryFeePkr)}</strong></div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t border-[var(--border)] text-xs text-[var(--text-muted)]">
              <div>
                <span className="block text-[10px] uppercase">Approved Clubs</span>
                <strong className="text-white">{t.approvedCount} / {t.maxTeams} Teams</strong>
              </div>
              <div>
                <span className="block text-[10px] uppercase">Fixtures Generated</span>
                <strong className="text-white">{t.matchesCount} Matches</strong>
              </div>
              <div>
                <span className="block text-[10px] uppercase">Duration</span>
                <strong className="text-white">{formatShortDate(t.startDate)} – {formatShortDate(t.endDate)}</strong>
              </div>
              <div>
                <span className="block text-[10px] uppercase">Squad Size</span>
                <strong className="text-white">{t.minSquadSize} - {t.maxSquadSize} Players</strong>
              </div>
            </div>

            <TournamentControls tournament={t} />
          </div>
        ))}
      </div>
    </div>
  );
}

