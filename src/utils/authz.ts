import type { Context } from "hono";
import type { UserRecord } from "../auth.js";

export function getCurrentUser(c: Context): UserRecord {
  const user = c.get("currentUser") as UserRecord | undefined;
  if (!user) {
    throw new Error("Missing currentUser in request context");
  }
  return user;
}

export function isSuperUser(c: Context): boolean {
  return getCurrentUser(c).is_superuser;
}
