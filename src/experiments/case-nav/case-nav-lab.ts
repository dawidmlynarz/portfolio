/**
 * Case-study navigation playground (CaseNavLab, previews only).
 * - Switcher: ?nav=<option> or the session's last pick shows one option; the rest stay hidden.
 *   Picking swaps in place (no reload) and updates the URL, so a link shares the option.
 * - Index: the hovered row's cover follows the pointer.
 * - Filmstrip: starts at the case study you're reading; arrows page through it.
 * - Remote: ← / → keys, and a burst of static before the page changes.
 */
const KEY = "case-nav";
const OPTIONS = ["current", "split", "pull", "index", "film", "remote", "stories"];
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
let filmStarted = false;

const lab = document.querySelector<HTMLElement>("[data-case-nav-lab]");
const switches = [...document.querySelectorAll<HTMLElement>("[data-case-nav-switch]")];

function stored() {
  try {
    return sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
}

function show(option: string) {
  if (!lab) return;
  lab.querySelectorAll<HTMLElement>("[data-case-nav-option]").forEach((el) => {
    el.hidden = el.dataset.caseNavOption !== option;
  });
  document.querySelectorAll<HTMLElement>("[data-case-nav-pick]").forEach((link) => {
    if (link.dataset.caseNavPick === option) link.setAttribute("aria-current", "true");
    else link.removeAttribute("aria-current");
  });
  try {
    sessionStorage.setItem(KEY, option);
  } catch {
    /* private mode: the pick lasts this page only */
  }
  if (option === "film") startFilm();
}

if (lab) {
  // The top switcher sits above the case study's header.
  const top = switches.find((el) => el.classList.contains("case-nav-lab__switch--top"));
  const article = document.querySelector("main .case-study");
  if (top && article) {
    article.before(top);
    top.hidden = false;
  }

  const param = new URLSearchParams(location.search).get("nav");
  const initial = [param, stored()].find((o) => o && OPTIONS.includes(o)) ?? "current";
  show(initial);

  document.addEventListener("click", (event) => {
    const link = (event.target as Element).closest<HTMLAnchorElement>("[data-case-nav-pick]");
    if (!link || event.metaKey || event.ctrlKey || event.shiftKey) return;
    event.preventDefault();
    const option = link.dataset.caseNavPick!;
    const url = new URL(location.href);
    url.searchParams.set("nav", option);
    history.replaceState(history.state, "", url);
    show(option);
  });

  setupIndex();
  setupFilm();
  setupRemote();
}

/* ---------- Index: a cover that follows the pointer ---------- */
function setupIndex() {
  const frame = lab!.querySelector<HTMLElement>("[data-cn-preview-frame]");
  const list = lab!.querySelector<HTMLElement>(".cn-index__list");
  if (!frame || !list) return;
  const images = [...frame.querySelectorAll<HTMLElement>("[data-cn-preview-img]")];

  // Beside the pointer, on whichever side has room.
  list.addEventListener("pointermove", (event) => {
    const gap = 32;
    const width = frame.offsetWidth;
    const x =
      event.clientX + gap + width < innerWidth ? event.clientX + gap : event.clientX - gap - width;
    frame.style.setProperty("--cn-x", `${x}px`);
    frame.style.setProperty("--cn-y", `${event.clientY}px`);
  });
  list.addEventListener("pointerover", (event) => {
    const row = (event.target as Element).closest<HTMLElement>("[data-cn-preview]");
    if (!row) return;
    const n = row.dataset.cnPreview;
    images.forEach((img) => img.toggleAttribute("data-shown", img.dataset.cnPreviewImg === n));
    frame.setAttribute("data-active", "");
  });
  list.addEventListener("pointerleave", () => frame.removeAttribute("data-active"));
}

/* ---------- Filmstrip ---------- */
function startFilm() {
  const track = lab?.querySelector<HTMLElement>("[data-cn-film-track]");
  const current = track?.querySelector<HTMLElement>("[data-cn-film-current]");
  if (!track || !current || filmStarted) return;
  filmStarted = true;
  requestAnimationFrame(() => {
    track.scrollLeft = current.offsetLeft - track.offsetLeft;
  });
}

function setupFilm() {
  const track = lab!.querySelector<HTMLElement>("[data-cn-film-track]");
  if (!track) return;
  const buttons = [...lab!.querySelectorAll<HTMLButtonElement>("[data-cn-film]")];
  const update = () => {
    const max = track.scrollWidth - track.clientWidth - 1;
    buttons.forEach((button) => {
      button.disabled =
        button.dataset.cnFilm === "prev" ? track.scrollLeft <= 0 : track.scrollLeft >= max;
    });
  };
  buttons.forEach((button) =>
    button.addEventListener("click", () => {
      const step = track.clientWidth * 0.8 * (button.dataset.cnFilm === "prev" ? -1 : 1);
      track.scrollBy({ left: step, behavior: reduced.matches ? "auto" : "smooth" });
    }),
  );
  track.addEventListener("scroll", update, { passive: true });
  update();
}

/* ---------- Remote: arrow keys and the channel-change static ---------- */
function setupRemote() {
  const remote = lab!.querySelector<HTMLElement>('[data-case-nav-option="remote"]');
  const staticEl = lab!.querySelector<HTMLElement>("[data-cn-static]");
  if (!remote || !staticEl) return;

  const go = (href: string) => {
    if (reduced.matches) {
      location.href = href;
      return;
    }
    staticEl.hidden = false;
    setTimeout(() => (location.href = href), 240);
  };

  remote.addEventListener("click", (event) => {
    const link = (event.target as Element).closest<HTMLAnchorElement>("[data-cn-remote]");
    if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
    event.preventDefault();
    go(link.href);
  });

  document.addEventListener("keydown", (event) => {
    if (remote.hidden || event.altKey || event.metaKey || event.ctrlKey || event.shiftKey) return;
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    const target = event.target as HTMLElement;
    if (target.closest("input, textarea, select, [contenteditable], .cn-film__track")) return;
    const dir = event.key === "ArrowLeft" ? "prev" : "next";
    const link = remote.querySelector<HTMLAnchorElement>(`[data-cn-remote="${dir}"]`);
    if (link) go(link.href);
  });

  // Coming back with the back button restores the page from the cache, static and all.
  addEventListener("pageshow", () => (staticEl.hidden = true));
}

export {};
