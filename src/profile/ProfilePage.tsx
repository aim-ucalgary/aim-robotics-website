import { useEffect, useState } from "react";
import Logo from "../components/Logo";
import { api } from "./api";
import ProfileForm from "./ProfileForm";
import type { Profile, SessionUser, SignInProvider } from "./types";
import "./ProfilePage.css";

type PageState =
  | { kind: "loading" }
  | { kind: "signed-out" }
  | { kind: "not-approved"; user: SessionUser }
  | { kind: "editor"; user: SessionUser; profile: Profile | null }
  | { kind: "error"; message: string };

const CONTACT_EMAIL = "aim.ucalgary@gmail.com";

/**
 * After a refused sign-in, Better Auth sends the browser back here with `?error=<code>`.
 * Read it once, then remove it from the address bar so a refresh starts clean.
 */
function takeSignInError(): PageState | null {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("error");
  if (!code) return null;
  params.delete("error");
  params.delete("error_description");
  const query = params.toString();
  window.history.replaceState(null, "", `${window.location.pathname}${query ? `?${query}` : ""}`);

  if (code === "NOT_APPROVED") return { kind: "not-approved", user: { email: "", approved: false } };
  if (code === "EMAIL_NOT_VERIFIED") {
    return {
      kind: "error",
      message:
        "Your sign-in provider didn't confirm your email address, so we can't match it to the member list. Try signing in with Google instead.",
    };
  }
  if (code === "access_denied") return { kind: "signed-out" };
  return { kind: "error", message: "Sign-in didn't complete. Please try again." };
}

// Read once at page load (not inside an effect, which React may run twice in development).
const signInError = takeSignInError();

/** Works out which screen to show from the current session and profile. */
async function loadPageState(): Promise<PageState> {
  try {
    const user = await api.getSession();
    if (!user) return { kind: "signed-out" };
    if (!user.approved) return { kind: "not-approved", user };
    const profile = await api.getMyProfile();
    return { kind: "editor", user, profile };
  } catch {
    return { kind: "error", message: "We couldn't load your profile. Refresh the page to try again." };
  }
}

/** /profile/ — where approved members sign in and edit their own profile card. */
function ProfilePage() {
  const [state, setState] = useState<PageState>(signInError ?? { kind: "loading" });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (signInError) return;
    let active = true;
    loadPageState().then((next) => {
      if (active) setState(next);
    });
    return () => {
      active = false;
    };
  }, []);

  async function handleSignIn(provider: SignInProvider) {
    setBusy(true);
    try {
      await api.signIn(provider);
      setState({ kind: "loading" });
      setState(await loadPageState());
    } catch {
      setState({ kind: "error", message: "Sign-in didn't complete. Please try again." });
    } finally {
      setBusy(false);
    }
  }

  async function handleSignOut() {
    try {
      await api.signOut();
    } finally {
      setState({ kind: "signed-out" });
    }
  }

  const user = state.kind === "editor" || (state.kind === "not-approved" && state.user.email) ? state.user : null;

  return (
    <>
      <header className="profile-header">
        <div className="profile-header__inner container">
          <a href="/" aria-label="AIM Robotics home">
            <Logo />
          </a>
          <div className="profile-header__actions">
            {user && (
              <>
                <span className="profile-header__email">{user.email}</span>
                <button type="button" className="arrow-link" onClick={handleSignOut}>
                  Sign out
                </button>
              </>
            )}
            {!user && (
              <a className="arrow-link" href="/">
                Back to site
              </a>
            )}
          </div>
        </div>
      </header>

      <main className="profile-page container">
        {api.isPreview && (
          <p className="profile-preview-note" role="note">
            <strong>Preview mode.</strong> Sign-in and the database aren't connected yet, so anything you save
            stays in this browser only.
          </p>
        )}

        {state.kind === "loading" && (
          <p className="profile-status" role="status">
            Loading…
          </p>
        )}

        {state.kind === "signed-out" && (
          <section className="profile-panel" aria-labelledby="signin-heading">
            <span className="section-label">Members only</span>
            <h1 id="signin-heading" className="profile-panel__heading">
              Set up your AIM profile
            </h1>
            <p className="profile-panel__text">
              Sign in with the email address the team approved for you. Once you save your profile, it appears on
              the AIM website straight away.
            </p>
            <div className="profile-signin">
              <button
                type="button"
                className="profile-signin__button"
                onClick={() => handleSignIn("google")}
                disabled={busy}
              >
                Continue with Google
              </button>
              <button
                type="button"
                className="profile-signin__button"
                onClick={() => handleSignIn("microsoft")}
                disabled={busy}
              >
                Continue with Microsoft
              </button>
            </div>
          </section>
        )}

        {state.kind === "not-approved" && (
          <section className="profile-panel" aria-labelledby="unapproved-heading">
            <span className="section-label">Not approved yet</span>
            <h1 id="unapproved-heading" className="profile-panel__heading">
              This email isn't on the member list
            </h1>
            <p className="profile-panel__text">
              {state.user.email ? (
                <>
                  You're signed in as <strong>{state.user.email}</strong>, which hasn't been approved.
                </>
              ) : (
                <>The account you signed in with hasn't been approved.</>
              )}{" "}
              If you're on the team, ask an AIM admin to add your email, or email{" "}
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. You can also try a different account.
            </p>
            <div className="profile-signin">
              <button type="button" className="profile-signin__button" onClick={handleSignOut}>
                Use a different account
              </button>
            </div>
          </section>
        )}

        {state.kind === "editor" && (
          <ProfileForm
            initialProfile={state.profile}
            onSaved={(profile) => setState({ ...state, profile })}
          />
        )}

        {state.kind === "error" && (
          <section className="profile-panel" role="alert">
            <h1 className="profile-panel__heading">Something went wrong</h1>
            <p className="profile-panel__text">{state.message}</p>
            <div className="profile-signin">
              <button type="button" className="profile-signin__button" onClick={handleSignOut}>
                Back to sign-in
              </button>
            </div>
          </section>
        )}
      </main>
    </>
  );
}

export default ProfilePage;
