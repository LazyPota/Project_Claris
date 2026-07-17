"use client";

import { useHardware } from "@/lib/hardware-context";

const STATUS_CONFIG = {
  ONLINE: {
    label: "Hardware Online",
    dotClass: "bg-emerald-500",
    pingClass: "bg-emerald-400",
    showPing: true,
  },
  SYNCING: {
    label: "Syncing...",
    dotClass: "bg-amber-500",
    pingClass: "bg-amber-400",
    showPing: true,
  },
  OFFLINE: {
    label: "Hardware Offline",
    dotClass: "bg-red-500",
    pingClass: "",
    showPing: false,
  },
} as const;

export function HardwareStatusIndicator() {
  const { status } = useHardware();
  const config = STATUS_CONFIG[status];

  return (
    <div className="flex items-center gap-2 rounded-md border border-separator/10 bg-background/60 px-3 py-2 backdrop-blur-sm">
      <span className="relative flex h-2 w-2">
        {config.showPing && (
          <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${config.pingClass} opacity-75`} />
        )}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${config.dotClass}`} />
      </span>
      <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
        {config.label}
      </span>
    </div>
  );
}
