import { jwtMiddleware } from "@/common/jwt.js";
import { zValidator } from "@hono/zod-validator";
import {
  createArticlePayloadSchema,
  updateArticlePayloadSchema,
} from "./articles.schema.js";
import { ArticlesService } from "./articles.service.js";
import { Hono } from "hono";

export const articlesController = new Hono()
  .get("/:slug", jwtMiddleware, async (c) => {
    const article = await ArticlesService.getArticleBySlug(
      c.get("user").id,
      c.req.param("slug")
    );

    return c.json(article);
  })
  .post(
    "/",
    jwtMiddleware,
    zValidator("json", createArticlePayloadSchema),
    async (c) => {
      const payload = c.req.valid("json");
      const userId = c.get("user").id;
      const article = await ArticlesService.createArticle(userId, payload);

      return c.json({ article });
    }
  )
  .put(
    "/:slug",
    jwtMiddleware,
    zValidator("json", updateArticlePayloadSchema),
    async (c) => {
      const body = c.req.valid("json");
      const article = await ArticlesService.updateArticle(
        c.req.param("slug"),
        body
      );

      return c.json(article);
    }
  )
  .delete("/:slug", jwtMiddleware, async (c) => {
    const article = await ArticlesService.deleteArticle(c.req.param("slug"));
    return c.json(article);
  });
