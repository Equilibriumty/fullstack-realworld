import { users } from "@/db/schema.js";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import type { z } from "zod";

export const createUserSchema = createInsertSchema(users);
export const updateUserSchema = createUserSchema.omit({ id: true }).partial();

export const registerUserSchema = createUserSchema.pick({
	username: true,
	password: true,
	email: true,
});

export const loginUserSchema = createUserSchema.pick({
	email: true,
	password: true,
});

const getUserSchema = createSelectSchema(users);

export const userSchema = createSelectSchema(users).omit({ password: true });

export type RegisterUserSchema = z.infer<typeof registerUserSchema>;
export type LoginUserSchema = z.infer<typeof loginUserSchema>;
export type GetUserSchema = z.infer<typeof getUserSchema>;
export type User = z.infer<typeof userSchema>;
export type UpdateUserSchema = z.input<typeof updateUserSchema>;
