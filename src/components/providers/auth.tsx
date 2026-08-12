import { createContext, useContext, useMemo } from "react";

type AuthUser = {
  id: string;
  name: string;
  email: string;
};

type AuthContextValue = {
  isAuthenticated: boolean;
  user: AuthUser | null;
  isLoading: boolean;
  error: Error | null;
  signin: () => Promise<void>;
  signout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: false,
      user: null,
      isLoading: false,
      error: null,
      signin: async () => {},
      signout: async () => {},
    }),
    [],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
