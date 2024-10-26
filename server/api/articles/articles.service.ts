import { db } from "@/db/index.js";
import { articles, favorites, userFollowers } from "@/db/schema.js";
import { eq } from "drizzle-orm";
import type {
  CreateArticlePayload,
  UpdateArticlePayload,
} from "./articles.schema.js";
import { toArticle } from "./articles.dto.js";
import { TagsService } from "../tags/tags.service.js";
import { HTTPException } from "hono/http-exception";
import { auth } from "hono/utils/basic-auth";

export const ArticlesService = {
  async getArticleBySlug(userId: number, slug: string) {
    const article = await db.query.articles.findFirst({
      where: eq(articles.slug, slug),
      with: {
        author: {
          columns: {
            password: false,
          },
          with: {
            followedBy: {
              where: eq(userFollowers.followerId, userId),
            },
          },
        },
        tagsArticles: {
          with: {
            tag: true,
          },
        },
        favorites: {
          where: eq(favorites.userId, userId),
        },
      },
    });

    return toArticle(article);
  },

  async createArticle(userId: number, payload: CreateArticlePayload) {
    const { tagList, ...articlePayload } = payload;
    const values = {
      ...articlePayload,
      authorId: userId,
      slug: articlePayload.title.toLowerCase().replace(/\s+/g, "-"),
    };

    const res = await db.insert(articles).values(values).returning();
    try {
      await db.transaction(async (trx) => {
        if (payload.tagList && payload.tagList.length > 0) {
          const tagList = await TagsService.findOrCreateTags(
            payload.tagList,
            trx
          );
          await TagsService.linkTagsToArticle(res[0].id, tagList, trx);
        }
        return await this.getArticleBySlug(userId, values.slug);
      });
    } catch (e) {
      throw new HTTPException(400, { message: "Invalid article" });
    }
  },

  async updateArticle(slug: string, payload: UpdateArticlePayload) {
    return db
      .update(articles)
      .set(payload)
      .where(eq(articles.slug, slug))
      .returning();
  },

  async deleteArticle(slug: string) {
    const article = await db
      .select()
      .from(articles)
      .where(eq(articles.slug, slug));

    if (!article[0])
      throw new HTTPException(404, { message: "Article not found" });

    return db.delete(articles).where(eq(articles.slug, slug)).returning();
  },
};
