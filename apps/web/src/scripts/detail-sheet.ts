// On phones the detail is a modal sheet: showModal() makes everything behind it inert and adds the scrim.
// Without JavaScript the dialog stays open as a normal element, so the page is still readable.
export function initDetailSheet(root: ParentNode): void {
  const dialog = root.querySelector<HTMLDialogElement>("dialog.app-detail");
  if (!dialog || !window.matchMedia("(width < 64rem)").matches) return;
  dialog.close();
  dialog.showModal();
  // Start on the sheet, not its first control, so the close button does not open with a focus ring.
  dialog.focus();
  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    window.location.href = dialog.dataset.closeHref ?? "/";
  });
}
