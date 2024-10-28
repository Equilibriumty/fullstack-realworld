import {
  articles,
  favorites,
  tags,
  userFollowers,
  users,
} from "@/db/schema.js";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { getProfileSchema } from "../profiles/profiles.schema.js";
import { sql } from "drizzle-orm";

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

export const articleQueryParams = z.object({
  author: z.string().optional(),
  favorited: z.string().optional(),
  tag: z.string().optional(),
  limit: z.number().optional(),
  offset: z.number().optional(),
});

export type ArticleQueryParams = z.infer<typeof articleQueryParams>;

export type CreateArticlePayload = z.infer<typeof createArticlePayloadSchema>;
export type UpdateArticlePayload = z.input<typeof updateArticlePayloadSchema>;
export type Article = z.infer<typeof getArticleSchema>;

export const articleFields = {
  id: articles.id,
  slug: articles.slug,
  title: articles.title,
  body: articles.body,
  description: articles.description,
  tagString: sql<string>`JSON_ARRAYAGG(${tags.name})`.as("tags"),
  createdAt: articles.createdAt,
  updatedAt: articles.updatedAt,
  username: users.username,
  bio: users.bio,
  image: users.image,
  userFollowers: sql<string>`JSON_ARRAYAGG(${userFollowers.followerId})`.as(
    "userFollowers"
  ),
  favorites: sql<string>`JSON_ARRAYAGG(${favorites.userId})`.as("favorites"),
};
