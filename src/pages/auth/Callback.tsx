import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Spinner } from "@/components/ui/spinner.tsx";
import { useAuth } from "@/components/providers/auth.tsx";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    // Wait for react-oidc-context to finish processing the redirect.
    if (isLoading) return;

    const state = user?.state as
      | { returnTo?: string }
      | null
      | undefined;
    const returnTo = state?.returnTo;

    let destination = "/";
    if (isAuthenticated && returnTo && returnTo !== window.location.pathname) {
      destination = returnTo;
    }

    navigate(destination, { replace: true });
  }, [navigate, isAuthenticated, isLoading, user]);

  return (
    <div className="flex flex-col items-center justify-center h-svh gap-4">
      <Spinner className="size-8" />
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  );
}