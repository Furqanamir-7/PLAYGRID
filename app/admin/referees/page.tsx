import React from "react";
import { getDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { ShieldCheck, MapPin } from "lucide-react";


export default async function AdminRefereesPage() {
  const user = await getCurrentUser();
  const db = getDb();

  const referees = db.referees.map((r) => {
    const city = db.cities.find((c) => c.id === r.cityId);
    const officiatedCount = db.matchOfficials.filter((mo) => mo.refereeId === r.id).length;
    return {
      ...r,
      cityName: city?.name || "Pakistan",
      officiatedCount,
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white font-['Space_Grotesk']">
          Referees & Match Officials
        </h1>
        <p className="text-xs text-[var(--text-muted)]">
          Federation-certified referees with certification levels and assignment conflict checks
        </p>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden shadow-lg">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--surface-2)] text-[11px] uppercase font-bold text-[var(--text-muted)] border-b border-[var(--border)]">
            <tr>
              <th className="py-3.5 px-4">Referee Name</th>
              <th className="py-3.5 px-4">City</th>
              <th className="py-3.5 px-4">Certification</th>
              <th className="py-3.5 px-4">Phone</th>
              <th className="py-3.5 px-4 text-right">Matches Officiated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)] font-medium">
            {referees.map((r) => (
              <tr key={r.id} className="hover:bg-[var(--surface-2)]/60 transition-colors">
                <td className="py-3.5 px-4 font-bold text-white">
                  {r.fullName}
                </td>
                <td className="py-3.5 px-4 text-xs text-[var(--text-muted)]">{r.cityName}</td>
                <td className="py-3.5 px-4 text-xs">
                  <span className="px-2 py-0.5 rounded-full bg-[var(--plum-900)] text-[var(--plum-300)] font-bold text-[10px]">
                    {r.certificationLevel}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-xs text-[var(--text-muted)] font-mono">{r.phone}</td>
                <td className="py-3.5 px-4 text-right text-xs font-bold text-white tabular-nums">
                  {r.officiatedCount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

