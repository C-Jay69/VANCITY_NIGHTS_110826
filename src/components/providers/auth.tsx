import { createContext, useContext, useState } from "react";

type AuthContextValue = {
  isAuthenticated: boolean;
  user: { id: string; name: string; email: string } | null;
  isLoading: boolean;
  signin: () => void;
  signout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: any }) {
  const [isLoading, setIsLoading] = useState(true);

  // Simulate a brief load then resolve to "not authenticated"
  setTimeout(() => {
    setIsLoading(false);
  }, 100);

  const value: AuthContextValue = {
    isAuthenticated: false,
    user: null,
    isLoading,
    signin: () => {},
    signout: () => {},
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}