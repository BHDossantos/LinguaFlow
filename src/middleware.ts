import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

type CookieToSet = { name: string; value: string; options: CookieOptions };

const PUBLIC_PATHS = new Set<string>(["/", "/sign-in", "/auth/callback", "/pricing", "/offline"]);

// Static marketing/PWA assets served from /public.
const PUBLIC_FILES = /\.(png|jpg|jpeg|svg|webp|ico|txt|xml)$/;

function isPublic(pathname: string) {
  if (PUBLIC_PATHS.has(pathname)) return true;
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/stripe/webhook") ||
    pathname === "/api/track" ||
    pathname.startsWith("/legal/") ||
    pathname === "/manifest.json" ||
    pathname === "/sw.js" ||
    pathname === "/sitemap.xml" ||
    pathname === "/robots.txt" ||
    pathname === "/favicon.ico" ||
    PUBLIC_FILES.test(pathname)
  );
}

export async function middleware(req: NextRequest) {
  // Canonical host: serve everything from the host in NEXT_PUBLIC_SITE_URL.
  // Auth cookies (incl. the PKCE code-verifier set mid-OAuth) are host-bound,
  // so letting www and the apex both serve pages breaks sign-in whenever a
  // flow starts on one host and finishes on the other.
  const site = process.env.NEXT_PUBLIC_SITE_URL;
  if (site) {
    const canonical = new URL(site).host;
    const host = req.headers.get("host") ?? "";
    if (
      host !== canonical &&
      (host === `www.${canonical}` || canonical === `www.${host}`)
    ) {
      const url = req.nextUrl.clone();
      url.protocol = "https:";
      url.host = canonical;
      url.port = "";
      return NextResponse.redirect(url, 308);
    }
  }

  const res = NextResponse.next();
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return res;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (toSet: CookieToSet[]) => {
          toSet.forEach(({ name, value, options }) => {
            req.cookies.set(name, value);
            res.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user && !isPublic(req.nextUrl.pathname)) {
    if (req.nextUrl.pathname.startsWith("/api/")) {
      // APIs return JSON, not an HTML redirect — so non-browser callers
      // (future mobile clients, external integrations) get a useful response.
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    const url = req.nextUrl.clone();
    url.pathname = "/sign-in";
    url.searchParams.set("redirectTo", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|manifest.json).*)"],
};
