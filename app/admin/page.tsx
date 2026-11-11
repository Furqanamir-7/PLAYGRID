import React from "react";
import Link from "next/link";
import { getDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { formatPKR, formatMatchDate, formatShortDate } from "@/lib/formatters";
import { DashboardCharts } from "@/components/admin/DashboardCharts";
import { 
  Trophy, 
  Users, 
  Calendar, 
  FileCheck, 
  CreditCard, 
  Flame, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  ArrowRight,
  Database
} from "lucide-react";


export default async function AdminDashboardPage() {
  const user = await getCurrentUser();
  const db = getDb();

  // Real KPIs matching Section 7 & v_tournament_summary
  const totalTournaments = db.tournaments.length;
  const totalTeams = db.teams.length;
  const totalPlayers = db.players.length;
  const upcomingMatches = db.matches.filter((m) => m.status === "SCHEDULED").length;
  const completedMatches = db.matches.filter((m) => m.status === "COMPLETED").length;

  // Verified Revenue in PKR
  const verifiedRevenue = db.payments
    .filter((p) => p.status === "VERIFIED")
    .reduce((sum, p) => sum + Number(p.amountPkr), 0);

  // Pending Registrations
  const pendingRegistrations = db.registrations.filter((r) => r.status === "PENDING");
  const pendingPayments = db.payments.filter((p) => p.status === "PENDING");

  // Chart 1: Goals per tournament
  const goalsData = db.tournaments.map((t) => {
    const tMatchIds = db.matches.filter((m) => m.tournamentId === t.id).map((m) => m.id);
    const goalsCount = db.matchEvents.filter(
      (e) => e.eventType === "GOAL" && tMatchIds.includes(e.matchId)
    ).length;
    return {
      name: t.name.replace("PlayGrid ", "").replace(" 2026", ""),
      goals: goalsCount,
    };
  });

  // Chart 2: Registrations timeline
  const regTimeline = [
    { date: "Aug 2026", registrations: 8 },
    { date: "Sep 2026", registrations: 4 },
    { date: "Oct 2026", registrations: 8 },
    { date: "Nov 2026", registrations: 6 },
  ];

  // Today's / Next Matches
  const upcomingMatchList = db.matches
    .filter((m) => m.status === "SCHEDULED")
    .slice(0, 4)
    .map((m) => {
      const ht = db.teams.find((t) => t.id === m.homeTeamId);
      const at = db.teams.find((t) => t.id === m.awayTeamId);
      const tourn = db.tournaments.find((t) => t.id === m.tournamentId);
      const ven = db.venues.find((v) => v.id === m.venueId);
      return {
        ...m,
        homeTeam: ht,
        awayTeam: at,
        tournament: tourn,
        venue: ven,
      };
    });

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Space_Grotesk']">
            Tournament Operations Dashboard
          </h1>
          <p className="text-xs text-[var(--text-muted)]">
            Verified financial receipts, referee rosters, and live trigger recalculations
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/matches"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--plum-500)] hover:bg-[var(--plum-300)] hover:text-[var(--bg)] text-white text-xs font-bold transition-all shadow-md"
          >
            <Calendar className="w-3.5 h-3.5" />
            Enter Match Result
          </Link>
          <Link
            href="/admin/sql-lab"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--surface-2)] text-[var(--plum-300)] hover:text-white border border-[var(--border)] text-xs font-bold transition-all"
          >
            <Database className="w-3.5 h-3.5" />
            SQL Lab (25+ Queries)
          </Link>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">
            Tournaments
          </span>
          <div className="text-2xl font-black text-white font-['Space_Grotesk'] tabular-nums">
            {totalTournaments}
          </div>
          <span className="text-[10px] text-[var(--plum-300)] font-semibold">1 Live · 1 Open · 1 Done</span>
        </div>

        <div className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">
            Total Teams
          </span>
          <div className="text-2xl font-black text-white font-['Space_Grotesk'] tabular-nums">
            {totalTeams}
          </div>
          <span className="text-[10px] text-[var(--plum-300)] font-semibold">24 Futsal Clubs</span>
        </div>

        <div className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">
            Rostered Players
          </span>
          <div className="text-2xl font-black text-white font-['Space_Grotesk'] tabular-nums">
            {totalPlayers}
          </div>
          <span className="text-[10px] text-[var(--plum-300)] font-semibold">Verified Pakistani CNICs</span>
        </div>

        <div className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">
            Matches Played
          </span>
          <div className="text-2xl font-black text-white font-['Space_Grotesk'] tabular-nums">
            {completedMatches}
          </div>
          <span className="text-[10px] text-[var(--success)] font-semibold">{upcomingMatches} Scheduled</span>
        </div>

        <div className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">
            Verified Revenue
          </span>
          <div className="text-xl font-black text-[var(--success)] font-['Space_Grotesk'] tabular-nums">
            {formatPKR(verifiedRevenue)}
          </div>
          <span className="text-[10px] text-[var(--text-muted)]">Real Fee Receipts</span>
        </div>

        <div className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">
            Pending Actions
          </span>
          <div className="text-2xl font-black text-[var(--warning)] font-['Space_Grotesk'] tabular-nums">
            {pendingRegistrations.length + pendingPayments.length}
          </div>
          <span className="text-[10px] text-[var(--warning)] font-semibold">Requires Review</span>
        </div>
      </div>

      {/* Analytics Charts */}
      <DashboardCharts goalsData={goalsData} regData={regTimeline} />

      {/* Two Column Grid: Pending Approvals & Scheduled Fixtures */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Actions List */}
        <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-4 shadow-md">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white font-['Space_Grotesk'] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[var(--warning)]" />
              Pending Registrations & Payments
            </h3>
            <Link href="/admin/registrations" className="text-xs text-[var(--plum-300)] hover:underline">
              View All
            </Link>
          </div>

          {pendingRegistrations.length === 0 ? (
            <div className="text-center py-8 text-xs text-[var(--text-muted)]">
              No pending registrations. All applications have been reviewed.
            </div>
          ) : (
            <div className="space-y-3">
              {pendingRegistrations.map((reg) => {
                const team = db.teams.find((t) => t.id === reg.teamId);
                const tourn = db.tournaments.find((t) => t.id === reg.tournamentId);
                const payment = db.payments.find((p) => p.registrationId === reg.id);

                return (
                  <div
                    key={reg.id}
                    className="p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-white text-sm">{team?.name}</div>
                      <div className="text-[11px] text-[var(--text-muted)]">
                        {tourn?.name} · Ref: <span className="text-[var(--plum-300)]">{payment?.transactionRef || "N/A"}</span>
                      </div>
                    </div>

                    <Link
                      href={`/admin/registrations?review=${reg.id}`}
                      className="px-3 py-1.5 rounded-lg bg-[var(--plum-500)] hover:bg-[var(--plum-300)] hover:text-[var(--bg)] text-white text-xs font-bold transition-all"
                    >
                      Review & Approve
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Scheduled Matches */}
        <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-4 shadow-md">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white font-['Space_Grotesk'] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[var(--plum-300)]" />
              Upcoming Scheduled Fixtures
            </h3>
            <Link href="/admin/matches" className="text-xs text-[var(--plum-300)] hover:underline">
              Manage Matches
            </Link>
          </div>

          <div className="space-y-3">
            {upcomingMatchList.map((m) => (
              <div
                key={m.id}
                className="p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-white text-sm">
                    {m.homeTeam?.name} vs {m.awayTeam?.name}
                  </div>
                  <div className="text-[11px] text-[var(--text-muted)]">
                    {m.tournament?.name} · {formatMatchDate(m.scheduledAt)}
                  </div>
                </div>

                <Link
                  href={`/admin/matches?enterResult=${m.id}`}
                  className="px-3 py-1.5 rounded-lg bg-[var(--surface)] hover:bg-[var(--plum-900)] text-[var(--plum-300)] border border-[var(--border)] text-xs font-bold transition-all"
                >
                  Enter Result
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

