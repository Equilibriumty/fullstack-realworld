import { db } from "@/db/index.js";
import { tags, tagsArticles } from "@/db/schema.js";
import type { Tags } from "./tags.schema.js";

export class TagsService {
  static async getAllTags() {
    const tags = await db.query.tags.findMany();
    return tags;
  }

  static async findOrCreateTags(tagList: string[], tx?: any) {
    const existingTags = await db.query.tags.findMany({
      where: (tags, { inArray }) => inArray(tags.name, tagList),
    });
    const existingTagNames = existingTags.map((row) => row.name);
    const nonExistingTags = tagList.filter(
      (t) => !existingTagNames.includes(t)
    );

    if (nonExistingTags.length === 0) return existingTags;

    const newTags = await (tx || db)
      .insert(tags)
      .values(nonExistingTags.map((t) => ({ name: t })))
      .returning();

    return [...existingTags, ...newTags];
  }

  static async linkTagsToArticle(articleId: number, tags: Tags, trx?: any) {
    const values = tags.map((tag) => ({ articleId, tagId: tag.id }));
    await (trx || db).insert(tagsArticles).values(values).returning();
  }
}
