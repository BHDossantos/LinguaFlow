// Interface localization for the Noelia site (distinct from the *target*
// languages a learner studies — see src/lib/languages.ts for those).
// The visitor picks an interface language; it is stored in the NEXT_LOCALE
// cookie and read server-side so pages render already translated.

export const UI_LOCALES = ["en", "es", "pt", "fr", "it", "ja", "zh"] as const;
export type UiLocale = (typeof UI_LOCALES)[number];

export const DEFAULT_LOCALE: UiLocale = "en";

export const LOCALE_COOKIE = "NEXT_LOCALE";

/** Native names + a flag, shown in the language switcher. */
export const LOCALE_META: Record<UiLocale, { native: string; english: string; flag: string }> = {
  en: { native: "English", english: "English", flag: "🇬🇧" },
  es: { native: "Español", english: "Spanish", flag: "🇪🇸" },
  pt: { native: "Português", english: "Portuguese", flag: "🇧🇷" },
  fr: { native: "Français", english: "French", flag: "🇫🇷" },
  it: { native: "Italiano", english: "Italian", flag: "🇮🇹" },
  ja: { native: "日本語", english: "Japanese", flag: "🇯🇵" },
  zh: { native: "中文", english: "Chinese", flag: "🇨🇳" },
};

export function isUiLocale(value: unknown): value is UiLocale {
  return typeof value === "string" && (UI_LOCALES as readonly string[]).includes(value);
}

/** Pick the best supported locale from an Accept-Language-style string. */
export function normalizeLocale(value: string | undefined | null): UiLocale {
  if (!value) return DEFAULT_LOCALE;
  const lower = value.toLowerCase();
  // Exact tag first (e.g. "pt"), then primary subtag (e.g. "pt-BR" -> "pt").
  if (isUiLocale(lower)) return lower;
  const primary = lower.split(/[-_]/)[0];
  if (isUiLocale(primary)) return primary;
  return DEFAULT_LOCALE;
}
