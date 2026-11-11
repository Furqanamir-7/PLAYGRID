"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trophy, Shield, CreditCard, ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";

export default function TournamentRegistrationFlowPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);

  // Form states
  const [selectedTournament, setSelectedTournament] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("JAZZCASH");
  const [transactionRef, setTransactionRef] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/portal/registration-options")
      .then((res) => res.json())
      .then((data) => {
        setTournaments(data.tournaments || []);
        setTeams(data.teams || []);
        if (data.tournaments?.length > 0) setSelectedTournament(data.tournaments[0].id);
        if (data.teams?.length > 0) setSelectedTeam(data.teams[0].id);
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/portal/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tournamentId: selectedTournament,
          teamId: selectedTeam,
          paymentMethod,
          transactionRef,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");

      toast.success("Tournament registration and payment slip submitted for review!");
      router.push("/portal");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] text-white">
        Loading registration portal...
      </div>
    );
  }

  const currentTourn = tournaments.find((t) => t.id === selectedTournament);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto w-full space-y-8">
        <Link
          href="/portal"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--plum-300)] hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>

        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--plum-300)]">
            <Trophy className="w-4 h-4" /> Tournament Entry
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Space_Grotesk']">
            Register for a Championship
          </h1>
          <p className="text-xs text-[var(--text-muted)]">
            Submit your club entry slip. Organizers manually verify the payment TID and approve your squad.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8 shadow-xl">
          {/* Step 1: Select Tournament */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[var(--text-muted)] block">
              1. Select Open Tournament
            </label>
            <select
              value={selectedTournament}
              onChange={(e) => setSelectedTournament(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-sm text-white focus:outline-none focus:border-[var(--plum-500)]"
            >
              {tournaments.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.format}) — Fee: Rs {t.entryFeePkr.toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          {/* Step 2: Select Team */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[var(--text-muted)] block">
              2. Select Your Club
            </label>
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-sm text-white focus:outline-none focus:border-[var(--plum-500)]"
            >
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.shortName})
                </option>
              ))}
            </select>
          </div>

          {/* Step 3: Payment Method & Reference */}
          <div className="pt-4 border-t border-[var(--border)] space-y-4">
            <h3 className="text-sm font-bold text-white font-['Space_Grotesk'] flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[var(--plum-300)]" />
              3. Payment Verification Reference
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--text-muted)]">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-sm text-white focus:outline-none focus:border-[var(--plum-500)]"
                >
                  <option value="JAZZCASH">JazzCash</option>
                  <option value="EASYPAISA">Easypaisa</option>
                  <option value="BANK_TRANSFER">Bank Transfer (Raast)</option>
                  <option value="CASH">Cash on Ground</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--text-muted)]">
                  Transaction Reference (TID)
                </label>
                <input
                  type="text"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  required
                  placeholder="e.g. TID-9823471"
                  className="w-full px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-sm text-white focus:outline-none focus:border-[var(--plum-500)]"
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[var(--surface-2)] text-xs text-[var(--text-muted)] leading-relaxed">
              Entry fee for this tournament is <strong>Rs {currentTourn?.entryFeePkr?.toLocaleString()}</strong>. Send funds to PLAYGRID official account (JazzCash/Easypaisa: 0300-PLAYGRID) and enter your transaction ID above.
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-[var(--plum-500)] hover:bg-[var(--plum-300)] hover:text-[var(--bg)] text-white text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {submitting ? "Submitting Registration..." : "Submit Registration for Review"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

