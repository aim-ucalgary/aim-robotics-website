import { mockApi } from "./mockApi";
import type { ProfileApi } from "./types";

// The one place the profile page gets its backend from.
// TODO (Phase 2): replace mockApi with the real implementation once sign-in and the Neon
// database are connected. The page itself won't need to change.
export const api: ProfileApi = mockApi;
