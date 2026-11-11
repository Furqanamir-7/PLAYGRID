"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle, XCircle, Clock, FileCheck, ArrowRight } from "lucide-react";

export function RegistrationsClient({ registrations }: { registrations: any[] }) {
  const router = useRouter();
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleApprove = async (regId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/registrations/${regId}/approve`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success(
        "Registration APPROVED! Stored procedure sp_approve_registration initialized standings and verified capacity."
      );
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (regId: string) => {
    if (!rejectReason.trim()) {
      toast.error("Please specify a rejection reason");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/registrations/${regId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectReason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success("Registration has been marked as REJECTED.");
      setRejectingId(null);
      setRejectReason("");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden shadow-lg">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--surface-2)] text-[11px] uppercase font-bold text-[var(--text-muted)] border-b border-[var(--border)]">
            <tr>
              <th className="py-3.5 px-4">Club Name</th>
              <th className="py-3.5 px-4">Tournament</th>
              <th className="py-3.5 px-4">Payment Ref</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)] font-medium">
            {registrations.map((reg) => {
              const isApproved = reg.status === "APPROVED";
              const isPending = reg.status === "PENDING";
              const isRejected = reg.status === "REJECTED";

              return (
                <tr key={reg.id} className="hover:bg-[var(--surface-2)]/60 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-white">{reg.team?.name}</div>
                    <div className="text-xs text-[var(--text-muted)]">
                      Manager: {reg.team?.manager?.email || "Manager"}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-white">
                    {reg.tournament?.name}
                  </td>
                  <td className="py-3.5 px-4 text-xs">
                    <span className="font-mono text-[var(--plum-300)]">
                      {reg.payment?.transactionRef || "Pending"}
                    </span>
                    <div className="text-[10px] text-[var(--text-muted)]">
                      {reg.payment?.method} ({reg.payment?.status})
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                        isApproved
                          ? "bg-[var(--success)]/20 text-[var(--success)]"
                          : isPending
                          ? "bg-[var(--warning)]/20 text-[var(--warning)]"
                          : "bg-[var(--danger)]/20 text-[var(--danger)]"
                      }`}
                    >
                      {reg.status}
                    </span>
                    {reg.rejectionReason && (
                      <div className="text-[10px] text-[var(--danger)] mt-1">
                        {reg.rejectionReason}
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {isPending && (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          disabled={loading}
                          onClick={() => handleApprove(reg.id)}
                          className="px-3 py-1 rounded-lg bg-[var(--success)]/20 text-[var(--success)] hover:bg-[var(--success)] hover:text-black text-xs font-bold transition-all"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          disabled={loading}
                          onClick={() => setRejectingId(reg.id)}
                          className="px-3 py-1 rounded-lg bg-[var(--danger)]/20 text-[var(--danger)] hover:bg-[var(--danger)] hover:text-white text-xs font-bold transition-all"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    {isApproved && (
                      <span className="text-xs text-[var(--success)] font-semibold flex items-center justify-end gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Approved
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Rejection Reason Dialog */}
      {rejectingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-4">
            <h3 className="text-base font-bold text-white font-['Space_Grotesk']">
              Reject Registration Application
            </h3>
            <div className="space-y-1">
              <label className="text-xs text-[var(--text-muted)]">
                State the reason for rejection (e.g. "Squad below minimum size"):
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                placeholder="Squad below minimum size"
                className="w-full p-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-xs text-white"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectingId(null)}
                className="px-3 py-1.5 rounded-lg bg-[var(--surface-2)] text-xs text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleReject(rejectingId)}
                className="px-4 py-1.5 rounded-lg bg-[var(--danger)] text-xs font-bold text-white"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

