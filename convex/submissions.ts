import { v, ConvexError } from "convex/values";
import { mutation } from "./_generated/server";

// Submit a new venue — goes to "pending" moderation queue
export const submitVenue = mutation({
  args: {
    name: v.string(),
    category: v.union(
      v.literal("bar"),
      v.literal("club"),
      v.literal("casino"),
      v.literal("lounge"),
    ),
    neighborhood: v.string(),
    address: v.string(),
    description: v.string(),
    whyItsAce: v.string(),
    imageUrls: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({ code: "UNAUTHENTICATED", message: "Sign in to submit a venue" });
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (!user) {
      throw new ConvexError({ code: "NOT_FOUND", message: "User account not found" });
    }

    // Generate a URL-friendly slug from the name
    const baseSlug = args.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 60);

    // Ensure slug uniqueness by appending timestamp if needed
    const existing = await ctx.db
      .query("venues")
      .withIndex("by_slug", (q) => q.eq("slug", baseSlug))
      .first();
    const slug = existing ? `${baseSlug}-${Date.now()}` : baseSlug;

    const handle = user.username ?? user.name ?? identity.email?.split("@")[0] ?? "Anonymous";

    await ctx.db.insert("venues", {
      name: args.name,
      slug,
      category: args.category,
      neighborhood: args.neighborhood,
      address: args.address,
      description: args.description,
      whyItsAce: args.whyItsAce,
      imageUrls: args.imageUrls,
      submittedBy: user._id,
      submitterHandle: handle,
      status: "pending",
      isPremium: false,
      isFeatured: false,
      ratingSum: 0,
      ratingCount: 0,
    });

    return { success: true };
  },
});

// Get the current user's own submissions
export const getMySubmissions = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({ code: "UNAUTHENTICATED", message: "Sign in to view submissions" });
    }
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    if (!user) return [];

    return await ctx.db
      .query("venues")
      .filter((q) => q.eq(q.field("submittedBy"), user._id))
      .order("desc")
      .take(50);
  },
});