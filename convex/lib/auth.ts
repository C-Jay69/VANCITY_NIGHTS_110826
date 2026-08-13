import type { QueryCtx, MutationCtx } from "../_generated/server";

function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export async function getAdminUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  const email = (identity.email ?? "").toLowerCase();
  if (!email) return null;
  return adminEmails().includes(email) ? identity : null;
}

export async function requireAdmin(ctx: QueryCtx | MutationCtx) {
  const admin = await getAdminUser(ctx);
  if (!admin) {
    throw new Error("This action requires admin access.");
  }
  return admin;
}