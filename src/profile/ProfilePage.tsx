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
  const [state, setState] = useState<PageState>({ kind: "loading" });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
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
    await api.signOut();
    setState({ kind: "signed-out" });
  }

  const user = state.kind === "editor" || state.kind === "not-approved" ? state.user : null;

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
              Sign in with the email address the team approved for you. Your profile appears on the AIM website
              once an admin has reviewed it.
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
              You're signed in as <strong>{state.user.email}</strong>, which hasn't been approved. If you're on the
              team, ask an AIM admin to add this email, or email{" "}
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. You can also sign out and try a different
              account.
            </p>
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
          </section>
        )}
      </main>
    </>
  );
}

export default ProfilePage;
