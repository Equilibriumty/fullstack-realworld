import { jwtMiddleware } from "@/common/jwt.js";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { createCommentPayloadSchema } from "./comments.schema.js";
import { CommentsService } from "./comments.service.js";

export const commentsController = new Hono()
	.basePath("/articles")
	.get("/:slug/comments", jwtMiddleware, async (c) => {
		const userId = c.get("user").id;
		const comments = await CommentsService.getCommentsByArticleSlug(
			c.req.param("slug"),
			userId,
		);

		return c.json(comments);
	})
	.post(
		"/:slug/comments",
		zValidator("json", createCommentPayloadSchema),
		jwtMiddleware,
		async (c) => {
			const comment = await CommentsService.createComment(
				c.req.param("slug"),
				c.get("user").id,
				c.req.valid("json"),
			);

			return c.json(comment);
		},
	)
	.delete("/:slug/comments/:id", async (c) => {
		const comment = await CommentsService.deleteComment(
			Number(c.req.param("id")),
		);

		return c.json(comment);
	});
