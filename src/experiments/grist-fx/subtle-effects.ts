/**
 * Quiet versions of six react-cards-opening effects, scaled to the element they play on. The library's
 * own are made for a full-screen reveal (a hundred particles or more); these use a dozen or two, a few
 * pixels across, that stay close to the element's edge and are gone in a second or two. Built with the
 * library's own particle field (vendor/rco-effects), so they play through playEffects like any other.
 * Sizes are in the library's design pixels: a 300-wide element, scaled to the real one.
 */
import { emit, onEdge, tint, type Effect } from "./vendor/rco-effects/stage";

const UP = -Math.PI / 2;
const TAU = Math.PI * 2;
const between = (from: number, to: number, random: () => number) => from + (to - from) * random();

/** A point on the element's outline, picked at random, pushed out by `near` to `far` of its size. */
const onOutline =
  (ratio: number, near: number, far: number) =>
  (_index: number, _count: number, random: () => number) =>
    onEdge(random() * TAU, ratio, between(near, far, random));

export const SUBTLE_EFFECTS: readonly Effect[] = [
  {
    name: "embers",
    kind: "particles",
    label: "Embers",
    about: "A few warm motes lifting off the edge.",
    seconds: 2.4,
    play: (stage, tl) =>
      emit(stage, tl, {
        count: 12,
        shape: "mote",
        colours: [stage.tone, tint(stage.tone, 0.4)],
        from: onOutline(stage.ratio, 0.98, 1.06),
        angle: [UP - 0.3, UP + 0.3],
        speed: [18, 50],
        gravity: -8,
        life: [1, 1.8],
        delay: [0, 0.6],
        size: [2, 3.5],
        twinkle: [3, 6],
        sway: [4, 12],
        swayHz: [0.6, 1.2],
        fadeIn: 0.2,
        fadeOut: 0.5,
        glow: 0.4,
      }),
  },
  {
    name: "stardust",
    kind: "particles",
    label: "Stardust",
    about: "A handful of small stars twinkling just outside the edge.",
    seconds: 1.8,
    play: (stage, tl) =>
      emit(stage, tl, {
        count: 8,
        shape: "star",
        colours: [stage.tone, tint(stage.tone, 0.5)],
        from: "edge",
        speed: [8, 30],
        drag: 0.3,
        life: [0.9, 1.5],
        delay: [0, 0.3],
        size: [3, 5],
        spin: [-0.6, 0.6],
        twinkle: [2, 4],
        fadeIn: 0.25,
        fadeOut: 0.5,
        glow: 0.3,
      }),
  },
  {
    name: "sparks",
    kind: "particles",
    label: "Sparks",
    about: "A short flick of tiny sparks off the edge.",
    seconds: 0.8,
    play: (stage, tl) =>
      emit(stage, tl, {
        count: 12,
        shape: "square",
        colours: [stage.tone, tint(stage.tone, 0.6)],
        from: "edge",
        speed: [50, 130],
        drag: 0.06,
        life: [0.35, 0.6],
        size: [1.5, 2.5],
        spin: [-4, 4],
        fadeOut: 0.6,
        glow: 0.4,
      }),
  },
  {
    name: "flames",
    kind: "particles",
    label: "Flame",
    about: "Small licks of the tier colour along the bottom edge, rising a little and fading.",
    seconds: 1.8,
    play: (stage, tl) => {
      const foot = 150 * stage.ratio;
      emit(stage, tl, {
        count: 26,
        shape: "flame",
        colours: [stage.tone, tint(stage.tone, 0.3)],
        from: (_index, _count, random) => [
          between(-140, 140, random),
          foot + between(-2, 4, random),
        ],
        angle: (_index, _count, random) => UP + between(-0.2, 0.2, random),
        speed: [20, 55],
        gravity: -30,
        drag: 0.5,
        life: [0.4, 0.8],
        delay: [0, 1],
        size: [5, 10],
        alpha: [0.3, 0.55],
        sway: [3, 8],
        swayHz: [1.5, 3],
        fadeIn: 0.15,
        fadeOut: 0.5,
      });
    },
  },
  {
    name: "aurora",
    kind: "particles",
    label: "Aurora",
    about: "A faint wash of the tier colour that drifts round the edge and fades.",
    seconds: 2.6,
    play: (stage, tl) =>
      emit(stage, tl, {
        count: 6,
        shape: "puff",
        colours: [stage.tone, stage.accent],
        from: onOutline(stage.ratio, 0.9, 1),
        speed: [4, 12],
        life: [2, 2.6],
        size: [50, 80],
        alpha: [0.1, 0.18],
        fadeIn: 0.4,
        fadeOut: 0.5,
      }),
  },
  {
    name: "beams",
    kind: "particles",
    label: "Beams",
    about: "A few thin streaks of light rising past the sides.",
    seconds: 1.4,
    play: (stage, tl) =>
      emit(stage, tl, {
        count: 6,
        shape: "square",
        colours: [tint(stage.tone, 0.3), tint(stage.tone, 0.6)],
        from: (_index, _count, random) => [
          (random() < 0.5 ? -1 : 1) * between(150, 158, random),
          between(-40, 120, random) * stage.ratio,
        ],
        angle: [UP, UP],
        rotation: "heading",
        speed: [90, 160],
        life: [0.5, 0.9],
        delay: [0, 0.4],
        size: [1.5, 2],
        trail: 0.6,
        fadeOut: 0.6,
        glow: 0.5,
      }),
  },
];

export const SUBTLE = Object.fromEntries(SUBTLE_EFFECTS.map((effect) => [effect.name, effect]));
