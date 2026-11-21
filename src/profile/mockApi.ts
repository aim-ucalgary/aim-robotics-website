// Preview-only stand-in for the real backend, so the profile page can be built and tried before
// sign-in and the database are connected. Nothing here leaves the browser: the "session" and
// the profile live in localStorage on this device only.
//
// Add ?demo=unapproved to the page URL to see what someone who isn't on the approved list sees.

import type { Profile, ProfileApi, ProfileDraft, SessionUser } from "./types";

const SESSION_KEY = "aim-profile-preview:session";
const PROFILE_KEY = "aim-profile-preview:profile";

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage blocked (private window, quota): preview still works for this page load.
  }
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

export const mockApi: ProfileApi = {
  isPreview: true,

  async getSession() {
    await wait(150);
    return read<SessionUser>(SESSION_KEY);
  },

  async signIn() {
    await wait(300);
    const approved = new URLSearchParams(window.location.search).get("demo") !== "unapproved";
    write(SESSION_KEY, { email: "preview.member@example.com", approved } satisfies SessionUser);
  },

  async signOut() {
    write(SESSION_KEY, null);
  },

  async getMyProfile() {
    await wait(150);
    return read<Profile>(PROFILE_KEY);
  },

  async saveMyProfile(draft: ProfileDraft) {
    await wait(400);
    const previous = read<Profile>(PROFILE_KEY);
    const saved: Profile = {
      ...draft,
      // Members can't publish themselves: new and edited profiles wait for an admin.
      status: previous?.status === "hidden" ? "hidden" : "pending",
      updatedAt: new Date().toISOString(),
    };
    write(PROFILE_KEY, saved);
    return saved;
  },

  async uploadPhoto(photo: Blob) {
    await wait(200);
    return blobToDataUrl(photo);
  },
};
