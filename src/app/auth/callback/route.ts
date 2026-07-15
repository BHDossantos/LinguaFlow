import { NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

type CookieToSet = { name: string; value: string; options: CookieOptions };

// OAuth (PKCE) callback: exchange the provider code for a session, set the
// auth cookies, and land the user on the app.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  // Behind Vercel's proxy req.url's origin can differ from the host the
  // browser is on — build redirects from the forwarded host instead.
  const proto = req.headers.get("x-forwarded-proto") ?? "https";
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  const origin = host ? `${proto}://${host}` : url.origin;

  // Supabase reports failures (provider errors, expired links, database
  // errors on signup) as query params with no code. Forward them to the
  // sign-in page so the user sees why — otherwise this looks like a silent
  // bounce back to sign-in.
  const providerError =
    url.searchParams.get("error_description") ?? url.searchParams.get("error");
  if (!code && providerError) {
    return NextResponse.redirect(
      new URL(`/sign-in?error=${encodeURIComponent(providerError)}`, origin),
    );
  }

  // Only same-site paths — never redirect to another host. Backslashes are
  // treated as slashes by URL parsing, so "/\evil.com" would resolve
  // protocol-relative — reject it too.
  const requested = url.searchParams.get("redirectTo") ?? "/";
  const redirectTo =
    requested.startsWith("/") && !requested.startsWith("//") && !requested.startsWith("/\\")
      ? requested
      : "/";

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (toSet: CookieToSet[]) =>
            toSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            ),
        },
      },
    );
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(
        new URL(`/sign-in?error=${encodeURIComponent(error.message)}`, origin),
      );
    }
  }

  return NextResponse.redirect(new URL(redirectTo, origin));
}
