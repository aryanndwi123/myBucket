"use client";

import { useEffect, useState, type ReactNode } from "react";
import { api, ApiError, type BackendUser } from "@/lib/api";
import { Button, Spinner } from "@/components/ui/primitives";

interface Props {
  children: (user: BackendUser, logout: () => void) => ReactNode;
}

export function AuthGate({ children }: Props) {
  const [user, setUser] = useState<BackendUser | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    api
      .me()
      .then((r) => setUser(r.user))
      .catch(() => setUser(null))
      .finally(() => setChecking(false));
  }, []);

  const logout = () => {
    api.logout().finally(() => setUser(null));
  };

  if (checking) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Spinner className="size-6" />
      </div>
    );
  }

  if (!user) {
    return <AuthForm onAuthed={setUser} />;
  }

  return <>{children(user, logout)}</>;
}

function AuthForm({ onAuthed }: { onAuthed: (u: BackendUser) => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const result = mode === "login" ? await api.login(username, password) : await api.register(username, password);
      onAuthed(result.user);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center px-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-3xl border border-line bg-card p-8">
        <h1 className="font-serif text-3xl">{mode === "login" ? "Log in" : "Create an account"}</h1>
        <p className="mt-1 text-sm text-ink-3">myBucket · Stashd</p>

        <label className="mt-6 block text-sm font-medium">Username</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="mt-1 h-11 w-full rounded-xl border border-line-strong bg-paper px-3 text-[15px] outline-none focus:border-ink"
          autoComplete="username"
          required
          minLength={3}
        />

        <label className="mt-4 block text-sm font-medium">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 h-11 w-full rounded-xl border border-line-strong bg-paper px-3 text-[15px] outline-none focus:border-ink"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          required
          minLength={8}
        />

        {error && <p className="mt-3 text-sm text-ember">{error}</p>}

        <Button type="submit" variant="ember" className="mt-6 w-full" disabled={busy}>
          {busy ? <Spinner /> : mode === "login" ? "Log in" : "Sign up"}
        </Button>

        <button
          type="button"
          onClick={() => setMode(mode === "login" ? "register" : "login")}
          className="mt-4 w-full text-center text-sm text-ink-3 underline"
        >
          {mode === "login" ? "Need an account? Sign up" : "Already have an account? Log in"}
        </button>
      </form>
    </div>
  );
}
