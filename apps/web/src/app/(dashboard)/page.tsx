"use client";

import { useState, useEffect } from "react";
import { LayoutDashboard, Sparkles, HeartPulse, CheckCircle2 } from "lucide-react";
import { EnvironmentMonitor } from "@/components/environment-monitor";
import { BiomassChart } from "@/components/biomass-chart";
import { AICopilotSection as AICopilot } from "@/components/ai-copilot";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [healthScore, setHealthScore] = useState(0);
  const [aiSummary, setAiSummary] = useState("");
  const [recommendations, setRecommendations] = useState<string[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHealthScore(92);
      setAiSummary("The pond ecosystem is highly stable. Water parameters are within optimal ranges for Clarias gariepinus growth. Biomass accumulation is tracking 4% ahead of the predictive model.");
      setRecommendations([
        "Maintain current feeding rate of 45kg/day.",
        "Schedule routine water sampling for next Tuesday.",
        "Prepare for partial harvest in approximately 14 days."
      ]);
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="flex items-center gap-3 font-bold font-montreal text-3xl tracking-tight text-foreground">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 border border-indigo-500/20 shadow-sm">
            <LayoutDashboard className="h-5 w-5" />
          </div>
          Operational Hub
        </h1>
        <p className="font-mono text-muted-foreground text-sm max-w-2xl">
          Real-time overview of your aquaculture operation. Monitor ecosystem health, AI insights, and key performance indicators at a glance.
        </p>
      </div>

      <section>
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-48 rounded-xl lg:col-span-2" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="relative flex flex-col overflow-hidden border-separator/10">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-center gap-2 font-mono text-[10px] text-muted-foreground uppercase tracking-wider text-center">
                  <HeartPulse className="h-3.5 w-3.5" />
                  Overall Health Score
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col items-center justify-center pt-2 pb-6 text-center">
                <div className="text-6xl font-bold font-montreal tracking-tight text-indigo-600">{healthScore}</div>
                <span className="mt-1 font-mono text-[10px] text-muted-foreground uppercase tracking-wider">/ 100</span>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2 border-separator/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-montreal text-lg tracking-tight">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  AI Intelligence Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {aiSummary}
                </p>
                <div className="space-y-2">
                  <h4 className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">Key Recommendations</h4>
                  <ul className="space-y-1.5">
                    {recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-foreground">
                        <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-emerald-500" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </section>

      <section>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="relative overflow-hidden rounded-xl border border-separator/10 bg-background p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="font-bold font-montreal text-xl text-foreground">Environment Snapshot</h2>
              <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">Live Sensor Feed</p>
            </div>
            {isLoading ? <Skeleton className="h-80 rounded-xl" /> : <EnvironmentMonitor />}
          </div>
          <div className="relative overflow-hidden rounded-xl border border-separator/10 bg-background p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="font-bold font-montreal text-xl text-foreground">Biomass Performance</h2>
              <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">Growth Trajectory</p>
            </div>
            {isLoading ? <Skeleton className="h-80 rounded-xl" /> : <BiomassChart />}
          </div>
        </div>
      </section>

      <section>
        {isLoading ? <Skeleton className="h-64 rounded-xl" /> : <AICopilot />}
      </section>
    </div>
  );
}
