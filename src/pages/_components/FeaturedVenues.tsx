import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { StarIcon, MapPinIcon, BadgeCheckIcon, TrendingUpIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { venueImgFallback } from "@/lib/utils.ts";

const FEATURED_VENUES = [
  {
    name: "The Blackbird Public House",
    category: "Bar",
    neighborhood: "Gastown",
    rating: 4.8,
    reviews: 214,
    image: "https://images.unsplash.com/photo-1640902106532-47dd3a2e833e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
    desc: "Dimly lit, expertly crafted cocktails, and zero pretension. The kind of place Gastown does best.",
    submittedBy: "PintLoverPete",
    premium: true,
    tag: "Editor's Pick",
  },
  {
    name: "Celebrities Nightclub",
    category: "Club",
    neighborhood: "Downtown",
    rating: 4.6,
    reviews: 389,
    image: "https://images.unsplash.com/photo-1545128485-c400e7702796?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
    desc: "Vancouver's legendary LGBTQ+ club. Massive dance floor, resident DJs, and an energy that never quits.",
    submittedBy: "NightOwlNadia",
    premium: true,
    tag: "Hot Right Now",
  },
  {
    name: "River Rock Casino Resort",
    category: "Casino",
    neighborhood: "Richmond",
    rating: 4.5,
    reviews: 876,
    image: "https://images.unsplash.com/photo-1521364577880-a15e92cbff6f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
    desc: "The Lower Mainland's premier casino. Table games, slots, live entertainment, and restaurants under one roof.",
    submittedBy: "RichmondRick",
    premium: true,
    tag: "Featured",
  },
  {
    name: "Granville Room",
    category: "Bar",
    neighborhood: "Granville Strip",
    rating: 4.3,
    reviews: 156,
    image: "https://images.unsplash.com/photo-1500217052183-bc01eee1a74e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
    desc: "Rain-slicked windows, local craft beer on tap, and a crowd that's just the right amount of rowdy.",
    submittedBy: "StripSurvivor",
    premium: false,
    tag: null,
  },
  {
    name: "Fortune Sound Club",
    category: "Club",
    neighborhood: "Chinatown",
    rating: 4.7,
    reviews: 302,
    image: "https://images.unsplash.com/photo-1578736641330-3155e606cd40?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
    desc: "Underground vibes, world-class sound system, and the best electronic music bookings in the city.",
    submittedBy: "BassheadBrenda",
    premium: false,
    tag: null,
  },
  {
    name: "The Roxy Nightclub",
    category: "Club",
    neighborhood: "Granville Strip",
    rating: 4.1,
    reviews: 487,
    image: "https://images.unsplash.com/photo-1517983079452-bbaa6a081a6b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
    desc: "A Granville institution. Live bands, sticky floors, and memories you may or may not remember.",
    submittedBy: "ClassicVanCity",
    premium: false,
    tag: null,
  },
];

const categoryColor: Record<string, string> = {
  Bar: "text-primary border-primary/40 bg-primary/10",
  Club: "text-accent border-accent/40 bg-accent/10",
  Casino: "text-yellow-400 border-yellow-400/40 bg-yellow-400/10",
};

export default function FeaturedVenues() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUpIcon className="h-4 w-4 text-primary" />
              <span className="text-xs uppercase tracking-widest text-primary font-semibold">
                Top Rated
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              Tonight&apos;s Best Bets
            </h2>
          </div>
          <Link to="/venues">
            <Button variant="ghost" className="hidden sm:flex text-muted-foreground hover:text-foreground gap-1">
              View all venues
            </Button>
          </Link>
        </div>

        {/* Venue grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURED_VENUES.map((venue, i) => (
            <motion.div
              key={venue.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.08, ease: "easeOut" }}
              whileHover={{ y: -4 }}
              className="group relative bg-card border border-border rounded-xl overflow-hidden cursor-pointer"
            >
              {/* Image */}
              <div className="relative h-44 overflow-hidden">
                <img
                  src={venue.image}
                  alt={venue.name}
                  onError={venueImgFallback}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />

                {/* Premium badge */}
                {venue.premium && (
                  <div className="absolute top-3 left-3 flex items-center gap-1 bg-primary/90 text-primary-foreground text-xs font-bold px-2 py-1 rounded-full">
                    <BadgeCheckIcon className="h-3 w-3" />
                    Premium
                  </div>
                )}
                {/* Tag */}
                {venue.tag && (
                  <div className="absolute top-3 right-3 bg-accent/90 text-accent-foreground text-xs font-bold px-2 py-1 rounded-full">
                    {venue.tag}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-bold text-base text-foreground leading-tight line-clamp-1">
                    {venue.name}
                  </h3>
                  <span className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded border ${categoryColor[venue.category] ?? ""}`}>
                    {venue.category}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                  <MapPinIcon className="h-3 w-3" />
                  {venue.neighborhood}
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{venue.desc}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <StarIcon className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
                    <span className="text-sm font-semibold text-foreground">{venue.rating}</span>
                    <span className="text-xs text-muted-foreground">({venue.reviews})</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Spotted by <span className="text-primary">@{venue.submittedBy}</span>
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link to="/venues">
            <Button variant="ghost" className="text-muted-foreground">
              View all venues
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}