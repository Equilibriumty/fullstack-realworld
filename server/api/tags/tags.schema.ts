import type { tags } from "@/db/schema.js";

export type Tag = typeof tags.$inferSelect;
export type Tags = Tag[];
