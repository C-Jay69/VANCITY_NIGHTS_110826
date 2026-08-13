import { createContext, useContext, useMemo } from "react";
import { HerculesAuthProvider, useAuth as useHerculesAuth } from "@usehercules/auth";

type AuthUser = {
  id: string;
  name: string;
  email: string;
  sub?: string;
  id_token?: string;
  access_token?: string;
  expires_at?: number;
  token_type?: string;
  scope?: string;
  refresh_token?: string;
};

type AuthContextValue = {
  isAuthenticated: boolean;
  user: AuthUser | null;
  isLoading: boolean;
  error: Error | null;
  signin: () => Promise<void>;
  signout: () => Promise<void>;
  signinRedirect: () => Promise<void>;
  removeUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function transformUser(user: any | null): AuthUser | null {
  if (!user) return null;
  return {
    id: user?.profile?.sub || user?.profile?.id || "",
    name: user?.profile?.name || user?.profile?.given_name || "",
    email: user?.profile?.email || "",
    sub: user?.profile?.sub,
    id_token: user?.id_token,
    access_token: user?.access_token,
    expires_at: user?.expires_at,
    token_type: user?.token_type,
    scope: user?.scope,
    refresh_token: user?.refresh_token,
  };
}

export function useAuth() {
  const herculesAuth = useHerculesAuth();

  const auth = useContext(AuthContext);
  if (!auth) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return {
    ...auth,
    isAuthenticated: !!herculesAuth.user,
    user: transformUser(herculesAuth.user),
    isLoading: herculesAuth.isLoading,
    error: herculesAuth.error,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: false,
      user: null,
      isLoading: false,
      error: null,
      signin: async () => {
        throw new Error("Please use signinRedirect for OIDC auth");
      },
      signout: async () => {
        throw new Error("Please use signinRedirect for OIDC auth");
      },
      signinRedirect: async () => {
        const authority = process.env.HERCULES_OIDC_AUTHORITY;
        const client_id = process.env.HERCULES_OIDC_CLIENT_ID;
        
        if (!authority || !client_id) {
          throw new Error("HERCULES_OIDC_AUTHORITY and HERCULES_OIDC_CLIENT_ID must be configured");
        }
        
        try {
          const googleAuthority = process.env.GOOGLE_OAUTH_AUTHORITY || "https://accounts.google.com";
          const googleClientId = process.env.GOOGLE_CLIENT_ID;
          
          if (googleClientId) {
            window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${window.location.origin}/auth/callback&response_type=code&scope=openid profile email&access_type=offline`;
          } else {
            window.location.href = `${authority}/login?client_id=${client_id}&response_type=code&redirect_uri=${window.location.origin}/auth/callback&scope=openid profile email`;
          }
        } catch (err) {
          throw new Error("Failed to initiate OIDC sign-in");
        }
      },
      removeUser: async () => {
        throw new Error("Please use signinRedirect for OIDC auth");
      },
    }),
    [],
  );

  return (
    <AuthContext.Provider value={value}>
      <HerculesAuthProvider
        authority={process.env.HERCULES_OIDC_AUTHORITY!}
        client_id={process.env.HERCULES_OIDC_CLIENT_ID!}
        loadingFallback={<div>Loading authentication...</div>}
      >
        {children}
      </HerculesAuthProvider>
    </AuthContext.Provider>
  );
}