import { betterAuth } from "better-auth";
import { APIError } from "better-auth/api";
import { isEmailApproved, pool } from "./db.ts";

/** Error codes the profile page reads from `?error=` after a refused sign-in. */
export const SIGN_IN_ERRORS = {
  notApproved: "NOT_APPROVED",
  emailNotVerified: "EMAIL_NOT_VERIFIED",
} as const;

function refuse(code: string, message: string): never {
  throw new APIError("FORBIDDEN", { code, message });
}

/**
 * The gate for every sign-in: the provider must vouch for the email (so nobody can claim a
 * member's address), and the address must be on the approved list.
 */
async function assertMayUseSite(email: string, emailVerified: boolean) {
  if (!emailVerified) {
    refuse(SIGN_IN_ERRORS.emailNotVerified, "Your sign-in provider did not confirm this email address.");
  }
  if (!(await isEmailApproved(email))) {
    refuse(SIGN_IN_ERRORS.notApproved, "This email is not on the AIM member list.");
  }
}

function env(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim() ? value : undefined;
}

// Only offer a provider once its credentials are configured, so Google can launch first.
const googleId = env("GOOGLE_CLIENT_ID");
const googleSecret = env("GOOGLE_CLIENT_SECRET");
const microsoftId = env("MICROSOFT_CLIENT_ID");
const microsoftSecret = env("MICROSOFT_CLIENT_SECRET");

export const auth = betterAuth({
  appName: "AIM Robotics",
  baseURL: env("BETTER_AUTH_URL"),
  secret: env("BETTER_AUTH_SECRET"),
  database: pool,

  // Google and Microsoft only: no passwords, no email sign-up.
  emailAndPassword: { enabled: false },
  socialProviders: {
    ...(googleId && googleSecret
      ? { google: { clientId: googleId, clientSecret: googleSecret, prompt: "select_account" as const } }
      : {}),
    ...(microsoftId && microsoftSecret
      ? {
          microsoft: {
            clientId: microsoftId,
            clientSecret: microsoftSecret,
            // Personal Microsoft accounts and work/school accounts (e.g. @ucalgary.ca).
            tenantId: "common",
            prompt: "select_account" as const,
            disableProfilePhoto: true,
          },
        }
      : {}),
  },

  account: {
    // We never call Google/Microsoft APIs, but tokens are still stored; keep them encrypted.
    encryptOAuthTokens: true,
  },

  databaseHooks: {
    user: {
      create: {
        // First sign-in: refuse to create an account for anyone not approved.
        before: async (user) => {
          await assertMayUseSite(user.email, Boolean(user.emailVerified));
        },
      },
    },
    session: {
      create: {
        // Every later sign-in: re-check, so removing an email from the list locks them out.
        before: async (session) => {
          const result = await pool.query<{ email: string; emailVerified: boolean }>(
            'select "email", "emailVerified" from "user" where "id" = $1',
            [session.userId],
          );
          const user = result.rows[0];
          if (!user) refuse(SIGN_IN_ERRORS.notApproved, "Unknown account.");
          await assertMayUseSite(user.email, user.emailVerified);
        },
      },
    },
  },
});
