import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const schema = defineSchema({
	...authTables,
	users: defineTable({
		name: v.optional(v.string()),
		image: v.optional(v.string()),
		email: v.optional(v.string()),
		emailVerificationTime: v.optional(v.number()),
		phone: v.optional(v.string()),
		phoneVerificationTime: v.optional(v.number()),
		isAnonymous: v.optional(v.boolean()),
		// other "users" fields...
	})
		.index("email", ["email"])
		.index("phone", ["phone"]),
	assignments: defineTable({
		userId: v.id("users"),
		assignment: v.string(),
		type: v.string(),
		status: v.string(),
		target: v.number(),
		received: v.number(),
		class: v.string(),
		dueDate: v.string(),
		createdAt: v.number(),
	}),
	userClasses: defineTable({
		userId: v.id("users"),
		name: v.string(),
		createdAt: v.number(),
	}).index("by_user", ["userId"]),
	userTypes: defineTable({
		userId: v.id("users"),
		name: v.string(),
		createdAt: v.number(),
	}).index("by_user", ["userId"]),
});

export default schema;
