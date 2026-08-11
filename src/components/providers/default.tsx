import { QueryClientProvider } from "./query-client.tsx";
import { ThemeProvider } from "./theme.tsx";
import { TooltipProvider } from "../ui/tooltip.tsx";
import { Toaster } from "../ui/sonner.tsx";

export function DefaultProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          {children}
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}