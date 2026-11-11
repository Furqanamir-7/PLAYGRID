import React from "react";
import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { formatShortDate } from "@/lib/formatters";
import { UserCog, ShieldCheck } from "lucide-react";


export default async function AdminUsersPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "SUPER_ADMIN") {
    notFound();
  }

  const db = getDb();
  const users = db.users;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white font-['Space_Grotesk']">
          User Accounts & Access Roles
        </h1>
        <p className="text-xs text-[var(--text-muted)]">
          SUPER_ADMIN view for managing system users, organizers, and managers
        </p>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden shadow-lg">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--surface-2)] text-[11px] uppercase font-bold text-[var(--text-muted)] border-b border-[var(--border)]">
            <tr>
              <th className="py-3.5 px-4">User</th>
              <th className="py-3.5 px-4">Role</th>
              <th className="py-3.5 px-4">Phone</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)] font-medium">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-[var(--surface-2)]/60 transition-colors">
                <td className="py-3.5 px-4">
                  <div className="font-bold text-white">{u.name}</div>
                  <div className="text-xs text-[var(--text-muted)]">{u.email}</div>
                </td>
                <td className="py-3.5 px-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--plum-900)] text-[var(--plum-300)]">
                    {u.role}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-xs font-mono text-[var(--text-muted)]">
                  {u.phone || "—"}
                </td>
                <td className="py-3.5 px-4 text-xs font-semibold text-[var(--success)]">
                  Active
                </td>
                <td className="py-3.5 px-4 text-right text-xs text-[var(--text-muted)]">
                  {formatShortDate(u.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

