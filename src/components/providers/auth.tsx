import { createContext, useContext, useMemo } from "react";
import {
  HerculesAuthProvider,
  useAuth as useHerculesAuth,
} from "@usehercules/auth/react";

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
  state?: unknown;
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
    state: user?.state,
  };
}

export function useAuth() {
  const auth = useContext(AuthContext);
  if (!auth) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return auth;
}

function AuthProviderInner({ children }: { children: React.ReactNode }) {
  const herculesAuth = useHerculesAuth();

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: herculesAuth.isAuthenticated,
      user: transformUser(herculesAuth.user),
      isLoading: herculesAuth.isLoading,
      error: herculesAuth.error ?? null,
      signin: () => herculesAuth.signin(),
      signout: () => herculesAuth.signout(),
      signinRedirect: () => herculesAuth.signinRedirect(),
      removeUser: () => herculesAuth.removeUser(),
    }),
    [
      herculesAuth.isAuthenticated,
      herculesAuth.user,
      herculesAuth.isLoading,
      herculesAuth.error,
      herculesAuth.signin,
      herculesAuth.signout,
      herculesAuth.signinRedirect,
      herculesAuth.removeUser,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const authority = import.meta.env.VITE_HERCULES_OIDC_AUTHORITY;
  const clientId = import.meta.env.VITE_HERCULES_OIDC_CLIENT_ID;
  const clientSecret = import.meta.env.VITE_GOOGLE_CLIENT_SECRET;

  if (!authority || !clientId) {
    throw new Error(
      "VITE_HERCULES_OIDC_AUTHORITY and VITE_HERCULES_OIDC_CLIENT_ID must be configured",
    );
  }

  return (
    <HerculesAuthProvider
      authority={authority}
      client_id={clientId}
      userManagerSettings={{
        scope: "openid profile email",
        // Google's token endpoint requires the client secret for this client
        // type, even when PKCE is used for the authorization code flow.
        client_secret: clientSecret,
      }}
      loadingFallback={
        <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
          Loading authentication...
        </div>
      }
    >
      <AuthProviderInner>{children}</AuthProviderInner>
    </HerculesAuthProvider>
  );
}