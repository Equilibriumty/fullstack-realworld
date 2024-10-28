import type { GetUserSchema, User } from "./users.schema.js";

export const toUser = (user: GetUserSchema): User => {
	return {
		id: user.id,
		username: user.username,
		email: user.email,
		image: user.image,
		bio: user.bio,
	};
};
