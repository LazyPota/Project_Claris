"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { HarvestRecord } from "@/types/models";
import { getHarvestStats } from "@/services/mock-data";

interface ChartDatum {
  date: string;
  estimated: number;
  actual: number;
}

function toChartData(records: HarvestRecord[]): ChartDatum[] {
  return [...records]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((r) => ({
      date: r.date,
      estimated: r.estimatedBiomassKg,
      actual: r.actualYieldKg,
    }));
}

export function BiomassChart() {
  const [data, setData] = useState<ChartDatum[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHarvestStats()
      .then((records) => setData(toChartData(records)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-sm text-neutral-500">Loading harvest data…</div>;
  }

  if (data.length === 0) {
    return <div className="text-sm text-neutral-500">No harvest data available.</div>;
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
        Estimated Biomass vs Actual Yield (kg)
      </h3>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Bar
              dataKey="estimated"
              name="Estimated Biomass"
              fill="#6366f1"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="actual"
              name="Actual Yield"
              fill="#22c55e"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
