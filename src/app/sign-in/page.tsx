"use client";
import { useState, useTransition } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { requestMagicLink } from "@/app/sign-in/actions";

const GOOGLE_ENABLED = process.env.NEXT_PUBLIC_GOOGLE_AUTH === "1";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [oauthBusy, setOauthBusy] = useState(false);

  function handle(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      const res = await requestMagicLink({ email });
      if (res.ok) setSent(true);
      else setError(res.error ?? "Could not send the link");
    });
  }

  async function google() {
    setError(null);
    setOauthBusy(true);
    const { error } = await supabaseBrowser().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setError(
        /not enabled|unsupported/i.test(error.message)
          ? "Google sign-in isn't enabled on this deployment yet."
          : error.message,
      );
      setOauthBusy(false);
    }
    // On success the browser navigates away to Google.
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Sign in</h1>

      {GOOGLE_ENABLED && (
      <button
        type="button"
        onClick={google}
        disabled={oauthBusy}
        data-testid="google-signin"
        className="btn-ghost w-full border border-black/10 dark:border-white/10"
      >
        {oauthBusy ? "Redirecting…" : (
          <span className="inline-flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
              <path fill="#4285F4" d="M23.5 12.3c0-.9-.1-1.5-.3-2.2H12v4.1h6.5c-.1 1.1-.8 2.7-2.4 3.8l-.02.15 3.5 2.7.24.02c2.2-2 3.5-5 3.5-8.6z"/>
              <path fill="#34A853" d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.8-2.9c-1 .7-2.4 1.2-4.1 1.2-3.1 0-5.8-2-6.7-4.9l-.14.01-3.6 2.8-.05.13C3.5 21.3 7.5 24 12 24z"/>
              <path fill="#FBBC05" d="M5.3 14.5c-.2-.7-.4-1.4-.4-2.2s.1-1.5.4-2.2l-.01-.15-3.7-2.9-.12.06C.6 8.7 0 10.3 0 12.3s.6 3.6 1.5 5.1l3.8-2.9z"/>
              <path fill="#EB4335" d="M12 4.9c2.2 0 3.7.9 4.5 1.7l3.3-3.2C17.9 1.3 15.2 0 12 0 7.5 0 3.5 2.7 1.5 6.6l3.8 2.9c1-2.8 3.6-4.6 6.7-4.6z"/>
            </svg>
            Continue with Google
          </span>
        )}
      </button>
      )}

      {GOOGLE_ENABLED && (
      <div className="flex items-center gap-3 text-xs text-ink-500">
        <span className="h-px flex-1 bg-black/10 dark:bg-white/10" />
        or with email
        <span className="h-px flex-1 bg-black/10 dark:bg-white/10" />
      </div>
      )}

      {sent ? (
        <p className="card">Check your email for the magic link.</p>
      ) : (
        <form onSubmit={handle} className="space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-xl border border-black/10 bg-white px-4 py-3"
          />
          <button className="btn-primary w-full" type="submit" disabled={pending}>
            {pending ? "Sending…" : "Send magic link"}
          </button>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </form>
      )}

      <p className="pt-2 text-center text-xs text-ink-500">
        By continuing you agree to our{" "}
        <a href="/legal/terms" className="underline">Terms</a> and{" "}
        <a href="/legal/privacy" className="underline">Privacy Policy</a>.
      </p>
    </div>
  );
}
