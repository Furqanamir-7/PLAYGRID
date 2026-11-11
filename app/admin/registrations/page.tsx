import React from "react";
import Link from "next/link";
import { getDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { RegistrationsClient } from "@/components/admin/RegistrationsClient";
import { FileCheck } from "lucide-react";


export default async function AdminRegistrationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const user = await getCurrentUser();
  const db = getDb();
  const params = await searchParams;

  const registrations = db.registrations
    .filter((r) => (params.status ? r.status === params.status : true))
    .map((r) => {
      const team = db.teams.find((t) => t.id === r.teamId);
      const manager = team ? db.users.find((u) => u.id === team.managerId) : null;
      const tourn = db.tournaments.find((t) => t.id === r.tournamentId);
      const payment = db.payments.find((p) => p.registrationId === r.id);
      return {
        ...r,
        team: {
          ...team,
          manager,
        },
        tournament: tourn,
        payment,
      };
    });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white font-['Space_Grotesk']">
          Team Registrations & Approvals
        </h1>
        <p className="text-xs text-[var(--text-muted)]">
          Invokes stored procedure <code>sp_approve_registration</code> to atomically verify payments and enforce tournament capacities.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-[var(--border)] pb-4 text-xs">
        <Link
          href="/admin/registrations"
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
            !params.status
              ? "bg-[var(--plum-500)] text-white"
              : "bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-white"
          }`}
        >
          All Applications ({db.registrations.length})
        </Link>
        <Link
          href="/admin/registrations?status=PENDING"
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
            params.status === "PENDING"
              ? "bg-[var(--plum-500)] text-white"
              : "bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-white"
          }`}
        >
          Pending Review
        </Link>
        <Link
          href="/admin/registrations?status=APPROVED"
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
            params.status === "APPROVED"
              ? "bg-[var(--plum-500)] text-white"
              : "bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-white"
          }`}
        >
          Approved
        </Link>
        <Link
          href="/admin/registrations?status=REJECTED"
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
            params.status === "REJECTED"
              ? "bg-[var(--plum-500)] text-white"
              : "bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-white"
          }`}
        >
          Rejected
        </Link>
      </div>

      <RegistrationsClient registrations={registrations} />
    </div>
  );
}

