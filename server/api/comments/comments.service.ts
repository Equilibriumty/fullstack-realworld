import { db } from "@/db/index.js";
import { articles, comments, userFollowers } from "@/db/schema.js";
import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { toComment } from "./comments.dto.js";
import type { CreateCommentPayload } from "./comments.schema.js";

export const CommentsService = {
	async createComment(
		slug: string,
		authorId: number,
		payload: CreateCommentPayload,
	) {
		const article = await db.query.articles.findFirst({
			where: eq(articles.slug, slug),
		});

		if (!article) {
			throw new HTTPException(404, { message: "Article not found" });
		}

		const body = {
			articleId: article.id,
			body: payload.body,
			authorId,
		};

		const res = await db
			.insert(comments)
			.values(body)
			.returning({ id: comments.id });

		return this.get(res[0].id, authorId);
	},

	async get(id: number, userId: number) {
		const comment = await db.query.comments.findFirst({
			where: eq(comments.id, id),
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
			},
		});

		if (!comment) {
			throw new HTTPException(404, { message: "Comment not found" });
		}
		return toComment(comment);
	},
	async deleteComment(commentId: number) {
		const deleted = await db
			.delete(comments)
			.where(eq(comments.id, commentId))
			.returning();

		return deleted;
	},

	async getCommentsByArticleSlug(slug: string, userId: number) {
		const allComments = await db.query.comments.findMany({
			where: eq(
				comments.articleId,
				db
					.select({ id: articles.id })
					.from(articles)
					.where(eq(articles.slug, slug)),
			),
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
			},
		});
		return allComments.map(toComment);
	},
};
