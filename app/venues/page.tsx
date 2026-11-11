import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { MapPin, CheckCircle, Phone, Users, Shield } from "lucide-react";


export default async function VenuesPage({
  searchParams,
}: {
  searchParams: Promise<{ city?: string }>;
}) {
  const user = await getCurrentUser();
  const db = getDb();
  const params = await searchParams;

  const venues = db.venues
    .filter((v) => (params.city ? v.cityId === params.city : true))
    .map((v) => {
      const city = db.cities.find((c) => c.id === v.cityId);
      const matchesHosted = db.matches.filter((m) => m.venueId === v.id).length;
      return {
        ...v,
        cityName: city?.name || "Pakistan",
        province: city?.province,
        matchesHosted,
      };
    });

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)]">
      <Navbar user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8 flex-1">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--plum-900)] text-xs font-semibold text-[var(--plum-100)]">
            <MapPin className="w-3.5 h-3.5 text-[var(--plum-300)]" />
            Certified Arenas & Turfs
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-['Space_Grotesk']">
            Futsal Venues Directory
          </h1>
          <p className="text-sm text-[var(--text-muted)] max-w-2xl">
            Tournament-grade floodlit turfs, indoor wooden courts, and sports arenas across Pakistani metropolitan cities.
          </p>
        </div>

        {/* City Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 border-b border-[var(--border)] pb-4 text-xs">
          <Link
            href="/venues"
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              !params.city
                ? "bg-[var(--plum-500)] text-white"
                : "bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-white"
            }`}
          >
            All Venues ({db.venues.length})
          </Link>
          {db.cities.map((c) => (
            <Link
              key={c.id}
              href={`/venues?city=${c.id}`}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                params.city === c.id
                  ? "bg-[var(--plum-500)] text-white"
                  : "bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-white"
              }`}
            >
              {c.name}
            </Link>
          ))}
        </div>

        {/* Venues Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {venues.map((v) => (
            <div
              key={v.id}
              className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-4 hover:border-[var(--plum-500)] transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[var(--plum-900)] text-[var(--plum-300)] font-semibold uppercase tracking-wider">
                  {v.surfaceType.replace("_", " ")}
                </span>
                <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[var(--plum-300)]" />
                  {v.cityName}
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white font-['Space_Grotesk']">
                  {v.name}
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  {v.address}
                </p>
              </div>

              <div className="pt-3 border-t border-[var(--border)] grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] uppercase text-[var(--text-muted)] block">Lighting</span>
                  <span className="font-semibold text-[var(--success)] flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    {v.hasFloodlights ? "Night Floodlights" : "Standard"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-[var(--text-muted)] block">Capacity</span>
                  <strong className="text-white">{v.capacity} Spectators</strong>
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs text-[var(--text-muted)]">
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[var(--plum-300)]" />
                  {v.contactPhone || "Arena Booking"}
                </span>
                <span className="text-[var(--plum-100)] font-semibold">
                  {v.matchesHosted} Matches Hosted
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}

