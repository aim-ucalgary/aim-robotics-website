import { useEffect, useId, useState, type ChangeEvent, type FormEvent } from "react";
import MemberCard from "../components/MemberCard";
import { teams } from "../content/loader";
import { api } from "./api";
import { SaveError } from "./realApi";
import { ACCEPTED_TYPES, MAX_INPUT_BYTES, resizePhoto } from "./resizePhoto";
import { emptyDraft, type Profile, type ProfileDraft, type ProfileStatus } from "./types";
import { cleanDraft, LIMITS, validateDraft, type FieldErrors } from "./validation";

const SUBTEAMS = teams.subteams.map((subteam) => ({ id: subteam.id, title: subteam.title }));
const SUBTEAM_IDS = SUBTEAMS.map((subteam) => subteam.id);

const STATUS_TEXT: Record<ProfileStatus, { label: string; detail: string }> = {
  pending: {
    label: "Not on the website",
    detail: "Tick the box agreeing to have your profile shown, then save to publish it.",
  },
  published: {
    label: "Live on the website",
    detail: "Changes you save go live straight away.",
  },
  hidden: {
    label: "Hidden by an admin",
    detail: "Your profile isn't shown on the website. Contact an admin to make it visible again.",
  },
};

function draftFrom(profile: Profile | null): ProfileDraft {
  if (!profile) return emptyDraft;
  const { status: _status, updatedAt: _updatedAt, ...draft } = profile;
  return draft;
}

interface ProfileFormProps {
  initialProfile: Profile | null;
  onSaved: (profile: Profile) => void;
}

/** The profile editor: form on one side, a live preview of the public card on the other. */
function ProfileForm({ initialProfile, onSaved }: ProfileFormProps) {
  const [draft, setDraft] = useState<ProfileDraft>(() => draftFrom(initialProfile));
  const [savedDraft, setSavedDraft] = useState<ProfileDraft>(() => draftFrom(initialProfile));
  const [status, setStatus] = useState<ProfileStatus | null>(initialProfile?.status ?? null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const formId = useId();

  const dirty = JSON.stringify(draft) !== JSON.stringify(savedDraft);

  // Warn before leaving the page with unsaved changes.
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function update<K extends keyof ProfileDraft>(field: K, value: ProfileDraft[K]) {
    const next = { ...draft, [field]: value };
    setDraft(next);
    setMessage(null);
    if (submitted) setErrors(validateDraft(next, SUBTEAM_IDS));
  }

  const text = (field: "name" | "role" | "program" | "bio" | "linkedin" | "github") => ({
    id: `${formId}-${field}`,
    value: draft[field],
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => update(field, event.target.value),
    "aria-invalid": errors[field] ? true : undefined,
    "aria-describedby": errors[field] ? `${formId}-${field}-error` : undefined,
  });

  const errorFor = (field: keyof ProfileDraft) =>
    errors[field] ? (
      <p id={`${formId}-${field}-error`} className="profile-field__error">
        {errors[field]}
      </p>
    ) : null;

  async function handlePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setPhotoError("");
    if (!ACCEPTED_TYPES.includes(file.type)) return setPhotoError("Use a JPG, PNG, or WebP image.");
    if (file.size > MAX_INPUT_BYTES) return setPhotoError("That image is over 10 MB. Try a smaller one.");

    setPhotoBusy(true);
    try {
      const resized = await resizePhoto(file);
      update("photo", await api.uploadPhoto(resized));
    } catch {
      setPhotoError("We couldn't use that photo. Try a different one.");
    } finally {
      setPhotoBusy(false);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitted(true);
    const cleaned = cleanDraft(draft);
    const found = validateDraft(cleaned, SUBTEAM_IDS);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setMessage({ tone: "error", text: "Fix the highlighted fields, then save again." });
      return;
    }

    setSaving(true);
    try {
      const saved = await api.saveMyProfile(cleaned);
      const savedFields = draftFrom(saved);
      setDraft(savedFields);
      setSavedDraft(savedFields);
      setStatus(saved.status);
      onSaved(saved);
      setMessage({
        tone: "success",
        text:
          saved.status === "published"
            ? "Saved. Your profile is live on the website."
            : saved.status === "hidden"
              ? "Saved. Your profile is still hidden by an admin."
              : "Saved, but it won't appear on the website until you agree to have it shown.",
      });
    } catch (error) {
      if (error instanceof SaveError) {
        setErrors(error.fields);
        setMessage({ tone: "error", text: error.message });
      } else {
        setMessage({ tone: "error", text: "Saving failed. Check your connection and try again." });
      }
    } finally {
      setSaving(false);
    }
  }

  const preview = {
    name: draft.name.trim() || "Your Name",
    role: draft.role.trim() || "Your role",
    program: draft.program.trim() || undefined,
    photo: draft.photo || undefined,
    linkedin: draft.linkedin.trim() || undefined,
  };

  return (
    <div className="profile-editor">
      <div className="profile-editor__intro">
        <span className="section-label">{initialProfile ? "Your profile" : "New profile"}</span>
        <h1 className="profile-panel__heading">
          {initialProfile ? "Edit your profile" : "Create your profile"}
        </h1>
        {status && (
          <p className={`profile-badge profile-badge--${status}`}>
            <span className="profile-badge__label">{STATUS_TEXT[status].label}</span>
            <span className="profile-badge__detail">{STATUS_TEXT[status].detail}</span>
          </p>
        )}
      </div>

      <form className="profile-form" onSubmit={handleSubmit} noValidate>
        <fieldset className="profile-form__group">
          <legend className="technical-label">Photo</legend>
          <div className="profile-photo">
            <div className="profile-photo__frame">
              {draft.photo ? (
                <img src={draft.photo} alt="Your profile photo" />
              ) : (
                <span>No photo</span>
              )}
            </div>
            {!api.photoUploads ? (
              <div className="profile-photo__controls">
                <p className="profile-field__hint">
                  Photo uploads are coming soon. Until then, your card shows your initials.
                </p>
              </div>
            ) : (
            <div className="profile-photo__controls">
              <label className="arrow-link profile-photo__upload">
                {photoBusy ? "Processing…" : draft.photo ? "Change photo" : "Upload photo"}
                <input
                  type="file"
                  accept={ACCEPTED_TYPES.join(",")}
                  onChange={handlePhoto}
                  disabled={photoBusy}
                  className="visually-hidden"
                />
              </label>
              {draft.photo && (
                <button type="button" className="profile-photo__remove" onClick={() => update("photo", "")}>
                  Remove
                </button>
              )}
              <p className="profile-field__hint">
                JPG, PNG, or WebP. It's cropped to a square from the center. Optional: without one, your card
                shows your initials.
              </p>
              {photoError && (
                <p className="profile-field__error" role="alert">
                  {photoError}
                </p>
              )}
            </div>
            )}
          </div>
        </fieldset>

        <fieldset className="profile-form__group">
          <legend className="technical-label">About you</legend>

          <div className="profile-field">
            <label htmlFor={`${formId}-name`}>
              Full name <span className="profile-field__required">Required</span>
            </label>
            <input type="text" autoComplete="name" maxLength={LIMITS.name} required {...text("name")} />
            {errorFor("name")}
          </div>

          <div className="profile-field">
            <label htmlFor={`${formId}-subteam`}>
              Subteam <span className="profile-field__required">Required</span>
            </label>
            <select
              id={`${formId}-subteam`}
              value={draft.subteam}
              onChange={(event) => update("subteam", event.target.value)}
              aria-invalid={errors.subteam ? true : undefined}
              aria-describedby={errors.subteam ? `${formId}-subteam-error` : undefined}
              required
            >
              <option value="" disabled>
                Choose your subteam
              </option>
              {SUBTEAMS.map((subteam) => (
                <option key={subteam.id} value={subteam.id}>
                  {subteam.title}
                </option>
              ))}
            </select>
            {errorFor("subteam")}
          </div>

          <div className="profile-field">
            <label htmlFor={`${formId}-role`}>Role on the team</label>
            <input type="text" placeholder="e.g. Motion Planning & Control" maxLength={LIMITS.role} {...text("role")} />
            {errorFor("role")}
          </div>

          <div className="profile-field">
            <label htmlFor={`${formId}-program`}>Program and year</label>
            <input
              type="text"
              placeholder="e.g. Software Engineering, 3rd year"
              maxLength={LIMITS.program}
              {...text("program")}
            />
            {errorFor("program")}
          </div>

          <div className="profile-field">
            <label htmlFor={`${formId}-bio`}>Short bio</label>
            <textarea rows={4} maxLength={LIMITS.bio} {...text("bio")} />
            <p className="profile-field__hint profile-field__count">
              {draft.bio.length} / {LIMITS.bio}
            </p>
            {errorFor("bio")}
          </div>
        </fieldset>

        <fieldset className="profile-form__group">
          <legend className="technical-label">Links (optional)</legend>

          <div className="profile-field">
            <label htmlFor={`${formId}-linkedin`}>LinkedIn profile</label>
            <input type="url" inputMode="url" placeholder="https://www.linkedin.com/in/…" {...text("linkedin")} />
            {errorFor("linkedin")}
          </div>

          <div className="profile-field">
            <label htmlFor={`${formId}-github`}>GitHub profile</label>
            <input type="url" inputMode="url" placeholder="https://github.com/…" {...text("github")} />
            {errorFor("github")}
          </div>
        </fieldset>

        <div className="profile-consent">
          <input
            id={`${formId}-consent`}
            type="checkbox"
            checked={draft.consent}
            onChange={(event) => update("consent", event.target.checked)}
          />
          <label htmlFor={`${formId}-consent`}>
            I agree to have my name, photo, and the details above shown publicly on the AIM Robotics website. I can
            ask for my profile to be removed at any time.
          </label>
        </div>

        <div className="profile-form__actions">
          <button type="submit" className="arrow-link arrow-link--primary" disabled={saving || photoBusy}>
            {saving ? "Saving…" : "Save profile"}
          </button>
          {dirty && !saving && <span className="profile-field__hint">Unsaved changes</span>}
        </div>

        {message && (
          <p
            className={`profile-message profile-message--${message.tone}`}
            role={message.tone === "error" ? "alert" : "status"}
          >
            {message.text}
          </p>
        )}
      </form>

      <aside className="profile-preview" aria-label="Preview of your card">
        <span className="technical-label">Preview</span>
        <p className="profile-field__hint">This is how your card looks on the website.</p>
        <div className="profile-preview__card">
          <MemberCard member={preview} />
        </div>
      </aside>
    </div>
  );
}

export default ProfileForm;
