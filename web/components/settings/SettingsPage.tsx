"use client";

import { useCallback, useEffect, useState } from "react";
import { api, ApiError, type BackendToken } from "@/lib/api";
import { useAuth } from "@/components/auth/AuthGate";
import { Button, Eyebrow, Spinner } from "@/components/ui/primitives";

const sectionHeading = "font-serif text-4xl leading-none";

function relativeTime(iso: string | null): string {
  if (!iso) return "never used";
  const diffMs = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diffMs / 86_400_000);
  if (days <= 0) return "used today";
  if (days === 1) return "used 1d ago";
  return `used ${days}d ago`;
}

export function SettingsPage() {
  const { user } = useAuth();
  const [tokens, setTokens] = useState<BackendToken[] | null>(null);
  const [newToken, setNewToken] = useState<string | null>(null);
  const [label, setLabel] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    api
      .listTokens()
      .then((r) => setTokens(r.tokens))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Couldn't load tokens"));
  }, []);

  useEffect(refresh, [refresh]);

  const createToken = async () => {
    setBusy(true);
    setError(null);
    try {
      const { token } = await api.createToken(label.trim() || "MCP connector");
      setNewToken(token);
      setLabel("");
      refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't create a token");
    } finally {
      setBusy(false);
    }
  };

  const revoke = async (id: string) => {
    await api.deleteToken(id).catch(() => setError("Couldn't revoke that token"));
    refresh();
  };

  const apiOrigin = process.env.NEXT_PUBLIC_API_URL || (typeof window !== "undefined" ? window.location.origin : "");
  const configSnippet = newToken
    ? JSON.stringify(
        {
          mcpServers: {
            stashd: {
              type: "http",
              url: `${apiOrigin}/mcp`,
              headers: { Authorization: `Bearer ${newToken}` },
            },
          },
        },
        null,
        2,
      )
    : "";

  return (
    <div>
      <Eyebrow>Settings</Eyebrow>
      <h1 className={sectionHeading}>{user.username}</h1>

      <section aria-labelledby="mcp-heading" className="mt-12">
        <h2 id="mcp-heading" className="font-serif text-3xl leading-none">
          MCP connector
        </h2>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-3">
          Generate a personal access token and paste it into Claude Desktop (or another MCP client) so it can search,
          open, save and complete action items on your saves directly.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Label (e.g. Claude Desktop)"
            className="h-11 w-64 rounded-xl border border-line-strong bg-paper px-3 text-[15px] outline-none focus:border-ink"
          />
          <Button onClick={createToken} disabled={busy}>
            {busy ? <Spinner /> : "Generate token"}
          </Button>
        </div>

        {error && (
          <p role="alert" className="mt-3 text-sm text-ember-text">
            {error}
          </p>
        )}

        {newToken && (
          <div className="mt-6 rounded-3xl border border-line bg-card p-5">
            <p className="text-sm font-medium">Copy this now — it won’t be shown again.</p>
            <pre className="mt-3 overflow-x-auto rounded-xl bg-ink p-4 font-mono text-[13px] text-on-ink">
              <code>{newToken}</code>
            </pre>
            <p className="mt-4 text-sm font-medium">Claude Desktop config (claude_desktop_config.json)</p>
            <pre className="mt-2 overflow-x-auto rounded-xl bg-ink p-4 font-mono text-[12px] leading-relaxed text-on-ink">
              <code>{configSnippet}</code>
            </pre>
          </div>
        )}

        <div className="mt-8">
          <Eyebrow>Active tokens</Eyebrow>
          {tokens === null ? (
            <Spinner className="mt-3" />
          ) : tokens.length === 0 ? (
            <p className="mt-3 text-sm text-ink-4">No tokens yet.</p>
          ) : (
            <ul className="mt-3 divide-y divide-line rounded-3xl border border-line">
              {tokens.map((t) => (
                <li key={t._id} className="flex items-center justify-between gap-3 px-5 py-4">
                  <div>
                    <p className="text-[15px] font-medium">{t.label}</p>
                    <p className="text-sm text-ink-4">{relativeTime(t.lastUsedAt)}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => revoke(t._id)}>
                    Revoke
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
