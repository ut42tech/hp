import { profile } from "./profile";
import type { SocialLink } from "./types";

/** primary: true のリンクを定義順で返す。 */
export function getPrimarySocial(
  links: SocialLink[] = profile.social,
): SocialLink[] {
  return links.filter((l) => l.primary);
}
