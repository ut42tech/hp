export type SheetDialog = Pick<HTMLDialogElement, "close" | "show" | "showModal">;

// Narrow screens: a modal sheet (everything behind it inert, scrim). Wide screens: part of the page.
// Without JavaScript the dialog stays open as a normal element, so the page is still readable.
export function applySheetMode(dialog: SheetDialog, narrow: boolean): void {
  dialog.close();
  if (narrow) dialog.showModal();
  else dialog.show();
}
