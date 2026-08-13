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

// Upload an image to storage for a pending venue submission
export const uploadPendingImage = mutation({
  args: {
    venueId: v.id("venues"),
    storageId: v.id("_storage"),
    fileName: v.string(),
    mimeType: v.string(),
    size: v.number(),
    isThumbnail: v.optional(v.boolean()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({ code: "UNAUTHENTICATED", message: "Sign in to upload images" });
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
    if (!user) {
      throw new ConvexError({ code: "NOT_FOUND", message: "User account not found" });
    }

    // Verify the venue is in pending status and belongs to the user
    const venue = await ctx.db.get(args.venueId);
    if (!venue) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Venue not found" });
    }
    if (venue.status !== "pending") {
      throw new ConvexError({ code: "BAD_REQUEST", message: "Can only upload images to pending venues" });
    }
    if (venue.submittedBy !== user._id) {
      throw new ConvexError({ code: "FORBIDDEN", message: "Can only upload images to your own submissions" });
    }

    // Store the image record
    await ctx.db.insert("pendingVenueImages", {
      venueId: args.venueId,
      storageId: args.storageId,
      fileName: args.fileName,
      mimeType: args.mimeType,
      size: args.size,
      uploadedBy: user._id,
      uploadedAt: Date.now(),
      isThumbnail: args.isThumbnail ?? false,
      order: args.order ?? 0,
    });

    return { success: true };
  },
});

// Get pending images for a venue submission
export const getPendingImages = query({
  args: { venueId: v.id("venues") },
  handler: async (ctx, args) => {
    // Verify venue is pending
    const venue = await ctx.db.get(args.venueId);
    if (!venue) return null;
    if (venue.status !== "pending") return null;

    const images = await ctx.db
      .query("pendingVenueImages")
      .withIndex("by_venue", (q) => q.eq("venueId", args.venueId))
      .order("asc")
      .collect();

    // Get signed URLs for each image
    const imagesWithUrls = await Promise.all(
      images.map(async (image) => {
        const url = await ctx.storage.getUrl(image.storageId);
        return {
          ...image,
          url,
        };
      })
    );

    return imagesWithUrls;
  },
});