// Whether a pointer landed on a drag handle that belongs to `layer` (a sheet or a dialog). Layers nest in the
// DOM (the app detail is a dialog inside the Works sheet), so a handle belongs to its nearest layer only.
export function isOwnHandle(target: Element, layer: Element): boolean {
  const handle = target.closest("[data-sheet-handle]");
  return handle !== null && handle.closest("dialog, .sheet") === layer;
}
