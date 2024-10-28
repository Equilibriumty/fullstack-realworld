import { HTTPException } from "hono/http-exception";
import { type Article, getArticleSchema } from "./articles.schema.js";

export const toArticle = (article: any): Article => {
	const following = article.author.followedBy.length;

	const tagList =
		article.tagList ??
		article.tagsArticles.map(({ tag }) => ({
			id: tag.id,
			name: tag.name,
		}));

	const favorited = article.favorites.length > 0;

	const favoritesCount = article.favorites.length;

	const author = { ...article.author, following };

	const articleData = {
		...article,
		favorited,
		favoritesCount,
		tagList,
		author,
	};

	const validated = getArticleSchema.safeParse(articleData);

	if (!validated.success) {
		throw new HTTPException(400, { message: "Invalid article" });
	}

	return validated.data;
};
