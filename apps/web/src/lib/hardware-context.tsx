"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useAlert } from "@/lib/alert-context";

export type HardwareStatus = "ONLINE" | "SYNCING" | "OFFLINE";

interface HardwareContextValue {
  status: HardwareStatus;
  lastSeen: number;
  isOnline: boolean;
  isSyncing: boolean;
  isOffline: boolean;
}

const HardwareContext = createContext<HardwareContextValue>({
  status: "OFFLINE",
  lastSeen: 0,
  isOnline: false,
  isSyncing: false,
  isOffline: true,
});

const POLL_INTERVAL_MS = 3000;

export function HardwareProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<HardwareStatus>("OFFLINE");
  const [lastSeen, setLastSeen] = useState(0);
  const previousStatusRef = useRef<HardwareStatus>("OFFLINE");
  const { pushAlert } = useAlert();

  const poll = useCallback(async () => {
    try {
      const res = await fetch("/api/status/hardware");
      if (!res.ok) {
        setStatus("OFFLINE");
        return;
      }
      const json = await res.json();
      if (json.success && json.data) {
        setStatus(json.data.status);
        setLastSeen(json.data.lastHeartbeat);
      }
    } catch {
      setStatus("OFFLINE");
    }
  }, []);

  useEffect(() => {
    poll();
    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [poll]);

  useEffect(() => {
    const prev = previousStatusRef.current;

    if (prev !== "OFFLINE" && status === "OFFLINE") {
      pushAlert("error", "Hardware disconnected. Action buttons have been disabled for safety.", 0);
    }

    if (prev === "OFFLINE" && status === "ONLINE") {
      pushAlert("info", "Hardware reconnected. Systems nominal.");
    }

    previousStatusRef.current = status;
  }, [status, pushAlert]);

  const isOnline = status === "ONLINE";
  const isSyncing = status === "SYNCING";
  const isOffline = status === "OFFLINE";

  return (
    <HardwareContext value={{ status, lastSeen, isOnline, isSyncing, isOffline }}>
      {children}
    </HardwareContext>
  );
}

export function useHardware() {
  return useContext(HardwareContext);
}
