"use client";

import type { ReactNode } from "react";
import { StoreProvider } from "easy-peasy";
import { AuthProvider } from "@/lib/auth-context";
import { AlertProvider } from "@/lib/alert-context";
import { HardwareProvider } from "@/lib/hardware-context";
import { aiCacheStore } from "@/lib/ai-cache-store";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <StoreProvider store={aiCacheStore}>
      <AuthProvider>
        <AlertProvider>
          <HardwareProvider>
            {children}
          </HardwareProvider>
        </AlertProvider>
      </AuthProvider>
    </StoreProvider>
  );
}
