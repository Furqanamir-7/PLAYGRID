"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";

interface ChartsProps {
  goalsData: Array<{ name: string; goals: number }>;
  regData: Array<{ date: string; registrations: number }>;
}

export function DashboardCharts({ goalsData, regData }: ChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Chart 1: Goals per Tournament */}
      <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-4 shadow-md">
        <h3 className="text-base font-bold text-white font-['Space_Grotesk']">
          Goals Recorded by Tournament
        </h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={goalsData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2E2533" vertical={false} />
              <XAxis dataKey="name" stroke="#9C90A0" fontSize={11} interval={0} angle={-15} textAnchor="end" />
              <YAxis stroke="#9C90A0" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#141117",
                  borderColor: "#2E2533",
                  borderRadius: "8px",
                  color: "#F4F0F5",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="goals" fill="#8E4585" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Registrations Timeline */}
      <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-4 shadow-md">
        <h3 className="text-base font-bold text-white font-['Space_Grotesk']">
          Team Registration Influx
        </h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={regData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2E2533" vertical={false} />
              <XAxis dataKey="date" stroke="#9C90A0" fontSize={11} />
              <YAxis stroke="#9C90A0" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#141117",
                  borderColor: "#2E2533",
                  borderRadius: "8px",
                  color: "#F4F0F5",
                  fontSize: "12px",
                }}
              />
              <Line
                type="monotone"
                dataKey="registrations"
                stroke="#C68BBF"
                strokeWidth={3}
                dot={{ r: 4, fill: "#8E4585" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

