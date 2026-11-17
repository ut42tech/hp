import { profile } from "@ut42tech/profile";
import type { Locale } from "./config";
import { en } from "./messages/en";
import { ja, type MessageKey } from "./messages/ja";

const messages: Record<Locale, Record<MessageKey, string>> = { ja, en };

export type Translate = (key: MessageKey, vars?: Record<string, string | number>) => string;

export function useTranslations(locale: Locale): Translate {
  return (key, vars) =>
    messages[locale][key].replace(/\{(\w+)\}/g, (match, name: string) =>
      vars && name in vars ? String(vars[name]) : match,
    );
}

export function mottoFor(locale: Locale): string {
  return locale === "en" ? profile.mottoEn : profile.motto;
}
