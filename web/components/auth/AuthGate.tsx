"use client";

import { createContext, useCallback, useContext, useEffect, useState, type FormEvent, type ReactNode } from "react";
import { api, ApiError, UNAUTHORIZED_EVENT, type BackendUser } from "@/lib/api";
import { Button, Spinner } from "@/components/ui/primitives";
import { LoadError } from "@/components/ui/States";

interface AuthValue {
  user: BackendUser;
  /** Null while sign-in is automatic: there is nothing to log out of. */
  logout: (() => void) | null;
}

/**
 * Auth is skipped for now: unless NEXT_PUBLIC_REQUIRE_AUTH=true, the app signs in a shared demo account
 * by itself (creating it on first run) and never shows the form. The credentials are public by design,
 * so use this for development only.
 */
const REQUIRE_AUTH = process.env.NEXT_PUBLIC_REQUIRE_AUTH === "true";
const DEMO_USER = process.env.NEXT_PUBLIC_DEMO_USER ?? "demo";
const DEMO_PASSWORD = process.env.NEXT_PUBLIC_DEMO_PASSWORD ?? "stashd-demo-account";

async function signInDemo(): Promise<BackendUser> {
  try {
    return (await api.login(DEMO_USER, DEMO_PASSWORD)).user;
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) return (await api.register(DEMO_USER, DEMO_PASSWORD)).user;
    throw err;
  }
}

const AuthContext = createContext<AuthValue | null>(null);

/** The signed-in user. Only valid below <AuthGate>. */
export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthGate>");
  return ctx;
}

/**
 * Shows the login / sign-up form until there's a session, then renders its children.
 * A 401 from any later request (an expired session) sends the user back to the form.
 */
export function AuthGate({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<BackendUser | null>(null);
  const [checking, setChecking] = useState(true);
  const [failure, setFailure] = useState<string | null>(null);

  const start = useCallback(() => {
    setChecking(true);
    setFailure(null);
    api
      .me()
      .then((r) => r.user)
      .catch((err) => {
        if (REQUIRE_AUTH) return null;
        return signInDemo().catch((e) => {
          setFailure(e instanceof ApiError ? e.message : "Something went wrong");
          return null;
        });
      })
      .then(setUser)
      .finally(() => setChecking(false));
  }, []);

  useEffect(start, [start]);

  useEffect(() => {
    const onUnauthorized = () => (REQUIRE_AUTH ? setUser(null) : start());
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  }, [start]);

  const logout = useCallback(() => {
    api.logout().finally(() => setUser(null));
  }, []);

  if (checking) {
    return (
      <div className="grid min-h-screen place-items-center" role="status" aria-label="Loading">
        <Spinner className="size-6" />
      </div>
    );
  }

  if (!user) {
    if (REQUIRE_AUTH) return <AuthForm onAuthed={setUser} />;
    return <LoadError message={failure ?? "Couldn’t reach the server."} onRetry={start} />;
  }

  return <AuthContext value={{ user, logout: REQUIRE_AUTH ? logout : null }}>{children}</AuthContext>;
}

const field = "mt-1 h-11 w-full rounded-xl border border-line-strong bg-paper px-3 text-[15px] outline-none focus:border-ink";

function AuthForm({ onAuthed }: { onAuthed: (u: BackendUser) => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const result = mode === "login" ? await api.login(username, password) : await api.register(username, password);
      onAuthed(result.user);
    } catch (err) {
      // The API reports validation failures as raw schema text, so say it in plain words.
      setError(
        err instanceof ApiError ? (err.status === 400 ? "Use 3–32 characters for the username and at least 8 for the password." : err.message) : "Something went wrong",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-center gap-3">
          <span className="grid size-10 place-items-center rounded-[11px] bg-ember font-serif text-2xl text-white">S</span>
          <span className="font-serif text-[34px] leading-none">Stashd</span>
        </div>

        <form onSubmit={submit} className="rounded-3xl border border-line bg-card p-8">
          <h1 className="font-serif text-3xl">{mode === "login" ? "Log in" : "Create an account"}</h1>
          <p className="mt-1 text-sm text-ink-3">We don’t save links. We make sure you use them.</p>

          <label htmlFor="username" className="mt-6 block text-sm font-medium">
            Username
          </label>
          <input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={field}
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            required
            minLength={3}
            maxLength={32}
          />

          <label htmlFor="password" className="mt-4 block text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={field}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            required
            minLength={8}
          />

          {error && (
            <p role="alert" className="mt-3 text-sm text-ember-text">
              {error}
            </p>
          )}

          <Button type="submit" variant="ember" size="lg" className="mt-6 w-full" disabled={busy}>
            {busy ? <Spinner className="border-white/40 border-t-white" /> : mode === "login" ? "Log in" : "Sign up"}
          </Button>

          <button
            type="button"
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setError(null);
            }}
            className="mt-4 inline-flex min-h-11 w-full items-center justify-center text-sm text-ink-3 underline"
          >
            {mode === "login" ? "Need an account? Sign up" : "Already have an account? Log in"}
          </button>
        </form>
      </div>
    </main>
  );
}
