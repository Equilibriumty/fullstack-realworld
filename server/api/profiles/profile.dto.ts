import { HTTPException } from "hono/http-exception";
import { getProfileSchema, type Profile } from "./profiles.schema.js";

export const toProfile = (user: unknown): Profile => {
  const validated = getProfileSchema.safeParse(user);

  if (!validated.success) {
    throw new HTTPException(400, { message: "Invalid profile" });
  }

  return validated.data;
};
