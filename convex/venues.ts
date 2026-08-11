import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import type { Doc } from "./_generated/dataModel.d.ts";

export type VenueCategory = "bar" | "club" | "casino" | "lounge";

// List approved venues with optional category/neighborhood filters + pagination
export const list = query({
  args: {
    paginationOpts: paginationOptsValidator,
    category: v.optional(
      v.union(
        v.literal("bar"),
        v.literal("club"),
        v.literal("casino"),
        v.literal("lounge"),
      ),
    ),
    neighborhood: v.optional(v.string()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let q;
    if (args.category) {
      q = ctx.db
        .query("venues")
        .withIndex("by_status_and_category", (idx) =>
          idx.eq("status", "approved").eq("category", args.category!),
        );
    } else {
      q = ctx.db
        .query("venues")
        .withIndex("by_status", (idx) => idx.eq("status", "approved"));
    }

    const result = await q.order("desc").paginate(args.paginationOpts);

    // Client-side neighborhood and search filter (bounded page)
    const filtered = result.page.filter((v) => {
      if (args.neighborhood && v.neighborhood !== args.neighborhood) return false;
      if (
        args.search &&
        !v.name.toLowerCase().includes(args.search.toLowerCase()) &&
        !v.neighborhood.toLowerCase().includes(args.search.toLowerCase()) &&
        !v.description.toLowerCase().includes(args.search.toLowerCase())
      )
        return false;
      return true;
    });

    return { ...result, page: filtered };
  },
});

// Get a single venue by slug
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args): Promise<Doc<"venues"> | null> => {
    return await ctx.db
      .query("venues")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

// Get reviews for a venue
export const getReviews = query({
  args: {
    venueId: v.id("venues"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("reviews")
      .withIndex("by_venue", (q) => q.eq("venueId", args.venueId))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

// Seed approved venues for demo (admin only — no auth check for initial seed)
export const seedVenues = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("venues")
      .withIndex("by_status", (q) => q.eq("status", "approved"))
      .first();
    if (existing) return { seeded: false, reason: "Already has venues" };

    const venues = [
      {
        name: "The Blackbird Public House",
        slug: "the-blackbird-public-house",
        category: "bar" as const,
        neighborhood: "Gastown",
        address: "165 Water St, Vancouver, BC V6B 1A7",
        description:
          "Dimly lit, expertly crafted cocktails, and zero pretension. The kind of place Gastown does best — exposed brick, candlelit tables, and a bartender who actually knows what they're doing.",
        whyItsAce:
          "Best Old Fashioned in the city. Go on a rainy Tuesday when it's not packed.",
        imageUrls: [
          "https://images.unsplash.com/photo-1640902106532-47dd3a2e833e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
          "https://images.unsplash.com/photo-1500217052183-bc01eee1a74e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
        ],
        submitterHandle: "PintLoverPete",
        status: "approved" as const,
        isPremium: true,
        isFeatured: true,
        ratingSum: 4.8 * 214,
        ratingCount: 214,
      },
      {
        name: "Celebrities Nightclub",
        slug: "celebrities-nightclub",
        category: "club" as const,
        neighborhood: "Downtown",
        address: "1022 Davie St, Vancouver, BC V6E 1M3",
        description:
          "Vancouver's legendary LGBTQ+ club. Massive dance floor, resident DJs every weekend, and an energy that hasn't quit since 1985. The sound system alone is worth the cover.",
        whyItsAce:
          "The only club in YVR that consistently books world-class DJs and doesn't charge insane bottle service prices.",
        imageUrls: [
          "https://images.unsplash.com/photo-1545128485-c400e7702796?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
          "https://images.unsplash.com/photo-1578736641330-3155e606cd40?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
        ],
        submitterHandle: "NightOwlNadia",
        status: "approved" as const,
        isPremium: true,
        isFeatured: true,
        ratingSum: 4.6 * 389,
        ratingCount: 389,
      },
      {
        name: "River Rock Casino Resort",
        slug: "river-rock-casino-resort",
        category: "casino" as const,
        neighborhood: "Richmond",
        address: "8811 River Rd, Richmond, BC V6X 3P8",
        description:
          "The Lower Mainland's premier casino resort. Table games, slots, live entertainment, and multiple restaurants under one roof. The SkyTrain stop out front is a rare luxury in the casino world.",
        whyItsAce:
          "Skip the Vegas trip — River Rock has everything you need. Especially their live poker room on weekends.",
        imageUrls: [
          "https://images.unsplash.com/photo-1521364577880-a15e92cbff6f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
          "https://images.unsplash.com/photo-1509478861672-91e9a2f90c04?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
        ],
        submitterHandle: "RichmondRick",
        status: "approved" as const,
        isPremium: true,
        isFeatured: true,
        ratingSum: 4.5 * 876,
        ratingCount: 876,
      },
      {
        name: "Granville Room",
        slug: "granville-room",
        category: "bar" as const,
        neighborhood: "Granville Strip",
        address: "957 Granville St, Vancouver, BC V6Z 1L3",
        description:
          "Rain-slicked windows, local craft beer on tap, and a crowd that's just the right amount of rowdy. A proper Granville Strip institution that hasn't sold out to tourist traps.",
        whyItsAce:
          "Rotating local taps, no pretension, and a patio that's packed even when it's raining. Very Vancouver.",
        imageUrls: [
          "https://images.unsplash.com/photo-1621873495884-845a939892d1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
          "https://images.unsplash.com/photo-1598994671512-395d7a6147e0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
        ],
        submitterHandle: "StripSurvivor",
        status: "approved" as const,
        isPremium: false,
        isFeatured: false,
        ratingSum: 4.3 * 156,
        ratingCount: 156,
      },
      {
        name: "Fortune Sound Club",
        slug: "fortune-sound-club",
        category: "club" as const,
        neighborhood: "Chinatown",
        address: "147 E Pender St, Vancouver, BC V6A 1T6",
        description:
          "Underground vibes, world-class sound system, and the best electronic music bookings in the city. Fortune Sound is where Vancouver's music scene actually lives — not on Granville.",
        whyItsAce:
          "The Funktion-One sound system is the real deal. Catch a mid-week warehouse night for half the crowd and twice the vibe.",
        imageUrls: [
          "https://images.unsplash.com/photo-1578736641330-3155e606cd40?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
          "https://images.unsplash.com/photo-1545128485-c400e7702796?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
        ],
        submitterHandle: "BassheadBrenda",
        status: "approved" as const,
        isPremium: false,
        isFeatured: false,
        ratingSum: 4.7 * 302,
        ratingCount: 302,
      },
      {
        name: "The Roxy Nightclub",
        slug: "the-roxy-nightclub",
        category: "club" as const,
        neighborhood: "Granville Strip",
        address: "932 Granville St, Vancouver, BC V6Z 1L2",
        description:
          "A Granville institution since 1984. Live bands, sticky floors, and memories you may or may not remember the next morning. It's not trying to be fancy — and that's exactly the point.",
        whyItsAce:
          "No bottle service nonsense. Just a proper live band, cheap drinks, and strangers becoming your best friends by midnight.",
        imageUrls: [
          "https://images.unsplash.com/photo-1517983079452-bbaa6a081a6b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
          "https://images.unsplash.com/photo-1544785316-6e58aed68a50?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
        ],
        submitterHandle: "ClassicVanCity",
        status: "approved" as const,
        isPremium: false,
        isFeatured: false,
        ratingSum: 4.1 * 487,
        ratingCount: 487,
      },
      {
        name: "Guilt & Co.",
        slug: "guilt-and-co",
        category: "lounge" as const,
        neighborhood: "Gastown",
        address: "1 Alexander St, Vancouver, BC V6A 1B2",
        description:
          "A subterranean Gastown lounge that feels like a speakeasy but delivers a proper lineup of live jazz, soul, and blues seven nights a week. Low ceilings, candlelight, and some seriously good small plates.",
        whyItsAce:
          "The best live music venue in Vancouver for its size. Book a table in advance — it fills up by 9pm on weekends.",
        imageUrls: [
          "https://images.unsplash.com/photo-1690335008679-1e319b9fa3d8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
          "https://images.unsplash.com/photo-1640902106532-47dd3a2e833e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
        ],
        submitterHandle: "JazzFanJamie",
        status: "approved" as const,
        isPremium: false,
        isFeatured: false,
        ratingSum: 4.9 * 198,
        ratingCount: 198,
      },
      {
        name: "Parq Casino",
        slug: "parq-casino",
        category: "casino" as const,
        neighborhood: "Downtown",
        address: "39 Smithe St, Vancouver, BC V6B 0R3",
        description:
          "Vancouver's newest and flashiest casino sits right in the heart of downtown. Sleek design, a massive gaming floor, multiple restaurants, and a rooftop bar with views that'll make you forget how much you just lost at blackjack.",
        whyItsAce:
          "The rooftop terrace at dusk is genuinely spectacular. Come for the views, stay for the craps table.",
        imageUrls: [
          "https://images.unsplash.com/photo-1511965897574-f6fc86cf3474?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
          "https://images.unsplash.com/photo-1521364577880-a15e92cbff6f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
        ],
        submitterHandle: "HighRollerHenry",
        status: "approved" as const,
        isPremium: true,
        isFeatured: false,
        ratingSum: 4.4 * 543,
        ratingCount: 543,
      },
      {
        name: "Twelve West",
        slug: "twelve-west",
        category: "club" as const,
        neighborhood: "Downtown",
        address: "1219 Granville St, Vancouver, BC V6Z 1M6",
        description:
          "Multi-level nightclub with a rooftop patio, three distinct rooms, and a booking policy that actually cares about music. The Friday night hip-hop room is a sweaty, joyful mess in the best possible way.",
        whyItsAce:
          "Three rooms means three DJs — find your vibe. The rooftop on a rare clear Vancouver night is worth every dollar of cover.",
        imageUrls: [
          "https://images.unsplash.com/photo-1582008558029-34f157a939b5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
          "https://images.unsplash.com/photo-1578736641330-3155e606cd40?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
        ],
        submitterHandle: "RooftopRachel",
        status: "approved" as const,
        isPremium: false,
        isFeatured: false,
        ratingSum: 4.2 * 267,
        ratingCount: 267,
      },
      {
        name: "The Diamond",
        slug: "the-diamond",
        category: "bar" as const,
        neighborhood: "Gastown",
        address: "6 Powell St, Vancouver, BC V6A 1E7",
        description:
          "One of Gastown's most beloved cocktail bars, sitting above a historic cobblestone street. The Diamond is serious about its drinks without taking itself too seriously. The seasonal cocktail menu changes every few months and never disappoints.",
        whyItsAce:
          "Order whatever the bartender recommends — they genuinely know their stuff. The upstairs window seats with Gastown views are magic.",
        imageUrls: [
          "https://images.unsplash.com/photo-1636144924623-b3aea3c5f16c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
          "https://images.unsplash.com/photo-1500217052183-bc01eee1a74e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
        ],
        submitterHandle: "CocktailCarla",
        status: "approved" as const,
        isPremium: false,
        isFeatured: false,
        ratingSum: 4.8 * 321,
        ratingCount: 321,
      },
    ];

    for (const venue of venues) {
      await ctx.db.insert("venues", venue);
    }

    return { seeded: true, count: venues.length };
  },
});