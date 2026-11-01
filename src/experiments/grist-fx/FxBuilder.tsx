/**
 * Experiment: an effects builder for Grist, on react-cards-opening (MIT, from npm, used as it ships).
 * One card or one rarity icon at a time. For each rarity you set when its show plays (hover, click,
 * a loop), which of the library's effects run, and each effect's delay, size, strength, density and
 * colour. The card can be Grist's own drop card or the library's card. Settings stay in this browser
 * and can be copied out as JSON. Colours are read from the site's tokens, so both themes work.
 */
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import "@react-cards-opening/ui/styles.css";
import { Card, SIGNATURE_EFFECTS, type CardTheme } from "@react-cards-opening/ui";
import {
  clearEffects,
  EFFECT_KINDS,
  EFFECT_LIST,
  EFFECTS,
  playEffects,
  type Effect,
  type EffectName,
} from "@react-cards-opening/effects";

const TIERS = ["common", "uncommon", "rare", "epic", "legendary", "mythic"] as const;
type Tier = (typeof TIERS)[number];
const LABEL: Record<Tier, string> = {
  common: "Common",
  uncommon: "Uncommon",
  rare: "Rare",
  epic: "Epic",
  legendary: "Legendary",
  mythic: "Mythic",
};

type Mode = "card" | "icon";
interface Row {
  id: string;
  effect: EffectName;
  /** Seconds after the trigger. */
  delay: number;
  /** % of the element's width the effect is drawn for (the library draws for a 300px card). */
  size: number;
  /** 0 to 1: the layer's opacity. */
  strength: number;
  /** 0 to 1: the share of particles kept. Light, wave and screen effects ignore it. */
  density: number;
  colour: "tier" | "accent" | "text";
}
interface Look {
  trigger: "hover" | "click" | "loop";
  /** Seconds between plays, for the loop. */
  every: number;
  blend: "auto" | "add" | "normal";
  place: "behind" | "front";
  rows: Row[];
}
interface Setup {
  cardStyle: "grist" | "library";
  card: Record<Tier, Look>;
  icon: Record<Tier, Look>;
}

const KEY = "grist-fx-builder-v1";
const uid = () => Math.random().toString(36).slice(2, 9);

const row = (effect: EffectName, extra: Partial<Row> = {}): Row => ({
  id: uid(),
  effect,
  delay: 0,
  size: 100,
  strength: 1,
  density: 1,
  colour: "tier",
  ...extra,
});

/** The library's own show for each tier (the steps played as a card turns), as a starting point. */
function signatureRows(tier: Tier): Row[] {
  const steps = SIGNATURE_EFFECTS[tier] as readonly (
    string | { effect: string; on?: string; delay?: number }
  )[];
  return steps
    .map((step) => (typeof step === "string" ? { effect: step, delay: 0, on: "turn" } : step))
    .filter((step) => step.on !== "hum" && step.effect in EFFECTS)
    .map((step) => row(step.effect as EffectName, { delay: step.delay ?? 0 }));
}

const ICON_START: Record<Tier, Row[]> = {
  common: [],
  uncommon: [],
  rare: [],
  epic: [],
  legendary: [],
  mythic: [],
};

function defaults(): Setup {
  const card = {} as Record<Tier, Look>;
  const icon = {} as Record<Tier, Look>;
  for (const tier of TIERS) {
    card[tier] = {
      trigger: "hover",
      every: 4,
      blend: "auto",
      place: "behind",
      rows: signatureRows(tier),
    };
    icon[tier] = {
      trigger: "hover",
      every: 3,
      blend: "auto",
      place: "behind",
      rows: ICON_START[tier],
    };
  }
  return { cardStyle: "grist", card, icon };
}

function load(): Setup {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved) return { ...defaults(), ...(JSON.parse(saved) as Setup) };
  } catch {
    /* private window or blocked storage: start fresh */
  }
  return defaults();
}

/** Keeps only `density` of the particles an effect lets go. Effects without particles are unchanged. */
function thinned(effect: Effect, density: number): Effect {
  if (density >= 1) return effect;
  return {
    ...effect,
    play: (stage, timeline) => {
      const field = Object.create(stage.field) as typeof stage.field;
      field.emit = (particles) => stage.field.emit(particles.filter(() => Math.random() < density));
      effect.play({ ...stage, field }, timeline);
    },
  };
}

/** A token's colour as a plain hex (the library takes hex only), read off a probe element. */
function tokenHex(probe: HTMLElement, token: string) {
  probe.style.color = `var(${token})`;
  const [r = 0, g = 0, b = 0] = (getComputedStyle(probe).color.match(/[\d.]+/g) ?? []).map(Number);
  return `#${[r, g, b].map((n) => Math.round(n).toString(16).padStart(2, "0")).join("")}`;
}

interface Palette {
  bg: string;
  subtle: string;
  text: string;
  muted: string;
  dark: boolean;
  tier: Record<Tier, string>;
}

function readPalette(probe: HTMLElement): Palette {
  const tier = {} as Record<Tier, string>;
  for (const t of TIERS) tier[t] = tokenHex(probe, `--rarity-${t}-icon`);
  const bg = tokenHex(probe, "--color-bg");
  const [r, g, b] = [1, 3, 5].map((at) => parseInt(bg.slice(at, at + 2), 16));
  return {
    bg,
    subtle: tokenHex(probe, "--color-bg-subtle"),
    text: tokenHex(probe, "--color-text"),
    muted: tokenHex(probe, "--color-text-muted"),
    dark: (r! + g! + b!) / 3 < 128,
    tier,
  };
}

/** Grist's colours as a library theme, for the library's card. */
const themeOf = (p: Palette): CardTheme => ({
  bg: p.bg,
  card: p.subtle,
  fg: p.text,
  muted: p.muted,
  levels: [p.subtle, p.muted, p.muted, p.text, p.text],
  rarity: p.tier,
});

const SAMPLE: Record<Tier, { name: string; line: string }> = {
  common: { name: "Tokens-only Guardrail", line: "Build UI only from your design tokens." },
  uncommon: { name: "Token Description Writer", line: "A one-line description for every token." },
  rare: { name: "Design System Audit", line: "What your design system hasn't decided yet." },
  epic: { name: "DESIGN.md", line: "One plain file that explains your design system." },
  legendary: { name: "Agent Evaluation Kit", line: "Test an agent against its spec." },
  mythic: { name: "Presales Workflow", line: "From call notes to a signed statement of work." },
};

type Slots = Record<string, ReactNode>;
const slot = (props: Slots, name: string) =>
  props[name] ?? props[name.replace(/-(\w)/g, (_m, c: string) => c.toUpperCase())];

export default function FxBuilder(props: Slots) {
  const [setup, setSetup] = useState<Setup>(defaults);
  const [mode, setMode] = useState<Mode>("card");
  const [tier, setTier] = useState<Tier>("legendary");
  const [palette, setPalette] = useState<Palette | null>(null);
  const [copied, setCopied] = useState("");
  const probe = useRef<HTMLSpanElement>(null);
  const layers = useRef<HTMLDivElement>(null);
  const subject = useRef<HTMLDivElement>(null);

  // Load saved settings after mount (storage can throw), and save on every change.
  const loaded = useRef(false);
  useEffect(() => {
    setSetup(load());
    loaded.current = true;
  }, []);
  useEffect(() => {
    if (!loaded.current) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(setup));
    } catch {
      /* storage blocked: settings live until the page closes */
    }
  }, [setup]);

  // Colours follow the site theme: re-read them when it changes.
  useEffect(() => {
    const read = () => probe.current && setPalette(readPalette(probe.current));
    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, { attributes: true });
    const media = matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", read);
    return () => {
      observer.disconnect();
      media.removeEventListener("change", read);
    };
  }, []);

  const look = setup[mode][tier];
  const setLook = (change: Partial<Look>) =>
    setSetup((now) => ({
      ...now,
      [mode]: { ...now[mode], [tier]: { ...now[mode][tier], ...change } },
    }));
  const setRow = (id: string, change: Partial<Row>) =>
    setLook({ rows: look.rows.map((r) => (r.id === id ? { ...r, ...change } : r)) });

  const clear = useCallback(() => {
    for (const layer of layers.current?.querySelectorAll<HTMLElement>(".rco-fx-layer") ?? []) {
      clearEffects(layer);
      layer.remove();
    }
  }, []);

  const play = useCallback(() => {
    // The element itself, not the slot wrapper around it (which lays out as display: contents).
    const target =
      subject.current?.querySelector<HTMLElement>(
        mode === "icon" ? "svg" : ".drop-card, .rco-card",
      ) ?? null;
    if (!palette || !layers.current || !target) return;
    clear();
    const box = target.getBoundingClientRect();
    const blend = look.blend === "auto" ? (palette.dark ? "add" : "normal") : look.blend;
    const tone = palette.tier[tier];
    for (const r of look.rows) {
      const effect = EFFECTS[r.effect];
      if (!effect) continue;
      // One layer per effect, so each has its own strength.
      const layer = document.createElement("div");
      layer.className = "rco-fx-layer fxb__layer";
      layer.style.opacity = String(r.strength);
      layers.current.append(layer);
      const colour =
        r.colour === "text" ? palette.text : r.colour === "accent" ? palette.muted : tone;
      playEffects(layer, thinned(effect, r.density), {
        at: target,
        size: (box.width * r.size) / 100,
        ratio: box.height / box.width,
        tone: colour,
        delay: r.delay,
        blend,
        subject: target,
      });
    }
  }, [clear, look, mode, palette, tier]);

  // Loop: play every few seconds while this look is on screen.
  useEffect(() => {
    if (look.trigger !== "loop") return;
    play();
    const timer = setInterval(play, Math.max(0.5, look.every) * 1000);
    return () => clearInterval(timer);
  }, [look.trigger, look.every, play]);

  // A new tier or mode starts clean.
  useEffect(() => clear, [mode, tier, clear]);

  const lastHover = useRef(0);
  const onHover = () => {
    if (look.trigger !== "hover" || Date.now() - lastHover.current < 600) return;
    lastHover.current = Date.now();
    play();
  };

  const copy = async (what: "all" | "tier") => {
    const data = what === "all" ? setup : { mode, tier, cardStyle: setup.cardStyle, ...look };
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setCopied(what === "all" ? "All settings copied" : `${LABEL[tier]} ${mode} copied`);
    } catch {
      setCopied("Couldn't copy: your browser blocked the clipboard");
    }
    setTimeout(() => setCopied(""), 2500);
  };

  const groups = useMemo(
    () =>
      EFFECT_KINDS.map(({ kind, label }) => ({
        label,
        list: EFFECT_LIST.filter((e) => e.kind === kind),
      })),
    [],
  );
  const [adding, setAdding] = useState<EffectName>("sparks");

  const theme = palette && themeOf(palette);
  const element =
    mode === "icon" ? (
      slot(props, `icon-${tier}`)
    ) : setup.cardStyle === "library" && theme ? (
      <Card card={{ id: tier, rarity: tier, ...SAMPLE[tier] }} theme={theme} width={280} />
    ) : (
      slot(props, `card-${tier}`)
    );

  return (
    <div className="fxb">
      <span ref={probe} className="fxb__probe" aria-hidden="true" />

      <div className="fxb__bar">
        <div className="fxb__group" role="group" aria-label="What to style">
          {(["card", "icon"] as const).map((m) => (
            <button
              key={m}
              type="button"
              className="fxb__chip"
              aria-pressed={mode === m}
              onClick={() => setMode(m)}
            >
              {m === "card" ? "Card" : "Rarity icon"}
            </button>
          ))}
        </div>
        <div className="fxb__group" role="group" aria-label="Rarity">
          {TIERS.map((t) => (
            <button
              key={t}
              type="button"
              className={`fxb__chip fxb__chip--${t}`}
              aria-pressed={tier === t}
              onClick={() => setTier(t)}
            >
              {LABEL[t]}
            </button>
          ))}
        </div>
      </div>

      <div className="fxb__main">
        <div className="fxb__stage">
          <div ref={layers} className={`fxb__layers fxb__layers--${look.place}`} />
          <div
            ref={subject}
            className={`fxb__subject fxb__subject--${mode}`}
            onPointerEnter={onHover}
            onFocusCapture={onHover}
            onClickCapture={(event) => {
              event.preventDefault();
              if (look.trigger === "click") play();
            }}
          >
            {/* Keyed: Astro's slot wrapper never re-renders, so a new tier needs a new element. */}
            <div key={`${mode}-${setup.cardStyle}-${tier}`} className="fxb__slot">
              {element}
            </div>
          </div>
          <p className="fxb__hint">
            {look.trigger === "hover"
              ? "Hover it"
              : look.trigger === "click"
                ? "Click it"
                : `Plays every ${look.every}s`}
            {" · "}
            <button type="button" className="fxb__link" onClick={play}>
              Play now
            </button>
          </p>
        </div>

        <div className="fxb__panel">
          <fieldset className="fxb__set">
            <legend className="fxb__legend">
              {LABEL[tier]} {mode === "card" ? "card" : "icon"}
            </legend>
            {mode === "card" && (
              <label className="fxb__field">
                <span>Card style</span>
                <select
                  value={setup.cardStyle}
                  onChange={(e) =>
                    setSetup((now) => ({ ...now, cardStyle: e.target.value as Setup["cardStyle"] }))
                  }
                >
                  <option value="grist">Grist card</option>
                  <option value="library">Library card (foil on Legendary)</option>
                </select>
              </label>
            )}
            <label className="fxb__field">
              <span>Plays on</span>
              <select
                value={look.trigger}
                onChange={(e) => setLook({ trigger: e.target.value as Look["trigger"] })}
              >
                <option value="hover">Hover</option>
                <option value="click">Click</option>
                <option value="loop">Loop</option>
              </select>
            </label>
            {look.trigger === "loop" && (
              <Slider
                label="Every (s)"
                min={1}
                max={12}
                step={0.5}
                value={look.every}
                onChange={(every) => setLook({ every })}
              />
            )}
            <label className="fxb__field">
              <span>Layer</span>
              <select
                value={look.place}
                onChange={(e) => setLook({ place: e.target.value as Look["place"] })}
              >
                <option value="behind">Behind the {mode}</option>
                <option value="front">In front</option>
              </select>
            </label>
            <label className="fxb__field">
              <span>Light</span>
              <select
                value={look.blend}
                onChange={(e) => setLook({ blend: e.target.value as Look["blend"] })}
              >
                <option value="auto">Auto (adds up on dark, painted on light)</option>
                <option value="add">Add up</option>
                <option value="normal">Painted</option>
              </select>
            </label>
          </fieldset>

          <fieldset className="fxb__set">
            <legend className="fxb__legend">Effects ({look.rows.length})</legend>
            {look.rows.length === 0 && <p className="fxb__muted">None yet. Add one below.</p>}
            {look.rows.map((r) => (
              <div key={r.id} className="fxb__row">
                <div className="fxb__row-head">
                  <select
                    value={r.effect}
                    onChange={(e) => setRow(r.id, { effect: e.target.value as EffectName })}
                  >
                    {groups.map((g) => (
                      <optgroup key={g.label} label={g.label}>
                        {g.list.map((e) => (
                          <option key={e.name} value={e.name}>
                            {e.label}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="fxb__link"
                    onClick={() => setLook({ rows: look.rows.filter((x) => x.id !== r.id) })}
                  >
                    Remove
                  </button>
                </div>
                <p className="fxb__muted fxb__about">{EFFECTS[r.effect]?.about}</p>
                <Slider
                  label="Delay (s)"
                  min={0}
                  max={2}
                  step={0.05}
                  value={r.delay}
                  onChange={(delay) => setRow(r.id, { delay })}
                />
                <Slider
                  label={`Size (% of ${mode})`}
                  min={10}
                  max={400}
                  step={5}
                  value={r.size}
                  onChange={(size) => setRow(r.id, { size })}
                />
                <Slider
                  label="Strength"
                  min={0.05}
                  max={1}
                  step={0.05}
                  value={r.strength}
                  onChange={(strength) => setRow(r.id, { strength })}
                />
                {EFFECTS[r.effect]?.kind === "particles" && (
                  <Slider
                    label="Density"
                    min={0.05}
                    max={1}
                    step={0.05}
                    value={r.density}
                    onChange={(density) => setRow(r.id, { density })}
                  />
                )}
                <label className="fxb__field">
                  <span>Colour</span>
                  <select
                    value={r.colour}
                    onChange={(e) => setRow(r.id, { colour: e.target.value as Row["colour"] })}
                  >
                    <option value="tier">Tier colour</option>
                    <option value="text">Text colour</option>
                    <option value="accent">Muted colour</option>
                  </select>
                </label>
              </div>
            ))}
            <div className="fxb__add">
              <select
                value={adding}
                onChange={(e) => setAdding(e.target.value as EffectName)}
                aria-label="Effect to add"
              >
                {groups.map((g) => (
                  <optgroup key={g.label} label={g.label}>
                    {g.list.map((e) => (
                      <option key={e.name} value={e.name}>
                        {e.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <button
                type="button"
                className="fxb__button"
                onClick={() =>
                  setLook({
                    rows: [
                      ...look.rows,
                      row(adding, mode === "icon" ? { size: 200, density: 0.3 } : {}),
                    ],
                  })
                }
              >
                Add effect
              </button>
            </div>
          </fieldset>

          <div className="fxb__actions">
            <button type="button" className="fxb__button" onClick={play}>
              Play
            </button>
            <button
              type="button"
              className="fxb__button"
              onClick={() => setLook({ rows: mode === "card" ? signatureRows(tier) : [] })}
            >
              Reset {LABEL[tier]}
            </button>
            <button type="button" className="fxb__button" onClick={() => setLook({ rows: [] })}>
              Clear
            </button>
            <button type="button" className="fxb__button" onClick={() => copy("tier")}>
              Copy this tier
            </button>
            <button
              type="button"
              className="fxb__button fxb__button--primary"
              onClick={() => copy("all")}
            >
              Copy all settings
            </button>
          </div>
          <p className="fxb__muted" role="status">
            {copied}
          </p>
        </div>
      </div>
    </div>
  );
}

function Slider(props: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="fxb__field fxb__field--slider">
      <span>{props.label}</span>
      <input
        type="range"
        min={props.min}
        max={props.max}
        step={props.step}
        value={props.value}
        onChange={(e) => props.onChange(Number(e.target.value))}
      />
      <output>{props.value}</output>
    </label>
  );
}
