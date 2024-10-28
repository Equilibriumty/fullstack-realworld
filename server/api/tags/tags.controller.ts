import { Hono } from "hono";
import { TagsService } from "./tags.service.js";

export const tagsController = new Hono().get("/tags", async (c) => {
	const tags = await TagsService.getAllTags();
	return c.json(tags);
});
