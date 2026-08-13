"""
Pending venue image storage system for VANCITY NIGHTS PLATFORM

This module implements a comprehensive image upload and moderation system
for venue submissions. Images are stored in Convex Storage and tracked
in a pending moderation queue until approved or rejected.
"""

import { defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Pending venue images storage
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
});
