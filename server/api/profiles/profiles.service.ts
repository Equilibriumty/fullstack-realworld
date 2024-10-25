import { db } from "@/db/index.js";
import { userFollowers, users } from "@/db/schema.js";
import { and, eq } from "drizzle-orm";
import { toProfile } from "./profile.dto.js";
import { HTTPException } from "hono/http-exception";

export class ProfilesService {
  static async getProfileByUsername(followerId: number, username: string) {
    const user = await db
      .select({
        username: users.username,
        bio: users.bio,
        image: users.image,
        following: userFollowers.followerId,
      })
      .from(users)
      .where(eq(users.username, username))
      .leftJoin(userFollowers, eq(userFollowers.followerId, followerId));

    if (!user[0]) {
      throw new HTTPException(404, { message: "User not found" });
    }

    return toProfile(user[0]);
  }

  static async followUser(followerId: number, username: string) {
    const userToFollow = await db
      .select()
      .from(users)
      .where(eq(users.username, username));

    if (!userToFollow[0]) {
      throw new HTTPException(404, { message: "User not found" });
    }

    try {
      await db
        .insert(userFollowers)
        .values([{ followerId, followedId: userToFollow[0].id }])
        .returning();
    } catch (e) {
      return toProfile({ ...userToFollow[0], following: true });
    }

    return toProfile({ ...userToFollow[0], following: true });
  }

  static async unfollowUser(followerId: number, username: string) {
    const userToUnfollow = await db
      .select()
      .from(users)
      .where(eq(users.username, username));

    if (!userToUnfollow[0]) {
      throw new HTTPException(404, { message: "User not found" });
    }

    try {
      await db
        .delete(userFollowers)
        .where(
          and(
            eq(userFollowers.followerId, followerId),
            eq(userFollowers.followedId, userToUnfollow[0].id)
          )
        )
        .execute();
    } catch (e) {
      return toProfile({ ...userToUnfollow[0], following: false });
    }
    return toProfile({ ...userToUnfollow[0], following: false });
  }
}
