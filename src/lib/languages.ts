export type LanguageCode = "en" | "es" | "it" | "pt" | "fr";

export const LANGUAGES: Record<LanguageCode, { label: string; flag: string; dialects: { code: string; label: string }[] }> = {
  en: {
    label: "English",
    flag: "🇬🇧",
    dialects: [
      { code: "us", label: "American" },
      { code: "uk", label: "British" },
      { code: "au", label: "Australian" },
    ],
  },
  es: {
    label: "Spanish",
    flag: "🇪🇸",
    dialects: [
      { code: "es", label: "Castilian (Spain)" },
      { code: "latam", label: "Latin American (neutral)" },
      { code: "mx", label: "Mexican" },
      { code: "ar", label: "Rioplatense (Argentina/Uruguay)" },
    ],
  },
  it: {
    label: "Italian",
    flag: "🇮🇹",
    dialects: [{ code: "it", label: "Standard Italian" }],
  },
  pt: {
    label: "Portuguese",
    flag: "🇵🇹",
    dialects: [
      { code: "pt", label: "European Portuguese" },
      { code: "br", label: "Brazilian Portuguese" },
    ],
  },
  fr: {
    label: "French",
    flag: "🇫🇷",
    dialects: [
      { code: "fr", label: "Metropolitan French" },
      { code: "ca", label: "Canadian French" },
    ],
  },
};

export const LANGUAGE_CODES = Object.keys(LANGUAGES) as LanguageCode[];

export function languageLabel(code: string) {
  return (LANGUAGES as Record<string, { label: string }>)[code]?.label ?? code;
}
