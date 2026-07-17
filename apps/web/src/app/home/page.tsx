"use client";

import { GrainGradient } from "@paper-design/shaders-react";
import { AtomIcon } from "@phosphor-icons/react";
import {
  AlertTriangle,
  ArrowUp,
  CheckCircle2,
  Clock,
  Cpu,
  Download,
  Droplets,
  FileText,
  Play,
  ShieldCheck,
  Sparkles,
  Thermometer,
  Waves,
} from "lucide-react";
import { LayoutGroup, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import ShirokoTransparent from "#/public/static/image/shiroko-transparent.png";
import RotatingText from "#/src/components/ui/rotating-text";
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
    <div className="flex w-full flex-col">
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

              <div className="flex flex-col items-center gap-2">
                <h2 className="font-semibold text-4xl sm:text-5xl lg:text-6xl">
                  Make your farm
                </h2>
                <LayoutGroup>
                  <motion.h1
                    className="flex items-center gap-3 font-semibold text-2xl sm:text-3xl md:text-5xl"
                    layout
                  >
                    {/*
                    <motion.span
                      layout
                      transition={{
                        type: "spring",
                        damping: 30,
                        stiffness: 400,
                      }}
                    >
                      prefix
                    </motion.span>*/}
                    <RotatingText
                      texts={[
                        "like a tycoon.",
                        "thinks on it's own.",
                        "life and live safely",
                      ]}
                      mainClassName="font-semibold text-4xl bg-blue-500 text-white mix-blend-exclusion px-4 py-2 rounded-md sm:text-5xl lg:text-6xl"
                      staggerFrom={"last"}
                      initial={{ y: "100%" }}
                      animate={{ y: 0 }}
                      exit={{ y: "-120%" }}
                      staggerDuration={0.025}
                      splitLevelClassName="overflow-hidden pb-0.5"
                      transition={{
                        type: "spring",
                        damping: 30,
                        stiffness: 400,
                      }}
                      rotationInterval={5000}
                    />
                  </motion.h1>
                </LayoutGroup>
              </div>

              <div className="flex gap-4 pt-2">
                <Link
                  href="/auth"
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
                    <div className="flex items-center gap-2 rounded border border-red-200 bg-red-50 p-2 font-mono font-semibold text-[10px] text-red-800 uppercase   ">
                      <AlertTriangle className="h-3 w-3 shrink-0 animate-bounce" />
                      DO Critical Parameter Alert Triggered
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div
                      className={cn(
                        "rounded border p-3 transition duration-300",
                        simulateAlert
                          ? "border-red-200 bg-red-50  "
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
                          ? "border-red-200 bg-red-50  "
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

            {/* Modern Floating Status Pill */}
            <div className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2">
              <div className="flex items-center gap-3 rounded-full border border-separator/20 bg-background/50 px-4 py-2 shadow-lg backdrop-blur-md">
                <div className="flex h-2 w-2 items-center justify-center">
                  <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                </div>
                <span className="font-medium font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
                  All Systems Nominal • JKT
                </span>
              </div>
            </div>

            <PlusSeparator position={["bottom-left", "bottom-right"]} />
          </div>
        </section>

        {/* ABOUT SECTION - UNIQUE LAYOUT */}
        <main id="problem" className="w-full border-separator/10 border-t">
          <div className="inner relative flex flex-col items-center justify-center border-separator/10 border-x px-4 py-20 text-center sm:px-8 lg:px-16">
            <div className="max-w-3xl">
              <span className="mb-4 inline-flex items-center justify-center rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 font-bold font-mono text-[10px] text-red-600 uppercase shadow-sm">
                The Problem
              </span>
              <h2 className="mb-6 font-bold font-montreal text-3xl sm:text-4xl">
                Traditional Farming is Broken.
              </h2>
              <p className="mb-4 text-base text-muted-foreground leading-relaxed sm:text-lg">
                Traditional catfish farming is labor-intensive and lacks
                accurate data monitoring. Farmers often guess water quality
                parameters and feeding times, leading to
                <span className="mx-1 font-mono font-semibold text-red-500 underline decoration-red-500/30 decoration-wavy underline-offset-4">
                  High Mortality Rates
                </span>
                and wasted feed. Fish feed alone can account for up to 70% of
                total operational costs in aquaculture.
              </p>
              <p className="text-base text-muted-foreground leading-relaxed sm:text-lg">
                To solve this, we created Project Clarias. It uses automated
                servo-based feeders and real-time dissolved oxygen sensors to
                track everything about the pond's health.
              </p>
            </div>

            <div className="mt-16 grid w-full max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
              <div className="flex flex-col items-start rounded-xl border border-separator/10 bg-muted/20 p-8 text-left transition hover:bg-muted/30">
                <div className="mb-4 rounded-full bg-blue-500/10 p-2 text-blue-600">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="mb-2 font-bold font-montreal text-xl">
                  Our Philosophy
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Technology shouldn't just be flashy, but practically useful
                  for rural farmers. Every metric we track is aimed at reducing
                  cost and improving yield.
                </p>
              </div>
              <div className="flex flex-col items-start rounded-xl border border-separator/10 bg-muted/20 p-8 text-left transition hover:bg-muted/30">
                <div className="mb-4 rounded-md bg-emerald-500/10 p-2 text-emerald-600">
                  <Cpu className="h-6 w-6" />
                </div>
                <h3 className="mb-2 font-bold font-montreal text-xl">
                  Hardware Focused
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Since we started building it, we've focused on ensuring the
                  hardware can withstand rural outdoor environments while
                  providing seamless cloud synchronization.
                </p>
              </div>
            </div>

            <PlusSeparator position={["top-left", "top-right"]} />
          </div>
        </main>

        {/* DEMO SECTION */}
        <main
          id="modules"
          className="w-full border-separator/10 border-t bg-muted/50"
        >
          <div className="inner relative flex flex-col items-center justify-center border-separator/10 border-x px-4 py-16 text-center sm:px-8 lg:px-16">
            <span className="mb-6 inline-flex items-center justify-center rounded-full border border-separator/20 bg-background px-3 py-1 font-bold font-mono text-[10px] text-blue-600 uppercase shadow-sm">
              See it in action
            </span>
            <h2 className="mb-4 font-extrabold font-montreal text-3xl text-foreground tracking-tight sm:text-4xl lg:text-5xl">
              System Demonstration
            </h2>
            <p className="max-w-xl text-muted-foreground text-sm leading-relaxed sm:text-base">
              Watch how our IoT and analytics systems work together to deliver
              real-time insights and automated feeding control.
            </p>

            <div className="mt-16 flex w-full max-w-5xl flex-col gap-16 lg:gap-24">
              {/* Feature 1 */}
              <div className="flex flex-col items-center gap-8 lg:flex-row lg:gap-12">
                <div className="w-full lg:w-1/2">
                  <div className="flex flex-col overflow-hidden rounded-xl border border-separator/20 bg-background shadow-lg">
                    <div className="flex items-center gap-2 border-separator/10 border-b bg-muted/30 px-4 py-3">
                      <div className="h-2.5 w-2.5 rounded-full bg-red-400/80"></div>
                      <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/80"></div>
                      <div className="h-2.5 w-2.5 rounded-full bg-green-400/80"></div>
                      <div className="ml-2 flex-1 truncate text-left font-mono text-[10px] text-muted-foreground">
                        demo-feeder-sys.mp4
                      </div>
                    </div>
                    <div className="relative aspect-video w-full bg-muted/20">
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                        <Play className="mb-2 h-8 w-8 opacity-40" />
                      </div>
                      {/* <img src="/feeder-demo.gif" className="absolute inset-0 h-full w-full object-cover" /> */}
                    </div>
                  </div>
                </div>
                <div className="w-full text-left lg:w-1/2">
                  <h3 className="mb-4 font-bold font-montreal text-2xl lg:text-3xl">
                    Automated Feeder
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
                    Watch the servo motor dispense precise amounts of feed based
                    on real-time biomass calculations. This prevents overfeeding
                    and optimizes your feed conversion ratio, saving significant
                    costs.
                  </p>
                </div>
              </div>

              {/* Feature 2 - Reversed on Desktop */}
              <div className="flex flex-col items-center gap-8 lg:flex-row-reverse lg:gap-12">
                <div className="w-full lg:w-1/2">
                  <div className="flex flex-col overflow-hidden rounded-xl border border-separator/20 bg-background shadow-lg">
                    <div className="flex items-center gap-2 border-separator/10 border-b bg-muted/30 px-4 py-3">
                      <div className="h-2.5 w-2.5 rounded-full bg-red-400/80"></div>
                      <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/80"></div>
                      <div className="h-2.5 w-2.5 rounded-full bg-green-400/80"></div>
                      <div className="ml-2 flex-1 truncate text-left font-mono text-[10px] text-muted-foreground">
                        demo-water-quality.mp4
                      </div>
                    </div>
                    <div className="relative aspect-video w-full bg-muted/20">
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                        <Play className="mb-2 h-8 w-8 opacity-40" />
                      </div>
                      {/* <img src="/water-quality.gif" className="absolute inset-0 h-full w-full object-cover" /> */}
                    </div>
                  </div>
                </div>
                <div className="w-full text-left lg:w-1/2">
                  <h3 className="mb-4 font-bold font-montreal text-2xl lg:text-3xl">
                    Water Quality Alerts
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
                    See how the system instantly alerts farmers when Dissolved
                    Oxygen drops below critical levels. Real-time telemetry
                    ensures you can react immediately to prevent catastrophic
                    fish kills.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex flex-col items-center gap-8 lg:flex-row lg:gap-12">
                <div className="w-full lg:w-1/2">
                  <div className="flex flex-col overflow-hidden rounded-xl border border-separator/20 bg-background shadow-lg">
                    <div className="flex items-center gap-2 border-separator/10 border-b bg-muted/30 px-4 py-3">
                      <div className="h-2.5 w-2.5 rounded-full bg-red-400/80"></div>
                      <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/80"></div>
                      <div className="h-2.5 w-2.5 rounded-full bg-green-400/80"></div>
                      <div className="ml-2 flex-1 truncate text-left font-mono text-[10px] text-muted-foreground">
                        demo-pdf-report.mp4
                      </div>
                    </div>
                    <div className="relative aspect-video w-full bg-muted/20">
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                        <Play className="mb-2 h-8 w-8 opacity-40" />
                      </div>
                      {/* <img src="/pdf-export.gif" className="absolute inset-0 h-full w-full object-cover" /> */}
                    </div>
                  </div>
                </div>
                <div className="w-full text-left lg:w-1/2">
                  <h3 className="mb-4 font-bold font-montreal text-2xl lg:text-3xl">
                    Exporting PDF Reports
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
                    Generate comprehensive financial and growth reports for your
                    farm with a single click. Use these verified documents to
                    secure agricultural loans or share progress with
                    stakeholders.
                  </p>
                </div>
              </div>
            </div>

            <PlusSeparator position={["top-left", "top-right"]} />
          </div>
        </main>

        {/* AI AGENT SECTION */}
        <main
          id="ai-agent"
          className="relative w-full overflow-hidden border-separator/10 border-t bg-muted/10"
        >
          <div className="pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[600px] w-full max-w-3xl -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-[120px]" />

          <div className="inner relative flex flex-col items-center justify-center border-separator/10 border-x px-4 py-24 text-center sm:px-8 lg:px-16">
            <span className="mb-6 inline-flex items-center justify-center rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 font-bold font-mono text-[10px] text-blue-600 uppercase shadow-sm">
              say hi to clarie!
            </span>
            <h2 className="mb-4 font-extrabold font-montreal text-3xl text-foreground tracking-tight sm:text-4xl lg:text-5xl">
              Your cute, all-in-one AI pond manager.
            </h2>
            <p className="max-w-2xl text-muted-foreground text-sm leading-relaxed sm:text-base">
              Let Clarie do the heavy lifting! She's the adorable brain behind
              Project Clarias. Just text her in plain English to feed the fish,
              schedule tasks, or whip up a PDF report, and she'll handle all the
              messy IoT and database stuff for you. ✨
            </p>

            <div className="mt-16 grid w-full max-w-6xl gap-8 lg:grid-cols-2 lg:items-center">
              {/* Chat Interface Mockup */}
              <div className="relative">
                {/* Mascot Peeking Placeholder */}
                <div className="absolute -top-12 -left-8 -z-20 h-28 w-28 md:-top-32 md:-left-32 md:h-64 md:w-64">
                  <Image
                    src={ShirokoTransparent}
                    alt="Clarie Mascot"
                    className="absolute inset-0 h-full w-full -scale-x-100 object-contain drop-shadow-xl"
                  />
                </div>

                <div className="flex flex-col overflow-hidden rounded-2xl border border-separator/20 bg-background/50 shadow-2xl backdrop-blur-xl">
                  <div className="flex items-center justify-between border-separator/10 border-b bg-muted/30 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-blue-100 shadow-sm">
                        <span className="text-[10px]">🌸</span>
                        {/* <img src="/clarie-mascot-head.png" className="h-full w-full object-cover" /> */}
                      </div>
                      <span className="font-mono font-semibold text-xs">
                        Clarie AI
                      </span>
                    </div>
                    <div className="flex gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-full bg-red-400/80"></div>
                      <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/80"></div>
                      <div className="h-2.5 w-2.5 rounded-full bg-green-400/80"></div>
                    </div>
                  </div>

                  <div className="relative flex h-[320px] flex-col gap-4 overflow-hidden bg-muted/5 p-6 text-left">
                    {/* User Message */}
                    <div className="max-w-[80%] self-end rounded-2xl rounded-tr-sm bg-blue-600 px-4 py-3 text-white shadow-sm">
                      <p className="font-medium text-sm">
                        Hey Clarie, feed my fish at 5pm everyday and send me the
                        weekly yield report on Fridays.
                      </p>
                    </div>

                    {/* AI Message */}
                    <div className="max-w-[85%] space-y-3 self-start">
                      <div className="rounded-2xl rounded-tl-sm border border-separator/20 bg-background px-4 py-3 shadow-sm">
                        <p className="text-foreground text-sm leading-relaxed">
                          Got it! I've set up a daily Supabase cron job to
                          trigger the <strong>Servo Dispenser</strong> at 5:00
                          PM. I've also scheduled an automated PDF export every
                          Friday at 8:00 AM.
                        </p>
                      </div>

                      {/* Tool executions */}
                      <div className="flex flex-col gap-2 pl-2">
                        <div className="flex items-center gap-2 font-mono text-muted-foreground text-xs">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                          <span>
                            Created cron: <code>feed_daily_1700</code>
                          </span>
                        </div>
                        <div className="flex items-center gap-2 font-mono text-muted-foreground text-xs">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                          <span>
                            Scheduled: <code>report_weekly_fri</code>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-separator/10 border-t bg-background p-3">
                    <div className="flex items-center gap-2 rounded-full border border-separator/20 bg-muted/30 px-4 py-2">
                      <span className="flex-1 font-mono text-muted-foreground/70 text-xs">
                        Type a command for Clarie...
                      </span>
                      <button className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white">
                        <ArrowUp className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Capabilities List */}
              <div className="flex flex-col gap-6 text-left lg:pl-12">
                <div className="flex items-start gap-4 rounded-xl border border-transparent p-4 transition hover:border-separator/10 hover:bg-muted/20">
                  <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-600">
                    <Cpu className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold font-montreal text-xl">
                      IoT Orchestration
                    </h3>
                    <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
                      Clarie can parse natural language to trigger hardware
                      actions, like spinning the servo motor or requesting a
                      forced DO reading from sensors.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-xl border border-transparent p-4 transition hover:border-separator/10 hover:bg-muted/20">
                  <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-500/10 text-purple-600">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold font-montreal text-xl">
                      Supabase Cron Jobs
                    </h3>
                    <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
                      She automatically translates requests like "every evening"
                      into valid Supabase pg_cron schedules, running operations
                      even when you're offline.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-xl border border-transparent p-4 transition hover:border-separator/10 hover:bg-muted/20">
                  <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold font-montreal text-xl">
                      Analytics & PDF Exports
                    </h3>
                    <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
                      Need a report right now? Clarie gathers the latest pond
                      biomass data, calculates yields, and instantly compiles a
                      PDF document.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <PlusSeparator position={["top-left", "top-right"]} />
          </div>
        </main>
        <main className="w-full border-separator/10 border-t">
          <div className="inner relative flex flex-col items-center justify-center border-separator/10 border-x px-4 py-24 text-center">
            <section
              id="dashboard"
              className="flex flex-col items-center justify-center"
            >
              <h3 className="mb-3 font-bold font-montreal text-2xl text-foreground">
                Ready to Optimize Your Farm?
              </h3>
              <p className="mb-6 max-w-md text-muted-foreground text-sm">
                Experience the complete capabilities of Project Clarias by
                launching into our application dashboard.
              </p>
              <div className="flex gap-4 pt-2">
                <Link
                  href="/auth"
                  className="bg-foreground px-6 py-3 font-bold font-mono text-background text-sm uppercase transition hover:bg-foreground/90"
                >
                  [get started]
                </Link>
              </div>
            </section>
            
            <PlusSeparator position={["top-left", "top-right"]} />
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
              <nav className="flex flex-col gap-1 font-medium font-mono text-blue-600 text-sm transition-all *:hover:underline ">
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
              <nav className="flex flex-col gap-1 font-medium font-mono text-blue-600 text-sm transition-all *:hover:underline ">
                <Link href="/home">[home]</Link>
              </nav>
            </div>
            <PlusSeparator position={["top-left", "top-right"]} />
          </div>
        </section>
        <section className="relative h-[50px] w-full border-separator/10 border-t bg-muted/20">
          <div className="inner relative flex h-full items-center justify-between border-separator/10 border-x p-4">
            <p className="max-w-[60%] font-mono text-2xs text-muted-foreground uppercase leading-3 tracking-widest">
              This project is built for Garuda Hacks 7.0 Hackathon.
            </p>
            <PlusSeparator position={["top-left", "top-right"]} />
          </div>
        </section>
      </footer>
    </div>
  );
}
