import { ConvexProviderWithAuth, ConvexReactClient } from "convex/react";
import { useAuth } from "./auth.tsx";

const convexUrl = import.meta.env.VITE_CONVEX_URL ?? "http://localhost:3000";
const convex = new ConvexReactClient(convexUrl);

function useConvexAuth() {
  const { isAuthenticated, isLoading } = useAuth();
  return {
    isLoading,
    isAuthenticated,
    fetchAccessToken: async () => null,
  };
}

export function ConvexProvider({ children }: { children: React.ReactNode }) {
  return (
    <ConvexProviderWithAuth client={convex} useAuth={useConvexAuth}>
      {children}
    </ConvexProviderWithAuth>
  );
}
