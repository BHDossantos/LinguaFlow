"use client";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handle(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const { error } = await supabaseBrowser().auth.signInWithOtp({ email });
    if (error) setError(error.message);
    else setSent(true);
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Sign in</h1>
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
          <button className="btn-primary w-full" type="submit">Send magic link</button>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </form>
      )}
    </div>
  );
}
