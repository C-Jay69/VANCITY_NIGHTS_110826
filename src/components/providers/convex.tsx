import { useEffect, useRef } from "react";
import {
  ConvexProviderWithAuth,
  ConvexReactClient,
  useMutation,
} from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { useAuth } from "./auth.tsx";

const convexUrl = import.meta.env.VITE_CONVEX_URL ?? "http://localhost:3000";
const convex = new ConvexReactClient(convexUrl);

function useConvexAuth() {
  const { isAuthenticated, isLoading, user } = useAuth();
  return {
    isLoading,
    isAuthenticated,
    fetchAccessToken: async () => user?.id_token ?? null,
  };
}

// Once signed in, make sure a `users` row exists for the OIDC identity so
// submissions/reviews (which require a user record) work.
function SyncUser() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const updateCurrentUser = useMutation(api.users.updateCurrentUser);
  const synced = useRef(false);

  useEffect(() => {
    if (synced.current) return;
    if (isLoading) return;
    if (!isAuthenticated || !user?.id_token) return;

    synced.current = true;
    updateCurrentUser().catch((err) => {
      console.error("Failed to sync user to Convex", err);
      synced.current = false; // allow retry
    });
  }, [isLoading, isAuthenticated, user, updateCurrentUser]);

  return null;
}

export function ConvexProvider({ children }: { children: React.ReactNode }) {
  return (
    <ConvexProviderWithAuth client={convex} useAuth={useConvexAuth}>
      <SyncUser />
      {children}
    </ConvexProviderWithAuth>
  );
}