type SheetDialog = Pick<HTMLDialogElement, "close" | "show" | "showModal">;

// Narrow screens: a modal sheet (everything behind it inert, scrim). Wide screens: part of the page.
export function applySheetMode(dialog: SheetDialog, narrow: boolean): void {
  dialog.close();
  if (narrow) dialog.showModal();
  else dialog.show();
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
  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    window.location.href = dialog.dataset.closeHref ?? "/";
  });
}
