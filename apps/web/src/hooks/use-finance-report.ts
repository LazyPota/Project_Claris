"use client";

import { useCallback, useEffect, useState } from "react";
import type { HarvestRecord, EnvironmentData, FeedingEvent } from "@/types/models";
import {
  getHarvestStats,
  getEnvironmentData,
  getFeedingHistory,
} from "@/services/mock-data";

interface FeedingSummary {
  totalKg: number;
  byPond: Record<string, number>;
  byType: Record<string, number>;
}

export interface FinanceReportData {
  harvests: HarvestRecord[];
  environment: EnvironmentData;
  feeding: FeedingEvent[];
  feedingSummary: FeedingSummary;
  totalEstimatedKg: number;
  totalActualKg: number;
  overallYieldPercent: number;
}

function buildFeedingSummary(events: FeedingEvent[]): FeedingSummary {
  const byPond: Record<string, number> = {};
  const byType: Record<string, number> = {};
  let totalKg = 0;

  for (const e of events) {
    totalKg += e.amountKg;
    byPond[e.pondId] = (byPond[e.pondId] ?? 0) + e.amountKg;
    byType[e.feedType] = (byType[e.feedType] ?? 0) + e.amountKg;
  }

  return { totalKg, byPond, byType };
}

function aggregateReport(
  harvests: HarvestRecord[],
  environment: EnvironmentData,
  feeding: FeedingEvent[],
): FinanceReportData {
  const feedingSummary = buildFeedingSummary(feeding);
  const totalEstimatedKg = harvests.reduce((s, h) => s + h.estimatedBiomassKg, 0);
  const totalActualKg = harvests.reduce((s, h) => s + h.actualYieldKg, 0);
  const overallYieldPercent =
    totalEstimatedKg > 0
      ? Math.round((totalActualKg / totalEstimatedKg) * 1000) / 10
      : 0;

  return {
    harvests,
    environment,
    feeding,
    feedingSummary,
    totalEstimatedKg,
    totalActualKg,
    overallYieldPercent,
  };
}

interface FinanceHookResult {
  data: FinanceReportData | null;
  loading: boolean;
  generating: boolean;
  generatePdf: () => Promise<void>;
}

export function useFinanceReport(): FinanceHookResult {
  const [data, setData] = useState<FinanceReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    let cancelled = false;

    Promise.all([getHarvestStats(), getEnvironmentData(), getFeedingHistory()])
      .then(([harvests, environment, feeding]) => {
        if (!cancelled) {
          setData(aggregateReport(harvests, environment, feeding));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const generatePdf = useCallback(async () => {
    if (!data) return;
    setGenerating(true);

    try {
      const { jsPDF } = await import("jspdf");
      const autoTable = (await import("jspdf-autotable")).default;

      const doc = new jsPDF();

      doc.setFontSize(18);
      doc.text("Project Clarias — Financial Report", 14, 20);

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);

      doc.setFontSize(13);
      doc.setTextColor(0);
      doc.text("Water Quality Snapshot", 14, 40);

      autoTable(doc, {
        startY: 44,
        head: [["Parameter", "Value"]],
        body: [
          ["Dissolved Oxygen", `${data.environment.dissolvedOxygen} mg/L`],
          ["pH Level", data.environment.pH.toFixed(1)],
          ["Temperature", `${data.environment.temperature} °C`],
          ["Water Level", `${data.environment.waterLevel} m`],
          [
            "Alert Status",
            data.environment.hasAlert ? "⚠ ALERT" : "Normal",
          ],
        ],
        theme: "grid",
        headStyles: { fillColor: [99, 102, 241] },
      });

      const afterEnvY =
        (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable
          ?.finalY ?? 90;

      doc.setFontSize(13);
      doc.text("Harvest History", 14, afterEnvY + 12);

      autoTable(doc, {
        startY: afterEnvY + 16,
        head: [
          ["Date", "Pond", "Species", "Est. Biomass (kg)", "Actual Yield (kg)", "Yield %"],
        ],
        body: data.harvests.map((h) => [
          h.date,
          h.pondId,
          h.species,
          h.estimatedBiomassKg.toString(),
          h.actualYieldKg.toString(),
          `${((h.actualYieldKg / h.estimatedBiomassKg) * 100).toFixed(1)}%`,
        ]),
        theme: "grid",
        headStyles: { fillColor: [34, 197, 94] },
      });

      const afterHarvestY =
        (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable
          ?.finalY ?? 160;

      doc.setFontSize(11);
      doc.text(
        `Total Estimated: ${data.totalEstimatedKg} kg  |  Total Actual: ${data.totalActualKg} kg  |  Overall Yield: ${data.overallYieldPercent}%`,
        14,
        afterHarvestY + 10,
      );

      doc.setFontSize(13);
      doc.text("Feeding Summary", 14, afterHarvestY + 24);

      const feedingRows: string[][] = [];
      for (const [pond, kg] of Object.entries(data.feedingSummary.byPond)) {
        feedingRows.push([pond, `${kg} kg`]);
      }

      autoTable(doc, {
        startY: afterHarvestY + 28,
        head: [["Pond", "Total Feed (kg)"]],
        body: feedingRows,
        theme: "grid",
        headStyles: { fillColor: [234, 179, 8] },
      });

      const afterFeedY =
        (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable
          ?.finalY ?? 200;

      doc.setFontSize(11);
      doc.text(
        `Total Feed Used: ${data.feedingSummary.totalKg} kg`,
        14,
        afterFeedY + 10,
      );

      doc.save("clarias-financial-report.pdf");
    } finally {
      setGenerating(false);
    }
  }, [data]);

  return { data, loading, generating, generatePdf };
}
