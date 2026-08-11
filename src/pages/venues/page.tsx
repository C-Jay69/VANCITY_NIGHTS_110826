import { useState, useEffect } from "react";
import { useMutation, usePaginatedQuery } from "convex/react";
import { useSearchParams } from "react-router-dom";
import { motion } from "motion/react";
import {
  SearchIcon,
  SlidersHorizontalIcon,
  GlassWaterIcon,
  MusicIcon,
  SpadeIcon,
  UtensilsIcon,
} from "lucide-react";
import { api } from "@/convex/_generated/api.js";
import { Button } from "@/components/ui/button.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty.tsx";
import VenueCard from "@/components/VenueCard.tsx";
import Navbar from "../_components/Navbar.tsx";
import Footer from "../_components/Footer.tsx";
import { useDebounce } from "@/hooks/use-debounce.ts";

type CategoryFilter = "bar" | "club" | "casino" | "lounge" | null;

const CATEGORIES = [
  { value: null, label: "All", icon: SlidersHorizontalIcon },
  { value: "bar" as const, label: "Bars", icon: GlassWaterIcon },
  { value: "club" as const, label: "Clubs", icon: MusicIcon },
  { value: "casino" as const, label: "Casinos", icon: SpadeIcon },
  { value: "lounge" as const, label: "Lounges", icon: UtensilsIcon },
];

const NEIGHBORHOODS = [
  "All",
  "Gastown",
  "Downtown",
  "Granville Strip",
  "Chinatown",
  "Richmond",
  "Burnaby",
  "North Vancouver",
  "New Westminster",
];

export default function VenuesPage() {
  const [searchParams] = useSearchParams();
  const initCategory = (searchParams.get("category") as CategoryFilter) ?? null;
  const initSearch = searchParams.get("search") ?? "";

  const [category, setCategory] = useState<CategoryFilter>(initCategory);
  const [neighborhood, setNeighborhood] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState(initSearch);
  const [debouncedSearch] = useDebounce(searchInput, 300);

  // Seed demo data once on mount
  const seedVenues = useMutation(api.venues.seedVenues);
  useEffect(() => {
    seedVenues().catch(() => {
      // Ignore seed errors (already seeded)
    });
  }, [seedVenues]);

  const { results, status, loadMore } = usePaginatedQuery(
    api.venues.list,
    {
      category: category ?? undefined,
      neighborhood: neighborhood ?? undefined,
      search: debouncedSearch || undefined,
    },
    { initialNumItems: 9 },
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Page header */}
      <div className="pt-24 pb-10 border-b border-border bg-card/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-3xl sm:text-4xl font-bold text-foreground mb-1"
          >
            Explore{" "}
            <span className="text-primary">YVR Nightlife</span>
          </motion.h1>
          <p className="text-muted-foreground text-sm">
            {results.length} venues across Vancouver&apos;s Lower Mainland
          </p>

          {/* Search */}
          <div className="mt-6 relative max-w-lg">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, neighbourhood, vibe..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-md bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters row */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {/* Category pills */}
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.label}
                onClick={() => setCategory(cat.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors cursor-pointer ${
                  category === cat.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
                }`}
              >
                <cat.icon className="h-3.5 w-3.5" />
                {cat.label}
              </button>
            ))}
          </div>

          {/* Neighborhood select */}
          <div className="sm:ml-auto">
            <select
              value={neighborhood ?? "All"}
              onChange={(e) =>
                setNeighborhood(
                  e.target.value === "All" ? null : e.target.value,
                )
              }
              className="px-3 py-1.5 rounded-md bg-card border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
            >
              {NEIGHBORHOODS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Venue grid */}
        {status === "LoadingFirstPage" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-72 w-full rounded-xl" />
            ))}
          </div>
        ) : results.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <SearchIcon />
              </EmptyMedia>
              <EmptyTitle>No venues found</EmptyTitle>
              <EmptyDescription>
                Try adjusting your filters or search term
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {results.map((venue, i) => (
                <motion.div
                  key={venue._id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                >
                  <VenueCard venue={venue} />
                </motion.div>
              ))}
            </div>

            {status === "CanLoadMore" && (
              <div className="mt-10 text-center">
                <Button
                  variant="secondary"
                  onClick={() => loadMore(9)}
                  className="px-8"
                >
                  Load more venues
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}