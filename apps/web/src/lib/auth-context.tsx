"use client";

import {
  createContext,
  useContext,
  type ReactNode,
} from "react";
import { createAuthClient } from "better-auth/react";
import { genericOAuthClient } from "better-auth/client/plugins";

const authClient = createAuthClient({
  plugins: [genericOAuthClient()],
});

type Session = typeof authClient.$Infer.Session;

interface AuthContextValue {
  user: Session["user"] | null;
  session: Session["session"] | null;
  isPending: boolean;
  signIn: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  isPending: true,
  signIn: () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data, isPending } = authClient.useSession();

  const signIn = () => {
    authClient.signIn.social({
      provider: "google",
    });
  };

  const signOut = async () => {
    await authClient.signOut();
  };

  return (
    <AuthContext value={{
      user: data?.user ?? null,
      session: data?.session ?? null,
      isPending,
      signIn,
      signOut,
    }}>
      {children}
    </AuthContext>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
