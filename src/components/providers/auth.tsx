import { HerculesAuthProvider } from "@usehercules/auth/react";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const authority = import.meta.env.VITE_HERCULES_OIDC_AUTHORITY as
    | string
    | undefined;
  const clientId = import.meta.env.VITE_HERCULES_OIDC_CLIENT_ID as
    | string
    | undefined;

  // No OIDC config available (e.g. local dev without Hercules env vars).
  // Render children anyway so the rest of the app works; auth degrades
  // to signed-out state.
  if (!authority || !clientId) {
    return <>{children}</>;
  }

  return (
    <HerculesAuthProvider authority={authority} client_id={clientId}>
      {children}
    </HerculesAuthProvider>
  );
}