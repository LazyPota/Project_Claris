"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "@/lib/auth-context";
import { AlertProvider } from "@/lib/alert-context";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <AlertProvider>
        {children}
      </AlertProvider>
    </AuthProvider>
  );
}
