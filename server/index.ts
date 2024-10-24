import { serve } from "@hono/node-server";
import { Hono } from "hono";
import usersController from "./api/users/users.controller.js";

const app = new Hono().basePath("/api/v1");

app.route("/users", usersController);
const port = Number(process.env["PORT"]) || 3000;

console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
