"use client";

import { GrainGradient } from "@paper-design/shaders-react";
import { AtomIcon } from "@phosphor-icons/react";
import {
  AlertTriangle,
  Cpu,
  Download,
  Droplets,
  Play,
  ShieldCheck,
  Thermometer,
  Waves,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BiomassChart } from "@/components/biomass-chart";
import { PlusSeparator } from "@/components/ui/plus-separator";
import { cn } from "@/lib/utils";

export default function LandingPage() {
  const [simulateAlert, setSimulateAlert] = useState(false);
  const [telemetry, setTelemetry] = useState({
    do: 6.8,
    ph: 7.4,
    temp: 29.2,
    waterLevel: 1.35,
  });

  const [isFeeding, setIsFeeding] = useState(false);
  const [feedProgress, setFeedProgress] = useState(0);

  const [fishLength, setFishLength] = useState(25);
  const [stockDensity, setStockDensity] = useState(1500);

  useEffect(() => {
    const timer = setInterval(() => {
      setTelemetry((prev) => {
        if (simulateAlert) {
          return {
            do: Math.max(
              1.8,
              +(prev.do - 0.4 + Math.random() * 0.2).toFixed(1),
            ),
            ph: +(prev.ph + 0.2 - Math.random() * 0.1).toFixed(1),
            temp: +(prev.temp + 0.15 - Math.random() * 0.1).toFixed(1),
            waterLevel: +(
              prev.waterLevel -
              0.01 +
              Math.random() * 0.02
            ).toFixed(2),
          };
        } else {
          return {
            do: Math.min(
              7.5,
              Math.max(5.2, +(prev.do - 0.1 + Math.random() * 0.2).toFixed(1)),
            ),
            ph: Math.min(
              8.0,
              Math.max(6.8, +(prev.ph - 0.05 + Math.random() * 0.1).toFixed(1)),
            ),
            temp: Math.min(
              31.0,
              Math.max(
                28.0,
                +(prev.temp - 0.1 + Math.random() * 0.2).toFixed(1),
              ),
            ),
            waterLevel: Math.min(
              1.5,
              Math.max(
                1.1,
                +(prev.waterLevel - 0.005 + Math.random() * 0.01).toFixed(2),
              ),
            ),
          };
        }
      });
    }, 2500);
    return () => clearInterval(timer);
  }, [simulateAlert]);

  useEffect(() => {
    if (simulateAlert) {
      setTelemetry({ do: 3.1, ph: 8.6, temp: 32.2, waterLevel: 0.9 });
    } else {
      setTelemetry({ do: 6.8, ph: 7.4, temp: 29.2, waterLevel: 1.35 });
    }
  }, [simulateAlert]);

  const triggerFeeder = () => {
    if (isFeeding) return;
    setIsFeeding(true);
    setFeedProgress(0);

    const interval = setInterval(() => {
      setFeedProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsFeeding(false);
          return 100;
        }
        return prev + 20;
      });
    }, 200);
  };

  const avgWeightKg = (0.008 * fishLength ** 3) / 1000;
  const estimatedBiomassKg = Math.round(avgWeightKg * stockDensity);
  const estimatedMarketValueIDR = estimatedBiomassKg * 22000;
  const estimatedMarketValueUSD = (estimatedMarketValueIDR / 15000).toFixed(2);

  const [downloadingReport, setDownloadingReport] = useState(false);
  const triggerPdfDownload = async () => {
    setDownloadingReport(true);
    try {
      const { jsPDF } = await import("jspdf");
      const autoTable = (await import("jspdf-autotable")).default;

      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text("Project Clarias — Technical Farm & Biomass Report", 14, 20);

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);

      doc.setFontSize(13);
      doc.setTextColor(0);
      doc.text("Water Telemetry History", 14, 40);

      autoTable(doc, {
        startY: 44,
        head: [["Parameter", "Current Value", "Health Threshold Status"]],
        body: [
          [
            "Dissolved Oxygen (DO)",
            `${telemetry.do} mg/L`,
            telemetry.do < 4.0 ? "CRITICAL (Low)" : "Normal (Safe)",
          ],
          [
            "pH Level",
            telemetry.ph.toFixed(1),
            telemetry.ph < 6.5 || telemetry.ph > 8.5 ? "Warning" : "Safe",
          ],
          ["Temperature", `${telemetry.temp} °C`, "Ideal (28.0 - 32.0 °C)"],
          ["Water Level", `${telemetry.waterLevel} m`, "Optimal"],
        ],
        theme: "grid",
        headStyles: { fillColor: [0, 128, 255] },
      });

      const finalY = (doc as any).lastAutoTable?.finalY ?? 85;
      doc.setFontSize(13);
      doc.text("Biometrics & Valuation Analytics", 14, finalY + 12);

      autoTable(doc, {
        startY: finalY + 16,
        head: [["Metric Parameter", "Value", "Status Details"]],
        body: [
          ["Average Length", `${fishLength} cm`, "Harvest Ready Size Group"],
          ["Stock Density", `${stockDensity} pcs`, "Active Pond P-01"],
          [
            "Estimated Biomass",
            `${estimatedBiomassKg} kg`,
            "Valuable Product Yield",
          ],
          [
            "Calculated Market Valuation (USD)",
            `$${estimatedMarketValueUSD}`,
            "Equivalent to IDR " + estimatedMarketValueIDR.toLocaleString(),
          ],
        ],
        theme: "grid",
        headStyles: { fillColor: [51, 204, 51] },
      });

      doc.save("project-clarias-valuation-report.pdf");
    } catch (e) {
      console.error(e);
    } finally {
      setDownloadingReport(false);
    }
  };

  return (
    <>
      <main>
        {/* HERO SECTION - HYBRID */}
        <section className="relative flex min-h-[50vh] flex-col">
          {/* Main Grid Wrapper */}
          <div className="inner relative flex grow flex-col justify-center overflow-hidden border-separator/10 border-x px-4 py-16 transition-all lg:px-16">
            {/* The GrainGradient from user's original request */}
            <GrainGradient
              colors={["#700000", "#0080ff", "#f2ebca", "#33cc33"]}
              colorBack="#ffffff00"
              softness={1}
              intensity={1}
              noise={0.7}
              shape="corners"
              speed={1}
              scale={2}
              className="absolute inset-0 -z-20 h-full w-full opacity-80"
            />
            {/* A slight gradient overlay to make text readable */}
            <div className="pointer-events-none absolute inset-0 -z-10 h-full w-full bg-background/30 backdrop-blur-[2px]" />

            <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center gap-8">
              <h1 className="flex items-center gap-2 font-semibold text-5xl leading-[1.1] tracking-tighter sm:text-6xl lg:text-7xl">
                <AtomIcon />
                Project Clarias
              </h1>

              <div className="flex flex-col items-center">
                <h2 className="font-semibold text-4xl sm:text-5xl lg:text-6xl">
                  Make your farm
                </h2>
                <h2 className="font-semibold text-4xl text-blue-500 mix-blend-exclusion sm:text-5xl lg:text-6xl">
                  like a tycoon.
                </h2>
              </div>

              <div className="flex gap-4 pt-2">
                <Link
                  href="/"
                  className="bg-foreground px-6 py-3 font-bold font-mono text-background text-sm uppercase transition hover:bg-foreground/90"
                >
                  [get started]
                </Link>
              </div>
            </div>

            {/* Right Column: Interactive Telemetry Monitor Sandbox
              <div className="w-full shrink-0 lg:w-[420px]">
                <div className="flex flex-col gap-4 rounded-xs border border-separator/20 bg-background/60 p-5 shadow-2xl backdrop-blur-xl">
                  <div className="flex items-center justify-between border-separator/10 border-b pb-3">
                    <span className="flex items-center gap-1.5 font-mono text-muted-foreground text-xs uppercase">
                      <span className="relative flex h-2 w-2">
                        <span
                          className={cn(
                            "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
                            simulateAlert ? "bg-red-400" : "bg-green-400",
                          )}
                        ></span>
                        <span
                          className={cn(
                            "relative inline-flex h-2 w-2 rounded-full",
                            simulateAlert ? "bg-red-500" : "bg-green-500",
                          )}
                        ></span>
                      </span>
                      Pond-01 Realtime Stream
                    </span>
                    <button
                      onClick={() => setSimulateAlert(!simulateAlert)}
                      className={cn(
                        "inline-flex cursor-pointer items-center gap-1 rounded border px-2 py-1 font-bold text-[10px] uppercase transition",
                        simulateAlert
                          ? "border-red-600 bg-red-500 text-white hover:bg-red-600"
                          : "border-separator/20 bg-background text-foreground shadow-sm hover:bg-separator/10",
                      )}
                    >
                      <AlertTriangle className="h-3 w-3" />
                      {simulateAlert ? "Stop Alert" : "Simulate Alert"}
                    </button>
                  </div>

                  {simulateAlert && (
                    <div className="flex items-center gap-2 rounded border border-red-200 bg-red-50 p-2 font-mono font-semibold text-[10px] text-red-800 uppercase dark:border-red-900 dark:bg-red-950 dark:text-red-200">
                      <AlertTriangle className="h-3 w-3 shrink-0 animate-bounce" />
                      DO Critical Parameter Alert Triggered
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div
                      className={cn(
                        "rounded border p-3 transition duration-300",
                        simulateAlert
                          ? "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30"
                          : "border-separator/10 bg-background",
                      )}
                    >
                      <span className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground uppercase">
                        <Droplets className="h-3 w-3 text-blue-500" /> DO Level
                      </span>
                      <p
                        className={cn(
                          "mt-1 font-bold font-mono text-xl",
                          simulateAlert ? "text-red-500" : "text-foreground",
                        )}
                      >
                        {telemetry.do}{" "}
                        <span className="font-normal text-[10px]">mg/L</span>
                      </p>
                    </div>
                    <div
                      className={cn(
                        "rounded border p-3 transition duration-300",
                        simulateAlert
                          ? "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30"
                          : "border-separator/10 bg-background",
                      )}
                    >
                      <span className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground uppercase">
                        <Waves className="h-3 w-3 text-emerald-500" /> pH
                      </span>
                      <p
                        className={cn(
                          "mt-1 font-bold font-mono text-xl",
                          simulateAlert ? "text-red-500" : "text-foreground",
                        )}
                      >
                        {telemetry.ph}
                      </p>
                    </div>
                    <div className="rounded border border-separator/10 bg-background p-3">
                      <span className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground uppercase">
                        <Thermometer className="h-3 w-3 text-orange-500" /> Temp
                      </span>
                      <p className="mt-1 font-bold font-mono text-foreground text-xl">
                        {telemetry.temp}{" "}
                        <span className="font-normal text-[10px]">°C</span>
                      </p>
                    </div>
                    <div className="rounded border border-separator/10 bg-background p-3">
                      <span className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground uppercase">
                        <Waves className="h-3 w-3 text-blue-500" /> Depth
                      </span>
                      <p className="mt-1 font-bold font-mono text-foreground text-xl">
                        {telemetry.waterLevel}{" "}
                        <span className="font-normal text-[10px]">m</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              */}
          </div>

          <div className="border-separator/10 border-t">
            <div className="inner relative m-auto border-separator/10 border-x p-4">
              <span className="relative flex items-center justify-between font-montreal-mono text-xs opacity-90 transition-opacity duration-300 dark:opacity-75">
                <Link
                  target="_blank"
                  href="https://time.is/Jakarta"
                  className="hover:underline"
                >
                  [Timezone: Jakarta, ID]
                </Link>
                <span className="text-muted-foreground">
                  SYSTEM STATUS: ALL SYSTEMS NOMINAL
                </span>
              </span>
              <PlusSeparator position={["top-left", "top-right"]} />
            </div>
          </div>
        </section>

        {/* ABOUT SECTION */}
        <main className="w-full border-separator/10 border-t">
          <div className="inner relative flex h-full flex-col border-separator/10 border-x px-4 sm:px-8 xl:flex-row xl:justify-between xl:px-16">
            <div className="py-24 xl:max-w-xl">
              <h2 className="mb-4 font-bold font-montreal text-2xl">
                the core problem
              </h2>
              <p className="text-sm leading-relaxed sm:text-base">
                traditional catfish farming is labor-intensive and lacks
                accurate data monitoring. farmers often guess water quality
                parameters and feeding times, leading to
                <span className="mx-1 text-destructive underline decoration-destructive decoration-dashed">
                  high mortality rates
                </span>
                and wasted feed. fish feed alone can account for up to 70% of
                total operational costs in aquaculture.
              </p>
              <br />
              <p className="text-sm leading-relaxed sm:text-base">
                to solve this, we created project clarias. it uses automated
                servo-based feeders and real-time dissolved oxygen sensors to
                track everything about the pond's health. since we started
                building it, we've focused on ensuring the hardware can
                withstand rural outdoor environments while providing seamless
                cloud synchronization.
              </p>
            </div>

            <div className="relative mx-auto mb-12 flex w-full max-w-sm items-center justify-center xl:mr-0 xl:mb-0 xl:ml-auto">
              <div className="flex w-full flex-col justify-between rounded-xs border border-separator/10 bg-muted/30 p-6 shadow-sm dark:bg-muted/10">
                <h2 className="font-montreal font-semibold text-xl">
                  philosophy
                </h2>
                <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
                  we believe technology shouldn't just be flashy, but
                  practically useful for rural farmers. every metric we track is
                  aimed at reducing cost and improving yield.
                </p>
                <Link
                  className="mt-6 font-bold font-mono text-blue-600 text-sm hover:underline dark:text-blue-400"
                  href="/"
                >
                  [/view-dashboard]
                </Link>
              </div>
            </div>

            <PlusSeparator position={["top-left", "top-right"]} />
          </div>
        </main>

        {/* PROJECTS / FEATURES TITLE SECTION */}
        <main className="w-full border-separator/10 border-t bg-muted/50">
          <div className="inner relative flex flex-col items-center justify-center border-separator/10 border-x px-4 py-16 text-center sm:px-8">
            <span className="mb-6 inline-flex items-center justify-center rounded border border-separator/20 bg-background px-3 py-1 font-bold font-mono text-[10px] text-blue-600 uppercase shadow-sm">
              Interactive Sandboxes
            </span>
            <h2 className="mb-4 font-extrabold font-montreal text-3xl text-foreground tracking-tight sm:text-4xl lg:text-5xl">
              Core System Modules
            </h2>
            <p className="max-w-xl text-muted-foreground text-sm leading-relaxed sm:text-base">
              We engineered our IoT and analytics systems to be resilient and
              precise. Explore the live sandbox simulations below to interact
              with our hardware controllers and predictive models.
            </p>
            <PlusSeparator position={["top-left", "top-right"]} />
          </div>

          <div className="inner relative border-separator/10 border-x p-2">
            <section className="relative grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-12">
              {/* FEEDER CARD */}
              <div className="group relative flex flex-col justify-between overflow-hidden rounded-xs border border-separator/10 bg-background transition-all hover:border-foreground/20 lg:col-span-5">
                <div className="flex flex-col gap-4 p-6">
                  <div className="flex flex-wrap gap-1.5">
                    <span className="inline-flex w-fit items-center justify-center rounded border border-separator/20 bg-muted/50 px-2 py-0.5 font-mono font-semibold text-[10px] text-foreground uppercase">
                      IoT System
                    </span>
                    <span className="inline-flex w-fit items-center justify-center rounded border border-separator/20 bg-muted/50 px-2 py-0.5 font-mono font-semibold text-[10px] text-foreground uppercase">
                      Hardware Control
                    </span>
                  </div>
                  <h2 className="font-montreal font-semibold text-xl leading-tight">
                    Smart Feeder Dispenser
                  </h2>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Automated motor dispensation for Hi-Pro-Vite pellets.
                    Triggers based on computed conversion ratios, avoiding
                    overfeeding while tracking daily costs.
                  </p>

                  <div className="mt-4 rounded-lg border border-separator/10 bg-muted/30 p-5 shadow-inner">
                    <div className="mb-5 flex items-center justify-center gap-5">
                      <div className="relative flex h-16 w-16 items-center justify-center rounded-full border-2 border-separator/20 bg-background shadow-sm">
                        <div
                          className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-background transition-transform duration-300",
                            isFeeding && "animate-spin",
                          )}
                        >
                          <Cpu className="h-5 w-5" />
                        </div>
                      </div>
                      <div className="flex-1 space-y-1.5">
                        <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
                          Servo Motor Status
                        </p>
                        <p className="font-bold font-mono text-foreground text-xs">
                          {isFeeding
                            ? `DISPENSING (${feedProgress}%)`
                            : "SYSTEM IDLE"}
                        </p>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-separator/20">
                          <div
                            className="h-full bg-blue-500 transition-all duration-200"
                            style={{ width: `${feedProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={triggerFeeder}
                      disabled={isFeeding}
                      className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded bg-foreground px-3 py-2.5 font-bold font-mono text-background text-xs uppercase shadow-md transition hover:bg-foreground/90 disabled:opacity-50"
                    >
                      <Play className="h-3.5 w-3.5" />
                      {isFeeding ? "Spinning..." : "Trigger Manual Feed"}
                    </button>
                  </div>
                </div>
              </div>

              {/* YIELD CARD */}
              <div className="group relative flex flex-col justify-between overflow-hidden rounded-xs border border-separator/10 bg-background transition-all hover:border-foreground/20 lg:col-span-7">
                <div className="flex flex-col gap-4 p-6">
                  <div className="flex flex-wrap gap-1.5">
                    <span className="inline-flex w-fit items-center justify-center rounded border border-separator/20 bg-muted/50 px-2 py-0.5 font-mono font-semibold text-[10px] text-foreground uppercase">
                      Predictive
                    </span>
                    <span className="inline-flex w-fit items-center justify-center rounded border border-separator/20 bg-muted/50 px-2 py-0.5 font-mono font-semibold text-[10px] text-foreground uppercase">
                      Analytics
                    </span>
                  </div>
                  <h2 className="font-montreal font-semibold text-xl leading-tight">
                    Biomass Forecaster & Reports
                  </h2>
                  <p className="max-w-2xl text-muted-foreground text-sm leading-relaxed">
                    Predict total pond harvests based on biological models using
                    fish sizes and stock counts. Export verified financial PDF
                    reports to secure agricultural loan capital.
                  </p>

                  <div className="mt-4 grid grid-cols-1 items-end gap-8 md:grid-cols-2">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <div className="flex justify-between font-mono font-semibold text-xs">
                          <span className="text-muted-foreground">
                            Catfish Avg Length
                          </span>
                          <span className="text-blue-600">{fishLength} cm</span>
                        </div>
                        <input
                          type="range"
                          min="15"
                          max="45"
                          value={fishLength}
                          onChange={(e) =>
                            setFishLength(Number(e.target.value))
                          }
                          className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-separator/20 accent-foreground"
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between font-mono font-semibold text-xs">
                          <span className="text-muted-foreground">
                            Pond Stock Count
                          </span>
                          <span className="text-blue-600">
                            {stockDensity} pcs
                          </span>
                        </div>
                        <input
                          type="range"
                          min="500"
                          max="4000"
                          step="100"
                          value={stockDensity}
                          onChange={(e) =>
                            setStockDensity(Number(e.target.value))
                          }
                          className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-separator/20 accent-foreground"
                        />
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="rounded border border-separator/10 bg-muted/30 p-3 text-center shadow-inner">
                          <span className="font-mono text-[10px] text-muted-foreground uppercase">
                            Biomass Yield
                          </span>
                          <p className="mt-1 font-bold font-mono text-foreground text-lg">
                            {estimatedBiomassKg} kg
                          </p>
                        </div>
                        <div className="rounded border border-separator/10 bg-muted/30 p-3 text-center shadow-inner">
                          <span className="font-mono text-[10px] text-muted-foreground uppercase">
                            Market Value
                          </span>
                          <p className="mt-1 font-bold font-mono text-green-600 text-lg">
                            ${estimatedMarketValueUSD}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-4">
                      <div className="rounded border border-separator/10 bg-background p-2 shadow-inner">
                        <BiomassChart />
                      </div>
                      <button
                        onClick={triggerPdfDownload}
                        disabled={downloadingReport}
                        className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded bg-foreground px-3 py-2.5 font-bold font-mono text-background text-xs uppercase shadow-md transition hover:bg-foreground/90 disabled:opacity-50"
                      >
                        <Download className="h-3.5 w-3.5" />
                        {downloadingReport
                          ? "Generating Document..."
                          : "Export Live PDF Report"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="flex flex-col items-center justify-center py-16 text-center">
              <h3 className="mb-3 font-bold font-montreal text-2xl text-foreground">
                ready to optimize your farm?
              </h3>
              <p className="mb-6 max-w-md text-muted-foreground text-sm">
                experience the complete capabilities of project clarias by
                launching into our application dashboard.
              </p>
              <Link
                className="rounded bg-blue-600 px-8 py-3 font-mono font-semibold text-white transition hover:bg-blue-700"
                href="/"
              >
                [enter dashboard]
              </Link>
            </section>
          </div>
        </main>

        <main className="w-full border-separator/10 border-t">
          <div className="inner relative flex h-24 border-separator/10 border-x">
            <PlusSeparator position={["top-left", "top-right"]} />
          </div>
        </main>
      </main>

      {/* FOOTER */}
      <footer>
        <section className="w-full border-separator/10 border-t bg-muted/10">
          <div className="inner relative grid grid-cols-2 items-start justify-between gap-8 border-separator/10 border-x p-8 sm:grid-cols-3 md:grid-cols-6">
            <div className="col-span-2 my-auto flex flex-col gap-2 sm:col-span-3">
              <Link
                className="w-max bg-foreground pr-2 pl-1 font-montreal font-semibold text-2xl text-background tracking-[-0.09em]"
                href="/"
              >
                clarias.
              </Link>
              <p className="text-muted-foreground text-sm">
                agriculture and food systems track project.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <span className="font-bold font-montreal text-foreground/80 text-lg">
                App
              </span>
              <nav className="flex flex-col gap-1 font-medium font-mono text-blue-600 text-sm transition-all *:hover:underline dark:text-blue-400">
                <Link href="/">[dashboard]</Link>
                <Link href="/environment">[environment]</Link>
                <Link href="/harvest">[harvests]</Link>
                <Link href="/finance">[finance]</Link>
              </nav>
            </div>
            <div className="flex flex-col gap-4">
              <span className="font-bold font-montreal text-foreground/80 text-lg">
                Meta
              </span>
              <nav className="flex flex-col gap-1 font-medium font-mono text-blue-600 text-sm transition-all *:hover:underline dark:text-blue-400">
                <Link href="/home">[home]</Link>
              </nav>
            </div>
            <PlusSeparator position={["top-left", "top-right"]} />
          </div>
        </section>
        <section className="relative h-[50px] w-full border-separator/10 border-t bg-muted/20">
          <div className="inner relative flex h-full items-center justify-between border-separator/10 border-x p-4">
            <p className="max-w-[60%] font-mono text-2xs text-muted-foreground uppercase leading-3 tracking-widest">
              This project is built for the Semoga Menang Hackathon.
            </p>
            <PlusSeparator position={["top-left", "top-right"]} />
          </div>
        </section>
      </footer>
    </>
  );
}
