import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Classes
export const getClasses = query({
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) return [];

		return await ctx.db
			.query("userClasses")
			.withIndex("by_user", (q) => q.eq("userId", userId))
			.order("desc")
			.collect();
	},
});

export const addClass = mutation({
	args: {
		name: v.string(),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error("Not authenticated");

		return await ctx.db.insert("userClasses", {
			userId,
			name: args.name,
			createdAt: Date.now(),
		});
	},
});

export const updateClass = mutation({
	args: {
		id: v.id("userClasses"),
		name: v.string(),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error("Not authenticated");

		const classItem = await ctx.db.get(args.id);
		if (!classItem || classItem.userId !== userId) {
			throw new Error("Class not found or unauthorized");
		}

		await ctx.db.patch(args.id, {
			name: args.name,
		});
	},
});

export const removeClass = mutation({
	args: {
		id: v.id("userClasses"),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error("Not authenticated");

		const classItem = await ctx.db.get(args.id);
		if (!classItem || classItem.userId !== userId) {
			throw new Error("Class not found or unauthorized");
		}

		await ctx.db.delete(args.id);
	},
});

// Types
export const getTypes = query({
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) return [];

		return await ctx.db
			.query("userTypes")
			.withIndex("by_user", (q) => q.eq("userId", userId))
			.order("desc")
			.collect();
	},
});

export const addType = mutation({
	args: {
		name: v.string(),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error("Not authenticated");

		return await ctx.db.insert("userTypes", {
			userId,
			name: args.name,
			createdAt: Date.now(),
		});
	},
});

export const updateType = mutation({
	args: {
		id: v.id("userTypes"),
		name: v.string(),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error("Not authenticated");

		const typeItem = await ctx.db.get(args.id);
		if (!typeItem || typeItem.userId !== userId) {
			throw new Error("Type not found or unauthorized");
		}

		await ctx.db.patch(args.id, {
			name: args.name,
		});
	},
});

export const removeType = mutation({
	args: {
		id: v.id("userTypes"),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error("Not authenticated");

		const typeItem = await ctx.db.get(args.id);
		if (!typeItem || typeItem.userId !== userId) {
			throw new Error("Type not found or unauthorized");
		}

		await ctx.db.delete(args.id);
	},
});
