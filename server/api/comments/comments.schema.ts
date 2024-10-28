import { comments } from "@/db/schema.js";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { getProfileSchema } from "../profiles/profiles.schema.js";

export const createCommentSchema = createInsertSchema(comments);
export const getCommentBaseSchema = createSelectSchema(comments).omit({
  id: true,
  authorId: true,
  articleId: true,
});

export const createCommentPayloadSchema = createCommentSchema.pick({
  body: true,
});

export const getCommentSchema = getCommentBaseSchema.extend({
  author: getProfileSchema,
  id: z.number(),
});

export type CommentType = z.output<typeof getCommentSchema>;
export type CreateCommentPayload = z.infer<typeof createCommentPayloadSchema>;
