import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { formatPKR, formatMatchDate, formatShortDate } from "@/lib/formatters";
import { 
  Users, 
  Shield, 
  Calendar, 
  Trophy, 
  CreditCard, 
  PlusCircle, 
  CheckCircle, 
  Clock, 
  XCircle,
  ArrowRight
} from "lucide-react";


export default async function PortalDashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const db = getDb();

  // Find teams managed by this user
  let myTeams = db.teams.filter((t) => t.managerId === user.id);
  // If the user just registered and has no team yet, fall back to the first available team or show create prompt
  if (myTeams.length === 0 && user.role === "TEAM_MANAGER") {
    // Show Clifton Strikers as default if manager.cls or give quick assign
    const matchingShort = user.email.split("@")[0].replace("manager.", "").toUpperCase();
    const found = db.teams.find((t) => t.shortName === matchingShort);
    if (found) {
      myTeams = [found];
    } else {
      myTeams = [db.teams[0]];
    }
  }

  const myTeamIds = myTeams.map((t) => t.id);

  // My registrations
  const myRegistrations = db.registrations
    .filter((r) => myTeamIds.includes(r.teamId))
    .map((r) => {
      const tourn = db.tournaments.find((t) => t.id === r.tournamentId);
      const team = db.teams.find((t) => t.id === r.teamId);
      const payment = db.payments.find((p) => p.registrationId === r.id);
      return {
        ...r,
        tournament: tourn,
        team,
        payment,
      };
    });

  // Upcoming matches for my teams
  const myMatches = db.matches
    .filter(
      (m) =>
        (myTeamIds.includes(m.homeTeamId) || (m.awayTeamId && myTeamIds.includes(m.awayTeamId))) &&
        m.status === "SCHEDULED"
    )
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
    .map((m) => {
      const ht = db.teams.find((t) => t.id === m.homeTeamId);
      const at = db.teams.find((t) => t.id === m.awayTeamId);
      const ven = db.venues.find((v) => v.id === m.venueId);
      const tourn = db.tournaments.find((t) => t.id === m.tournamentId);
      return {
        ...m,
        homeTeam: ht,
        awayTeam: at,
        venue: ven,
        tournament: tourn,
      };
    });

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)]">
      <Navbar user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8 flex-1">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--plum-300)]">
              Team Manager Portal
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white font-['Space_Grotesk']">
              Welcome back, {user.name}
            </h1>
            <p className="text-xs text-[var(--text-muted)]">
              Manage your futsal club roster, submit tournament entries, and track payment verifications
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/portal/register"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--plum-500)] hover:bg-[var(--plum-300)] hover:text-[var(--bg)] text-white text-xs font-bold transition-all shadow-md"
            >
              <PlusCircle className="w-4 h-4" />
              Register for Tournament
            </Link>
          </div>
        </div>

        {/* My Teams Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white font-['Space_Grotesk'] flex items-center gap-2">
              <Shield className="w-5 h-5 text-[var(--plum-300)]" />
              My Managed Teams ({myTeams.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myTeams.map((team) => {
              const city = db.cities.find((c) => c.id === team.cityId);
              const playersCount = db.teamPlayers.filter((tp) => tp.teamId === team.id).length;

              return (
                <div
                  key={team.id}
                  className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-black shadow-sm"
                        style={{ backgroundColor: team.primaryColor || "#8E4585" }}
                      >
                        {team.shortName}
                      </span>
                      <div>
                        <h3 className="font-bold text-white text-lg">{team.name}</h3>
                        <p className="text-xs text-[var(--text-muted)]">
                          {city?.name} · Founded {team.foundedYear || 2021}
                        </p>
                      </div>
                    </div>

                    <Link
                      href={`/teams/${team.id}`}
                      className="text-xs font-semibold text-[var(--plum-300)] hover:underline"
                    >
                      Public Profile →
                    </Link>
                  </div>

                  <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs">
                    <span className="text-[var(--text-muted)]">
                      Roster Size: <strong className="text-white">{playersCount} Players</strong>
                    </span>
                    <Link
                      href={`/portal/teams/${team.id}/players`}
                      className="px-3 py-1.5 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--plum-900)] text-white font-semibold transition-colors border border-[var(--border)]"
                    >
                      Manage Squad Roster
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tournament Registration Statuses */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white font-['Space_Grotesk'] flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[var(--plum-300)]" />
            Tournament Registrations & Slips
          </h2>

          {myRegistrations.length === 0 ? (
            <div className="p-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-center space-y-3">
              <p className="text-sm text-[var(--text-muted)]">
                You haven't registered your team for any upcoming tournaments yet.
              </p>
              <Link
                href="/portal/register"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--plum-500)] text-white text-xs font-bold"
              >
                Register for Lahore Winter Futsal Cup
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {myRegistrations.map((reg) => {
                const isApproved = reg.status === "APPROVED";
                const isPending = reg.status === "PENDING";
                const isRejected = reg.status === "REJECTED";

                return (
                  <div
                    key={reg.id}
                    className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 ${
                            isApproved
                              ? "bg-[var(--success)]/20 text-[var(--success)]"
                              : isPending
                              ? "bg-[var(--warning)]/20 text-[var(--warning)]"
                              : "bg-[var(--danger)]/20 text-[var(--danger)]"
                          }`}
                        >
                          {isApproved && <CheckCircle className="w-3 h-3" />}
                          {isPending && <Clock className="w-3 h-3" />}
                          {isRejected && <XCircle className="w-3 h-3" />}
                          {reg.status}
                        </span>
                        <span className="text-xs text-[var(--text-muted)]">
                          Submitted {formatShortDate(reg.submittedAt)}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-white">
                        {reg.tournament?.name}
                      </h4>

                      <p className="text-xs text-[var(--text-muted)]">
                        Team: {reg.team?.name} · Fee: {formatPKR(reg.tournament?.entryFeePkr)}
                      </p>

                      {reg.rejectionReason && (
                        <div className="text-xs text-[var(--danger)] font-medium bg-[var(--danger)]/10 p-2 rounded-lg mt-2">
                          Rejection Reason: {reg.rejectionReason}
                        </div>
                      )}
                    </div>

                    <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-[var(--border)] space-y-1">
                      <div className="text-xs text-[var(--text-muted)]">
                        Payment Ref: <strong className="text-white">{reg.payment?.transactionRef || "N/A"}</strong>
                      </div>
                      <div className="text-xs">
                        Method: <span className="font-semibold text-[var(--plum-300)]">{reg.payment?.method}</span> (Status: {reg.payment?.status})
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Upcoming Fixtures for My Teams */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white font-['Space_Grotesk'] flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[var(--plum-300)]" />
            Upcoming Club Matches
          </h2>

          {myMatches.length === 0 ? (
            <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-center text-xs text-[var(--text-muted)]">
              No upcoming scheduled matches for your club at this time.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myMatches.map((m) => (
                <div
                  key={m.id}
                  className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between text-[var(--plum-300)] font-semibold text-[11px]">
                    <span>{m.tournament?.name}</span>
                    <span>Round {m.roundNumber}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm font-bold text-white">
                    <span>{m.homeTeam?.name}</span>
                    <span className="text-xs text-[var(--text-muted)] font-normal">VS</span>
                    <span>{m.awayTeam?.name}</span>
                  </div>
                  <div className="text-[var(--text-muted)] text-[11px]">
                    {formatMatchDate(m.scheduledAt)} · {m.venue?.name}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

