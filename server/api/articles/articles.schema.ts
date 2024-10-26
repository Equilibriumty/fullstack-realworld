import { articles } from "@/db/schema.js";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { getProfileSchema } from "../profiles/profiles.schema.js";

export const createArticleSchema = createInsertSchema(articles);
export const getArticleBaseSchema = createSelectSchema(articles).omit({
  id: true,
  authorId: true,
});

export const getArticleSchema = getArticleBaseSchema.extend({
  author: getProfileSchema,
  favorited: z.boolean(),
  favoritesCount: z.number(),
  tagList: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
    })
  ),
  id: z.number(),
});

export const createArticlePayloadSchema = createArticleSchema
  .pick({
    title: true,
    description: true,
    body: true,
  })
  .extend({
    tagList: z.array(z.string()),
    slug: z.string().default(""),
  })
  .transform((data) => ({
    ...data,
    slug: data.title
      ? data.title.toLowerCase().replace(/\s+/g, "-")
      : data.slug,
  }));
export const updateArticlePayloadSchema = z
  .object({
    title: z.string().optional(),
    description: z.string().optional(),
    body: z.string().optional(),
    slug: z.string().default(""),
  })
  .transform((data) => ({
    ...data,
    slug: data.title
      ? data.title.toLowerCase().replace(/\s+/g, "-")
      : data.slug,
  }));

export type CreateArticlePayload = z.infer<typeof createArticlePayloadSchema>;
export type UpdateArticlePayload = z.input<typeof updateArticlePayloadSchema>;
export type Article = z.infer<typeof getArticleSchema>;
