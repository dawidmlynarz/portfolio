/**
 * Card lab behaviour (/playground/cards): the list option's sticky preview shows the cover of
 * whichever row is hovered or holds focus. Without JS the first cover stays.
 */
for (const wrap of document.querySelectorAll<HTMLElement>("[data-preview]")) {
  const covers = [...wrap.querySelectorAll<HTMLElement>(".card-lab__preview-cover")];
  const show = (index: number) =>
    covers.forEach((cover, i) => cover.toggleAttribute("data-active", i === index));

  for (const row of wrap.querySelectorAll<HTMLElement>("[data-preview-index]")) {
    const index = Number(row.dataset.previewIndex);
    row.addEventListener("pointerenter", () => show(index));
    row.addEventListener("focusin", () => show(index));
  }
}
