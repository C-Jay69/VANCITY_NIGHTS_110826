import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    tokenIdentifier: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    username: v.optional(v.string()),
  }).index("by_token", ["tokenIdentifier"]),

  venues: defineTable({
    name: v.string(),
    slug: v.string(),
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
    // Submitter info
    submittedBy: v.optional(v.id("users")),
    submitterHandle: v.optional(v.string()),
    // Status
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
    ),
    // Premium / featured
    isPremium: v.boolean(),
    isFeatured: v.boolean(),
    // Aggregated stats (denormalized for cheap reads)
    ratingSum: v.number(),
    ratingCount: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_status_and_category", ["status", "category"])
    .index("by_status_and_neighborhood", ["status", "neighborhood"])
    .index("by_featured", ["isFeatured"])
    .index("by_slug", ["slug"]),

  reviews: defineTable({
    venueId: v.id("venues"),
    userId: v.id("users"),
    rating: v.number(), // 1-5
    text: v.string(),
    userHandle: v.string(),
  })
    .index("by_venue", ["venueId"])
    .index("by_user", ["userId"])
    .index("by_venue_and_user", ["venueId", "userId"]),

  // Pending venue images storage — images that are awaiting moderation approval
  pendingVenueImages: defineTable({
    venueId: v.id("venues"),
    storageId: v.id("_storage"),
    fileName: v.string(),
    mimeType: v.string(),
    size: v.number(),
    uploadedBy: v.id("users"),
    uploadedAt: v.number(),
    isThumbnail: v.boolean(),
    order: v.number(),
  })
    .index("by_venue", ["venueId"])
    .index("by_uploader", ["uploadedBy"])
    .index("by_uploaded_at", ["uploadedAt"]),

  // Knowledge base fed to the site chat assistant — area guides, restaurants,
  // daytime activities, etc.
  knowledge: defineTable({
    title: v.string(),
    category: v.string(), // e.g. "area", "restaurant", "daytime", "bar", "event"
    content: v.string(),
    tags: v.array(v.string()),
  }),

  // Key/value app settings, e.g. which model NightShade uses.
  settings: defineTable({
    key: v.string(),
    value: v.string(),
  }).index("by_key", ["key"]),
});