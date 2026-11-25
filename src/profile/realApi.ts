// The real backend: Better Auth for Google/Microsoft sign-in, and /api/me for the member's own
// profile (both are Netlify Functions on the same domain, so the session cookie just works).

import { createAuthClient } from "better-auth/client";
import type { Profile, ProfileApi, ProfileDraft, SessionUser } from "./types";

const authClient = createAuthClient();

interface MeResponse {
  user: SessionUser;
  profile: Profile | null;
}

/** Thrown when the server rejects a save; carries per-field messages when there are any. */
export class SaveError extends Error {
  readonly fields: Partial<Record<keyof ProfileDraft, string>>;
  constructor(message: string, fields: Partial<Record<keyof ProfileDraft, string>> = {}) {
    super(message);
    this.fields = fields;
  }
}

// /api/me answers both "who am I" and "what's my profile"; share one request between them.
let me: Promise<{ status: number; body: unknown }> | null = null;

function loadMe() {
  me ??= fetch("/api/me", { credentials: "same-origin", headers: { accept: "application/json" } }).then(
    async (response) => ({ status: response.status, body: await response.json().catch(() => null) }),
  );
  return me;
}

export const realApi: ProfileApi = {
  isPreview: false,
  photoUploads: false,

  async getSession() {
    me = null;
    const { status, body } = await loadMe();
    if (status === 401) return null;
    if (status === 403) {
      const email = (body as { email?: string } | null)?.email ?? "";
      return { email, approved: false };
    }
    if (status !== 200) throw new Error(`Unexpected response ${status}`);
    return (body as MeResponse).user;
  },

  async signIn(provider) {
    const back = `${window.location.origin}/profile/`;
    const { error } = await authClient.signIn.social({
      provider,
      callbackURL: back,
      errorCallbackURL: back,
    });
    // On success the browser is redirected to Google/Microsoft and this page unloads.
    if (error) throw new Error(error.message ?? "Sign-in failed");
  },

  async signOut() {
    me = null;
    await authClient.signOut();
  },

  async getMyProfile() {
    const { status, body } = await loadMe();
    if (status !== 200) throw new Error(`Unexpected response ${status}`);
    return (body as MeResponse).profile;
  },

  async saveMyProfile(draft) {
    const response = await fetch("/api/me", {
      method: "PUT",
      credentials: "same-origin",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify(draft),
    });
    const body = (await response.json().catch(() => null)) as
      | { profile?: Profile; error?: string; fields?: SaveError["fields"] }
      | null;
    if (response.ok && body?.profile) {
      me = null;
      return body.profile;
    }
    if (response.status === 401) throw new SaveError("Your sign-in expired. Sign in again, then save.");
    if (response.status === 403) throw new SaveError("This account isn't approved to edit profiles anymore.");
    if (body?.error === "invalid_fields") {
      throw new SaveError("Fix the highlighted fields, then save again.", body.fields ?? {});
    }
    throw new SaveError("Saving failed. Check your connection and try again.");
  },

  async uploadPhoto() {
    throw new Error("Photo uploads aren't available yet.");
  },
};
