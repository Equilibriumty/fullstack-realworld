import { z } from "zod";

export const getProfileSchema = z.object({
  username: z.string(),
  bio: z.string().nullable(),
  image: z.string().nullable(),
  following: z.coerce.boolean(),
});

export type Profile = z.infer<typeof getProfileSchema>;
