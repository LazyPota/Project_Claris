"use client";

import { useCallback, useEffect, useState } from "react";
import type { FeedingEvent } from "@/types/models";
import { getFeedingHistory } from "@/services/mock-data";

interface FeedingHookResult {
  events: FeedingEvent[];
  loading: boolean;
  error: string | null;
  totalFeedKg: number;
  addFeedingEvent: (event: Omit<FeedingEvent, "date">) => void;
}

export function useFeedingData(): FeedingHookResult {
  const [events, setEvents] = useState<FeedingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    getFeedingHistory()
      .then((data) => {
        if (!cancelled) setEvents(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to fetch feeding data");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const addFeedingEvent = useCallback(
    (event: Omit<FeedingEvent, "date">) => {
      const newEvent: FeedingEvent = {
        ...event,
        date: new Date().toISOString(),
      };
      setEvents((prev) => [newEvent, ...prev]);
    },
    [],
  );

  const totalFeedKg = events.reduce((sum, e) => sum + e.amountKg, 0);

  return { events, loading, error, totalFeedKg, addFeedingEvent };
}
