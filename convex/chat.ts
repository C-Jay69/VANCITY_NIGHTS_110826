import { v } from "convex/values";
import { action, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";

const DEFAULT_MODEL = "anthropic/claude-3.5-sonnet";

const SYSTEM_PROMPT = `You are "Nights", the friendly local guide for VanCity Nights — a Vancouver nightlife and daylife discovery site.
You help visitors find great bars, clubs, lounges, casinos, restaurants, and daytime activities in and around Vancouver.
Answer ONLY from the provided knowledge base and venue list. If the answer isn't covered, say you don't know yet and suggest
the visitor check the site's venue listings. Keep answers short, warm, and practical. Use bullet points when listing options.`;

// Pull the full knowledge base + approved venues to use as LLM context.
export const getContext = internalQuery({
  args: {},
  handler: async (ctx) => {
    const venues = await ctx.db
      .query("venues")
      .withIndex("by_status", (q) => q.eq("status", "approved"))
      .collect();
    const knowledge = await ctx.db.query("knowledge").collect();
    return { venues, knowledge };
  },
});

// Chat with the assistant. Calls OpenRouter with venue + knowledge context.
export const chat = action({
  args: { message: v.string() },
  handler: async (ctx, args): Promise<string> => {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return "The chat assistant isn't configured yet. Set OPENROUTER_API_KEY in your environment.";
    }

    const { venues, knowledge } = await ctx.runQuery(internal.chat.getContext);

    const venueBlock = venues
      .map(
        (venue) =>
          `- ${venue.name} (${venue.category}, ${venue.neighborhood}): ${venue.description} Why it's ace: ${venue.whyItsAce}`,
      )
      .join("\n");

    const knowledgeBlock = knowledge
      .map((entry) => `[${entry.category}] ${entry.title}: ${entry.content}`)
      .join("\n");

    const userPrompt = [
      "KNOWLEDGE BASE:",
      knowledgeBlock || "(empty)",
      "",
      "VENUES:",
      venueBlock || "(empty)",
      "",
      `VISITOR QUESTION:\n${args.message}`,
    ].join("\n");

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL ?? DEFAULT_MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.6,
        max_tokens: 600,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      console.error("OpenRouter error:", response.status, body);
      return `Sorry, the assistant hit an error (${response.status}). Please try again in a moment.`;
    }

    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data.choices?.[0]?.message?.content?.trim();
    return content || "Sorry, I couldn't find an answer. Try rephrasing your question.";
  },
});