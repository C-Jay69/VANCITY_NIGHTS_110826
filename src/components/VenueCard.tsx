import { Link } from "react-router-dom";
import { StarIcon, MapPinIcon, BadgeCheckIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge.tsx";
import { venueImageSrc, venueImgFallback } from "@/lib/utils.ts";
import type { Doc } from "@/convex/_generated/dataModel.d.ts";

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

type VenueCardProps = {
  venue: Doc<"venues">;
};

export default function VenueCard({ venue }: VenueCardProps) {
  const avgRating =
    venue.ratingCount > 0
      ? (venue.ratingSum / venue.ratingCount).toFixed(1)
      : null;

  const image = venueImageSrc(venue.imageUrls[0]);

  return (
    <Link
      to={`/venues/${venue.slug}`}
      className="group relative bg-card border border-border rounded-xl overflow-hidden cursor-pointer hover:-translate-y-1 transition-transform duration-200 block"
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden">
        <img
          src={image}
          alt={venue.name}
          onError={venueImgFallback}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
        {venue.isPremium && (
          <div className="absolute top-3 left-3 flex items-center gap-1 bg-primary/90 text-primary-foreground text-xs font-bold px-2 py-1 rounded-full">
            <BadgeCheckIcon className="h-3 w-3" />
            Premium
          </div>
        )}
        {venue.isFeatured && (
          <div className="absolute top-3 right-3 bg-accent/90 text-accent-foreground text-xs font-bold px-2 py-1 rounded-full">
            Featured
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-bold text-base text-foreground leading-tight line-clamp-1">
            {venue.name}
          </h3>
          <span
            className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded border ${CATEGORY_STYLE[venue.category] ?? ""}`}
          >
            {CATEGORY_LABEL[venue.category]}
          </span>
        </div>

        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
          <MapPinIcon className="h-3 w-3" />
          {venue.neighborhood}
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {venue.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {avgRating ? (
              <>
                <StarIcon className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
                <span className="text-sm font-semibold text-foreground">
                  {avgRating}
                </span>
                <span className="text-xs text-muted-foreground">
                  ({venue.ratingCount})
                </span>
              </>
            ) : (
              <span className="text-xs text-muted-foreground">No reviews yet</span>
            )}
          </div>
          {venue.submitterHandle && (
            <span className="text-xs text-muted-foreground">
              Spotted by{" "}
              <span className="text-primary">@{venue.submitterHandle}</span>
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}