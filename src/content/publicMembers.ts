import { readPreviewProfile } from "../profile/mockApi";
import type { PublicMember } from "./types";

/** Published member profiles for the public site, from /api/members. */
export async function loadPublicMembers(): Promise<PublicMember[]> {
  // `npm run dev:preview` has no backend: show the profile saved on the preview profile page.
  if (import.meta.env.VITE_PROFILE_PREVIEW === "true") {
    const profile = readPreviewProfile();
    if (!profile || profile.status !== "published") return [];
    return [{ id: "preview", ...profile }];
  }

  const response = await fetch("/api/members", { headers: { accept: "application/json" } });
  if (!response.ok) throw new Error(`Loading members failed (${response.status})`);
  const body = (await response.json()) as { members?: PublicMember[] };
  return body.members ?? [];
}
