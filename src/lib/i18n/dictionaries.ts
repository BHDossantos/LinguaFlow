import type { UiLocale } from "./config";
import en, { type Dictionary } from "./dictionaries/en";
import es from "./dictionaries/es";
import pt from "./dictionaries/pt";
import fr from "./dictionaries/fr";
import it from "./dictionaries/it";
import ja from "./dictionaries/ja";
import zh from "./dictionaries/zh";

// All locale dictionaries share the English shape (`Dictionary`). Each is a
// full translation of en.ts with identical keys.
const DICTIONARIES: Record<UiLocale, Dictionary> = { en, es, pt, fr, it, ja, zh };

export function getDictionary(locale: UiLocale): Dictionary {
  return DICTIONARIES[locale] ?? en;
}

export type { Dictionary };
