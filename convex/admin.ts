import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAdminUser, requireAdmin } from "./lib/auth";

// Whether the current signed-in user is an admin.
export const isAdmin = query({
  args: {},
  handler: async (ctx) => {
    return (await getAdminUser(ctx)) !== null;
  },
});

// Aggregate stats for the admin dashboard.
export const dashboardStats = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const [pending, approved, rejected, reviews, knowledge, users] =
      await Promise.all([
        ctx.db
          .query("venues")
          .withIndex("by_status", (q) => q.eq("status", "pending"))
          .collect(),
        ctx.db
          .query("venues")
          .withIndex("by_status", (q) => q.eq("status", "approved"))
          .collect(),
        ctx.db
          .query("venues")
          .withIndex("by_status", (q) => q.eq("status", "rejected"))
          .collect(),
        ctx.db.query("reviews").collect(),
        ctx.db.query("knowledge").collect(),
        ctx.db.query("users").collect(),
      ]);

    const ratingSum = approved.reduce((s, v) => s + v.ratingSum, 0);
    const ratingCount = approved.reduce((s, v) => s + v.ratingCount, 0);

    return {
      venues: {
        pending: pending.length,
        approved: approved.length,
        rejected: rejected.length,
      },
      reviews: reviews.length,
      averageRating: ratingCount > 0 ? ratingSum / ratingCount : null,
      knowledge: knowledge.length,
      users: users.length,
      recentSubmissions: pending.slice(0, 5).map((v) => ({
        id: v._id,
        name: v.name,
        neighborhood: v.neighborhood,
        submitterHandle: v.submitterHandle,
        _creationTime: v._creationTime,
      })),
    };
  },
});

// Pending venues awaiting moderation.
export const listPendingVenues = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("venues")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .order("desc")
      .collect();
  },
});

// All venues (for maintenance views).
export const listAllVenues = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("venues").order("desc").collect();
  },
});

// Approve a pending submission, optionally reworded to match the brand.
export const approveVenue = mutation({
  args: {
    venueId: v.id("venues"),
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
    isPremium: v.boolean(),
    isFeatured: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const baseSlug = args.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 60);
    const existing = await ctx.db
      .query("venues")
      .withIndex("by_slug", (q) => q.eq("slug", baseSlug))
      .first();
    const slug = existing && existing._id !== args.venueId ? `${baseSlug}-${Date.now()}` : baseSlug;

    await ctx.db.patch(args.venueId, {
      name: args.name,
      slug,
      category: args.category,
      neighborhood: args.neighborhood,
      address: args.address,
      description: args.description,
      whyItsAce: args.whyItsAce,
      imageUrls: args.imageUrls,
      isPremium: args.isPremium,
      isFeatured: args.isFeatured,
      status: "approved",
    });
  },
});

// Reject a pending submission.
export const rejectVenue = mutation({
  args: { venueId: v.id("venues") },
  handler: async (ctx, { venueId }) => {
    await requireAdmin(ctx);
    await ctx.db.patch(venueId, { status: "rejected" });
  },
});