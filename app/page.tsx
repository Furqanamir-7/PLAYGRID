import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { formatMatchDate, formatPKR } from "@/lib/formatters";
import { 
  Trophy, 
  Flame, 
  Calendar, 
  ArrowRight, 
  Shield, 
  Target, 
  MapPin, 
  CheckCircle2, 
  Users, 
  Award,
  ChevronRight
} from "lucide-react";


export default async function HomePage() {
  const user = await getCurrentUser();
  const db = getDb();

  // Real Counts from DB
  const totalTournaments = db.tournaments.length;
  const totalTeams = db.teams.length;
  const totalPlayers = db.players.length;
  const totalGoals = db.matchEvents.filter((e) => e.eventType === "GOAL").length;

  // Active Ongoing Tournament (Karachi)
  const activeTournament = db.tournaments.find((t) => t.status === "ONGOING") || db.tournaments[0];

  // Next 5 Upcoming Matches
  const upcomingMatches = db.matches
    .filter((m) => m.status === "SCHEDULED")
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
    .slice(0, 5)
    .map((m) => {
      const ht = db.teams.find((t) => t.id === m.homeTeamId);
      const at = db.teams.find((t) => t.id === m.awayTeamId);
      const ven = db.venues.find((v) => v.id === m.venueId);
      const city = ven ? db.cities.find((c) => c.id === ven.cityId) : null;
      const tourn = db.tournaments.find((t) => t.id === m.tournamentId);
      return {
        ...m,
        homeTeam: ht,
        awayTeam: at,
        venue: ven,
        city,
        tournament: tourn,
      };
    });

  // Latest Results (5)
  const latestResults = db.matches
    .filter((m) => m.status === "COMPLETED")
    .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())
    .slice(0, 4)
    .map((m) => {
      const ht = db.teams.find((t) => t.id === m.homeTeamId);
      const at = db.teams.find((t) => t.id === m.awayTeamId);
      const res = db.matchResults.find((r) => r.matchId === m.id);
      const ven = db.venues.find((v) => v.id === m.venueId);
      const tourn = db.tournaments.find((t) => t.id === m.tournamentId);
      return {
        ...m,
        homeTeam: ht,
        awayTeam: at,
        result: res,
        venue: ven,
        tournament: tourn,
      };
    });

  // Top Scorer Spotlight (Goals view simulation)
  const playerGoalsMap: Record<string, { count: number; teamId: string }> = {};
  db.matchEvents
    .filter((e) => e.eventType === "GOAL")
    .forEach((e) => {
      if (!playerGoalsMap[e.playerId]) {
        playerGoalsMap[e.playerId] = { count: 0, teamId: e.teamId };
      }
      playerGoalsMap[e.playerId].count++;
    });

  const sortedScorers = Object.entries(playerGoalsMap)
    .map(([playerId, data]) => {
      const player = db.players.find((p) => p.id === playerId);
      const team = db.teams.find((t) => t.id === data.teamId);
      return {
        player,
        team,
        goals: data.count,
      };
    })
    .sort((a, b) => b.goals - a.goals);

  const topScorer = sortedScorers[0];

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)]">
      <Navbar user={user} />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 bg-grid-pattern radial-plum-glow border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--plum-900)]/80 border border-[var(--plum-500)]/40 text-xs font-semibold text-[var(--plum-100)] shadow-inner">
            <span className="w-2 h-2 rounded-full bg-[var(--plum-300)] animate-ping" />
            Pakistan's Premier Futsal Platform
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white font-['Space_Grotesk'] leading-[1.1]">
            Pakistan's Futsal, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--plum-300)] to-[var(--plum-500)]">
              Organised.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-[var(--text-muted)] font-normal leading-relaxed">
            Professional tournament operations for clubs, players, and organizers. Live standings, verified referee rosters, match timelines, and automatic bracket advancement.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/tournaments"
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold bg-[var(--plum-500)] text-white hover:bg-[var(--plum-300)] hover:text-[var(--bg)] transition-all shadow-lg shadow-[var(--plum-900)]/60 transform hover:-translate-y-0.5"
            >
              <Trophy className="w-4 h-4" />
              Explore Tournaments
            </Link>
            <Link
              href="/register"
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold bg-[var(--surface-2)] text-white hover:bg-[var(--surface)] border border-[var(--border)] transition-all"
            >
              <Shield className="w-4 h-4 text-[var(--plum-300)]" />
              Register Your Team
            </Link>
          </div>
        </div>
      </section>

      {/* Real Database Stats Strip */}
      <section className="border-b border-[var(--border)] bg-[var(--surface)] py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center divide-y md:divide-y-0 md:divide-x divide-[var(--border)]">
            <div className="py-2">
              <div className="text-3xl sm:text-4xl font-extrabold text-white font-['Space_Grotesk'] tabular-nums">
                {totalTournaments}
              </div>
              <div className="text-xs uppercase tracking-wider text-[var(--plum-300)] font-semibold mt-1">
                Tournaments
              </div>
            </div>
            <div className="py-2">
              <div className="text-3xl sm:text-4xl font-extrabold text-white font-['Space_Grotesk'] tabular-nums">
                {totalTeams}
              </div>
              <div className="text-xs uppercase tracking-wider text-[var(--plum-300)] font-semibold mt-1">
                Active Teams
              </div>
            </div>
            <div className="py-2">
              <div className="text-3xl sm:text-4xl font-extrabold text-white font-['Space_Grotesk'] tabular-nums">
                {totalPlayers}
              </div>
              <div className="text-xs uppercase tracking-wider text-[var(--plum-300)] font-semibold mt-1">
                Rostered Players
              </div>
            </div>
            <div className="py-2">
              <div className="text-3xl sm:text-4xl font-extrabold text-[var(--plum-500)] font-['Space_Grotesk'] tabular-nums">
                {totalGoals}
              </div>
              <div className="text-xs uppercase tracking-wider text-[var(--plum-300)] font-semibold mt-1">
                Goals Recorded
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Ongoing Tournament Banner */}
      {activeTournament && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
          <div className="rounded-2xl border border-[var(--plum-700)] bg-gradient-to-r from-[var(--plum-900)]/60 via-[var(--surface)] to-[var(--surface-2)] p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[var(--success)]/20 text-[var(--success)] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse" />
                  Live & Ongoing
                </span>
                <span className="text-xs text-[var(--text-muted)] uppercase font-semibold">
                  Karachi · Single Round-Robin
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Space_Grotesk']">
                {activeTournament.name}
              </h2>
              <p className="text-sm text-[var(--text-muted)] max-w-xl">
                {activeTournament.description}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--plum-100)] pt-1">
                <span>Prize Pool: <strong className="text-white">{formatPKR(activeTournament.prizePoolPkr)}</strong></span>
                <span>·</span>
                <span>Entry Fee: <strong className="text-white">{formatPKR(activeTournament.entryFeePkr)}</strong></span>
                <span>·</span>
                <span>Teams: <strong className="text-white">8 Registered</strong></span>
              </div>
            </div>

            <Link
              href={`/tournaments/${activeTournament.slug}`}
              className="shrink-0 flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--plum-500)] hover:bg-[var(--plum-300)] hover:text-[var(--bg)] text-white text-sm font-bold transition-all shadow-md"
            >
              View Standings & Fixtures
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      )}

      {/* Main Grid: Upcoming Matches & Latest Results */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upcoming Matches (Col 1 & 2) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[var(--plum-300)]" />
                <h3 className="text-xl font-bold text-white font-['Space_Grotesk']">
                  Upcoming Matches
                </h3>
              </div>
              <Link href="/matches" className="text-xs font-semibold text-[var(--plum-300)] hover:underline flex items-center gap-1">
                All Matches <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {upcomingMatches.map((m) => (
                <Link
                  key={m.id}
                  href={`/matches/${m.id}`}
                  className="block p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)] hover:border-[var(--plum-500)]/60 transition-all duration-200 group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--plum-300)]">
                        {m.tournament?.name} · Round {m.roundNumber}
                      </div>

                      {/* Teams Row */}
                      <div className="flex items-center justify-between sm:justify-start sm:gap-6 text-sm font-bold text-white">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: m.homeTeam?.primaryColor || "#8E4585" }}
                          />
                          <span>{m.homeTeam?.name}</span>
                        </div>
                        <span className="text-xs px-2 py-0.5 rounded bg-[var(--surface-2)] text-[var(--text-muted)] font-normal">
                          VS
                        </span>
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: m.awayTeam?.primaryColor || "#5E2A59" }}
                          />
                          <span>{m.awayTeam?.name}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-[var(--border)]">
                      <div className="text-xs font-semibold text-white">
                        {formatMatchDate(m.scheduledAt)}
                      </div>
                      <div className="text-[11px] text-[var(--text-muted)] flex items-center sm:justify-end gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-[var(--plum-300)]" />
                        {m.venue?.name}, {m.city?.name}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Sidebar Spotlight: Top Scorer & Quick Standings Preview */}
          <div className="space-y-6">
            {/* Top Scorer Card */}
            {topScorer && (
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 space-y-4 shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-[var(--warning)]" />
                    <h4 className="text-base font-bold text-white font-['Space_Grotesk']">
                      Golden Boot Leader
                    </h4>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--plum-900)] text-[var(--plum-100)] uppercase font-semibold">
                    Top Scorer
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-[var(--plum-900)] border-2 border-[var(--plum-500)] flex items-center justify-center text-white text-xl font-extrabold font-['Space_Grotesk']">
                    {topScorer.player?.fullName.charAt(0)}
                  </div>
                  <div>
                    <h5 className="font-extrabold text-white text-base">
                      {topScorer.player?.fullName}
                    </h5>
                    <p className="text-xs text-[var(--text-muted)]">
                      {topScorer.team?.name} · {topScorer.player?.preferredPosition}
                    </p>
                    <div className="flex items-baseline gap-1 mt-1 text-[var(--plum-300)]">
                      <span className="text-2xl font-extrabold font-['Space_Grotesk']">{topScorer.goals}</span>
                      <span className="text-xs font-semibold uppercase">Goals Scored</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Latest Completed Results */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 space-y-4 shadow-md">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-bold text-white font-['Space_Grotesk'] flex items-center gap-2">
                  <Flame className="w-4 h-4 text-[var(--plum-500)]" />
                  Latest Results
                </h4>
                <Link href="/matches?status=COMPLETED" className="text-xs text-[var(--plum-300)] hover:underline">
                  More
                </Link>
              </div>

              <div className="space-y-3">
                {latestResults.map((m) => (
                  <Link
                    key={m.id}
                    href={`/matches/${m.id}`}
                    className="block p-3 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--plum-900)]/30 border border-transparent hover:border-[var(--plum-500)]/40 transition-all text-xs"
                  >
                    <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] mb-1">
                      <span>{m.tournament?.name}</span>
                      <span>FT</span>
                    </div>
                    <div className="flex items-center justify-between font-bold text-white">
                      <span className="truncate pr-2">{m.homeTeam?.name}</span>
                      <span className="text-sm font-extrabold text-[var(--plum-300)] px-2 py-0.5 rounded bg-[var(--bg)]">
                        {m.result?.homeScore} - {m.result?.awayScore}
                      </span>
                      <span className="truncate pl-2 text-right">{m.awayTeam?.name}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Cities Showcase Strip */}
        <div className="pt-8 border-t border-[var(--border)]">
          <div className="text-center space-y-2 mb-6">
            <h3 className="text-lg font-bold text-white font-['Space_Grotesk']">
              Futsal Venues Across Pakistan
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              Official floodlit pitches and indoor stadiums in 8 major sports centers
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            {db.cities.map((city) => (
              <Link
                key={city.id}
                href={`/venues?city=${city.id}`}
                className="px-4 py-2 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-2)] border border-[var(--border)] hover:border-[var(--plum-500)] text-xs font-semibold text-white transition-all flex items-center gap-1.5"
              >
                <MapPin className="w-3.5 h-3.5 text-[var(--plum-300)]" />
                {city.name} ({city.province})
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
