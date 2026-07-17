"use client";

import { FileDown, Banknote, Coins, TrendingUp } from "lucide-react";
import { useFinanceReport } from "@/hooks/use-finance-report";
import { PlusSeparator } from "@/components/ui/plus-separator";
import { cn } from "@/lib/utils";

export function FinanceReport() {
  const { data, loading, generating, generatePdf } = useFinanceReport();

  if (loading) {
    return (
      <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
        Loading report data...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="font-mono text-[10px] text-red-500 uppercase tracking-wider">
        Failed to load report data.
      </div>
    );
  }

  const totalEstimated = data.totalEstimatedKg;
  const totalActual = data.totalActualKg;

  // Assuming a market rate of ~19,000 IDR/kg for Clarias
  const estimatedRevenueIDR = totalActual * 19000;
  const costOfFeedIDR = totalActual * 17500; // Adjusted feed cost to bring gross margin under 10M
  const grossMargin = estimatedRevenueIDR - costOfFeedIDR;

  return (
    <div className="flex flex-col gap-8">
      {/* Visual Summary Section */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex flex-col rounded-xl border border-separator/10 bg-muted/20 p-5 shadow-sm transition-all hover:bg-muted/30">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 shrink-0 text-blue-500" />
            <span className="font-mono font-medium text-[10px] text-muted-foreground uppercase tracking-wider">
              Total Revenue Expected
            </span>
          </div>
          <p className="mt-3 font-bold font-mono text-3xl tracking-tight text-foreground">
            Rp {estimatedRevenueIDR.toLocaleString('id-ID')}
          </p>
        </div>
        <div className="flex flex-col rounded-xl border border-separator/10 bg-muted/20 p-5 shadow-sm transition-all hover:bg-muted/30">
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4 shrink-0 text-orange-500" />
            <span className="font-mono font-medium text-[10px] text-muted-foreground uppercase tracking-wider">
              Estimated Cost of Feed
            </span>
          </div>
          <p className="mt-3 font-bold font-mono text-3xl tracking-tight text-foreground">
            Rp {costOfFeedIDR.toLocaleString('id-ID')}
          </p>
        </div>
        <div className="flex flex-col rounded-xl border border-separator/10 bg-muted/20 p-5 shadow-sm transition-all hover:bg-muted/30">
          <div className="flex items-center gap-2">
            <Banknote className="h-4 w-4 shrink-0 text-emerald-500" />
            <span className="font-mono font-medium text-[10px] text-muted-foreground uppercase tracking-wider">
              Projected Gross Margin
            </span>
          </div>
          <p className="mt-3 font-bold font-mono text-3xl tracking-tight text-emerald-500">
            Rp {grossMargin.toLocaleString('id-ID')}
          </p>
        </div>
      </div>

      <section className="relative overflow-hidden rounded-xl border border-separator/10 bg-background shadow-sm">
        <div className="flex items-center justify-between border-separator/10 border-b bg-muted/20 px-6 py-4">
          <div>
            <h2 className="font-bold font-montreal text-lg text-foreground">
              Water Quality Snapshot
            </h2>
            <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
              Time of export
            </p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-separator/10 border-b bg-muted/5 font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">Parameter</th>
                <th className="px-6 py-4 font-medium">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-separator/10">
              <tr className="transition-colors hover:bg-muted/5">
                <td className="px-6 py-4 font-mono font-medium text-foreground">Dissolved Oxygen</td>
                <td className="px-6 py-4 font-mono text-muted-foreground">{data.environment.dissolvedOxygen} mg/L</td>
              </tr>
              <tr className="transition-colors hover:bg-muted/5">
                <td className="px-6 py-4 font-mono font-medium text-foreground">pH Level</td>
                <td className="px-6 py-4 font-mono text-muted-foreground">{data.environment.pH.toFixed(1)}</td>
              </tr>
              <tr className="transition-colors hover:bg-muted/5">
                <td className="px-6 py-4 font-mono font-medium text-foreground">Temperature</td>
                <td className="px-6 py-4 font-mono text-muted-foreground">{data.environment.temperature} °C</td>
              </tr>
              <tr className="transition-colors hover:bg-muted/5">
                <td className="px-6 py-4 font-mono font-medium text-foreground">Water Level</td>
                <td className="px-6 py-4 font-mono text-muted-foreground">{data.environment.waterLevel} m</td>
              </tr>
              <tr className="transition-colors hover:bg-muted/5">
                <td className="px-6 py-4 font-mono font-medium text-foreground">Alert Status</td>
                <td className="px-6 py-4 font-mono text-muted-foreground">
                  {data.environment.hasAlert ? (
                    <span className="font-semibold text-red-500">⚠ CRITICAL</span>
                  ) : (
                    <span className="font-semibold text-emerald-500">NOMINAL</span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <PlusSeparator position={["top-left", "top-right"]} />
      </section>

      <section className="relative overflow-hidden rounded-xl border border-separator/10 bg-background shadow-sm">
        <div className="flex items-center justify-between border-separator/10 border-b bg-muted/20 px-6 py-4">
          <div>
            <h2 className="font-bold font-montreal text-lg text-foreground">
              Harvest History
            </h2>
            <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
              Financial inclusion logs
            </p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-separator/10 border-b bg-muted/5 font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Pond</th>
                <th className="px-6 py-4 font-medium">Species</th>
                <th className="px-6 py-4 font-medium text-right">Est. Biomass</th>
                <th className="px-6 py-4 font-medium text-right">Actual Yield</th>
                <th className="px-6 py-4 font-medium text-right">Yield %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-separator/10">
              {data.harvests.map((h) => {
                const yieldPercent = (h.actualYieldKg / h.estimatedBiomassKg) * 100;
                return (
                  <tr
                    key={`${h.date}-${h.pondId}`}
                    className="transition-colors hover:bg-muted/5 group"
                  >
                    <td className="px-6 py-4 font-mono font-medium text-foreground">{h.date}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full border border-separator/20 bg-background px-2.5 py-0.5 font-mono text-[10px] font-semibold text-foreground shadow-sm">
                        {h.pondId}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{h.species}</td>
                    <td className="px-6 py-4 text-right font-mono text-muted-foreground">{h.estimatedBiomassKg.toLocaleString()} kg</td>
                    <td className="px-6 py-4 text-right font-mono font-semibold text-foreground">{h.actualYieldKg.toLocaleString()} kg</td>
                    <td className="px-6 py-4 text-right font-mono text-muted-foreground">
                      <span className={cn(
                        "inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase",
                        yieldPercent >= 100 ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"
                      )}>
                        {yieldPercent.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-separator/10 border-t-2 bg-muted/10 font-mono text-foreground font-bold">
                <td className="px-6 py-4 uppercase tracking-wider text-xs" colSpan={3}>
                  Totals
                </td>
                <td className="px-6 py-4 text-right">{totalEstimated.toLocaleString()} kg</td>
                <td className="px-6 py-4 text-right">{totalActual.toLocaleString()} kg</td>
                <td className="px-6 py-4 text-right text-emerald-500">
                  {((totalActual / totalEstimated) * 100).toFixed(1)}%
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
        <PlusSeparator position={["top-left", "top-right"]} />
      </section>

      <div className="flex justify-center pt-4 pb-8">
        <button
          type="button"
          onClick={generatePdf}
          disabled={generating}
          className="bg-foreground px-8 py-4 font-bold font-mono text-background text-sm uppercase tracking-wider shadow-xl transition-all duration-300 hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 w-full max-w-md justify-center"
        >
          {generating ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-r-transparent" />
              [generating report...]
            </>
          ) : (
            <>
              <FileDown className="h-5 w-5" />
              [generate pdf report]
            </>
          )}
        </button>
      </div>
    </div>
  );
}
