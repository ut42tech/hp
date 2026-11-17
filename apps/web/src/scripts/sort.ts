import { nextOrder, type SortOrder } from "../lib/works";

// The list is rendered newest first; flipping the order reverses it in place.
export function initSortButtons(root: ParentNode): void {
  for (const button of root.querySelectorAll<HTMLButtonElement>("[data-sort-list]")) {
    button.addEventListener("click", () => {
      const list = document.getElementById(button.dataset.sortList ?? "");
      if (!list) return;
      list.append(...[...list.children].reverse());
      const order = nextOrder(button.dataset.order as SortOrder);
      button.dataset.order = order;
      const label = button.querySelector("[data-sort-label]");
      if (label)
        label.textContent =
          button.dataset[order === "newest" ? "labelNewest" : "labelOldest"] ?? "";
    });
  }
}
