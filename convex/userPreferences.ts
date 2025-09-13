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

export const getSemesters = query({
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) return [];

		const user = await ctx.db.get(userId);
		if (!user) return [];

		if ("semesters" in user && Array.isArray(user.semesters)) {
			return user.semesters;
		}

		return [];
	},
});

export const addSemester = mutation({
	args: {
		name: v.string(),
		startDate: v.string(),
		endDate: v.string(),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error("Not authenticated");

		const user = await ctx.db.get(userId);
		if (!user) throw new Error("User not found");

		const existingSemesters =
			"semesters" in user && Array.isArray(user.semesters)
				? user.semesters
				: [];

		const newSemester = {
			id: crypto.randomUUID(),
			name: args.name,
			startDate: args.startDate,
			endDate: args.endDate,
			createdAt: Date.now(),
		};

		const updatedSemesters = [...existingSemesters, newSemester];

		await ctx.db.patch(userId, {
			semesters: updatedSemesters,
		});

		return newSemester;
	},
});

export const updateSemester = mutation({
	args: {
		id: v.string(),
		name: v.string(),
		startDate: v.string(),
		endDate: v.string(),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error("Not authenticated");

		const user = await ctx.db.get(userId);
		if (!user) throw new Error("User not found");

		const existingSemesters =
			"semesters" in user && Array.isArray(user.semesters)
				? user.semesters
				: [];

		const semesterIndex = existingSemesters.findIndex((s) => s.id === args.id);
		if (semesterIndex === -1) {
			throw new Error("Semester not found");
		}

		const updatedSemesters = [...existingSemesters];
		updatedSemesters[semesterIndex] = {
			...updatedSemesters[semesterIndex],
			name: args.name,
			startDate: args.startDate,
			endDate: args.endDate,
		};

		await ctx.db.patch(userId, {
			semesters: updatedSemesters,
		});
	},
});

export const removeSemester = mutation({
	args: {
		id: v.string(),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error("Not authenticated");

		const user = await ctx.db.get(userId);
		if (!user) throw new Error("User not found");

		const existingSemesters =
			"semesters" in user && Array.isArray(user.semesters)
				? user.semesters
				: [];

		const updatedSemesters = existingSemesters.filter((s) => s.id !== args.id);

		await ctx.db.patch(userId, {
			semesters: updatedSemesters,
		});
	},
});

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
