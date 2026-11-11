"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { RefreshCw, Play, Trophy } from "lucide-react";

export function TournamentControls({ tournament }: { tournament: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleRecalculate = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/tournaments/${tournament.id}/recalculate`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success(
        `Standings for ${tournament.name} recalculated successfully from all match results!`
      );
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateFixtures = async () => {
    if (!confirm(`Are you sure you want to generate/re-generate fixtures for ${tournament.name}?`)) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/tournaments/${tournament.id}/generate-fixtures`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success(
        `Generated ${data.matchesCount} fixtures for ${tournament.name} using circle-method round robin!`
      );
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2 pt-2">
      <button
        type="button"
        disabled={loading}
        onClick={handleGenerateFixtures}
        className="px-3 py-1.5 rounded-lg bg-[var(--plum-700)] hover:bg-[var(--plum-500)] text-white text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50"
      >
        <Play className="w-3.5 h-3.5" />
        Generate Fixtures
      </button>

      <button
        type="button"
        disabled={loading}
        onClick={handleRecalculate}
        className="px-3 py-1.5 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--plum-900)] text-[var(--plum-300)] border border-[var(--border)] text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        Recalculate Standings
      </button>
    </div>
  );
}

