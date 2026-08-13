# Pending Venue Image Storage

This system implements a comprehensive file storage solution for venue images that are pending moderation approval.

## Overview

Venue images uploaded through the submission system are stored in a dedicated "pending" storage bucket until the venue is approved. Once approved, images are moved to the main venues storage bucket.

## Core Components

### 1. File Storage Configuration

The pending venue image storage is configured as a public, authenticated storage bucket that:

- Accepts image uploads from authenticated users
- Stores files securely during moderation
- Provides signed URLs for temporary access
- Supports cleanup of expired pending files

### 2. Database Schema

```typescript
// In schema.ts
export default defineSchema({
  // ... existing tables ...

  // Pending venue images storage
  pendingVenueImages: defineTable({
    venueId: v.id("venues"),  // Links to the pending venue submission
    storageId: v.id("_storage"),  // Convex storage identifier
    fileName: v.string(),  // Original filename
    mimeType: v.string(),  // Image MIME type (image/jpeg, image/png, etc.)
    size: v.number(),  // File size in bytes
    uploadedBy: v.id("users"),  // User who uploaded
    uploadedAt: v.number(),  // Timestamp (Unix epoch)
    isThumbnail: v.boolean(),  // Whether this is a thumbnail version
    order: v.number(),  // Display order for multiple images
  })
    .index("by_venue", ["venueId"])
    .index("by_uploader", ["uploadedBy"])
    .index("by_uploaded_at", ["uploadedAt"]),
});
```

### 3. Convex Storage Setup

```typescript
// In convex/storage.ts
import { defineStorage, defineTable } from "convex/server";
import { v } from "convex/values";

export const pendingVenueStorage = defineStorage({
  table: "pendingVenueImages",
  separator: "/",
  maxSizeInBytes: 10 * 1024 * 1024,  // 10MB per file
});
```

### 4. Core Functions

#### Upload Pending Image

```typescript
// In convex/submissions.ts
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
```

#### Get Pending Images for a Venue

```typescript
// In convex/submissions.ts
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
```

#### Approve Venue and Move Images

```typescript
// In convex/admin.ts
export const approveVenue = mutation({
  args: {
    venueId: v.id("venues"),
    name: v.string(),
    category: v.union(...),
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

    // Update the venue to approved status with image URLs
    await ctx.db.patch(args.venueId, {
      name: args.name,
      slug: generateSlug(args.name), // Helper function
      category: args.category,
      neighborhood: args.neighborhood,
      address: args.address,
      description: args.description,
      whyItsAce: args.whyItsAce,
      imageUrls: imageUrls,
      submittedBy: undefined, // Clear submitter
      submitterHandle: undefined, // Clear submitter
      status: "approved",
      isPremium: args.isPremium,
      isFeatured: args.isFeatured,
      ratingSum: 0,
      ratingCount: 0,
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
```

#### Reject Venue and Cleanup Images

```typescript
// In convex/admin.ts
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
```

### 5. Client-side Upload Functions

```typescript
// In src/components/ReviewForm.tsx or new SubmissionForm component

// Upload image to Convex storage
async function uploadImageToStorage(file: File): Promise<{ storageId: string; url: string }> {
  const uploadUrl = await api.storage.generateUploadUrl();

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(uploadUrl, {
    method: "POST",
    body: formData,
    headers: {
      "x-storage-id": "pending-venue-images", // Optional storage identifier
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to upload image");
  }

  const result = await response.json();
  return {
    storageId: result.storageId,
    url: result.url,
  };
}

// Handle image upload during venue submission
async function handleImageUpload(file: File, venueId: string, isThumbnail: boolean = false, order: number = 0) {
  try {
    // Upload to Convex storage
    const { storageId, url } = await uploadImageToStorage(file);

    // Save image metadata to pendingVenueImages table
    await api.submissions.uploadPendingImage({
      venueId,
      storageId,
      fileName: file.name,
      mimeType: file.type,
      size: file.size,
      isThumbnail,
      order,
    });

    return { storageId, url };
  } catch (error) {
    console.error("Image upload failed:", error);
    throw error;
  }
}
```

### 6. Frontend Integration

#### Submission Form

```typescript
// In src/pages/submit/page.tsx
const [images, setImages] = useState<File[]>([]);
const [pendingImages, setPendingImages] = useState<any[]>([]);

const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const files = Array.from(event.target.files || []);
  if (files.length === 0) return;

  // Validate file types
  const validFiles = files.filter(file => 
    file.type.startsWith("image/") && file.size <= 10 * 1024 * 1024 // 10MB
  );

  setUploading(true);
  try {
    const uploadedImages = await Promise.all(
      validFiles.map(async (file, index) => {
        return await handleImageUpload(file, venueId, index === 0, index);
      })
    );
    setPendingImages(prev => [...prev, ...uploadedImages]);
    setImages(prev => [...prev, ...validFiles]);
  } catch (error) {
    toast.error("Failed to upload images");
  } finally {
    setUploading(false);
  }
};
```

### 7. Cleanup Mechanisms

#### Admin Cleanup Script

```typescript
// In convex/admin.ts
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
```

## Benefits

1. **Secure Storage**: Images are isolated in a pending storage bucket until approved
2. **Automatic Cleanup**: Rejected or expired images are automatically deleted
3. **Atomic Operations**: Image uploads and venue approval happen in transactions
4. **Flexible Storage**: Support for thumbnails and multiple image ordering
5. **Admin Control**: Full control over image management during moderation
6. **Scalable**: Handles high-volume submissions efficiently

## Migration Notes

When implementing this system:

1. Add the `pendingVenueImages` table to your schema
2. Update the venue submission workflow to save images to pending storage
3. Modify the admin approval/rejection logic to handle pending images
4. Add image management UI components for moderators
5. Implement cleanup mechanisms to prevent storage buildup

This system provides a robust solution for managing user-uploaded images during the moderation process, ensuring that only approved content appears on the public site.