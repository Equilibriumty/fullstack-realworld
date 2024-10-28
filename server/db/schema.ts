import { relations } from "drizzle-orm";
import {
	pgTable,
	primaryKey,
	serial,
	text,
	timestamp,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
	id: serial("id").primaryKey(),
	email: text("email").notNull(),
	username: text("username").notNull(),
	password: text("password").notNull().unique(),
	image: text("image"),
	bio: text("bio"),
});

export const userRelations = relations(users, ({ many }) => ({
	articles: many(articles),
	comments: many(comments),
	favorites: many(favorites),
	followedBy: many(userFollowers, { relationName: "followedBy" }),
	following: many(userFollowers, { relationName: "following" }),
}));

export const articles = pgTable("articles", {
	id: serial("id").primaryKey(),
	slug: text("slug").notNull(),
	title: text("title").notNull(),
	description: text("description").notNull(),
	body: text("body").notNull(),
	createdAt: timestamp("createdAt").notNull().defaultNow(),
	updatedAt: timestamp("updatedAt").notNull().defaultNow(),
	authorId: serial("author_id").notNull(),
});

export const articleRelations = relations(articles, ({ one, many }) => ({
	tagsArticles: many(tagsArticles),
	author: one(users, { fields: [articles.authorId], references: [users.id] }),
	comments: many(comments),
	favorites: many(favorites),
}));

export const tags = pgTable("tags", {
	id: serial("id").primaryKey(),
	name: text("name").notNull(),
});

export const tagRelations = relations(tags, ({ many }) => ({
	tagsArticles: many(tagsArticles),
}));

export const tagsArticles = pgTable(
	"tags_articles",
	{
		articleId: serial("article_id")
			.notNull()
			.references(() => articles.id, { onDelete: "cascade" }),
		tagId: serial("tag_id")
			.notNull()
			.references(() => tags.id, { onDelete: "cascade" }),
	},
	(t) => ({
		pk: primaryKey({ columns: [t.tagId, t.articleId] }),
	}),
);

export const tagsArticlesRelations = relations(tagsArticles, ({ one }) => ({
	tag: one(tags, { fields: [tagsArticles.tagId], references: [tags.id] }),
	article: one(articles, {
		fields: [tagsArticles.articleId],
		references: [articles.id],
	}),
}));

export const comments = pgTable("comments", {
	id: serial("id").primaryKey(),
	body: text("body").notNull(),
	createdAt: timestamp("createdAt").notNull().defaultNow(),
	updatedAt: timestamp("updatedAt").notNull().defaultNow(),
	authorId: serial("author_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	articleId: serial("article_id")
		.notNull()
		.references(() => articles.id, { onDelete: "cascade" }),
});

export const commentsRelations = relations(comments, ({ one }) => ({
	author: one(users, { fields: [comments.authorId], references: [users.id] }),
	article: one(articles, {
		fields: [comments.articleId],
		references: [articles.id],
	}),
}));

export const userFollowers = pgTable(
	"user_followers",
	{
		followerId: serial("follower_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		followedId: serial("followed_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
	},
	(t) => ({
		pk: primaryKey({ columns: [t.followerId, t.followedId] }),
	}),
);

export const userFollowersRelations = relations(userFollowers, ({ one }) => ({
	follower: one(users, {
		fields: [userFollowers.followerId],
		references: [users.id],
		relationName: "following",
	}),
	followed: one(users, {
		fields: [userFollowers.followedId],
		references: [users.id],
		relationName: "followedBy",
	}),
}));

export const favorites = pgTable(
	"favorites",
	{
		userId: serial("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		articleId: serial("article_id")
			.notNull()
			.references(() => articles.id, { onDelete: "cascade" }),
	},
	(t) => ({
		pk: primaryKey({ columns: [t.userId, t.articleId] }),
	}),
);

export const favoritesRelations = relations(favorites, ({ one }) => ({
	user: one(users, {
		fields: [favorites.userId],
		references: [users.id],
		relationName: "user",
	}),
	article: one(articles, {
		fields: [favorites.articleId],
		references: [articles.id],
		relationName: "article",
	}),
}));
