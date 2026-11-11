import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { Shield, MapPin, Users, ArrowRight } from "lucide-react";


export default async function TeamsListPage({
  searchParams,
}: {
  searchParams: Promise<{ city?: string }>;
}) {
  const user = await getCurrentUser();
  const db = getDb();
  const params = await searchParams;

  const teams = db.teams
    .filter((t) => (params.city ? t.cityId === params.city : true))
    .map((t) => {
      const city = db.cities.find((c) => c.id === t.cityId);
      const squadCount = db.teamPlayers.filter((tp) => tp.teamId === t.id).length;
      return {
        ...t,
        cityName: city?.name || "Pakistan",
        squadCount,
      };
    });

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)]">
      <Navbar user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8 flex-1">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--plum-900)] text-xs font-semibold text-[var(--plum-100)]">
            <Shield className="w-3.5 h-3.5 text-[var(--plum-300)]" />
            Clubs & Squads
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-['Space_Grotesk']">
            Registered Futsal Teams
          </h1>
          <p className="text-sm text-[var(--text-muted)] max-w-2xl">
            Directory of 24 premier futsal clubs across Karachi, Lahore, and Islamabad/Rawalpindi.
          </p>
        </div>

        {/* City Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 border-b border-[var(--border)] pb-4 text-xs">
          <Link
            href="/teams"
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              !params.city
                ? "bg-[var(--plum-500)] text-white"
                : "bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-white"
            }`}
          >
            All Cities ({db.teams.length})
          </Link>
          <Link
            href="/teams?city=city_khi"
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              params.city === "city_khi"
                ? "bg-[var(--plum-500)] text-white"
                : "bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-white"
            }`}
          >
            Karachi (8)
          </Link>
          <Link
            href="/teams?city=city_lhr"
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              params.city === "city_lhr"
                ? "bg-[var(--plum-500)] text-white"
                : "bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-white"
            }`}
          >
            Lahore (8)
          </Link>
          <Link
            href="/teams?city=city_isb"
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              params.city === "city_isb"
                ? "bg-[var(--plum-500)] text-white"
                : "bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-white"
            }`}
          >
            Islamabad / Rawalpindi (8)
          </Link>
        </div>

        {/* Teams Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {teams.map((t) => (
            <Link
              key={t.id}
              href={`/teams/${t.id}`}
              className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)] hover:border-[var(--plum-500)] transition-all duration-200 space-y-3 group"
            >
              <div className="flex items-center justify-between">
                <span
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-base font-extrabold shadow-sm"
                  style={{ backgroundColor: t.primaryColor || "#8E4585" }}
                >
                  {t.shortName}
                </span>
                <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[var(--plum-300)]" />
                  {t.cityName}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-white text-base group-hover:text-[var(--plum-300)] transition-colors">
                  {t.name}
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Est. {t.foundedYear} · {t.squadCount} Players Rostered
                </p>
              </div>

              <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between text-xs text-[var(--plum-100)] font-semibold">
                <span>View Roster</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}

