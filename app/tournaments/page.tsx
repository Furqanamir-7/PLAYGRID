import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { formatPKR, formatShortDate } from "@/lib/formatters";
import { Trophy, Calendar, MapPin, Users, ArrowRight } from "lucide-react";


export default async function TournamentsPage({
  searchParams,
}: {
  searchParams: Promise<{ city?: string; format?: string; status?: string }>;
}) {
  const user = await getCurrentUser();
  const db = getDb();
  const params = await searchParams;

  const tournaments = db.tournaments
    .filter((t) => {
      if (params.city && t.cityId !== params.city) return false;
      if (params.format && t.format !== params.format) return false;
      if (params.status && t.status !== params.status) return false;
      return true;
    })
    .map((t) => {
      const city = db.cities.find((c) => c.id === t.cityId);
      const approvedCount = db.registrations.filter(
        (r) => r.tournamentId === t.id && r.status === "APPROVED"
      ).length;
      return {
        ...t,
        cityName: city?.name || "Pakistan",
        approvedCount,
      };
    });

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)]">
      <Navbar user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--plum-900)] text-xs font-semibold text-[var(--plum-100)]">
            <Trophy className="w-3.5 h-3.5 text-[var(--plum-300)]" />
            Official Futsal Competitions
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-['Space_Grotesk']">
            Tournaments & Championships
          </h1>
          <p className="text-sm text-[var(--text-muted)] max-w-2xl">
            Browse live leagues, open winter cups, and completed corporate championships across Karachi, Lahore, and Islamabad.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-b border-[var(--border)] pb-4 text-xs">
          <Link
            href="/tournaments"
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              !params.status && !params.format
                ? "bg-[var(--plum-500)] text-white"
                : "bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-white"
            }`}
          >
            All Tournaments
          </Link>
          <Link
            href="/tournaments?status=ONGOING"
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              params.status === "ONGOING"
                ? "bg-[var(--plum-500)] text-white"
                : "bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-white"
            }`}
          >
            Ongoing
          </Link>
          <Link
            href="/tournaments?status=REGISTRATION_OPEN"
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              params.status === "REGISTRATION_OPEN"
                ? "bg-[var(--plum-500)] text-white"
                : "bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-white"
            }`}
          >
            Registration Open
          </Link>
          <Link
            href="/tournaments?status=COMPLETED"
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              params.status === "COMPLETED"
                ? "bg-[var(--plum-500)] text-white"
                : "bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-white"
            }`}
          >
            Completed
          </Link>
        </div>

        {/* Tournaments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map((t) => {
            const isOngoing = t.status === "ONGOING";
            const isOpen = t.status === "REGISTRATION_OPEN";
            const isCompleted = t.status === "COMPLETED";

            return (
              <div
                key={t.id}
                className="flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--plum-500)] transition-all duration-300 overflow-hidden shadow-lg group"
              >
                {/* Header Strip */}
                <div className="p-6 space-y-3 flex-1">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        isOngoing
                          ? "bg-[var(--success)]/20 text-[var(--success)]"
                          : isOpen
                          ? "bg-[var(--warning)]/20 text-[var(--warning)]"
                          : "bg-[var(--plum-900)] text-[var(--plum-300)]"
                      }`}
                    >
                      {t.status.replace("_", " ")}
                    </span>
                    <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[var(--plum-300)]" />
                      {t.cityName}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white font-['Space_Grotesk'] group-hover:text-[var(--plum-300)] transition-colors">
                    {t.name}
                  </h3>

                  <p className="text-xs text-[var(--text-muted)] line-clamp-2">
                    {t.description}
                  </p>

                  <div className="pt-3 border-t border-[var(--border)] grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[var(--text-muted)] block text-[10px] uppercase">Format</span>
                      <strong className="text-white">{t.format.replace("_", " ")}</strong>
                    </div>
                    <div>
                      <span className="text-[var(--text-muted)] block text-[10px] uppercase">Prize Pool</span>
                      <strong className="text-[var(--plum-300)]">{formatPKR(t.prizePoolPkr)}</strong>
                    </div>
                    <div>
                      <span className="text-[var(--text-muted)] block text-[10px] uppercase">Dates</span>
                      <strong className="text-white">{formatShortDate(t.startDate)} - {formatShortDate(t.endDate)}</strong>
                    </div>
                    <div>
                      <span className="text-[var(--text-muted)] block text-[10px] uppercase">Capacity</span>
                      <strong className="text-white">{t.approvedCount} / {t.maxTeams} Teams</strong>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-4 bg-[var(--surface-2)] border-t border-[var(--border)] flex items-center justify-between">
                  <span className="text-xs font-semibold text-[var(--text-muted)]">
                    Entry Fee: <strong className="text-white">{formatPKR(t.entryFeePkr)}</strong>
                  </span>
                  <Link
                    href={`/tournaments/${t.slug}`}
                    className="flex items-center gap-1.5 text-xs font-bold text-[var(--plum-300)] group-hover:text-white transition-colors"
                  >
                    View Details
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
}

