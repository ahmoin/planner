import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const add = mutation({
	args: {
		assignment: v.string(),
		type: v.string(),
		status: v.string(),
		target: v.number(),
		received: v.number(),
		class: v.string(),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error("Not authenticated");
		return await ctx.db.insert("assignments", {
			...args,
			userId,
			createdAt: Date.now(),
		});
	},
});

export const list = query({
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) return [];
		return await ctx.db
			.query("assignments")
			.filter((q) => q.eq(q.field("userId"), userId))
			.collect();
	},
});
