"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Clock } from "lucide-react";

export function PaymentsClient({ payments }: { payments: any[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleVerify = async (paymentId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/payments/${paymentId}/verify`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success("Payment verified successfully! Financial revenue ledger updated.");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden shadow-lg">
      <table className="w-full text-left text-sm">
        <thead className="bg-[var(--surface-2)] text-[11px] uppercase font-bold text-[var(--text-muted)] border-b border-[var(--border)]">
          <tr>
            <th className="py-3.5 px-4">Club Name</th>
            <th className="py-3.5 px-4">Amount</th>
            <th className="py-3.5 px-4">Method & Reference</th>
            <th className="py-3.5 px-4">Status</th>
            <th className="py-3.5 px-4 text-right">Verification</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)] font-medium">
          {payments.map((p) => {
            const isVerified = p.status === "VERIFIED";

            return (
              <tr key={p.id} className="hover:bg-[var(--surface-2)]/60 transition-colors">
                <td className="py-3.5 px-4">
                  <div className="font-bold text-white">{p.team?.name || "Team"}</div>
                  <div className="text-xs text-[var(--text-muted)]">{p.tournament?.name}</div>
                </td>
                <td className="py-3.5 px-4 font-bold text-white tabular-nums">
                  Rs {Number(p.amountPkr).toLocaleString()}
                </td>
                <td className="py-3.5 px-4">
                  <div className="font-mono text-xs text-[var(--plum-300)] font-bold">
                    {p.transactionRef}
                  </div>
                  <div className="text-[10px] text-[var(--text-muted)] uppercase">
                    {p.method}
                  </div>
                </td>
                <td className="py-3.5 px-4">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                      isVerified
                        ? "bg-[var(--success)]/20 text-[var(--success)]"
                        : "bg-[var(--warning)]/20 text-[var(--warning)]"
                    }`}
                  >
                    {isVerified ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    {p.status}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  {!isVerified ? (
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => handleVerify(p.id)}
                      className="px-3 py-1.5 rounded-lg bg-[var(--plum-500)] hover:bg-[var(--plum-300)] hover:text-[var(--bg)] text-white text-xs font-bold transition-all shadow-sm"
                    >
                      Verify TID
                    </button>
                  ) : (
                    <span className="text-xs text-[var(--success)] font-semibold flex items-center justify-end gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Reconciled
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

