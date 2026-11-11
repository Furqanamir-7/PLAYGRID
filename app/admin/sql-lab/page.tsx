import React from "react";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { SqlLabClient } from "@/components/admin/SqlLabClient";
import { Database } from "lucide-react";


export default async function SqlLabPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "SUPER_ADMIN") {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--plum-900)] text-xs font-semibold text-[var(--plum-100)] mb-2">
          <Database className="w-3.5 h-3.5 text-[var(--plum-300)]" />
          Academic Viva & DBMS Demonstration
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Space_Grotesk']">
          SQL Demonstration Lab
        </h1>
        <p className="text-xs text-[var(--text-muted)] max-w-3xl">
          Predefined, read-only demonstration suite executing 25+ academic SQL queries covering Inner/Left/Self joins, GROUP BY + HAVING, correlated/nested subqueries, CTEs, Window Functions, Views, and Stored Procedures.
        </p>
      </div>

      <SqlLabClient />
    </div>
  );
}

