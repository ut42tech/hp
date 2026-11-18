const trimSlash = (path: string) => path.replace(/(.)\/$/, "$1");

// Closing a sheet or detail leads to `target`. When that is the page it was opened from, going back reuses
// the history entry; pushing a new one would make the browser's back button reopen what was just closed.
export function closeAction(back: string | null | undefined, target: string): "back" | "replace" {
  return back && trimSlash(back) === trimSlash(target) ? "back" : "replace";
}

// Set while Safari's own back swipe is animating the page change, so ours does not play a second time.
export const uaTransition = { skip: false };
