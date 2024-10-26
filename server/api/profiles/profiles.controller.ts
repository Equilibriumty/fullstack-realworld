import { jwtMiddleware } from "@/common/jwt.js";
import { Hono } from "hono";
import { ProfilesService } from "./profiles.service.js";

export const profilesController = new Hono()
  .get("/:username", jwtMiddleware, async (c) => {
    const profile = await ProfilesService.getProfileByUsername(
      c.get("user").id,
      c.req.param("username")
    );

    return c.json(profile);
  })
  .post("/:username/follow", jwtMiddleware, async (c) => {
    const profile = await ProfilesService.followUser(
      c.get("user").id,
      c.req.param("username")
    );
    return c.json(profile);
  })
  .delete("/:username/unfollow", jwtMiddleware, async (c) => {
    const profile = await ProfilesService.unfollowUser(
      c.get("user").id,
      c.req.param("username")
    );
    return c.json(profile, 204);
  });
