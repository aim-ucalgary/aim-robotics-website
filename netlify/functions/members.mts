import type { Config } from "@netlify/functions";
import type { PublicMember } from "../../src/content/types.ts";
import { pool } from "../lib/db.ts";

// GET /api/members — every published profile, for the public Members section.
// Reads only the `public_members` view: display fields, no emails or account ids.

interface Row {
  id: string;
  name: string;
  role: string | null;
  subteam: string;
  program: string | null;
  bio: string | null;
  photo_id: string | null;
  linkedin_url: string | null;
  github_url: string | null;
}

export default async (request: Request) => {
  if (request.method !== "GET") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405,
      headers: { "content-type": "application/json" },
    });
  }

  try {
    const result = await pool.query<Row>(
      `select id, name, role, subteam, program, bio, photo_id, linkedin_url, github_url
         from public_members
        order by subteam, sort_order, name`,
    );
    const members: PublicMember[] = result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      role: row.role ?? "",
      subteam: row.subteam,
      program: row.program ?? "",
      bio: row.bio ?? "",
      photo: row.photo_id ?? "",
      linkedin: row.linkedin_url ?? "",
      github: row.github_url ?? "",
    }));

    return new Response(JSON.stringify({ members }), {
      headers: {
        "content-type": "application/json",
        // Browsers always re-check; Netlify's CDN serves a copy for up to a minute, so most
        // visitors never wake the database. Saved profiles show up within about a minute.
        "cache-control": "public, max-age=0, must-revalidate",
        "netlify-cdn-cache-control": "public, durable, max-age=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("Loading members failed", error);
    return new Response(JSON.stringify({ error: "load_failed" }), {
      status: 500,
      headers: { "content-type": "application/json", "cache-control": "no-store" },
    });
  }
};

export const config: Config = {
  path: "/api/members",
};
