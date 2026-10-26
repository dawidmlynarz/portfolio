/**
 * Mindblown About: behaviour. `init(root)` wires one [data-mindblown] section and returns
 * `destroy()`, which kills every tween, the tails ticker, the window listeners and the confetti
 * frame, and removes the cards it created. Copy lives in content.ts.
 *
 * States: closed -> busy (animating, clicks ignored) -> open -> busy -> closed.
 */
import { gsap } from "gsap";
import { BELT, DESKTOP_COUNT, ICONS, ITEMS, MOBILE_COUNT, type IconName } from "./content";

type Card = HTMLButtonElement & {
  _i: number;
  _in: HTMLElement;
  _tails: HTMLElement[];
  _dragged?: boolean;
};

const svg = (k: IconName) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[k]}</svg>`;
const esc = (s: string) =>
  String(s).replace(
    /[&<>"]/g,
    (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[m] as string,
  );

export function init(root: HTMLElement): () => void {
  if (root.dataset.mindblownReady) return () => {};
  root.dataset.mindblownReady = "";

  const q = <T extends Element = HTMLElement>(sel: string) =>
    root.querySelector<T & Element>(`.mindblown__${sel}`) as T;
  const stage = q("stage"),
    head = q("head"),
    lid = q("layer--lid"),
    hole = q("hole"),
    brain = q<SVGSVGElement>("brain"),
    cardsEl = q("cards"),
    scissors = q<SVGSVGElement>("scissors"),
    dash = q("dash"),
    rig = q("rig"),
    headPos = q("head-pos"),
    note = q("note"),
    bubble = q("bubble"),
    tip = q("tip"),
    noteClose = q("note-close"),
    cursor = q("cursor"),
    canvas = q<HTMLCanvasElement>("confetti"),
    pop = q("pop"),
    scrim = q("pop-scrim"),
    panel = q("pop-panel"),
    beltTrack = q("belt-track"),
    intro = root.querySelector<HTMLElement>(".mindblown__intro");
  const layers = root.querySelectorAll(".mindblown__layer");

  const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const T = (d: number) => (RM ? 0.01 : d);
  const abort = new AbortController();
  const on = { signal: abort.signal };
  const ctx = gsap.context(() => {}, root);
  const run = <R>(fn: () => R): R => {
    let out!: R;
    ctx.add(() => {
      out = fn();
    });
    return out;
  };

  if (matchMedia("(pointer:coarse)").matches) {
    const verb = root.querySelector("[data-close-verb]");
    if (verb) verb.textContent = "tap";
  }

  /* belt: rendered by Astro; keep it in sync with content.ts if this runs on stale markup */
  if (!beltTrack.children.length) {
    const beltTxt = BELT.map(
      (b) =>
        `<span class="mindblown__belt-item">${esc(b)}</span><span class="mindblown__belt-star">✶</span>`,
    ).join("");
    beltTrack.innerHTML = beltTxt + beltTxt;
  }

  /* ---------- expressions ---------- */
  let face = "rest";
  function setFace(name: "rest" | "shock" | "super", squash = true) {
    if (name === face) return;
    face = name;
    head.classList.toggle("mindblown__head--shock", name === "shock");
    head.classList.toggle("mindblown__head--super", name === "super");
    if (squash && !RM)
      run(() =>
        gsap.fromTo(
          layers,
          { scaleY: 1.035, scaleX: 0.975, transformOrigin: "50% 100%" },
          { scaleY: 1, scaleX: 1, duration: 0.45, ease: "elastic.out(1,.4)", overwrite: "auto" },
        ),
      );
  }

  /* ---------- cards ---------- */
  const narrow = () => stage.clientWidth < 1000;
  const cards: Card[] = ITEMS.map((it, i) => {
    const b = document.createElement("button") as Card;
    b.className = "mindblown__card";
    b.type = "button";
    b.tabIndex = -1;
    b.setAttribute("aria-label", `${it.label}: ${it.title}`);
    b.innerHTML = `<span class="mindblown__card-in"><span class="mindblown__icon">${svg(it.icon)}</span><span class="mindblown__label"><span class="mindblown__label-text" data-l="${esc(it.label)}" data-s="${esc(it.short)}">${esc(it.label)}</span><span class="mindblown__label-tag">${esc(it.tag)}</span></span></span>`;
    b._i = i;
    b._in = b.firstElementChild as HTMLElement;
    b._tails = ["t1", "t2"].map((t) => {
      const d = document.createElement("span");
      d.className = `mindblown__tail mindblown__tail--${t}`;
      cardsEl.prepend(d);
      return d;
    });
    cardsEl.appendChild(b);
    return b;
  });
  function labelSize() {
    for (const c of cards) {
      const b = c.querySelector<HTMLElement>(".mindblown__label-text")!;
      b.textContent = (narrow() ? b.dataset.s : b.dataset.l) ?? "";
    }
  }
  labelSize();

  /* ---------- intro ---------- */
  let idle: gsap.core.Tween | null = null;
  run(() => {
    gsap.set(brain, { yPercent: 130 });
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

  /* ---------- state ---------- */
  let state: "closed" | "busy" | "open" = "closed";
  let floats: gsap.core.Tween[] = [];
  const rel = (el: Element) => {
    const s = stage.getBoundingClientRect(),
      r = el.getBoundingClientRect();
    return { x: r.left - s.left + r.width / 2, y: r.top - s.top + r.height / 2 };
  };
  /* ---------- where the thoughts land (new random spots on every open) ---------- */
  type Box = { l: number; t: number; r: number; b: number };
  const box = (el: Element): Box => {
    const s = stage.getBoundingClientRect(),
      r = el.getBoundingClientRect();
    return { l: r.left - s.left, t: r.top - s.top, r: r.right - s.left, b: r.bottom - s.top };
  };
  const hits = (a: Box, b: Box) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t;
  const phone = () => stage.clientWidth < 720;
  let active: Card[] = cards;
  let shown = new Set<Card>(cards);
  let spots = new Map<Card, { x: number; y: number }>();
  /* a random handful of thoughts on every open */
  function pickActive() {
    active = gsap.utils.shuffle(cards.slice()).slice(0, phone() ? MOBILE_COUNT : DESKTOP_COUNT);
    shown = new Set(active);
  }
  function layout() {
    spots = new Map();
    const W = stage.clientWidth,
      H = stage.clientHeight;
    // Scatter around the head, clear of the face, the flying lid, the shoulders and the notes.
    // Start in a tight band around the head and widen it only if the thoughts don't fit.
    const hp = box(headPos),
      hw = hp.r - hp.l,
      hh = hp.b - hp.t,
      o = rel(hole);
    const note = {
      l: hp.l + noteClose.offsetLeft,
      t: hp.t + noteClose.offsetTop,
      r: hp.l + noteClose.offsetLeft + noteClose.offsetWidth,
      b: hp.t + noteClose.offsetTop + noteClose.offsetHeight,
    };
    const avoid: Box[] = [
      { l: hp.l + 0.22 * hw, r: hp.l + 0.7 * hw, t: o.y - 0.14 * hh, b: H },
      { l: hp.l - 0.05 * hw, r: hp.l + 0.43 * hw, t: o.y - 0.5 * hh, b: o.y - 0.06 * hh },
      { l: hp.l, r: hp.r, t: o.y + 0.33 * hh, b: H },
      note,
      box(tip),
    ];
    // clear of the nav (a floating pill on desktop, a 56px bar on phones); phones pack tighter
    const TOP = phone() ? 64 : 80,
      GAP = phone() ? 4 : 10,
      yMax = H - 16;
    for (let pass = 0; pass < 5; pass++) {
      const half = Math.min(W - 16, hw * (1.75 + pass * 0.3)) / 2,
        xMin = Math.max(8, o.x - half),
        xMax = Math.min(W - 8, o.x + half);
      const placed: Box[] = [];
      const next = new Map<Card, { x: number; y: number }>();
      for (const c of gsap.utils.shuffle(active.slice())) {
        const w = c.offsetWidth,
          h = c.offsetHeight;
        for (let k = 0; k < 400; k++) {
          const x = gsap.utils.random(xMin, Math.max(xMin, xMax - w)),
            y = gsap.utils.random(TOP, Math.max(TOP, yMax - h));
          const b = { l: x - GAP, t: y - GAP, r: x + w + GAP, b: y + h + GAP };
          if (avoid.some((a) => hits(a, b)) || placed.some((p) => hits(p, b))) continue;
          placed.push(b);
          next.set(c, { x, y });
          break;
        }
        // last pass: a thought that still has no room overlaps another thought, never the head
        if (!next.has(c) && pass === 4) {
          let best = { x: xMin, y: TOP },
            least = Infinity;
          for (let k = 0; k < 200; k++) {
            const x = gsap.utils.random(xMin, Math.max(xMin, xMax - w)),
              y = gsap.utils.random(TOP, Math.max(TOP, yMax - h));
            const b = { l: x, t: y, r: x + w, b: y + h };
            if (avoid.some((a) => hits(a, b))) continue;
            const n = placed.filter((p) => hits(p, b)).length;
            if (n < least) [best, least] = [{ x, y }, n];
          }
          placed.push({
            l: best.x - GAP,
            t: best.y - GAP,
            r: best.x + w + GAP,
            b: best.y + h + GAP,
          });
          next.set(c, best);
        }
      }
      if (next.size === active.length) {
        spots = next;
        return;
      }
    }
  }
  const target = (c: Card) => spots.get(c) ?? { x: 0, y: 0 };
  function say(text: string, delay = 0) {
    bubble.textContent = text;
    run(() =>
      gsap
        .timeline({ delay })
        .fromTo(
          bubble,
          { scale: 0, opacity: 1, rotation: -10, transformOrigin: "100% 100%" },
          { scale: 1, rotation: 0, duration: T(0.35), ease: "back.out(3)" },
        )
        .to(bubble, { opacity: 0, y: -10, duration: T(0.3) }, "+=0.9")
        .set(bubble, { y: 0 }),
    );
  }
  function shake() {
    if (RM) return;
    run(() =>
      gsap.fromTo(
        stage,
        { x: 0 },
        {
          x: "random(-7,7)",
          duration: 0.05,
          repeat: 7,
          yoyo: true,
          ease: "none",
          clearProps: "x",
        },
      ),
    );
  }

  function openHead() {
    if (state !== "closed") return;
    state = "busy";
    head.setAttribute("aria-expanded", "true");
    head.setAttribute("aria-label", "Close my head");
    idle?.pause();
    gsap.killTweensOf(note);
    rig.classList.add("mindblown__rig--armed");
    setFace("super");
    const o = rel(hole);
    pickActive();
    layout();
    run(() => {
      const tl = gsap.timeline({
        onComplete() {
          state = "open";
          startFloats();
          for (const c of active) c.tabIndex = 0;
        },
      });
      // the heading fades away to make room for the thoughts
      if (intro)
        tl.to(intro, { opacity: 0, y: -24, duration: T(0.6), ease: "power2.inOut" }, 0).set(intro, {
          pointerEvents: "none",
        });
      // 1. scissors cut along the line
      tl.to(note, { scale: 0, rotation: 20, duration: T(0.25), ease: "back.in(2)" }, 0)
        .set(scissors, { transition: "none" }, 0)
        .fromTo(scissors, { opacity: 1, x: 0, rotation: 0 }, { opacity: 1, duration: 0.01 }, 0)
        .add(() => scissors.classList.add("mindblown__scissors--snip"), 0)
        .to(scissors, { left: "100%", duration: T(0.7), ease: "power1.inOut" }, 0.05)
        .to(scissors, { y: -3, duration: T(0.07), repeat: 9, yoyo: true, ease: "sine.inOut" }, 0.05)
        .add(() => scissors.classList.remove("mindblown__scissors--snip"))
        .to(scissors, { x: 60, rotation: 25, opacity: 0, duration: T(0.3), ease: "power2.in" })
        .to(dash, { opacity: 0, duration: T(0.12) }, "<")
        // 2. lid pops
        .add("pop")
        .to(
          lid,
          {
            yPercent: -24,
            xPercent: -6,
            rotation: -18,
            duration: T(1.1),
            ease: "elastic.out(1,.5)",
          },
          "pop",
        )
        .to(hole, { scaleY: 1, duration: T(0.5), ease: "back.out(2.5)" }, "pop")
        .add(() => {
          shake();
          confetti(o.x, o.y);
          say("ow.");
        }, "pop")
        .fromTo(
          brain,
          { yPercent: 130 },
          { yPercent: 4, duration: T(0.7), ease: "back.out(2.2)", onUpdate: () => look() },
          "pop+=.9",
        );
      // 3. thoughts erupt
      const P = tl.labels.pop!;
      active.forEach((c, i) => {
        const w = c.offsetWidth,
          h = c.offsetHeight,
          t = target(c),
          sx = o.x - w / 2,
          sy = o.y - h / 2,
          at = P + (RM ? 0 : 0.05 + i * 0.06);
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
    });
  }

  function closeHead() {
    if (state !== "open") return;
    state = "busy";
    stopFloats();
    closePop(true);
    head.setAttribute("aria-expanded", "false");
    head.setAttribute("aria-label", "Open my head to see what's inside");
    for (const c of active) c.tabIndex = -1;
    const o = rel(hole);
    run(() => {
      const tl = gsap.timeline({
        onComplete() {
          state = "closed";
          idle?.resume();
        },
      });
      tl.to(tip, { autoAlpha: 0, duration: T(0.2) }, 0)
        .to(noteClose, { scale: 0, rotation: -20, duration: T(0.25), ease: "back.in(2)" }, 0)
        .set(noteClose, { autoAlpha: 0 });
      active
        .slice()
        .reverse()
        .forEach((c, i) => {
          const w = c.offsetWidth,
            h = c.offsetHeight;
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
      tl.to(brain, { yPercent: 130, duration: T(0.3), ease: "power2.in" }, "-=.3")
        .to(
          lid,
          { y: 0, yPercent: 0, xPercent: 0, rotation: 0, duration: T(0.45), ease: "bounce.out" },
          ">-0.05",
        )
        .to(hole, { scaleY: 0, duration: T(0.15) }, "<+.12")
        .add(() => {
          shake();
          setFace("shock");
        }, "<+.1")
        .add(() => {
          setFace("rest");
          say("much better.");
        }, "+=.45")
        .set(scissors, { left: 0, x: 0, rotation: 0, clearProps: "opacity,transition,transform" })
        .set(dash, { clearProps: "opacity" })
        .to(note, { scale: 1, rotation: 0, duration: T(0.5), ease: "back.out(2.5)" });
      if (intro)
        tl.set(intro, { clearProps: "pointerEvents" }, "<").to(
          intro,
          { opacity: 1, y: 0, duration: T(0.6), ease: "power2.out" },
          "<",
        );
    });
  }

  function startFloats() {
    if (RM) return;
    floats = run(() =>
      active.map((c) =>
        gsap.to(c._in, {
          y: "random(-9,9)",
          rotation: "random(-3,3)",
          duration: "random(1.6,2.6)",
          yoyo: true,
          repeat: -1,
          ease: "sine.inOut",
        }),
      ),
    );
  }
  function stopFloats() {
    for (const f of floats) f.kill();
    floats = [];
    run(() =>
      gsap.to(
        active.map((c) => c._in),
        { y: 0, rotation: 0, duration: 0.2 },
      ),
    );
  }

  /* ---------- head interactions ---------- */
  head.addEventListener("click", () => (state === "closed" ? openHead() : closeHead()), on);
  head.addEventListener(
    "keydown",
    (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        head.click();
      }
    },
    on,
  );
  head.addEventListener(
    "pointerenter",
    (e) => {
      if (state !== "closed" || e.pointerType !== "mouse") return;
      rig.classList.add("mindblown__rig--armed");
      setFace("shock");
      run(() =>
        gsap.to(lid, {
          y: -8,
          rotation: -2,
          duration: T(0.4),
          ease: "back.out(3)",
          overwrite: "auto",
        }),
      );
    },
    on,
  );
  head.addEventListener(
    "pointerleave",
    () => {
      if (state !== "closed") return;
      rig.classList.remove("mindblown__rig--armed");
      setFace("rest");
      run(() =>
        gsap.to(lid, {
          y: 0,
          rotation: 0,
          duration: T(0.5),
          ease: "elastic.out(1,.4)",
          overwrite: "auto",
        }),
      );
    },
    on,
  );

  /* ---------- drag + click on cards ---------- */
  for (const c of cards) {
    let sx = 0,
      sy = 0,
      px = 0,
      py = 0,
      moved = false,
      lastX = 0;
    c.addEventListener(
      "pointerdown",
      (e) => {
        if (state !== "open") return;
        c.setPointerCapture(e.pointerId);
        moved = false;
        sx = gsap.getProperty(c, "x") as number;
        sy = gsap.getProperty(c, "y") as number;
        px = e.clientX;
        py = e.clientY;
        lastX = e.clientX;
        run(() => gsap.to(c, { scale: 1.08, duration: 0.2, overwrite: "auto" }));
        c.style.zIndex = "5";
      },
      on,
    );
    c.addEventListener(
      "pointermove",
      (e) => {
        if (!c.hasPointerCapture(e.pointerId)) return;
        const dx = e.clientX - px,
          dy = e.clientY - py;
        if (!moved && Math.hypot(dx, dy) > 6) moved = true;
        if (!moved) return;
        const W = stage.clientWidth,
          H = stage.clientHeight;
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
      },
      on,
    );
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
    c.addEventListener("pointerup", end, on);
    c.addEventListener("pointercancel", end, on);
    c.addEventListener(
      "click",
      () => {
        if (c._dragged) {
          c._dragged = false;
          return;
        }
        if (state === "open") openPop(c);
      },
      on,
    );
  }

  /* ---------- popover ---------- */
  let popFrom: Card | null = null,
    popOpen = false;
  function openPop(card: Card) {
    const it = ITEMS[card._i]!;
    popFrom = card;
    panel.innerHTML = `<div class="mindblown__pop-head"><span class="mindblown__icon">${svg(it.icon)}</span><div><div class="mindblown__pop-kicker">${esc(it.tag)}</div><h2 class="mindblown__pop-title" id="mindblown-pop-title">${esc(it.title)}</h2></div>
    <button class="mindblown__pop-close" type="button" aria-label="Close"><svg viewBox="0 0 16 16" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M3 3l10 10M13 3L3 13"/></svg></button></div>
    <div class="mindblown__pop-body">
      ${it.stat ? `<div class="mindblown__stat"><b class="mindblown__stat-value">${esc(it.stat[0])}</b><span class="mindblown__stat-caption">${esc(it.stat[1])}</span></div>` : ""}
      ${it.body ? `<p>${esc(it.body)}</p>` : ""}
      ${it.chips ? `<ul class="mindblown__chips">${it.chips.map((s) => `<li>${esc(s)}</li>`).join("")}</ul>` : ""}
      ${it.email ? `<div class="mindblown__mail"><code>${esc(it.email)}</code><button type="button" class="mindblown__copy">Copy</button></div>` : ""}
      ${it.links ? `<div class="mindblown__links">${it.links.map(([n, u]) => `<a href="${esc(u)}" target="_blank" rel="noopener">${esc(n)} ↗</a>`).join("")}</div>` : ""}
    </div>`;
    const x = panel.querySelector<HTMLButtonElement>(".mindblown__pop-close")!;
    x.onclick = () => closePop();
    const cp = panel.querySelector<HTMLButtonElement>(".mindblown__copy");
    if (cp && it.email) {
      const email = it.email;
      cp.onclick = () => {
        const done = () => {
          cp.textContent = "Copied!";
          run(() =>
            gsap.fromTo(cp, { scale: 0.8 }, { scale: 1, ease: "back.out(4)", duration: 0.4 }),
          );
        };
        try {
          navigator.clipboard.writeText(email).then(done, selectMail);
        } catch {
          selectMail();
        }
      };
    }
    pop.hidden = false;
    popOpen = true;
    cursor.classList.remove("mindblown__cursor--on");
    const r = card.getBoundingClientRect(),
      p = panel.getBoundingClientRect();
    const ox = r.left + r.width / 2 - p.left,
      oy = r.top + r.height / 2 - p.top;
    gsap.killTweensOf([panel, scrim]);
    run(() => {
      gsap.fromTo(scrim, { opacity: 0 }, { opacity: 1, duration: T(0.3) });
      gsap.fromTo(
        panel,
        { clipPath: `circle(0px at ${ox}px ${oy}px)` },
        {
          clipPath: `circle(${Math.hypot(p.width, p.height) * 1.1}px at ${ox}px ${oy}px)`,
          duration: T(0.6),
          ease: "power3.inOut",
          clearProps: "clipPath",
        },
      );
      gsap.from(panel.querySelectorAll(".mindblown__pop-head > *, .mindblown__pop-body > *"), {
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
    });
    x.focus({ preventScroll: true });
  }
  function selectMail() {
    const code = panel.querySelector(".mindblown__mail code");
    const s = getSelection();
    if (!code || !s) return;
    const rg = document.createRange();
    rg.selectNodeContents(code);
    s.removeAllRanges();
    s.addRange(rg);
  }
  function closePop(instant = false) {
    if (!popOpen) return;
    popOpen = false;
    const from = popFrom;
    if (instant || RM || !from) {
      pop.hidden = true;
      if (!instant) from?.focus({ preventScroll: true });
      return;
    }
    const p = panel.getBoundingClientRect(),
      r = from.getBoundingClientRect();
    const ox = r.left + r.width / 2 - p.left,
      oy = r.top + r.height / 2 - p.top;
    run(() => {
      gsap.to(scrim, { opacity: 0, duration: 0.3 });
      gsap.fromTo(
        panel,
        { clipPath: `circle(${Math.hypot(p.width, p.height) * 1.1}px at ${ox}px ${oy}px)` },
        {
          clipPath: `circle(0px at ${ox}px ${oy}px)`,
          duration: 0.45,
          ease: "power3.in",
          onComplete() {
            pop.hidden = true;
            gsap.set(panel, { clearProps: "clipPath" });
          },
        },
      );
    });
    from.focus({ preventScroll: true });
  }
  scrim.addEventListener("click", () => closePop(), on);
  addEventListener(
    "keydown",
    (e) => {
      if (e.key !== "Escape") return;
      if (popOpen) closePop();
      else if (state === "open") closeHead();
    },
    on,
  );

  /* ---------- confetti ---------- */
  const c2d = canvas.getContext("2d")!;
  const styles = getComputedStyle(root);
  const COLORS = [1, 2, 3, 4, 5, 6].map((n) => styles.getPropertyValue(`--mb-cf-${n}`).trim());
  const INK = styles.getPropertyValue("--mb-art-ink").trim();
  type Part = {
    x: number;
    y: number;
    vx: number;
    vy: number;
    w: number;
    h: number;
    r: number;
    vr: number;
    c: string;
    life: number;
  };
  let parts: Part[] = [],
    raf = 0;
  function confetti(x: number, y: number) {
    if (RM) return;
    const dpr = Math.min(2, devicePixelRatio || 1);
    canvas.width = stage.clientWidth * dpr;
    canvas.height = stage.clientHeight * dpr;
    c2d.setTransform(dpr, 0, 0, dpr, 0, 0);
    for (let i = 0; i < 90; i++) {
      const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.2,
        v = 6 + Math.random() * 11;
      parts.push({
        x,
        y,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v,
        w: 6 + Math.random() * 10,
        h: 4 + Math.random() * 8,
        r: Math.random() * 6,
        vr: (Math.random() - 0.5) * 0.4,
        c: COLORS[i % COLORS.length]!,
        life: 1,
      });
    }
    if (!raf) raf = requestAnimationFrame(tick);
  }
  function tick() {
    c2d.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of parts) {
      p.vy += 0.32;
      p.vx *= 0.985;
      p.x += p.vx;
      p.y += p.vy;
      p.r += p.vr;
      p.life -= 0.006;
      c2d.save();
      c2d.translate(p.x, p.y);
      c2d.rotate(p.r);
      c2d.globalAlpha = Math.max(0, p.life);
      c2d.fillStyle = p.c;
      c2d.strokeStyle = INK;
      c2d.lineWidth = 2;
      c2d.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      c2d.strokeRect(-p.w / 2, -p.h / 2, p.w, p.h);
      c2d.restore();
    }
    parts = parts.filter((p) => p.life > 0 && p.y < stage.clientHeight + 40);
    raf = parts.length ? requestAnimationFrame(tick) : 0;
  }

  /* ---------- brain eyes follow the pointer ---------- */
  const pupils = [...brain.querySelectorAll(".mindblown__pupil")];
  const eyeC = [
    [60, 56],
    [84, 56],
  ] as const;
  let lookX = innerWidth / 2,
    lookY = 0,
    lookRaf = 0;
  function look() {
    lookRaf = 0;
    const r = brain.getBoundingClientRect();
    if (!r.width) return;
    const k = r.width / 140;
    pupils.forEach((p, i) => {
      const ex = r.left + eyeC[i]![0] * k,
        ey = r.top + eyeC[i]![1] * k;
      const dx = lookX - ex,
        dy = lookY - ey,
        d = Math.hypot(dx, dy) || 1,
        m = Math.min(4.5, d / 30);
      p.setAttribute(
        "transform",
        `translate(${((dx / d) * m).toFixed(2)} ${((dy / d) * m * 1.1).toFixed(2)})`,
      );
    });
  }
  addEventListener(
    "pointermove",
    (e) => {
      lookX = e.clientX;
      lookY = e.clientY;
      if (!lookRaf) lookRaf = requestAnimationFrame(look);
    },
    { passive: true, signal: abort.signal },
  );

  /* ---------- cursor label + parallax ---------- */
  if (matchMedia("(pointer:fine)").matches) {
    const qx = gsap.quickTo(cursor, "left", { duration: 0.25, ease: "power3" }),
      qy = gsap.quickTo(cursor, "top", { duration: 0.25, ease: "power3" });
    addEventListener(
      "pointermove",
      (e) => {
        qx(e.clientX);
        qy(e.clientY);
        const t = e.target instanceof Element ? e.target : null;
        let label = "";
        if (t?.closest(".mindblown__card")) label = "open · drag";
        else if (t?.closest(".mindblown__head") && root.contains(t))
          label = state === "closed" ? "snip snip" : "close it";
        if (label) cursor.textContent = label;
        cursor.classList.toggle("mindblown__cursor--on", !!label && !popOpen);
      },
      on,
    );
    if (!RM) {
      const hx = gsap.quickTo(rig, "x", { duration: 1, ease: "power3" });
      stage.addEventListener("pointermove", (e) => hx((e.clientX / innerWidth - 0.5) * 14), on);
    }
  }

  /* ---------- thought-bubble tails ---------- */
  /* two dots per card on the line from the card's edge to the hole; they follow drags, floats and resizes */
  const tails = () => {
    if (state === "closed") {
      for (const c of cards) c._tails[0]!.style.opacity = c._tails[1]!.style.opacity = "0";
      return;
    }
    const h = rel(hole);
    for (const c of cards) {
      const w = c.offsetWidth,
        ht = c.offsetHeight;
      const cx =
          (gsap.getProperty(c, "x") as number) + w / 2 + (gsap.getProperty(c._in, "x") as number),
        cy =
          (gsap.getProperty(c, "y") as number) + ht / 2 + (gsap.getProperty(c._in, "y") as number);
      const dx = h.x - cx,
        dy = h.y - cy,
        d = Math.hypot(dx, dy) || 1,
        ux = dx / d,
        uy = dy / d;
      const edge = Math.min(
        Math.abs(ux) > 1e-3 ? w / 2 / Math.abs(ux) : 1e9,
        Math.abs(uy) > 1e-3 ? ht / 2 / Math.abs(uy) : 1e9,
      );
      // the dots grow with the cards (50% bigger on desktop): the first dot is 11px at 1x
      const k = c._tails[0]!.clientWidth / 11;
      const op = shown.has(c) && d > edge + 50 ? String(gsap.getProperty(c, "opacity")) : "0";
      c._tails[0]!.style.transform = `translate(${cx + ux * (edge + 13 * k)}px, ${cy + uy * (edge + 13 * k)}px)`;
      c._tails[1]!.style.transform = `translate(${cx + ux * (edge + 28 * k)}px, ${cy + uy * (edge + 28 * k)}px)`;
      c._tails[0]!.style.opacity = c._tails[1]!.style.opacity = op;
    }
  };
  gsap.ticker.add(tails);

  /* ---------- keep cards in their slots on resize ---------- */
  let rz = 0;
  addEventListener(
    "resize",
    () => {
      clearTimeout(rz);
      rz = window.setTimeout(() => {
        labelSize();
        if (state !== "open") return;
        layout();
        for (const c of active) {
          const t = target(c);
          run(() => gsap.to(c, { x: t.x, y: t.y, duration: 0.6, ease: "power3.out" }));
        }
      }, 150);
    },
    on,
  );

  return function destroy() {
    abort.abort();
    gsap.ticker.remove(tails);
    cancelAnimationFrame(raf);
    cancelAnimationFrame(lookRaf);
    clearTimeout(rz);
    ctx.revert();
    for (const c of cards) {
      c._tails.forEach((t) => t.remove());
      c.remove();
    }
    pop.hidden = true;
    delete root.dataset.mindblownReady;
  };
}
