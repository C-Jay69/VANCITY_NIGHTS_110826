import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { usePaginatedQuery, useQuery } from "convex/react";
import { motion } from "motion/react";
import {
  ArrowLeftIcon,
  BadgeCheckIcon,
  Building2Icon,
  MapPinIcon,
  StarIcon,
} from "lucide-react";
import { api } from "@/convex/_generated/api.js";
import type { Doc, Id } from "@/convex/_generated/dataModel.d.ts";
import Navbar from "../../_components/Navbar.tsx";
import Footer from "../../_components/Footer.tsx";
import ReviewForm from "@/components/ReviewForm.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty.tsx";

const CATEGORY_STYLE: Record<string, string> = {
  bar: "text-primary border-primary/40 bg-primary/10",
  club: "text-accent border-accent/40 bg-accent/10",
  casino: "text-yellow-400 border-yellow-400/40 bg-yellow-400/10",
  lounge: "text-purple-400 border-purple-400/40 bg-purple-400/10",
};

const CATEGORY_LABEL: Record<string, string> = {
  bar: "Bar",
  club: "Club",
  casino: "Casino",
  lounge: "Lounge",
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <StarIcon
          key={s}
          className={`h-3.5 w-3.5 ${
            s <= Math.round(rating)
              ? "text-yellow-400 fill-yellow-400"
              : "text-muted-foreground/40"
          }`}
        />
      ))}
    </div>
  );
}

function ReviewsList({ venueId }: { venueId: Id<"venues"> }) {
  const { results, status, loadMore } = usePaginatedQuery(
    api.venues.getReviews,
    { venueId },
    { initialNumItems: 5 },
  );

  if (status === "LoadingFirstPage") {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No reviews yet. Be the first to keep YVR honest.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {results.map((review) => (
        <motion.div
          key={review._id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-xl p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-foreground">
              @{review.userHandle}
            </span>
            <StarRating rating={review.rating} />
          </div>
          <p className="text-sm text-muted-foreground">{review.text}</p>
        </motion.div>
      ))}
      {status === "CanLoadMore" && (
        <Button
          variant="secondary"
          onClick={() => loadMore(5)}
          className="w-full"
        >
          Load more reviews
        </Button>
      )}
    </div>
  );
}

function VenueLoading() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-24 pb-16 space-y-6">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-72 w-full rounded-2xl md:h-96" />
        <div className="space-y-3">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      </div>
      <Footer />
    </div>
  );
}

function VenueNotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-32 pb-16">
        <Empty className="border border-border rounded-xl">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Building2Icon />
            </EmptyMedia>
            <EmptyTitle>Venue not found</EmptyTitle>
            <EmptyDescription>
              This spot doesn&apos;t exist or hasn&apos;t been added yet
            </EmptyDescription>
          </EmptyHeader>
          <Button asChild>
            <Link to="/venues">Back to venues</Link>
          </Button>
        </Empty>
      </div>
      <Footer />
    </div>
  );
}

export default function VenueDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const venue = useQuery(api.venues.getBySlug, { slug: slug ?? "" });
  const [reviewsKey, setReviewsKey] = useState(0);

  if (venue === undefined) return <VenueLoading />;
  if (venue === null) return <VenueNotFound />;

  const avgRating =
    venue.ratingCount > 0
      ? (venue.ratingSum / venue.ratingCount).toFixed(1)
      : null;
  const heroImage = venue.imageUrls[0] ?? "";
  const gallery =
    venue.imageUrls.length > 1 ? venue.imageUrls.slice(1) : [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <Link
          to="/venues"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer mb-6"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to venues
        </Link>

        {/* Hero image */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-8"
        >
          <img
            src={heroImage}
            alt={venue.name}
            className="w-full h-72 md:h-96 object-cover rounded-2xl"
          />
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-card via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center gap-2">
            {venue.isPremium && (
              <span className="flex items-center gap-1 bg-primary/90 text-primary-foreground text-xs font-bold px-2 py-1 rounded-full">
                <BadgeCheckIcon className="h-3 w-3" />
                Premium
              </span>
            )}
            {venue.isFeatured && (
              <span className="bg-accent/90 text-accent-foreground text-xs font-bold px-2 py-1 rounded-full">
                Featured
              </span>
            )}
          </div>
        </motion.div>

        {/* Title + meta */}
        <div className="mb-8">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-2">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
              {venue.name}
            </h1>
            <span
              className={`shrink-0 text-sm font-semibold px-3 py-1 rounded-full border ${CATEGORY_STYLE[venue.category] ?? ""}`}
            >
              {CATEGORY_LABEL[venue.category] ?? venue.category}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground mb-4">
            <span className="flex items-center gap-1">
              <MapPinIcon className="h-4 w-4" />
              {venue.neighborhood}
            </span>
            <span className="flex items-center gap-1">
              <Building2Icon className="h-4 w-4" />
              {venue.address}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <StarRating rating={avgRating ? Number(avgRating) : 0} />
            {avgRating ? (
              <span className="text-sm font-semibold text-foreground">
                {avgRating}
                <span className="text-muted-foreground font-normal">
                  {" "}
                  ({venue.ratingCount} reviews)
                </span>
              </span>
            ) : (
              <span className="text-sm text-muted-foreground">
                No reviews yet
              </span>
            )}
            {venue.submitterHandle && (
              <span className="ml-auto text-xs text-muted-foreground">
                Spotted by{" "}
                <span className="text-primary">@{venue.submitterHandle}</span>
              </span>
            )}
          </div>
        </div>

        {/* Gallery from remaining photos */}
        {gallery.length > 0 && (
          <div className="grid grid-cols-2 gap-3 mb-8">
            {gallery.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`${venue.name} photo ${i + 2}`}
                className="w-full h-40 md:h-48 object-cover rounded-xl"
              />
            ))}
          </div>
        )}

        {/* Description */}
        <div className="mb-8">
          <p className="text-base text-muted-foreground leading-relaxed">
            {venue.description}
          </p>
        </div>

        {/* Why it's ace */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 mb-10">
          <p className="text-sm text-muted-foreground mb-1">
            Why it&apos;s an ace spot
          </p>
          <p className="text-foreground">{venue.whyItsAce}</p>
        </div>

        {/* Reviews */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground">Reviews</h2>
          <ReviewForm
            venueId={venue._id}
            onReviewed={() => setReviewsKey((k) => k + 1)}
          />
          <ReviewsList key={reviewsKey} venueId={venue._id} />
        </div>
      </div>

      <Footer />
    </div>
  );
}