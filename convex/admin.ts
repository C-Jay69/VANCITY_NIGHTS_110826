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

    // Get all pending images for this venue
    const pendingImages = await ctx.db
      .query("pendingVenueImages")
      .withIndex("by_venue", (q) => q.eq("venueId", args.venueId))
      .collect();

    // Generate public URLs for the images
    const imageUrls = await Promise.all(
      pendingImages.map(async (image) => {
        const url = await ctx.storage.getUrl(image.storageId);
        if (!url) {
          throw new Error(`Failed to get URL for image: ${image.storageId}`);
        }
        return url;
      })
    );

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
      imageUrls: imageUrls,
      isPremium: args.isPremium,
      isFeatured: args.isFeatured,
      status: "approved",
    });

    // Delete pending images from storage after successful approval
    for (const image of pendingImages) {
      await ctx.storage.delete(image.storageId);
    }
    // Delete records from pendingVenueImages table
    for (const image of pendingImages) {
      await ctx.db.delete(image._id);
    }

    return { success: true, imageCount: pendingImages.length };
  },
});

// Reject a pending submission.
export const rejectVenue = mutation({
  args: {
    venueId: v.id("venues"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    // Get all pending images for this venue
    const pendingImages = await ctx.db
      .query("pendingVenueImages")
      .withIndex("by_venue", (q) => q.eq("venueId", args.venueId))
      .collect();

    // Update venue status to rejected
    await ctx.db.patch(args.venueId, {
      status: "rejected",
      // Optional: Add rejection reason field if needed
    });

    // Delete all pending images from storage
    for (const image of pendingImages) {
      await ctx.storage.delete(image.storageId);
    }
    // Delete records from pendingVenueImages table
    for (const image of pendingImages) {
      await ctx.db.delete(image._id);
    }

    return { success: true, cleanedUpCount: pendingImages.length };
  },
});

// Cleanup expired pending images (for admin/cron jobs)
export const cleanupExpiredPendingImages = mutation({
  args: {
    maxAgeDays: v.number(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const cutoffDate = Date.now() - (args.maxAgeDays * 24 * 60 * 60 * 1000);

    const expiredImages = await ctx.db
      .query("pendingVenueImages")
      .withIndex("by_uploaded_at", (q) => q.lt("uploadedAt", cutoffDate))
      .collect();

    // Delete from storage
    for (const image of expiredImages) {
      await ctx.storage.delete(image.storageId);
    }

    // Delete from database
    for (const image of expiredImages) {
      await ctx.db.delete(image._id);
    }

    return {
      cleanedUpCount: expiredImages.length,
      deletedImageIds: expiredImages.map(img => img.storageId),
    };
  },
});

// Reject a pending submission.
export const rejectVenue = mutation({
  args: {
    venueId: v.id("venues"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    // Get all pending images for this venue
    const pendingImages = await ctx.db
      .query("pendingVenueImages")
      .withIndex("by_venue", (q) => q.eq("venueId", args.venueId))
      .collect();

    // Update venue status to rejected
    await ctx.db.patch(args.venueId, {
      status: "rejected",
      // Optional: Add rejection reason field if needed
    });

    // Delete all pending images from storage
    for (const image of pendingImages) {
      await ctx.storage.delete(image.storageId);
    }
    // Delete records from pendingVenueImages table
    for (const image of pendingImages) {
      await ctx.db.delete(image._id);
    }

    return { success: true, cleanedUpCount: pendingImages.length };
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

    // Get all pending images for this venue
    const pendingImages = await ctx.db
      .query("pendingVenueImages")
      .withIndex("by_venue", (q) => q.eq("venueId", args.venueId))
      .collect();

    // Generate public URLs for the images
    const imageUrls = await Promise.all(
      pendingImages.map(async (image) => {
        const url = await ctx.storage.getUrl(image.storageId);
        if (!url) {
          throw new Error(`Failed to get URL for image: ${image.storageId}`);
        }
        return url;
      })
    );

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
      imageUrls: imageUrls,
      isPremium: args.isPremium,
      isFeatured: args.isFeatured,
      status: "approved",
    });

    // Delete pending images from storage after successful approval
    for (const image of pendingImages) {
      await ctx.storage.delete(image.storageId);
    }
    // Delete records from pendingVenueImages table
    for (const image of pendingImages) {
      await ctx.db.delete(image._id);
    }

    return { success: true, imageCount: pendingImages.length };
  },
});

// Cleanup expired pending images (for admin/cron jobs)
export const cleanupExpiredPendingImages = mutation({
  args: {
    maxAgeDays: v.number(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const cutoffDate = Date.now() - (args.maxAgeDays * 24 * 60 * 60 * 1000);

    const expiredImages = await ctx.db
      .query("pendingVenueImages")
      .withIndex("by_uploaded_at", (q) => q.lt("uploadedAt", cutoffDate))
      .collect();

    // Delete from storage
    for (const image of expiredImages) {
      await ctx.storage.delete(image.storageId);
    }

    // Delete from database
    for (const image of expiredImages) {
      await ctx.db.delete(image._id);
    }

    return {
      cleanedUpCount: expiredImages.length,
      deletedImageIds: expiredImages.map(img => img.storageId),
    };
  },
});