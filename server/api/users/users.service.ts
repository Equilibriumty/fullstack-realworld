import { comparePassword, hashPassword } from "@/common/password.js";
import { db } from "@/db/index.js";
import { users } from "@/db/schema.js";
import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { toUser } from "./users.dto.js";
import type {
	GetUserSchema,
	LoginUserSchema,
	RegisterUserSchema,
	UpdateUserSchema,
	User,
} from "./users.schema.js";

export const UsersService = {
	async createUser(payload: RegisterUserSchema): Promise<User> {
		const hashedPassword = await hashPassword(payload.password);
		const userToCreate = { ...payload, password: hashedPassword };

		const existingUser = await db
			.select()
			.from(users)
			.where(eq(users.email, payload.email));

		if (existingUser) {
			throw new HTTPException(409, { message: "User already exists" });
		}

		const user = await db.insert(users).values(userToCreate).returning();

		return toUser(user[0]);
	},

	async authenticateUser(payload: LoginUserSchema): Promise<User> {
		const userToVerify = await db
			.select()
			.from(users)
			.where(eq(users.email, payload.email));

		if (!userToVerify) {
			throw new HTTPException(404, { message: "User does not exist" });
		}

		const isMatching = await comparePassword(
			userToVerify[0].password,
			payload.password,
		);

		if (!isMatching) {
			throw new HTTPException(403, { message: "Invalid credentials" });
		}

		return toUser(userToVerify[0]);
	},

	async getUserById(id: GetUserSchema["id"]): Promise<User> {
		const user = await db.select().from(users).where(eq(users.id, id));

		if (!user) {
			throw new HTTPException(404, { message: "User does not exist" });
		}

		return toUser(user[0]);
	},

	async updateUser(userId: User["id"], payload: UpdateUserSchema) {
		const updatedUser = await db
			.update(users)
			.set(payload)
			.where(eq(users.id, userId))
			.returning();

		return toUser(updatedUser[0]);
	},

	async getUserByUsername(username: GetUserSchema["username"]): Promise<User> {
		const user = await db
			.select()
			.from(users)
			.where(eq(users.username, username));

		if (!user) {
			throw new HTTPException(404, { message: "User does not exist" });
		}

		return toUser(user[0]);
	},
};
