import { mockApi } from "./mockApi";
import { realApi } from "./realApi";
import type { ProfileApi } from "./types";

// The one place the profile page gets its backend from.
// Set VITE_PROFILE_PREVIEW=true to try the page without sign-in or a database (`npm run dev:preview`).
export const api: ProfileApi = import.meta.env.VITE_PROFILE_PREVIEW === "true" ? mockApi : realApi;
