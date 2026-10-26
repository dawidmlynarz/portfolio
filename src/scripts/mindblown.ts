/**
 * <mind-blown>: the About page hero (see src/components/blocks/Mindblown.astro).
 *
 * Ported from the "Mindblown About" prototype with the same motion. Changes from the prototype:
 * - Everything is scoped to the element; no ids, no global styles.
 * - Cards and dialog content are rendered by Astro from src/lib/thoughts.ts, not built here.
 * - The popover is a native <dialog> (focus trap, Esc, focus return come for free).
 * - init/destroy: every GSAP tween runs inside a gsap.context() that is reverted, and every
 *   listener is tied to an AbortController, when the element leaves the page.
 * - Colours are read from the theme tokens at the moment they are needed (confetti), so it
 *   follows light and dark.
 */
import { gsap } from "gsap";

type State = "closed" | "busy" | "open";
type Card = HTMLButtonElement & { _in: HTMLElement; _dragged?: boolean };

/** Card landing spots on wide screens, as fractions of the stage (centre of the card). */
const SLOTS_WIDE: [number, number][] = [
  [0.1, 0.17], [0.29, 0.12], [0.5, 0.1], [0.71, 0.12], [0.9, 0.17], [0.11, 0.37], [0.27, 0.25],
  [0.71, 0.3], [0.89, 0.37], [0.24, 0.5], [0.76, 0.5], [0.11, 0.62], [0.89, 0.62], [0.13, 0.8],
]; // prettier-ignore
/** Below 62em: 3 columns; the second number is the row. */
const SLOTS_NARROW: [number, number][] = [
  [0.19, 0], [0.5, 0], [0.81, 0], [0.19, 1], [0.5, 1], [0.81, 1], [0.19, 2], [0.5, 2], [0.81, 2],
  [0.19, 3], [0.5, 3], [0.81, 3], [0.3, 4], [0.7, 4],
]; // prettier-ignore
const NARROW_TOP = 24; // px from the top of the stage to the first row's centre
const NARROW_GAP = 14; // px between rows
const TINTS = ["pink", "blue", "green", "orange", "violet", "cyan", "yellow"];
const EYES: [number, number][] = [
  [60, 56],
  [84, 56],
];

function init(root: HTMLElement) {
  const $ = <T extends Element = HTMLElement>(sel: string) => root.querySelector<T>(sel)!;
  const stage = $(".mindblown__stage");
  const headPos = $(".mindblown__head-pos");
  const rig = $(".mindblown__rig");
  const head = $(".mindblown__head");
  const base = $(".mindblown__layer--base");
  const lid = $(".mindblown__layer--lid");
  const hole = $(".mindblown__hole");
  const brain = $<SVGSVGElement>(".mindblown__brain");
  const scissors = $<SVGSVGElement>(".mindblown__scissors");
  const dash = $(".mindblown__dash");
  const note = $(".mindblown__note--open");
  const noteClose = $(".mindblown__note--close");
  const bubble = $(".mindblown__bubble");
  const tip = $(".mindblown__tip");
  const cursor = $(".mindblown__cursor");
  const canvas = $<HTMLCanvasElement>(".mindblown__confetti");
  const dialog = $<HTMLDialogElement>(".mindblown__dialog");
  const cards = [...root.querySelectorAll<Card>(".mindblown__card")];
  cards.forEach((c) => (c._in = c.firstElementChild as HTMLElement));

  const abort = new AbortController();
  const { signal } = abort;
  const on = <K extends keyof HTMLElementEventMap>(
    el: EventTarget,
    type: K,
    fn: (e: HTMLElementEventMap[K]) => void,
    opts: AddEventListenerOptions = {},
  ) => el.addEventListener(type, fn as EventListener, { ...opts, signal });

  const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const T = (d: number) => (RM ? 0.01 : d);
  const narrowMQ = matchMedia("(width < 62em)");
  const narrow = () => narrowMQ.matches;

  let state: State = "closed";
  let face = "rest";
  let floats: gsap.core.Tween[] = [];
  let idle: gsap.core.Tween | null = null;
  let popFrom: Card | null = null;
  let popOpen = false;
  let confettiRaf = 0;
  let lookRaf = 0;
  let resizeTimer = 0;

  // Every tween is created inside this context (directly or through run()), so revert() undoes all.
  const ctx = gsap.context(() => {});
  const run = (fn: () => void) => ctx.add(fn);

  /* ---------- set up ---------- */
  head.setAttribute("role", "button");
  head.tabIndex = 0;
  head.setAttribute("aria-expanded", "false");
  if (matchMedia("(pointer: coarse)").matches) $(".mindblown__verb").textContent = "tap";
  root.classList.add("mindblown--ready");

  run(() => {
    gsap.set(brain, { yPercent: 100, translate: "none" });
    gsap.from(headPos, { yPercent: 40, duration: T(1), ease: "back.out(1.4)", delay: 0.1 });
    gsap.from(note, {
      scale: 0,
      rotation: -30,
      duration: T(0.6),
      ease: "back.out(2.5)",
      delay: 0.8,
    });
    idle = RM
      ? null
      : gsap.to(rig, { y: -5, duration: 1.8, yoyo: true, repeat: -1, ease: "sine.inOut" });
  });

  /* ---------- helpers ---------- */
  function setFace(name: "rest" | "shock" | "super", squash = true) {
    if (name === face) return;
    face = name;
    head.classList.toggle("mindblown__head--shock", name === "shock");
    head.classList.toggle("mindblown__head--super", name === "super");
    if (squash && !RM)
      run(() =>
        gsap.fromTo(
          [base, lid],
          { scaleY: 1.035, scaleX: 0.975, transformOrigin: "50% 100%" },
          { scaleY: 1, scaleX: 1, duration: 0.45, ease: "elastic.out(1,.4)", overwrite: "auto" },
        ),
      );
  }

  const rel = (el: Element) => {
    const s = stage.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return { x: r.left - s.left + r.width / 2, y: r.top - s.top + r.height / 2 };
  };

  function target(card: Card, i: number) {
    const W = stage.clientWidth;
    const H = stage.clientHeight;
    const w = card.offsetWidth;
    const h = card.offsetHeight;
    const slots = narrow() ? SLOTS_NARROW : SLOTS_WIDE;
    const [sx, sy] = slots[i % slots.length]!;
    const cy = narrow()
      ? NARROW_TOP + h / 2 + sy * (h + NARROW_GAP) + (sx === 0.5 ? -6 : 0)
      : sy * H;
    return {
      x: gsap.utils.clamp(8, W - w - 8, sx * W - w / 2),
      y: gsap.utils.clamp(8, H - h - 8, cy - h / 2),
    };
  }

  function say(text: string, delay = 0) {
    bubble.textContent = text;
    gsap
      .timeline({ delay })
      .fromTo(
        bubble,
        { scale: 0, opacity: 1, rotation: -10, transformOrigin: "100% 100%" },
        { scale: 1, rotation: 0, duration: T(0.35), ease: "back.out(3)" },
      )
      .to(bubble, { opacity: 0, y: -10, duration: T(0.3) }, "+=0.9")
      .set(bubble, { y: 0 });
  }

  function shake() {
    if (RM) return;
    gsap.fromTo(
      stage,
      { x: 0 },
      { x: "random(-7,7)", duration: 0.05, repeat: 7, yoyo: true, ease: "none", clearProps: "x" },
    );
  }

  /* ---------- open / close ---------- */
  function openHead() {
    if (state !== "closed") return;
    state = "busy";
    head.setAttribute("aria-expanded", "true");
    head.setAttribute("aria-label", "Close my head");
    idle?.pause();
    gsap.killTweensOf(note);
    root.classList.add("mindblown--open");
    rig.classList.add("mindblown__rig--armed");
    setFace("super");
    const o = rel(hole);
    const tl = gsap.timeline({
      onComplete() {
        state = "open";
        run(startFloats);
        cards.forEach((c) => (c.tabIndex = 0));
      },
    });
    // 1. The scissors cut along the line; the head stays in one piece until they leave.
    tl.to(note, { scale: 0, rotation: 20, duration: T(0.25), ease: "back.in(2)" }, 0)
      .set(scissors, { transition: "none" }, 0)
      .fromTo(scissors, { opacity: 1, x: 0, rotation: 0 }, { opacity: 1, duration: 0.01 }, 0)
      .add(() => scissors.classList.add("mindblown__scissors--snip"), 0)
      .to(scissors, { left: "100%", duration: T(0.7), ease: "power1.inOut" }, 0.05)
      .to(
        scissors,
        { y: -3, duration: 0.07, repeat: RM ? 0 : 9, yoyo: true, ease: "sine.inOut" },
        0.05,
      )
      .add(() => scissors.classList.remove("mindblown__scissors--snip"))
      .to(scissors, { x: 60, rotation: 25, opacity: 0, duration: T(0.3), ease: "power2.in" })
      .to(dash, { opacity: 0, duration: T(0.12) }, "<")
      // 2. The lid pops.
      .add("pop")
      .to(
        lid,
        { yPercent: -24, xPercent: -6, rotation: -18, duration: T(1.1), ease: "elastic.out(1,.5)" },
        "pop",
      )
      .to(hole, { scaleY: 1, duration: T(0.5), ease: "back.out(2.5)" }, "pop")
      .add(() => run(() => (shake(), confetti(o.x, o.y), say("ow."))), "pop")
      .fromTo(
        brain,
        { yPercent: 100 },
        { yPercent: 6, duration: T(0.7), ease: "back.out(2.2)", onUpdate: look },
        `pop+=${T(0.9)}`,
      );
    // 3. The thoughts erupt.
    const P = tl.labels.pop!;
    cards.forEach((c, i) => {
      const w = c.offsetWidth;
      const h = c.offsetHeight;
      const t = target(c, i);
      const sx = o.x - w / 2;
      const sy = o.y - h / 2;
      const at = P + (RM ? 0 : 0.05 + i * 0.06);
      const apex = Math.min(t.y, sy) - gsap.utils.random(70, 170);
      gsap.set(c, {
        x: sx,
        y: sy,
        scale: 0.15,
        rotation: gsap.utils.random(-90, 90),
        autoAlpha: 0,
      });
      tl.to(c, { autoAlpha: 1, duration: 0.05 }, at)
        .to(c, { x: t.x, duration: T(1.05), ease: "power2.out" }, at)
        .to(c, { y: apex, duration: T(0.42), ease: "power2.out" }, at)
        .to(c, { y: t.y, duration: T(0.7), ease: "bounce.out" }, at + T(0.42))
        .to(c, { scale: 1, duration: T(0.5), ease: "back.out(2)" }, at)
        .to(c, { rotation: gsap.utils.random(-7, 7), duration: T(1.1), ease: "power3.out" }, at);
    });
    tl.add(() => rig.classList.remove("mindblown__rig--armed"), "-=.5")
      .to(tip, { opacity: 1, duration: T(0.4) }, "-=.4")
      .fromTo(
        noteClose,
        { autoAlpha: 1, scale: 0, rotation: 20 },
        { scale: 1, rotation: 0, duration: T(0.5), ease: "back.out(2.5)" },
        "<",
      );
  }

  function closeHead() {
    if (state !== "open") return;
    state = "busy";
    stopFloats();
    closePop(true);
    head.setAttribute("aria-expanded", "false");
    head.setAttribute("aria-label", "Open my head to see what’s inside");
    cards.forEach((c) => (c.tabIndex = -1));
    const o = rel(hole);
    const tl = gsap.timeline({
      onComplete() {
        state = "closed";
        idle?.resume();
      },
    });
    tl.to(tip, { autoAlpha: 0, duration: T(0.2) }, 0)
      .to(noteClose, { scale: 0, rotation: -20, duration: T(0.25), ease: "back.in(2)" }, 0)
      .set(noteClose, { autoAlpha: 0 });
    cards
      .slice()
      .reverse()
      .forEach((c, i) => {
        const w = c.offsetWidth;
        const h = c.offsetHeight;
        tl.to(
          c,
          {
            x: o.x - w / 2,
            y: o.y - h / 2,
            scale: 0.1,
            rotation: "+=200",
            duration: T(0.55),
            ease: "power3.in",
          },
          RM ? 0 : i * 0.035,
        ).set(c, { autoAlpha: 0 });
      });
    tl.add(() => root.classList.remove("mindblown--open"), RM ? 0 : 0.3)
      .to(brain, { yPercent: 100, duration: T(0.3), ease: "power2.in" }, ">-.3")
      .to(
        lid,
        { y: 0, yPercent: 0, xPercent: 0, rotation: 0, duration: T(0.45), ease: "bounce.out" },
        ">-0.05",
      )
      .to(hole, { scaleY: 0, duration: T(0.15) }, "<+.12")
      .add(() => run(() => (shake(), setFace("shock"))), "<+.1")
      .add(() => run(() => (setFace("rest"), say("much better."))), `+=${T(0.45)}`)
      .set(scissors, { left: 0, x: 0, rotation: 0, clearProps: "opacity,transition,transform" })
      .set(dash, { clearProps: "opacity" })
      .to(note, { scale: 1, rotation: 0, duration: T(0.5), ease: "back.out(2.5)" });
  }

  function startFloats() {
    if (RM) return;
    floats = cards.map((c) =>
      gsap.to(c._in, {
        y: "random(-9,9)",
        rotation: "random(-3,3)",
        duration: "random(1.6,2.6)",
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
      }),
    );
  }

  function stopFloats() {
    floats.forEach((f) => f.kill());
    floats = [];
    gsap.to(
      cards.map((c) => c._in),
      { y: 0, rotation: 0, duration: 0.2 },
    );
  }

  /* ---------- head ---------- */
  on(head, "click", () => run(() => (state === "closed" ? openHead() : closeHead())));
  on(head, "keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      head.click();
    }
  });
  on(head, "pointerenter", (e) => {
    if (state !== "closed" || e.pointerType !== "mouse") return;
    rig.classList.add("mindblown__rig--armed");
    run(() => {
      setFace("shock");
      gsap.to(lid, {
        y: -8,
        rotation: -2,
        duration: T(0.4),
        ease: "back.out(3)",
        overwrite: "auto",
      });
    });
  });
  on(head, "pointerleave", () => {
    if (state !== "closed") return;
    rig.classList.remove("mindblown__rig--armed");
    run(() => {
      setFace("rest");
      gsap.to(lid, {
        y: 0,
        rotation: 0,
        duration: T(0.5),
        ease: "elastic.out(1,.4)",
        overwrite: "auto",
      });
    });
  });

  /* ---------- cards: drag + click ---------- */
  cards.forEach((c) => {
    let sx = 0;
    let sy = 0;
    let px = 0;
    let py = 0;
    let lastX = 0;
    let moved = false;
    on(c, "pointerdown", (e) => {
      if (state !== "open") return;
      c.setPointerCapture(e.pointerId);
      moved = false;
      sx = Number(gsap.getProperty(c, "x"));
      sy = Number(gsap.getProperty(c, "y"));
      px = lastX = e.clientX;
      py = e.clientY;
      run(() => gsap.to(c, { scale: 1.08, duration: 0.2, overwrite: "auto" }));
      c.style.zIndex = "5";
    });
    on(c, "pointermove", (e) => {
      if (!c.hasPointerCapture(e.pointerId)) return;
      const dx = e.clientX - px;
      const dy = e.clientY - py;
      if (!moved && Math.hypot(dx, dy) > 6) moved = true;
      if (!moved) return;
      const W = stage.clientWidth;
      const H = stage.clientHeight;
      run(() => {
        gsap.set(c, {
          x: gsap.utils.clamp(0, W - c.offsetWidth, sx + dx),
          y: gsap.utils.clamp(0, H - c.offsetHeight, sy + dy),
        });
        gsap.to(c, {
          rotation: gsap.utils.clamp(-25, 25, (e.clientX - lastX) * 1.5),
          duration: 0.3,
          overwrite: "auto",
        });
      });
      lastX = e.clientX;
    });
    const end = (e: PointerEvent) => {
      if (!c.hasPointerCapture(e.pointerId)) return;
      c.releasePointerCapture(e.pointerId);
      c.style.zIndex = "";
      run(() =>
        gsap.to(c, {
          scale: 1,
          rotation: gsap.utils.random(-7, 7),
          duration: 0.6,
          ease: "elastic.out(1,.4)",
        }),
      );
      c._dragged = moved;
    };
    on(c, "pointerup", end);
    on(c, "pointercancel", end);
    on(c, "click", () => {
      if (c._dragged) {
        c._dragged = false;
        return;
      }
      if (state === "open") run(() => openPop(c));
    });
  });

  /* ---------- dialog ---------- */
  const dialogIcon = $(".mindblown__icon--large");
  const dialogKicker = $(".mindblown__kicker");
  const dialogTitle = $(".mindblown__dialog-title");
  const dialogBody = $(".mindblown__dialog-body");

  function openPop(card: Card) {
    const i = Number(card.dataset.index);
    const template = $<HTMLTemplateElement>(`template[data-thought="${i}"]`);
    popFrom = card;
    const styles = getComputedStyle(card);
    dialog.style.setProperty("--card-fill", styles.getPropertyValue("--card-fill"));
    dialog.style.setProperty("--card-text", styles.getPropertyValue("--card-text"));
    dialogIcon.replaceChildren(card.querySelector(".mindblown__icon svg")!.cloneNode(true));
    dialogKicker.textContent = card.querySelector(".mindblown__label-tag")!.textContent;
    dialogTitle.textContent = card.getAttribute("aria-label")!.replace(/^[^:]*:\s*/, "");
    dialogBody.replaceChildren(template.content.cloneNode(true));

    dialog.showModal();
    popOpen = true;
    cursor.classList.remove("mindblown__cursor--on");
    const r = card.getBoundingClientRect();
    const p = dialog.getBoundingClientRect();
    const ox = r.left + r.width / 2 - p.left;
    const oy = r.top + r.height / 2 - p.top;
    const radius = Math.hypot(p.width, p.height) * 1.1;
    gsap.killTweensOf(dialog);
    gsap.fromTo(
      dialog,
      { clipPath: `circle(0px at ${ox}px ${oy}px)` },
      {
        clipPath: `circle(${radius}px at ${ox}px ${oy}px)`,
        duration: T(0.6),
        ease: "power3.inOut",
        clearProps: "clipPath",
      },
    );
    gsap.from(dialog.querySelectorAll(".mindblown__dialog-head > *, .mindblown__dialog-body > *"), {
      y: 24,
      opacity: 0,
      duration: T(0.5),
      ease: "back.out(2)",
      stagger: 0.05,
      delay: T(0.2),
    });
    gsap.fromTo(
      card._in,
      { scaleX: 1.15, scaleY: 0.85 },
      { scaleX: 1, scaleY: 1, duration: 0.6, ease: "elastic.out(1,.35)" },
    );
  }

  function closePop(instant = false) {
    if (!popOpen) return;
    popOpen = false;
    const from = popFrom;
    if (instant || RM || !from) {
      dialog.close();
      return;
    }
    const p = dialog.getBoundingClientRect();
    const r = from.getBoundingClientRect();
    const ox = r.left + r.width / 2 - p.left;
    const oy = r.top + r.height / 2 - p.top;
    gsap.fromTo(
      dialog,
      { clipPath: `circle(${Math.hypot(p.width, p.height) * 1.1}px at ${ox}px ${oy}px)` },
      {
        clipPath: `circle(0px at ${ox}px ${oy}px)`,
        duration: 0.45,
        ease: "power3.in",
        onComplete() {
          dialog.close();
          gsap.set(dialog, { clearProps: "clipPath" });
        },
      },
    );
  }

  on($(".mindblown__close"), "click", () => run(() => closePop()));
  // A click on the backdrop lands on the <dialog> itself.
  on(dialog, "click", (e) => e.target === dialog && run(() => closePop()));
  on(dialog, "cancel", (e) => {
    e.preventDefault();
    run(() => closePop());
  });
  on(dialog, "click", (e) => {
    const copy = (e.target as Element).closest<HTMLButtonElement>(".mindblown__copy");
    if (!copy) return;
    navigator.clipboard?.writeText(copy.dataset.email ?? "").then(() => {
      copy.textContent = "Copied!";
      run(() =>
        gsap.fromTo(copy, { scale: 0.8 }, { scale: 1, ease: "back.out(4)", duration: 0.4 }),
      );
    });
  });
  on(dialog, "close", () => (popOpen = false));
  on(window, "keydown", (e) => {
    if (e.key === "Escape" && !popOpen && state === "open") run(closeHead);
  });

  /* ---------- confetti (colours from the current theme) ---------- */
  const ctx2d = canvas.getContext("2d")!;
  let parts: {
    x: number; y: number; vx: number; vy: number; w: number; h: number;
    r: number; vr: number; c: string; life: number;
  }[] = []; // prettier-ignore
  let ink = "";

  function themeColors() {
    const probe = document.createElement("span");
    root.append(probe);
    const read = (token: string) => {
      probe.style.color = `var(${token})`;
      return getComputedStyle(probe).color;
    };
    const colors = TINTS.map((t) => read(`--color-tint-${t}`)).concat(read("--color-bg"));
    ink = read("--color-text");
    probe.remove();
    return colors;
  }

  function confetti(x: number, y: number) {
    if (RM) return;
    const colors = themeColors();
    const dpr = Math.min(2, devicePixelRatio || 1);
    canvas.width = stage.clientWidth * dpr;
    canvas.height = stage.clientHeight * dpr;
    ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);
    for (let i = 0; i < 90; i++) {
      const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.2;
      const v = 6 + Math.random() * 11;
      parts.push({
        x,
        y,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v,
        w: 6 + Math.random() * 10,
        h: 4 + Math.random() * 8,
        r: Math.random() * 6,
        vr: (Math.random() - 0.5) * 0.4,
        c: colors[i % colors.length]!,
        life: 1,
      });
    }
    if (!confettiRaf) confettiRaf = requestAnimationFrame(tick);
  }

  function tick() {
    ctx2d.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of parts) {
      p.vy += 0.32;
      p.vx *= 0.985;
      p.x += p.vx;
      p.y += p.vy;
      p.r += p.vr;
      p.life -= 0.006;
      ctx2d.save();
      ctx2d.translate(p.x, p.y);
      ctx2d.rotate(p.r);
      ctx2d.globalAlpha = Math.max(0, p.life);
      ctx2d.fillStyle = p.c;
      ctx2d.strokeStyle = ink;
      ctx2d.lineWidth = 2;
      ctx2d.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx2d.strokeRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx2d.restore();
    }
    parts = parts.filter((p) => p.life > 0 && p.y < stage.clientHeight + 40);
    confettiRaf = parts.length ? requestAnimationFrame(tick) : 0;
  }

  /* ---------- the brain's eyes follow the pointer ---------- */
  const pupils = [...brain.querySelectorAll(".mindblown__pupil")];
  let lookX = innerWidth / 2;
  let lookY = 0;
  function look() {
    lookRaf = 0;
    const r = brain.getBoundingClientRect();
    if (!r.width) return;
    const k = r.width / 140;
    pupils.forEach((p, i) => {
      const [cx, cy] = EYES[i]!;
      const dx = lookX - (r.left + cx * k);
      const dy = lookY - (r.top + cy * k);
      const d = Math.hypot(dx, dy) || 1;
      const m = Math.min(4.5, d / 30);
      p.setAttribute(
        "transform",
        `translate(${((dx / d) * m).toFixed(2)} ${((dy / d) * m * 1.1).toFixed(2)})`,
      );
    });
  }
  on(
    window,
    "pointermove",
    (e) => {
      lookX = e.clientX;
      lookY = e.clientY;
      if (!lookRaf && state !== "closed") lookRaf = requestAnimationFrame(look);
    },
    { passive: true },
  );

  /* ---------- cursor label + parallax (mouse only) ---------- */
  if (matchMedia("(pointer: fine)").matches) {
    run(() => {
      const qx = gsap.quickTo(cursor, "left", { duration: 0.25, ease: "power3" });
      const qy = gsap.quickTo(cursor, "top", { duration: 0.25, ease: "power3" });
      const hx = RM ? null : gsap.quickTo(rig, "x", { duration: 1, ease: "power3" });
      on(window, "pointermove", (e) => {
        qx(e.clientX);
        qy(e.clientY);
        const t = e.target instanceof Element ? e.target : null;
        let label = "";
        if (t?.closest(".mindblown__card")) label = "open · drag";
        else if (t?.closest(".mindblown__head") === head)
          label = state === "closed" ? "snip snip" : "close it";
        if (label) cursor.textContent = label;
        cursor.classList.toggle("mindblown__cursor--on", !!label && !popOpen && root.contains(t));
      });
      if (hx) on(stage, "pointermove", (e) => hx((e.clientX / innerWidth - 0.5) * 14));
    });
  }

  /* ---------- keep cards in their slots on resize ---------- */
  on(window, "resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      if (state !== "open") return;
      run(() =>
        cards.forEach((c, i) => {
          const t = target(c, i);
          gsap.to(c, { x: t.x, y: t.y, duration: 0.6, ease: "power3.out" });
        }),
      );
    }, 150);
  });

  return function destroy() {
    abort.abort();
    clearTimeout(resizeTimer);
    cancelAnimationFrame(confettiRaf);
    cancelAnimationFrame(lookRaf);
    if (dialog.open) dialog.close();
    ctx.revert();
    parts = [];
    root.classList.remove("mindblown--ready", "mindblown--open");
    rig.classList.remove("mindblown__rig--armed");
    head.classList.remove("mindblown__head--shock", "mindblown__head--super");
    scissors.classList.remove("mindblown__scissors--snip");
    cursor.classList.remove("mindblown__cursor--on");
    cards.forEach((c) => (c.tabIndex = -1));
    for (const name of ["role", "tabindex", "aria-expanded"]) head.removeAttribute(name);
    head.setAttribute("aria-label", "Open my head to see what’s inside");
  };
}

class Mindblown extends HTMLElement {
  #destroy: (() => void) | null = null;

  connectedCallback() {
    this.#destroy?.();
    this.#destroy = init(this);
  }

  disconnectedCallback() {
    this.#destroy?.();
    this.#destroy = null;
  }
}

if (!customElements.get("mind-blown")) customElements.define("mind-blown", Mindblown);
