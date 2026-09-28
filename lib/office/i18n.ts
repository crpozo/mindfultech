import type { Lang } from "@/components/i18n";

export type { Lang };

/**
 * Text helper for the office demo. Components receive `lang` as a prop and do
 *   const t = tx(lang);  t("Texto en español", "English text")
 * Spanish first because it is the copy the demo was written in.
 */
export const tx = (lang: Lang) => (es: string, en: string) => (lang === "es" ? es : en);

/** Locale for numbers, dates and times. */
export const LOCALE: Record<Lang, string> = { es: "es-EC", en: "en-US" };
