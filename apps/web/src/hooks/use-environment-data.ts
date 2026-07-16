"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { RealtimePostgresInsertPayload } from "@supabase/supabase-js";
import type { EnvironmentData } from "@/types/models";
import { getEnvironmentData } from "@/services/mock-data";
import { supabase } from "@/lib/api-client";

const POLL_INTERVAL_MS = 30_000;

interface EnvironmentHookResult {
  data: EnvironmentData | null;
  loading: boolean;
  error: string | null;
  waterEfficiency: number;
  feedEfficiency: number;
}

function computeWaterEfficiency(d: EnvironmentData): number {
  const phScore = d.pH >= 6.5 && d.pH <= 8.5 ? 100 : Math.max(0, 100 - Math.abs(d.pH - 7.5) * 20);
  const doScore = d.dissolvedOxygen >= 5 ? 100 : (d.dissolvedOxygen / 5) * 100;
  const tempScore =
    d.temperature >= 25 && d.temperature <= 32
      ? 100
      : Math.max(0, 100 - Math.abs(d.temperature - 28.5) * 10);
  return Math.round((phScore + doScore + tempScore) / 3);
}

function computeFeedEfficiency(d: EnvironmentData): number {
  const doFactor = Math.min(d.dissolvedOxygen / 7, 1);
  const tempFactor =
    d.temperature >= 26 && d.temperature <= 30
      ? 1
      : Math.max(0.5, 1 - Math.abs(d.temperature - 28) * 0.05);
  return Math.round(doFactor * tempFactor * 100);
}

function mapRealtimeRow(row: Record<string, unknown>): EnvironmentData {
  return {
    dissolvedOxygen: Number(row.dissolved_oxygen ?? row.dissolvedOxygen ?? 0),
    pH: Number(row.ph ?? row.pH ?? 7),
    waterLevel: Number(row.water_level ?? row.waterLevel ?? 0),
    temperature: Number(row.temperature ?? 0),
    hasAlert: Boolean(row.has_alert ?? row.hasAlert ?? false),
    timestamp: String(row.timestamp ?? row.created_at ?? new Date().toISOString()),
  };
}

export function useEnvironmentData(): EnvironmentHookResult {
  const [data, setData] = useState<EnvironmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const result = await getEnvironmentData();
      setData(result);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch environment data");
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      await fetchData();
      if (!cancelled) setLoading(false);
    };

    init();

    const channel = supabase
      .channel("environment-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "environment_readings" },
        (payload: RealtimePostgresInsertPayload<Record<string, unknown>>) => {
          if (payload.new) {
            setData(mapRealtimeRow(payload.new as Record<string, unknown>));
          }
        },
      )
      .subscribe((status: string) => {
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          if (!pollRef.current) {
            pollRef.current = setInterval(fetchData, POLL_INTERVAL_MS);
          }
        }
        if (status === "SUBSCRIBED" && pollRef.current) {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }
      });

    channelRef.current = channel;

    return () => {
      cancelled = true;
      if (pollRef.current) clearInterval(pollRef.current);
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
  }, [fetchData]);

  const waterEfficiency = data ? computeWaterEfficiency(data) : 0;
  const feedEfficiency = data ? computeFeedEfficiency(data) : 0;

  return { data, loading, error, waterEfficiency, feedEfficiency };
}
