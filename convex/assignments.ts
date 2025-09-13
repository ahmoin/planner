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
		const assignments = await ctx.db
			.query("assignments")
			.filter((q) => q.eq(q.field("userId"), userId))
			.collect();

		return assignments.map((assignment) => ({
			id: assignment._id,
			assignment: assignment.assignment,
			type: assignment.type,
			status: assignment.status,
			target: assignment.target,
			received: assignment.received,
			class: assignment.class,
		}));
	},
});

export const remove = mutation({
	args: {
		id: v.id("assignments"),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error("Not authenticated");

		const assignment = await ctx.db.get(args.id);
		if (!assignment || assignment.userId !== userId) {
			throw new Error("Assignment not found or unauthorized");
		}

		await ctx.db.delete(args.id);
	},
});
