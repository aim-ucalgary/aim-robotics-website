import type { Config } from "@netlify/functions";
import { auth } from "../lib/auth.ts";

// Better Auth's endpoints: sign-in redirects, OAuth callbacks, session, sign-out.
export default async (request: Request) => auth.handler(request);

export const config: Config = {
  path: "/api/auth/*",
};
