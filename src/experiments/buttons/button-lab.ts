/**
 * Button lab behaviour (/playground/buttons). Two small jobs:
 * - Tap to replay: specimen buttons go nowhere; a tap or click re-runs that button's hover, so touch
 *   screens can see each direction.
 * - Reduced motion preview: a switch that previews what reduced-motion visitors get.
 */
const buttonLab = document.querySelector<HTMLElement>("[data-button-lab]");

if (buttonLab) {
  buttonLab.addEventListener("click", (event) => {
    const button = (event.target as Element).closest<HTMLElement>(".lab-btn");
    if (!button) return;
    event.preventDefault();
    // Restart the CSS animations: drop the state, force a style flush, set it again.
    button.removeAttribute("data-hot");
    void button.offsetWidth;
    button.setAttribute("data-hot", "");
    clearTimeout(Number(button.dataset.hotTimer));
    button.dataset.hotTimer = String(setTimeout(() => button.removeAttribute("data-hot"), 1600));
  });

  buttonLab
    .querySelector<HTMLInputElement>("[data-reduced-switch]")
    ?.addEventListener("change", (e) => {
      buttonLab.toggleAttribute("data-reduced", (e.target as HTMLInputElement).checked);
    });
}
