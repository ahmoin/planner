import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const add = mutation({
	args: {
		assignment: v.string(),
		type: v.string(),
		status: v.string(),
		target: v.number(),
		class: v.string(),
		dueDate: v.string(),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error("Not authenticated");

		if (args.type.trim()) {
			const existingType = await ctx.db
				.query("userTypes")
				.withIndex("by_user", (q) => q.eq("userId", userId))
				.filter((q) => q.eq(q.field("name"), args.type))
				.first();

			if (!existingType) {
				await ctx.db.insert("userTypes", {
					userId,
					name: args.type,
					createdAt: Date.now(),
				});
			}
		}

		if (args.class.trim()) {
			const existingClass = await ctx.db
				.query("userClasses")
				.withIndex("by_user", (q) => q.eq("userId", userId))
				.filter((q) => q.eq(q.field("name"), args.class))
				.first();

			if (!existingClass) {
				await ctx.db.insert("userClasses", {
					userId,
					name: args.class,
					createdAt: Date.now(),
				});
			}
		}

		return await ctx.db.insert("assignments", {
			...args,
			received: -1,
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
			dueDate: assignment.dueDate || new Date().toISOString(),
		}));
	},
});

export const update = mutation({
	args: {
		id: v.id("assignments"),
		assignment: v.optional(v.string()),
		type: v.optional(v.string()),
		status: v.optional(v.string()),
		target: v.optional(v.number()),
		received: v.optional(v.number()),
		class: v.optional(v.string()),
		dueDate: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) throw new Error("Not authenticated");

		const assignment = await ctx.db.get(args.id);
		if (!assignment || assignment.userId !== userId) {
			throw new Error("Assignment not found or unauthorized");
		}

		const { id, ...updateData } = args;
		const fieldsToUpdate = Object.fromEntries(
			Object.entries(updateData).filter(([_, value]) => value !== undefined),
		);

		await ctx.db.patch(id, fieldsToUpdate);
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
