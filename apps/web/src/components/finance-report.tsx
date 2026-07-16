"use client";

import { useEffect, useState, useCallback } from "react";
import { FileDown } from "lucide-react";
import type { HarvestRecord, EnvironmentData } from "@/types/models";
import { getHarvestStats, getEnvironmentData } from "@/services/mock-data";

interface ReportData {
  harvests: HarvestRecord[];
  environment: EnvironmentData;
}

export function FinanceReport() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    Promise.all([getHarvestStats(), getEnvironmentData()])
      .then(([harvests, environment]) => setData({ harvests, environment }))
      .finally(() => setLoading(false));
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

      const totalEstimated = data.harvests.reduce(
        (sum, h) => sum + h.estimatedBiomassKg,
        0
      );
      const totalActual = data.harvests.reduce(
        (sum, h) => sum + h.actualYieldKg,
        0
      );

      doc.setFontSize(11);
      doc.text(
        `Total Estimated: ${totalEstimated} kg  |  Total Actual: ${totalActual} kg  |  Overall Yield: ${((totalActual / totalEstimated) * 100).toFixed(1)}%`,
        14,
        afterHarvestY + 10
      );

      doc.save("clarias-financial-report.pdf");
    } finally {
      setGenerating(false);
    }
  }, [data]);

  if (loading) {
    return <div className="text-sm text-neutral-500">Loading report data…</div>;
  }

  if (!data) {
    return (
      <div className="text-sm text-red-600">Failed to load report data.</div>
    );
  }

  const totalEstimated = data.harvests.reduce(
    (sum, h) => sum + h.estimatedBiomassKg,
    0
  );
  const totalActual = data.harvests.reduce(
    (sum, h) => sum + h.actualYieldKg,
    0
  );

  return (
    <div className="space-y-6">
      <section>
        <h2 className="mb-3 text-lg font-medium">Water Quality Snapshot</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800">
                <th className="px-3 py-2 font-medium">Parameter</th>
                <th className="px-3 py-2 font-medium">Value</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-neutral-100 dark:border-neutral-800">
                <td className="px-3 py-2">Dissolved Oxygen</td>
                <td className="px-3 py-2">{data.environment.dissolvedOxygen} mg/L</td>
              </tr>
              <tr className="border-b border-neutral-100 dark:border-neutral-800">
                <td className="px-3 py-2">pH Level</td>
                <td className="px-3 py-2">{data.environment.pH.toFixed(1)}</td>
              </tr>
              <tr className="border-b border-neutral-100 dark:border-neutral-800">
                <td className="px-3 py-2">Temperature</td>
                <td className="px-3 py-2">{data.environment.temperature} °C</td>
              </tr>
              <tr className="border-b border-neutral-100 dark:border-neutral-800">
                <td className="px-3 py-2">Water Level</td>
                <td className="px-3 py-2">{data.environment.waterLevel} m</td>
              </tr>
              <tr>
                <td className="px-3 py-2">Alert Status</td>
                <td className="px-3 py-2">
                  {data.environment.hasAlert ? (
                    <span className="font-semibold text-red-600">⚠ ALERT</span>
                  ) : (
                    <span className="text-green-600">Normal</span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-medium">Harvest History</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800">
                <th className="px-3 py-2 font-medium">Date</th>
                <th className="px-3 py-2 font-medium">Pond</th>
                <th className="px-3 py-2 font-medium">Species</th>
                <th className="px-3 py-2 font-medium text-right">Est. Biomass (kg)</th>
                <th className="px-3 py-2 font-medium text-right">Actual Yield (kg)</th>
                <th className="px-3 py-2 font-medium text-right">Yield %</th>
              </tr>
            </thead>
            <tbody>
              {data.harvests.map((h) => (
                <tr
                  key={`${h.date}-${h.pondId}`}
                  className="border-b border-neutral-100 dark:border-neutral-800"
                >
                  <td className="px-3 py-2">{h.date}</td>
                  <td className="px-3 py-2">{h.pondId}</td>
                  <td className="px-3 py-2">{h.species}</td>
                  <td className="px-3 py-2 text-right">{h.estimatedBiomassKg}</td>
                  <td className="px-3 py-2 text-right">{h.actualYieldKg}</td>
                  <td className="px-3 py-2 text-right">
                    {((h.actualYieldKg / h.estimatedBiomassKg) * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-neutral-300 font-semibold dark:border-neutral-700">
                <td className="px-3 py-2" colSpan={3}>
                  Totals
                </td>
                <td className="px-3 py-2 text-right">{totalEstimated}</td>
                <td className="px-3 py-2 text-right">{totalActual}</td>
                <td className="px-3 py-2 text-right">
                  {((totalActual / totalEstimated) * 100).toFixed(1)}%
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      <button
        type="button"
        onClick={generatePdf}
        disabled={generating}
        className="inline-flex items-center gap-2 rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700 disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
      >
        <FileDown className="h-4 w-4" />
        {generating ? "Generating…" : "Generate PDF Report"}
      </button>
    </div>
  );
}
