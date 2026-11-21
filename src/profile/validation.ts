import type { ProfileDraft } from "./types";

// These limits match the check constraints on the `profiles` table in Neon, so anything the form
// accepts, the database accepts too. Keep both in sync if either changes.
export const LIMITS = {
  name: 80,
  role: 80,
  program: 120,
  bio: 500,
} as const;

const LINKEDIN_PATTERN = /^https:\/\/(www\.)?linkedin\.com\//;
const GITHUB_PATTERN = /^https:\/\/github\.com\//;

export type FieldErrors = Partial<Record<keyof ProfileDraft, string>>;

export function validateDraft(draft: ProfileDraft, subteamIds: string[]): FieldErrors {
  const errors: FieldErrors = {};
  const name = draft.name.trim();

  if (!name) errors.name = "Enter your name.";
  else if (name.length > LIMITS.name) errors.name = `Keep it under ${LIMITS.name} characters.`;

  if (draft.role.trim().length > LIMITS.role) errors.role = `Keep it under ${LIMITS.role} characters.`;
  if (draft.program.trim().length > LIMITS.program) {
    errors.program = `Keep it under ${LIMITS.program} characters.`;
  }
  if (draft.bio.trim().length > LIMITS.bio) errors.bio = `Keep it under ${LIMITS.bio} characters.`;

  if (!subteamIds.includes(draft.subteam)) errors.subteam = "Choose your subteam.";

  const linkedin = draft.linkedin.trim();
  if (linkedin && !LINKEDIN_PATTERN.test(linkedin)) {
    errors.linkedin = "Use your full profile link, starting with https://www.linkedin.com/";
  }
  const github = draft.github.trim();
  if (github && !GITHUB_PATTERN.test(github)) {
    errors.github = "Use your full profile link, starting with https://github.com/";
  }

  return errors;
}

/** Trims every text field so stray spaces never reach the database. */
export function cleanDraft(draft: ProfileDraft): ProfileDraft {
  return {
    ...draft,
    name: draft.name.trim(),
    role: draft.role.trim(),
    program: draft.program.trim(),
    bio: draft.bio.trim(),
    linkedin: draft.linkedin.trim(),
    github: draft.github.trim(),
  };
}
