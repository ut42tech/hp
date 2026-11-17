type SheetDialog = Pick<HTMLDialogElement, "close" | "show" | "showModal">;

// Narrow screens: a modal sheet (everything behind it inert, scrim). Wide screens: part of the page.
export function applySheetMode(dialog: SheetDialog, narrow: boolean): void {
  dialog.close();
  if (narrow) dialog.showModal();
  else dialog.show();
}

const trimSlash = (path: string) => path.replace(/(.)\/$/, "$1");

// Closing goes to the list. When the list is the page the detail was opened from, going back reuses that
// history entry; pushing a new one would make the browser's back button reopen the detail.
export function closeAction(
  referrer: string,
  listHref: string,
  origin: string,
): "back" | "replace" {
  try {
    const from = new URL(referrer);
    return from.origin === origin && trimSlash(from.pathname) === trimSlash(listHref)
      ? "back"
      : "replace";
  } catch {
    return "replace";
  }
}

// Without JavaScript the dialog stays open as a normal element, so the page is still readable.
// The mode follows the width, so rotating a tablet or resizing a window across 1024px stays correct.
export function initDetailSheet(root: ParentNode): void {
  const dialog = root.querySelector<HTMLDialogElement>("dialog.app-detail");
  if (!dialog) return;
  const narrow = window.matchMedia("(width < 64rem)");
  if (narrow.matches) {
    applySheetMode(dialog, true);
    // Start on the sheet, not its first control, so the close button does not open with a focus ring.
    dialog.focus();
  }
  narrow.addEventListener("change", (event) => applySheetMode(dialog, event.matches));
  const listHref = dialog.dataset.closeHref ?? "/";
  const close = () => {
    if (closeAction(document.referrer, listHref, window.location.origin) === "back") history.back();
    else window.location.replace(listHref);
  };
  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    close();
  });
  // Plain clicks only: a modified click (new tab, new window) keeps the link's normal behaviour.
  dialog.addEventListener("click", (event) => {
    const link = (event.target as Element).closest<HTMLAnchorElement>("a[data-close]");
    if (
      !link ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }
    event.preventDefault();
    close();
  });
}
