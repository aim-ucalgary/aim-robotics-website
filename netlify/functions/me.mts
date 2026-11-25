import type { Config } from "@netlify/functions";
import { auth } from "../lib/auth.ts";
import { isEmailApproved, pool } from "../lib/db.ts";
import type { Profile, ProfileDraft } from "../../src/profile/types.ts";
import { cleanDraft, DB_SUBTEAM_IDS, validateDraft } from "../../src/profile/validation.ts";

// GET /api/me  → who you are + your profile.   PUT /api/me → save your own profile.
// Members can only ever read or write their own row. Saving with consent publishes it straight
// away; without consent it stays off the website. A profile an admin has hidden stays hidden.

const MAX_BODY_BYTES = 20_000;

interface ProfileRow {
  name: string;
  role: string | null;
  subteam: string;
  program: string | null;
  bio: string | null;
  photo_id: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  consent: boolean;
  status: Profile["status"];
  updated_at: Date;
}

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

function toProfile(row: ProfileRow): Profile {
  return {
    name: row.name,
    role: row.role ?? "",
    subteam: row.subteam,
    program: row.program ?? "",
    bio: row.bio ?? "",
    photo: row.photo_id ?? "",
    linkedin: row.linkedin_url ?? "",
    github: row.github_url ?? "",
    consent: row.consent,
    status: row.status,
    updatedAt: row.updated_at.toISOString(),
  };
}

const orNull = (value: string) => (value === "" ? null : value);

/** Only accept writes from our own pages (defense in depth on top of SameSite cookies). */
function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return !origin || origin === new URL(request.url).origin;
}

function readDraft(body: unknown): ProfileDraft | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  const str = (key: string) => (typeof b[key] === "string" ? (b[key] as string) : "");
  return {
    name: str("name"),
    role: str("role"),
    subteam: str("subteam"),
    program: str("program"),
    bio: str("bio"),
    photo: "", // Photo uploads arrive in a later phase; never accept a photo value from the client.
    linkedin: str("linkedin"),
    github: str("github"),
    consent: b.consent === true,
  };
}

export default async (request: Request) => {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return json(401, { error: "signed_out" });

  const { user } = session;
  if (!user.emailVerified || !(await isEmailApproved(user.email))) {
    return json(403, { error: "not_approved", email: user.email });
  }

  if (request.method === "GET") {
    const result = await pool.query<ProfileRow>("select * from profiles where user_id = $1", [user.id]);
    const row = result.rows[0];
    return json(200, { user: { email: user.email, approved: true }, profile: row ? toProfile(row) : null });
  }

  if (request.method === "PUT") {
    if (!isSameOrigin(request)) return json(403, { error: "bad_origin" });
    if (!request.headers.get("content-type")?.startsWith("application/json")) {
      return json(415, { error: "json_required" });
    }
    const text = await request.text();
    if (text.length > MAX_BODY_BYTES) return json(413, { error: "too_large" });

    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      return json(400, { error: "invalid_json" });
    }
    const raw = readDraft(parsed);
    if (!raw) return json(400, { error: "invalid_body" });

    const draft = cleanDraft(raw);
    const errors = validateDraft(draft, DB_SUBTEAM_IDS);
    if (Object.keys(errors).length > 0) return json(400, { error: "invalid_fields", fields: errors });

    try {
      // No review step: consent → published, no consent → pending (not shown). Hidden stays hidden.
      const result = await pool.query<ProfileRow>(
        `insert into profiles (user_id, name, role, subteam, program, bio, linkedin_url, github_url, consent, status)
         values ($1, $2, $3, $4, $5, $6, $7, $8, $9,
                 case when $9 then 'published'::profile_status else 'pending'::profile_status end)
         on conflict (user_id) do update set
           name = excluded.name,
           role = excluded.role,
           subteam = excluded.subteam,
           program = excluded.program,
           bio = excluded.bio,
           linkedin_url = excluded.linkedin_url,
           github_url = excluded.github_url,
           consent = excluded.consent,
           status = case when profiles.status = 'hidden' then 'hidden'::profile_status
                         when excluded.consent then 'published'::profile_status
                         else 'pending'::profile_status end
         returning *`,
        [
          user.id,
          draft.name,
          orNull(draft.role),
          draft.subteam,
          orNull(draft.program),
          orNull(draft.bio),
          orNull(draft.linkedin),
          orNull(draft.github),
          draft.consent,
        ],
      );
      return json(200, { profile: toProfile(result.rows[0]) });
    } catch (error) {
      // 23514 = a database check constraint rejected the data.
      if ((error as { code?: string }).code === "23514") return json(400, { error: "invalid_fields" });
      console.error("Saving profile failed", error);
      return json(500, { error: "save_failed" });
    }
  }

  return json(405, { error: "method_not_allowed" });
};

export const config: Config = {
  path: "/api/me",
};
