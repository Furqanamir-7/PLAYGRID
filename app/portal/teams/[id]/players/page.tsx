"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  Users, 
  Shield, 
  Plus, 
  Trash2, 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle 
} from "lucide-react";

export default function ManagePlayersPage() {
  const router = useRouter();
  const params = useParams();
  const teamId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [team, setTeam] = useState<any>(null);
  const [squad, setSquad] = useState<any[]>([]);

  // New Player Form State
  const [fullName, setFullName] = useState("");
  const [preferredPosition, setPreferredPosition] = useState("WINGER");
  const [jerseyNumber, setJerseyNumber] = useState("7");
  const [isCaptain, setIsCaptain] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchSquad = async () => {
    try {
      const res = await fetch(`/api/portal/teams/${teamId}`);
      if (!res.ok) throw new Error("Failed to load squad");
      const data = await res.json();
      setTeam(data.team);
      setSquad(data.squad);
    } catch (err: any) {
      toast.error(err.message || "Failed to load squad data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSquad();
  }, [teamId]);

  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch(`/api/portal/teams/${teamId}/players`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          preferredPosition,
          jerseyNumber: parseInt(jerseyNumber, 10),
          isCaptain,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to add player to squad");
      }

      toast.success(`${fullName} has been registered to the squad!`);
      setFullName("");
      setJerseyNumber((parseInt(jerseyNumber, 10) + 1).toString());
      setIsCaptain(false);
      fetchSquad();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] text-white">
        Loading squad management...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto w-full space-y-8">
        {/* Back Link */}
        <Link
          href="/portal"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--plum-300)] hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Portal Dashboard
        </Link>

        {/* Header */}
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--plum-300)]">
              Squad Management
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Space_Grotesk']">
              {team?.name} Roster
            </h1>
            <p className="text-xs text-[var(--text-muted)]">
              Current Squad: {squad.length} / 12 players (Enforcing DB constraints: Min 7, Max 12, unique kit numbers)
            </p>
          </div>
        </div>

        {/* Add Player Form */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-4">
          <h2 className="text-lg font-bold text-white font-['Space_Grotesk'] flex items-center gap-2">
            <Plus className="w-5 h-5 text-[var(--plum-300)]" />
            Add New Player to Squad
          </h2>

          <form onSubmit={handleAddPlayer} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-semibold text-[var(--text-muted)]">
                Player Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="Daniyal Tariq"
                className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-sm text-white focus:outline-none focus:border-[var(--plum-500)]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--text-muted)]">
                Position
              </label>
              <select
                value={preferredPosition}
                onChange={(e) => setPreferredPosition(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-sm text-white focus:outline-none focus:border-[var(--plum-500)]"
              >
                <option value="GOALKEEPER">Goalkeeper</option>
                <option value="DEFENDER">Defender (Fixo)</option>
                <option value="WINGER">Winger (Ala)</option>
                <option value="PIVOT">Pivot (Forward)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--text-muted)]">
                Jersey # (1-99)
              </label>
              <input
                type="number"
                min={1}
                max={99}
                value={jerseyNumber}
                onChange={(e) => setJerseyNumber(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-sm text-white focus:outline-none focus:border-[var(--plum-500)]"
              />
            </div>

            <div className="flex items-center gap-2 sm:col-span-2 py-1">
              <input
                type="checkbox"
                id="isCap"
                checked={isCaptain}
                onChange={(e) => setIsCaptain(e.target.checked)}
                className="w-4 h-4 rounded text-[var(--plum-500)] focus:ring-0 bg-[var(--surface-2)]"
              />
              <label htmlFor="isCap" className="text-xs text-[var(--text-muted)] font-medium cursor-pointer">
                Designate as Team Captain (C)
              </label>
            </div>

            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 rounded-xl bg-[var(--plum-500)] hover:bg-[var(--plum-300)] hover:text-[var(--bg)] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? "Validating & Adding..." : "Register Player"}
              </button>
            </div>
          </form>
        </div>

        {/* Current Squad Roster Table */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--surface-2)] text-[11px] uppercase font-bold text-[var(--text-muted)] border-b border-[var(--border)]">
              <tr>
                <th className="py-3 px-4 w-16 text-center">Jersey</th>
                <th className="py-3 px-4">Player Name</th>
                <th className="py-3 px-4">Position</th>
                <th className="py-3 px-4">Captain</th>
                <th className="py-3 px-4 text-right">CNIC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] font-medium">
              {squad.map((tp) => (
                <tr key={tp.id} className="hover:bg-[var(--surface-2)]/60 transition-colors">
                  <td className="py-3 px-4 text-center">
                    <span className="w-7 h-7 rounded-lg bg-[var(--plum-900)] text-white font-bold inline-flex items-center justify-center tabular-nums text-xs">
                      #{tp.jerseyNumber}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-white">
                    {tp.player?.fullName}
                  </td>
                  <td className="py-3 px-4 text-xs text-[var(--plum-300)] uppercase font-semibold">
                    {tp.player?.preferredPosition}
                  </td>
                  <td className="py-3 px-4">
                    {tp.isCaptain ? (
                      <span className="px-2 py-0.5 rounded bg-[var(--warning)] text-black text-[10px] font-black">
                        CAPTAIN
                      </span>
                    ) : (
                      <span className="text-[var(--text-muted)] text-xs">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right text-xs text-[var(--text-muted)] tabular-nums">
                    {tp.player?.cnic || "Pending"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

