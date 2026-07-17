"use client";

import { AtomIcon } from "@phosphor-icons/react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { SidebarNav } from "@/components/sidebar-nav";
import { HardwareStatusIndicator } from "@/components/hardware-status-indicator";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-full min-h-screen bg-background">
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:border-separator/10 lg:border-r lg:bg-muted/20">
        <div className="flex h-14 items-center gap-2 border-separator/10 border-b px-4">
          <Link
            href="/"
            className="flex items-center gap-2 font-montreal font-semibold text-lg tracking-tight"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-600 text-white shadow-sm">
              <AtomIcon className="h-4 w-4" weight="bold" />
            </div>
            <span>clarias.</span>
          </Link>
        </div>
        <SidebarNav />
        <div className="border-separator/10 border-t p-4">
          <HardwareStatusIndicator />
        </div>
      </aside>

      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setMobileOpen(false);
            }}
          />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-separator/10 border-r bg-background/80 shadow-2xl backdrop-blur-xl lg:hidden">
            <div className="flex h-14 items-center justify-between border-separator/10 border-b px-4">
              <Link
                href="/"
                className="flex items-center gap-2 font-montreal font-semibold text-lg tracking-tight"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-600 text-white shadow-sm">
                  <AtomIcon className="h-4 w-4" weight="bold" />
                </div>
                <span>clarias.</span>
              </Link>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-md border border-separator/10 p-1.5 text-muted-foreground transition hover:bg-muted/20 hover:text-foreground"
                aria-label="Close sidebar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <SidebarNav />
          </aside>
        </>
      )}

      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center gap-3 border-separator/10 border-b bg-background/50 px-4 backdrop-blur-sm lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="rounded-md border border-separator/10 p-1.5 text-muted-foreground transition hover:bg-muted/20 hover:text-foreground"
            aria-label="Open sidebar"
          >
            <Menu className="h-4 w-4" />
          </button>
          <Link
            href="/"
            className="flex items-center gap-2 font-montreal font-semibold tracking-tight"
          >
            <div className="flex h-5 w-5 items-center justify-center rounded-md bg-blue-600 text-white shadow-sm">
              <AtomIcon className="h-3 w-3" weight="bold" />
            </div>
            <span className="text-sm">clarias.</span>
          </Link>
        </header>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
