import { BrowserRouter, Route, Routes } from "react-router-dom";
import { DefaultProviders } from "./components/providers/default.tsx";
import AuthCallback from "./pages/auth/Callback.tsx";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import VenuesPage from "./pages/venues/page.tsx";
import VenueDetailPage from "./pages/venues/[slug]/page.tsx";
import SubmitPage from "./pages/submit/page.tsx";

export default function App() {
  return (
    // VanCityNights is always dark — remove theme provider switching
    <div className="dark">
      <DefaultProviders>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/venues" element={<VenuesPage />} />
            <Route path="/venues/:slug" element={<VenueDetailPage />} />
            <Route path="/submit" element={<SubmitPage />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </DefaultProviders>
    </div>
  );
}