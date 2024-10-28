import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import { env } from "./config.js";

export default defineConfig({
	out: "./server/drizzle",
	schema: "./server/db/schema.ts",
	dialect: "postgresql",
	dbCredentials: {
		url: env.DATABASE_URL,
	},
});
