// Copies the address and announces it through the polite live region next to the button.
export function initCopyEmail(root: ParentNode): void {
  for (const button of root.querySelectorAll<HTMLButtonElement>("[data-copy-email]")) {
    const status = button.parentElement?.querySelector<HTMLElement>("[data-copy-status]");
    button.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(button.dataset.copyEmail ?? "");
      } catch {
        return;
      }
      if (!status) return;
      status.textContent = button.dataset.copiedLabel ?? "";
      window.setTimeout(() => (status.textContent = ""), 2000);
    });
  }
}
