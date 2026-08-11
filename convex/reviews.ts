import { v, ConvexError } from "convex/values";
import { mutation, query } from "./_generated/server";

// Check if the current user already reviewed this venue
export const getMyReview = query({
  args: { venueId: v.id("venues") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    if (!user) return null;

    return await ctx.db
      .query("reviews")
      .withIndex("by_venue_and_user", (q) =>
        q.eq("venueId", args.venueId).eq("userId", user._id),
      )
      .first();
  },
});

// Submit or update a review
export const upsertReview = mutation({
  args: {
    venueId: v.id("venues"),
    rating: v.number(),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.rating < 1 || args.rating > 5) {
      throw new ConvexError({ code: "BAD_REQUEST", message: "Rating must be between 1 and 5" });
    }

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({ code: "UNAUTHENTICATED", message: "Sign in to leave a review" });
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    if (!user) {
      throw new ConvexError({ code: "NOT_FOUND", message: "User account not found" });
    }

    const venue = await ctx.db.get(args.venueId);
    if (!venue) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Venue not found" });
    }

    const handle = user.username ?? user.name ?? identity.email?.split("@")[0] ?? "Anonymous";

    // Check for existing review
    const existing = await ctx.db
      .query("reviews")
      .withIndex("by_venue_and_user", (q) =>
        q.eq("venueId", args.venueId).eq("userId", user._id),
      )
      .first();

    if (existing) {
      // Update: adjust the denormalized rating sum
      const ratingDiff = args.rating - existing.rating;
      await ctx.db.patch(existing._id, { rating: args.rating, text: args.text });
      await ctx.db.patch(args.venueId, {
        ratingSum: venue.ratingSum + ratingDiff,
      });
    } else {
      // Insert new review
      await ctx.db.insert("reviews", {
        venueId: args.venueId,
        userId: user._id,
        rating: args.rating,
        text: args.text,
        userHandle: handle,
      });
      await ctx.db.patch(args.venueId, {
        ratingSum: venue.ratingSum + args.rating,
        ratingCount: venue.ratingCount + 1,
      });
    }

    return { success: true };
  },
});