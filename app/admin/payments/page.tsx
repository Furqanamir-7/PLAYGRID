import React from "react";
import { getDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { formatPKR, formatShortDate } from "@/lib/formatters";
import { PaymentsClient } from "@/components/admin/PaymentsClient";
import { CreditCard } from "lucide-react";


export default async function AdminPaymentsPage() {
  const user = await getCurrentUser();
  const db = getDb();

  const payments = db.payments.map((p) => {
    const reg = db.registrations.find((r) => r.id === p.registrationId);
    const team = reg ? db.teams.find((t) => t.id === reg.teamId) : null;
    const tourn = reg ? db.tournaments.find((t) => t.id === reg.tournamentId) : null;
    return {
      ...p,
      team,
      tournament: tourn,
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white font-['Space_Grotesk']">
          Fee Payments & Transaction Slips
        </h1>
        <p className="text-xs text-[var(--text-muted)]">
          Manual reconciliation of JazzCash, Easypaisa, and Raast bank transfer TID references
        </p>
      </div>

      <PaymentsClient payments={payments} />
    </div>
  );
}

