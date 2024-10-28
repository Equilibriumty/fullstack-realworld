import { jwtMiddleware } from "@/common/jwt.js";
import { env } from "@/config.js";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { sign } from "hono/jwt";
import {
	loginUserSchema,
	registerUserSchema,
	updateUserSchema,
} from "./users.schema.js";
import { UsersService } from "./users.service.js";

export const userController = new Hono()
	.post("/login", zValidator("json", loginUserSchema), async (c) => {
		const body = c.req.valid("json");
		const user = await UsersService.authenticateUser(body);

		const token = await sign({ userId: user.id }, env.JWT_SECRET);
		return c.json({ user: { ...user, token } });
	})
	.post("/register", zValidator("json", registerUserSchema), async (c) => {
		const body = c.req.valid("json");
		const newUser = await UsersService.createUser(body);

		const token = await sign({ userId: newUser.id }, env.JWT_SECRET);
		return c.json({ user: { ...newUser, token } });
	})
	.get("/", jwtMiddleware, (c) => {
		const user = c.get("user");
		return c.json(user);
	})
	.put("/", jwtMiddleware, zValidator("json", updateUserSchema), async (c) => {
		const user = c.get("user");
		const body = c.req.valid("json");

		const updatedUser = await UsersService.updateUser(user.id, body);
		return c.json({ user: updatedUser });
	});

export default userController;
