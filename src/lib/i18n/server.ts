import { cookies, headers } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE, isUiLocale, normalizeLocale, type UiLocale } from "./config";
import { getDictionary } from "./dictionaries";

/**
 * Resolve the visitor's interface locale on the server:
 * 1. explicit choice in the NEXT_LOCALE cookie, else
 * 2. their browser's Accept-Language, else
 * 3. English.
 */
export async function getLocale(): Promise<UiLocale> {
  const cookieStore = await cookies();
  const fromCookie = cookieStore.get(LOCALE_COOKIE)?.value;
  if (isUiLocale(fromCookie)) return fromCookie;

  try {
    const h = await headers();
    const accept = h.get("accept-language");
    if (accept) {
      // Take the first weighted tag, e.g. "pt-BR,pt;q=0.9,en;q=0.8" -> "pt-BR".
      const first = accept.split(",")[0]?.trim();
      const normalized = normalizeLocale(first);
      if (normalized !== DEFAULT_LOCALE) return normalized;
    }
  } catch {
    // headers() unavailable in some contexts — fall through to default.
  }
  return DEFAULT_LOCALE;
}

/** Convenience: resolve the locale and return its dictionary in one call. */
export async function getI18n() {
  const locale = await getLocale();
  return { locale, t: getDictionary(locale) };
}
