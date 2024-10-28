import { db } from "@/db/index.js";
import {
	articles,
	favorites,
	tags,
	tagsArticles,
	userFollowers,
	users,
} from "@/db/schema.js";
import { and, eq, inArray } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { TagsService } from "../tags/tags.service.js";
import { toArticle } from "./articles.dto.js";
import type {
	ArticleQueryParams,
	CreateArticlePayload,
	UpdateArticlePayload,
} from "./articles.schema.js";

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

		if (!article) {
			throw new HTTPException(404, { message: "Article not found" });
		}

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
						trx,
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

	async getFeed(
		q: Pick<ArticleQueryParams, "offset" | "limit">,
		userId: number,
	) {
		const { limit, offset } = q;

		const feed = await db.query.articles.findMany({
			where: (articles, { eq, inArray }) =>
				inArray(
					articles.authorId,
					db
						.select({ id: userFollowers.followedId })
						.from(userFollowers)
						.where(eq(userFollowers.followerId, userId)),
				),
			with: {
				author: {
					with: {
						followedBy: {
							where: (followers, { eq }) => eq(followers.followerId, userId),
						},
					},
				},
				favorites: true,
				tagsArticles: {
					with: {
						tag: true,
					},
				},
			},
			orderBy: (articles, { desc }) => [desc(articles.createdAt)],
			limit: limit || 20,
			offset: offset || 0,
		});

		return feed.map(toArticle);
	},

	async getArticlesList(q: ArticleQueryParams, userId: number) {
		const { author, tag, limit, offset } = q;

		const articlesList = await db.query.articles.findMany({
			where: (articles, { eq, and }) => {
				const conditions = [];

				if (author) {
					conditions.push(
						eq(
							articles.authorId,
							db
								.select({ id: users.id })
								.from(users)
								.where(eq(users.username, author)),
						),
					);
				}
				if (tag) {
					conditions.push(
						inArray(
							articles.id,
							db
								.select({ articleId: tagsArticles.articleId })
								.from(tagsArticles)
								.innerJoin(tags, eq(tags.id, tagsArticles.tagId))
								.where(eq(tags.name, tag)),
						),
					);
				}

				return conditions.length ? and(...conditions) : undefined;
			},
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
				favorites: true,
				tagsArticles: {
					with: {
						tag: true,
					},
				},
			},
			orderBy: (articles, { desc }) => [desc(articles.createdAt)],
			limit: limit || 20,
			offset: offset || 0,
		});

		return articlesList.map(toArticle);
	},

	async addArticleToFavorites(userId: number, slug: string) {
		const article = await db
			.select()
			.from(articles)
			.where(eq(articles.slug, slug));

		if (!article[0])
			throw new HTTPException(404, { message: "Article not found" });

		try {
			await db
				.insert(favorites)
				.values([{ userId, articleId: article[0].id }])
				.returning();
		} catch (e) {
			return toArticle(article[0]);
		}

		return toArticle(article[0]);
	},

	async removeArticleFromFavorites(userId: number, slug: string) {
		const article = await db
			.select()
			.from(articles)
			.where(eq(articles.slug, slug));

		if (!article[0])
			throw new HTTPException(404, { message: "Article not found" });

		try {
			await db
				.delete(favorites)
				.where(
					and(
						eq(favorites.userId, userId),
						eq(favorites.articleId, article[0].id),
					),
				)
				.execute();
		} catch (e) {
			return toArticle(article[0]);
		}
		return toArticle(article[0]);
	},
};
