"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Award, Trophy, Plus, Trash2, X, Zap, CheckCircle2 } from "lucide-react";

interface ResultEntryModalProps {
  match: any;
  homePlayers: any[];
  awayPlayers: any[];
  onClose: () => void;
  onSuccess: () => void;
}

export function ResultEntryModal({
  match,
  homePlayers,
  awayPlayers,
  onClose,
  onSuccess,
}: ResultEntryModalProps) {
  const [homeScore, setHomeScore] = useState(match.result?.homeScore ?? 0);
  const [awayScore, setAwayScore] = useState(match.result?.awayScore ?? 0);
  const [homePenalties, setHomePenalties] = useState<string>(
    match.result?.homePenalties?.toString() || ""
  );
  const [awayPenalties, setAwayPenalties] = useState<string>(
    match.result?.awayPenalties?.toString() || ""
  );
  const [homeFouls, setHomeFouls] = useState(match.result?.homeFouls ?? 2);
  const [awayFouls, setAwayFouls] = useState(match.result?.awayFouls ?? 3);
  const [motmPlayerId, setMotmPlayerId] = useState(match.result?.manOfTheMatchPlayerId || "");
  const [submitting, setSubmitting] = useState(false);

  // Dynamic Event list
  const [events, setEvents] = useState<
    Array<{
      teamId: string;
      playerId: string;
      eventType: "GOAL" | "OWN_GOAL" | "YELLOW_CARD" | "RED_CARD" | "FOUL";
      minute: number;
    }>
  >([]);

  // Trigger feedback state
  const [triggerFired, setTriggerFired] = useState(false);

  const isKnockout = match.stage?.isKnockout || match.stageName?.toLowerCase().includes("final");
  const isLevel = homeScore === awayScore;

  const allMatchPlayers = [
    ...homePlayers.map((p) => ({ ...p, teamName: match.homeTeam?.name, teamId: match.homeTeamId })),
    ...awayPlayers.map((p) => ({ ...p, teamName: match.awayTeam?.name, teamId: match.awayTeamId })),
  ];

  const handleAddGoal = (teamId: string, playerId: string, min: number) => {
    if (!playerId) {
      toast.error("Please pick a scorer from the team squad");
      return;
    }
    setEvents([...events, { teamId, playerId, eventType: "GOAL", minute: min }]);
  };

  const handleSaveResult = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/matches/result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchId: match.id,
          homeScore: Number(homeScore),
          awayScore: Number(awayScore),
          homePenalties: homePenalties ? Number(homePenalties) : null,
          awayPenalties: awayPenalties ? Number(awayPenalties) : null,
          homeFouls: Number(homeFouls),
          awayFouls: Number(awayFouls),
          manOfTheMatchPlayerId: motmPlayerId || null,
          events,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save match result");

      setTriggerFired(true);
      toast.success(
        "Match result saved! Database triggers automatically recalculated standings, top scorers, and advanced knockout brackets."
      );
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8 space-y-6 shadow-2xl my-8">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-2 rounded-xl text-[var(--text-muted)] hover:text-white hover:bg-[var(--surface-2)]"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--plum-300)]">
            <Trophy className="w-4 h-4" /> Official Scorecard Entry
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white font-['Space_Grotesk']">
            {match.homeTeam?.name} vs {match.awayTeam?.name}
          </h2>
          <p className="text-xs text-[var(--text-muted)]">
            {match.tournament?.name} · Round {match.roundNumber}
          </p>
        </div>

        {triggerFired && (
          <div className="p-4 rounded-xl bg-[var(--success)]/20 border border-[var(--success)] text-xs text-[var(--success)] flex items-center gap-2 animate-pulse">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <div>
              <strong>Database Triggers Executed:</strong>
              <p className="mt-0.5">
                • <code>trg_update_standings</code> recalculated points & goal difference.
                {match.nextMatchId && " • trg_advance_knockout_winner placed winner into next bracket slot."}
                • <code>trg_audit_results</code> logged to immutable audit trail.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSaveResult} className="space-y-6">
          {/* Score inputs */}
          <div className="grid grid-cols-2 gap-6 p-4 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)]">
            <div className="space-y-2 text-center">
              <label className="text-xs font-bold text-white block truncate">
                {match.homeTeam?.name} Score
              </label>
              <input
                type="number"
                min={0}
                value={homeScore}
                onChange={(e) => setHomeScore(parseInt(e.target.value) || 0)}
                required
                className="w-20 mx-auto px-3 py-2 text-center rounded-xl bg-[var(--bg)] border border-[var(--border)] text-2xl font-black text-white focus:outline-none focus:border-[var(--plum-500)] tabular-nums"
              />
              <div className="text-[11px] text-[var(--text-muted)]">
                Fouls:{" "}
                <input
                  type="number"
                  min={0}
                  value={homeFouls}
                  onChange={(e) => setHomeFouls(parseInt(e.target.value) || 0)}
                  className="w-12 px-1 py-0.5 rounded bg-[var(--bg)] border border-[var(--border)] text-center text-xs font-bold text-white"
                />
              </div>
            </div>

            <div className="space-y-2 text-center">
              <label className="text-xs font-bold text-white block truncate">
                {match.awayTeam?.name} Score
              </label>
              <input
                type="number"
                min={0}
                value={awayScore}
                onChange={(e) => setAwayScore(parseInt(e.target.value) || 0)}
                required
                className="w-20 mx-auto px-3 py-2 text-center rounded-xl bg-[var(--bg)] border border-[var(--border)] text-2xl font-black text-white focus:outline-none focus:border-[var(--plum-500)] tabular-nums"
              />
              <div className="text-[11px] text-[var(--text-muted)]">
                Fouls:{" "}
                <input
                  type="number"
                  min={0}
                  value={awayFouls}
                  onChange={(e) => setAwayFouls(parseInt(e.target.value) || 0)}
                  className="w-12 px-1 py-0.5 rounded bg-[var(--bg)] border border-[var(--border)] text-center text-xs font-bold text-white"
                />
              </div>
            </div>
          </div>

          {/* Penalties (Only when level in knockout) */}
          {isKnockout && isLevel && (
            <div className="p-4 rounded-xl bg-[var(--plum-900)]/40 border border-[var(--plum-700)] space-y-2">
              <span className="text-xs font-bold text-[var(--plum-100)] block">
                Knockout Tie-breaker: Penalty Shootout
              </span>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  placeholder="Home Pens (e.g. 5)"
                  value={homePenalties}
                  onChange={(e) => setHomePenalties(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-xs text-white"
                />
                <input
                  type="number"
                  placeholder="Away Pens (e.g. 4)"
                  value={awayPenalties}
                  onChange={(e) => setAwayPenalties(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-xs text-white"
                />
              </div>
            </div>
          )}

          {/* Man of the Match Picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text-muted)] flex items-center gap-1.5">
              <Award className="w-4 h-4 text-[var(--warning)]" /> Man of the Match
            </label>
            <select
              value={motmPlayerId}
              onChange={(e) => setMotmPlayerId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-xs text-white focus:outline-none focus:border-[var(--plum-500)]"
            >
              <option value="">Select MOTM Player</option>
              {allMatchPlayers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.fullName} ({p.teamName} · #{p.jerseyNumber})
                </option>
              ))}
            </select>
          </div>

          {/* Event Logger (Goals / Cards) */}
          <div className="space-y-3 pt-2 border-t border-[var(--border)]">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--plum-300)] block">
              Match Events to Record ({events.length})
            </span>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  if (homePlayers.length > 0) {
                    handleAddGoal(match.homeTeamId, homePlayers[0].playerId || homePlayers[0].id, 12);
                  }
                }}
                className="px-3 py-1.5 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--plum-900)] text-xs font-semibold text-white border border-[var(--border)]"
              >
                + Goal ({match.homeTeam?.shortName})
              </button>
              <button
                type="button"
                onClick={() => {
                  if (awayPlayers.length > 0) {
                    handleAddGoal(match.awayTeamId, awayPlayers[0].playerId || awayPlayers[0].id, 18);
                  }
                }}
                className="px-3 py-1.5 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--plum-900)] text-xs font-semibold text-white border border-[var(--border)]"
              >
                + Goal ({match.awayTeam?.shortName})
              </button>
            </div>

            {events.map((evt, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-lg bg-[var(--surface-2)] text-xs"
              >
                <span>
                  {evt.eventType} at {evt.minute}'
                </span>
                <button
                  type="button"
                  onClick={() => setEvents(events.filter((_, i) => i !== idx))}
                  className="text-[var(--danger)] hover:underline"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-[var(--plum-500)] hover:bg-[var(--plum-300)] hover:text-[var(--bg)] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Zap className="w-4 h-4" />
            {submitting ? "Executing DB Triggers & Saving..." : "Commit Score & Fire Triggers"}
          </button>
        </form>
      </div>
    </div>
  );
}

