"use client";

import React, { useState } from "react";
import { SQL_LAB_QUERIES, SqlLabQuery } from "@/lib/sql-lab-queries";
import { Database, Play, CheckCircle2, Code2, BookOpen } from "lucide-react";

export function SqlLabClient() {
  const [selectedQuery, setSelectedQuery] = useState<SqlLabQuery>(SQL_LAB_QUERIES[0]);
  const [results, setResults] = useState<{ columns: string[]; rows: any[] } | null>(null);
  const [executing, setExecuting] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", ...Array.from(new Set(SQL_LAB_QUERIES.map((q) => q.category)))];

  const filteredQueries = SQL_LAB_QUERIES.filter((q) =>
    activeCategory === "All" ? true : q.category === activeCategory
  );

  const runQuery = (query: SqlLabQuery) => {
    setSelectedQuery(query);
    setExecuting(true);
    setTimeout(() => {
      const res = query.execute();
      setResults(res);
      setExecuting(false);
    }, 200);
  };

  return (
    <div className="space-y-6">
      {/* Category Pills */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[var(--border)] pb-4 text-xs">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              activeCategory === cat
                ? "bg-[var(--plum-500)] text-white"
                : "bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-white"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Query Selector */}
        <div className="space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--plum-300)] block">
            Predefined Academic Queries ({filteredQueries.length})
          </span>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filteredQueries.map((q) => (
              <button
                key={q.id}
                type="button"
                onClick={() => runQuery(q)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all text-xs space-y-1 block ${
                  selectedQuery.id === q.id
                    ? "bg-[var(--surface-2)] border-[var(--plum-500)] shadow-md"
                    : "bg-[var(--surface)] border-[var(--border)] hover:border-[var(--plum-700)]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-[var(--plum-300)]">{q.id}</span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[var(--plum-900)] text-[var(--plum-100)]">
                    {q.category}
                  </span>
                </div>
                <div className="font-bold text-white leading-tight">{q.title}</div>
                <div className="text-[11px] text-[var(--text-muted)] line-clamp-1">{q.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Code & Execution Output */}
        <div className="lg:col-span-2 space-y-6">
          {/* SQL Editor View */}
          <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-[var(--plum-300)]" />
                <h3 className="font-bold text-white text-sm font-['Space_Grotesk']">
                  {selectedQuery.id}: {selectedQuery.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => runQuery(selectedQuery)}
                disabled={executing}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[var(--plum-500)] hover:bg-[var(--plum-300)] hover:text-[var(--bg)] text-white text-xs font-bold transition-all shadow-md disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                {executing ? "Executing..." : "Run Query"}
              </button>
            </div>

            <p className="text-xs text-[var(--text-muted)]">
              {selectedQuery.description}
            </p>

            <pre className="p-4 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--plum-100)] font-mono overflow-x-auto leading-relaxed">
              <code>{selectedQuery.sql}</code>
            </pre>
          </div>

          {/* Results Table */}
          <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-4 shadow-lg">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-white text-sm font-['Space_Grotesk'] flex items-center gap-2">
                <Database className="w-4 h-4 text-[var(--plum-300)]" />
                Execution Results {results && `(${results.rows.length} rows)`}
              </h4>
              <span className="text-[11px] text-[var(--success)] font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Read-only Sandbox Safe
              </span>
            </div>

            {results ? (
              <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[var(--surface-2)] text-[10px] uppercase font-bold text-[var(--text-muted)] border-b border-[var(--border)]">
                    <tr>
                      {results.columns.map((col) => (
                        <th key={col} className="py-2.5 px-3">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)] font-medium">
                    {results.rows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-[var(--surface-2)]/60 transition-colors">
                        {results.columns.map((col) => (
                          <td key={col} className="py-2.5 px-3 text-white truncate max-w-xs">
                            {row[col] != null ? row[col].toString() : "NULL"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-10 text-xs text-[var(--text-muted)]">
                Click <strong>"Run Query"</strong> above to execute this demonstration SQL statement against the active relational schema.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

