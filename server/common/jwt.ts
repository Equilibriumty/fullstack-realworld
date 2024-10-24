import type { User } from "@/api/users/users.schema.js";
import { UsersService } from "@/api/users/users.service.js";
import { createMiddleware } from "hono/factory";
import { verify } from "hono/jwt";
import "dotenv/config";
import { HTTPException } from "hono/http-exception";

const JWT_SECRET = process.env["JWT_SECRET"]!;

type Env = {
  Variables: {
    user: User;
  };
};

export const jwtMiddleware = createMiddleware<Env>(async (c, next) => {
  const authHeader = c.req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new HTTPException(401, { message: "Unauthorized" });
  }
  const token = authHeader.split(" ")[1];

  try {
    const decodedToken = await verify(token, JWT_SECRET);

    const user = await UsersService.getUserById(Number(decodedToken["userId"]));

    if (!user) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }

    c.set("user", user);
    await next();
  } catch (err) {
    throw new HTTPException(401, { message: "Invalid or expired token" });
  }
});
