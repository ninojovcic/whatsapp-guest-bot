"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Legend,
} from "recharts";

type Point = {
  day: string; // YYYY-MM-DD
  total: number;
  ai: number;
  handoff: number;
};

function formatDayLabel(day: string) {
  // "2026-01-25" -> "25.01."
  const [y, m, d] = day.split("-");
  return `${d}.${m}.`;
}

export function AnalyticsCharts({ data }: { data: Point[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Line: total messages */}
      <div className="rounded-2xl border border-foreground/10 bg-background/40 p-4">
        <div className="mb-3 text-sm font-semibold">Poruke po danu</div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
              <XAxis
                dataKey="day"
                tickFormatter={formatDayLabel}
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip
                formatter={(v: any, n: any) => [v, n === "total" ? "Ukupno" : n]}
                labelFormatter={(l) => `Datum: ${l}`}
              />
              <Line type="monotone" dataKey="total" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bars: AI vs Handoff */}
      <div className="rounded-2xl border border-foreground/10 bg-background/40 p-4">
        <div className="mb-3 text-sm font-semibold">AI vs Handoff</div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
              <XAxis
                dataKey="day"
                tickFormatter={formatDayLabel}
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip
                formatter={(v: any, n: any) =>
                  [v, n === "ai" ? "AI" : n === "handoff" ? "Handoff" : n]
                }
                labelFormatter={(l) => `Datum: ${l}`}
              />
              <Legend />
              <Bar dataKey="ai" stackId="a" />
              <Bar dataKey="handoff" stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}