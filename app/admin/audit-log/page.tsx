import React from "react";
import { getDb } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { formatMatchDate } from "@/lib/formatters";
import { History, ShieldAlert } from "lucide-react";


export default async function AdminAuditLogPage() {
  const user = await getCurrentUser();
  const db = getDb();

  const logs = db.auditLogs.map((l) => {
    const actor = db.users.find((u) => u.id === l.userId);
    return {
      ...l,
      actorName: actor?.name || "System Service",
      actorRole: actor?.role || "SYSTEM",
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white font-['Space_Grotesk']">
          System Audit Trail & Trigger Log
        </h1>
        <p className="text-xs text-[var(--text-muted)]">
          Immutable chronological history of all score changes, fixture creations, and approvals
        </p>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden shadow-lg">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--surface-2)] text-[11px] uppercase font-bold text-[var(--text-muted)] border-b border-[var(--border)]">
            <tr>
              <th className="py-3.5 px-4">Action</th>
              <th className="py-3.5 px-4">Entity</th>
              <th className="py-3.5 px-4">Triggered By</th>
              <th className="py-3.5 px-4">Details (JSONB)</th>
              <th className="py-3.5 px-4 text-right">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)] font-medium">
            {logs.map((l) => (
              <tr key={l.id} className="hover:bg-[var(--surface-2)]/60 transition-colors">
                <td className="py-3.5 px-4">
                  <span className="font-mono text-xs font-bold text-[var(--plum-300)]">
                    {l.action}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-xs text-[var(--text-muted)]">
                  {l.entity} ({l.entityId})
                </td>
                <td className="py-3.5 px-4 text-xs">
                  <div className="font-bold text-white">{l.actorName}</div>
                  <div className="text-[10px] text-[var(--text-muted)]">{l.actorRole}</div>
                </td>
                <td className="py-3.5 px-4 font-mono text-[11px] text-[var(--text-muted)] max-w-xs truncate">
                  {JSON.stringify(l.details)}
                </td>
                <td className="py-3.5 px-4 text-right text-xs text-[var(--text-muted)] tabular-nums">
                  {formatMatchDate(l.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

