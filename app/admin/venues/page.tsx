import React from "react";
import { getDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { MapPin, CheckCircle, Shield } from "lucide-react";


export default async function AdminVenuesPage() {
  const user = await getCurrentUser();
  const db = getDb();

  const venues = db.venues.map((v) => {
    const city = db.cities.find((c) => c.id === v.cityId);
    return {
      ...v,
      cityName: city?.name || "Pakistan",
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white font-['Space_Grotesk']">
          Futsal Venues & Arenas Master
        </h1>
        <p className="text-xs text-[var(--text-muted)]">
          Pitches with surface classifications and night floodlight compliance
        </p>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden shadow-lg">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--surface-2)] text-[11px] uppercase font-bold text-[var(--text-muted)] border-b border-[var(--border)]">
            <tr>
              <th className="py-3.5 px-4">Arena Name</th>
              <th className="py-3.5 px-4">City</th>
              <th className="py-3.5 px-4">Surface Type</th>
              <th className="py-3.5 px-4">Floodlights</th>
              <th className="py-3.5 px-4 text-right">Capacity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)] font-medium">
            {venues.map((v) => (
              <tr key={v.id} className="hover:bg-[var(--surface-2)]/60 transition-colors">
                <td className="py-3.5 px-4 font-bold text-white">
                  <div>{v.name}</div>
                  <div className="text-[10px] text-[var(--text-muted)] font-normal">{v.address}</div>
                </td>
                <td className="py-3.5 px-4 text-xs text-[var(--text-muted)]">{v.cityName}</td>
                <td className="py-3.5 px-4 text-xs capitalize text-[var(--plum-300)]">
                  {v.surfaceType.replace("_", " ")}
                </td>
                <td className="py-3.5 px-4 text-xs text-[var(--success)] font-semibold">
                  {v.hasFloodlights ? "Night Lights" : "Day Only"}
                </td>
                <td className="py-3.5 px-4 text-right text-xs font-bold text-white tabular-nums">
                  {v.capacity}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

