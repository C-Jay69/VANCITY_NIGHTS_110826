import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Add a knowledge entry for the site chat assistant.
export const add = mutation({
  args: {
    title: v.string(),
    category: v.string(),
    content: v.string(),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("knowledge", {
      title: args.title,
      category: args.category,
      content: args.content,
      tags: args.tags,
    });
  },
});

// Remove a knowledge entry.
export const remove = mutation({
  args: { id: v.id("knowledge") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// List all knowledge entries (for the admin/curation view).
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("knowledge").collect();
  },
});

// Seed starter knowledge so the assistant has useful local info.
export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("knowledge").first();
    if (existing) return { seeded: false, reason: "Already has knowledge" };

    const entries = [
      {
        title: "Getting around Vancouver",
        category: "area",
        content:
          "Most nightlife is walkable downtown (Gastown, Granville Strip, Yaletown). Use TransLink SkyTrain (Canada Line to Richmond/River Rock, Expo Line downtown) or Uber/Lyft after 1am when buses slow down. The last SkyTrain leaves downtown around 1:15am.",
        tags: ["transit", "transport", "downtown", "skytrain"],
      },
      {
        title: "Daytime activities",
        category: "daytime",
        content:
          "Stanley Park Seawall, Granville Island Public Market, Queen Elizabeth Park, and the Sea to Sky Gondola are top daytime picks. For a pre-night-out afternoon, hit Kitsilano Beach or do a Granville Island brewery crawl before heading downtown.",
        tags: ["daytime", "activities", "parks", "beach"],
      },
      {
        title: "Best food near the Granville Strip",
        category: "restaurant",
        content:
          "Japadog for late-night hot dogs, Phnom Penh for hole-in-the-wall Cambodian (get the butter beef), and Cactus Club for a reliable sit-down. For something nicer before a club night, Ancora or Miku on the waterfront.",
        tags: ["food", "restaurant", "granville", "late-night"],
      },
      {
        title: "Gastown nightlife tips",
        category: "area",
        content:
          "Gastown is the cocktail district — The Diamond, The Blackbird Public House, and Guilt & Co. (live jazz, no cover for the first set most nights). Cobblestones + heels are a bad combo; wear flats.",
        tags: ["gastown", "cocktails", "tips"],
      },
    ];

    for (const entry of entries) {
      await ctx.db.insert("knowledge", entry);
    }

    return { seeded: true, count: entries.length };
  },
});