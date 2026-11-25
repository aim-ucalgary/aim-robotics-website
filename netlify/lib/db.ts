import pg from "pg";

// One small connection pool per function instance. DATABASE_URL must be the *pooled* Neon
// connection string for the limited `aim_app` role (never the owner role).
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set. Add it in Netlify (or your local .env).");
}

export const pool = new pg.Pool({ connectionString, max: 3 });

/** True when this email is on the approved list (case-insensitive). */
export async function isEmailApproved(email: string): Promise<boolean> {
  const result = await pool.query("select 1 from approved_emails where email = $1::citext", [email]);
  return (result.rowCount ?? 0) > 0;
}
