import { articlesController } from "@/api/articles/articles.controller.js";
import { commentsController } from "@/api/comments/comments.controller.js";
import { profilesController } from "@/api/profiles/profiles.controller.js";
import usersController from "@/api/users/users.controller.js";
import { env } from "@/config.js";
import { serve } from "@hono/node-server";
import { Hono } from "hono";

const app = new Hono().basePath("/api/v1");

app.route("/users", usersController);
app.route("/profiles", profilesController);
app.route("/articles", articlesController);
app.route("", commentsController);

const port = Number(env.PORT) || 3000;

console.log(`Server is running on port ${port}`);

serve({
	fetch: app.fetch,
	port,
});
