"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type AlertType = "info" | "warning" | "error";

export interface Alert {
  id: string;
  type: AlertType;
  message: string;
}

interface AlertContextValue {
  alerts: Alert[];
  pushAlert: (type: AlertType, message: string, autoDissmissMs?: number) => string;
  dismissAlert: (id: string) => void;
}

const AlertContext = createContext<AlertContextValue>({
  alerts: [],
  pushAlert: () => "",
  dismissAlert: () => {},
});

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const counterRef = useRef(0);

  const dismissAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const pushAlert = useCallback(
    (type: AlertType, message: string, autoDismissMs = 5000) => {
      counterRef.current += 1;
      const id = `alert-${Date.now()}-${counterRef.current}`;
      const alert: Alert = { id, type, message };
      setAlerts((prev) => [...prev, alert]);

      if (autoDismissMs > 0) {
        setTimeout(() => dismissAlert(id), autoDismissMs);
      }

      return id;
    },
    [dismissAlert],
  );

  return (
    <AlertContext value={{ alerts, pushAlert, dismissAlert }}>
      {children}
    </AlertContext>
  );
}

export function useAlert() {
  return useContext(AlertContext);
}
