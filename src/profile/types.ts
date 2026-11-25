// Shapes shared by the profile page and its API. They mirror the `profiles` table in Neon.

export type ProfileStatus = "pending" | "published" | "hidden";

export type SignInProvider = "google" | "microsoft";

/** The fields a member can edit themselves. */
export interface ProfileDraft {
  name: string;
  role: string;
  subteam: string;
  program: string;
  bio: string;
  /** URL (or data URL in preview mode) of the cropped, resized photo; empty for none. */
  photo: string;
  linkedin: string;
  github: string;
  consent: boolean;
}

/** A saved profile, plus the fields only admins control. */
export interface Profile extends ProfileDraft {
  status: ProfileStatus;
  updatedAt: string;
}

export interface SessionUser {
  email: string;
  /** False when the email is not on the approved list. */
  approved: boolean;
}

/** Everything the page needs to talk to the backend. Swap the implementation, not the page. */
export interface ProfileApi {
  /** True while sign-in and the database are not connected yet. */
  readonly isPreview: boolean;
  /** False until photo storage (Cloudinary) is connected. */
  readonly photoUploads: boolean;
  getSession(): Promise<SessionUser | null>;
  signIn(provider: SignInProvider): Promise<void>;
  signOut(): Promise<void>;
  getMyProfile(): Promise<Profile | null>;
  saveMyProfile(draft: ProfileDraft): Promise<Profile>;
  uploadPhoto(photo: Blob): Promise<string>;
}

export const emptyDraft: ProfileDraft = {
  name: "",
  role: "",
  subteam: "",
  program: "",
  bio: "",
  photo: "",
  linkedin: "",
  github: "",
  consent: false,
};
