import { HTTPException } from "hono/http-exception";
import { type CommentType, getCommentSchema } from "./comments.schema.js";

export const toComment = (comment: any): CommentType => {
	const following = comment.author.followedBy.length;
	const author = { ...comment.author, following };
	const commentData = {
		...comment,
		author,
	};

	const validated = getCommentSchema.safeParse(commentData);

	if (!validated.success) {
		throw new HTTPException(400, { message: "Invalid comment" });
	}

	return validated.data;
};
