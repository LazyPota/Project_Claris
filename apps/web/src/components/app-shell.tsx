"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { SidebarNav } from "@/components/sidebar-nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-full min-h-screen">
      {/* Desktop sidebar — always visible on lg+ */}
      <aside className="hidden lg:flex lg:w-60 lg:flex-col lg:border-r lg:border-neutral-200 dark:lg:border-neutral-800">
        <div className="flex h-14 items-center border-b border-neutral-200 px-4 font-semibold dark:border-neutral-800">
          Project Clarias
        </div>
        <SidebarNav />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={() => setMobileOpen(false)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setMobileOpen(false);
            }}
          />
          {/* Drawer */}
          <aside className="fixed inset-y-0 left-0 z-50 flex w-60 flex-col bg-white dark:bg-neutral-950 lg:hidden">
            <div className="flex h-14 items-center justify-between border-b border-neutral-200 px-4 font-semibold dark:border-neutral-800">
              <span>Project Clarias</span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-md p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                aria-label="Close sidebar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <SidebarNav />
          </aside>
        </>
      )}

      {/* Main content area */}
      <div className="flex flex-1 flex-col">
        {/* Top bar (mobile only — contains hamburger) */}
        <header className="flex h-14 items-center gap-3 border-b border-neutral-200 px-4 lg:hidden dark:border-neutral-800">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="rounded-md p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-semibold">Project Clarias</span>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
