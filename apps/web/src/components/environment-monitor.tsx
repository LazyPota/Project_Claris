"use client";

import { AlertTriangle, Droplets, Thermometer, Waves } from "lucide-react";
import { useEnvironmentData } from "@/hooks/use-environment-data";
import { cn } from "@/lib/utils";

export function EnvironmentMonitor() {
  const { data, loading } = useEnvironmentData();

  if (loading) {
    return <div className="text-sm text-neutral-500">Loading sensor data…</div>;
  }

  if (!data) {
    return <div className="text-sm text-red-600">Failed to load sensor data.</div>;
  }

  const metrics = [
    {
      label: "Dissolved Oxygen",
      value: `${data.dissolvedOxygen} mg/L`,
      icon: Droplets,
    },
    {
      label: "pH Level",
      value: data.pH.toFixed(1),
      icon: Waves,
    },
    {
      label: "Temperature",
      value: `${data.temperature} °C`,
      icon: Thermometer,
    },
    {
      label: "Water Level",
      value: `${data.waterLevel} m`,
      icon: Waves,
    },
  ];

  return (
    <div className="space-y-4">
      {data.hasAlert && (
        <div className="flex items-center gap-2 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span className="text-sm font-medium">
            ALERT: One or more water quality parameters are outside safe
            thresholds.
          </span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className={cn(
              "rounded-md border p-4",
              data.hasAlert
                ? "border-red-300 dark:border-red-800"
                : "border-neutral-200 dark:border-neutral-800"
            )}
          >
            <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400">
              <metric.icon className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wide">
                {metric.label}
              </span>
            </div>
            <p className="mt-2 text-2xl font-semibold">{metric.value}</p>
          </div>
        ))}
      </div>

      <p className="text-xs text-neutral-400">
        Last updated: {new Date(data.timestamp).toLocaleString()}
      </p>
    </div>
  );
}
