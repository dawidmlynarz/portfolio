/**
 * Mindblown About: the thought cards and the stripe. Edit copy here; the animation lives in
 * mindblown.ts, which also places the cards at random on every open. `short` is the label on
 * screens under 1000px wide; `icon` is a key of ICONS. `pinned` cards are in every launch.
 */
export type IconName = keyof typeof ICONS;

export interface Thought {
  /** stable key for the card */
  id: string;
  /** true = in every launch; the rest are picked at random */
  pinned?: boolean;
  label: string;
  short: string;
  tag: string;
  icon: IconName;
  title: string;
  body?: string;
  stat?: [string, string];
  chips?: string[];
  email?: string;
  /** [name, url]; a url starting with "/" is a page on this site and opens in the same tab */
  links?: [string, string][];
}

export const ITEMS: Thought[] = [
  /* ---------- Work (10) ---------- */
  {
    id: "product-design",
    pinned: true,
    label: "Product design",
    short: "Design",
    tag: "what I do",
    icon: "pen",
    title: "Self-taught product designer",
    body: "No design degree, 15 years of shipping. I help companies build products people actually want to use.",
    stat: ["Millions", "of people use products I've worked on"],
  },

  {
    id: "design-systems",
    label: "Design systems",
    short: "Systems",
    tag: "build & scale",
    icon: "grid",
    title: "Design systems, from zero to scale",
    body: "I set up design systems and help them grow with the product, so teams ship faster and the UI stays consistent.",
    chips: ["Newsweek", "Pantheon", "BeatStars"],
  },

  {
    id: "research",
    label: "Research",
    short: "Research",
    tag: "evidence first",
    icon: "search",
    title: "Research before pixels",
    body: "At NerdWallet, steady UX improvements backed by A/B tests lifted click-through by 80%. Opinions are welcome; data settles them.",
    stat: ["+80%", "click-through at NerdWallet"],
  },

  {
    id: "mobile-apps",
    label: "Mobile apps",
    short: "Apps",
    tag: "iOS & Android",
    icon: "phone",
    title: "Native apps for iOS and Android",
    body: "Native app design, plus the structure underneath it: information architecture and interaction design.",
    chips: ["iOS", "Android", "Information architecture", "Interaction design"],
  },

  {
    id: "leading-teams",
    label: "Leading teams",
    short: "Leading",
    tag: "people",
    icon: "people",
    title: "I grow designers",
    body: "At XWP I led the design team on client projects: hiring, onboarding, mentoring and design toolkits.",
    stat: ["30%", "more efficient design team, thanks to design ops"],
  },

  {
    id: "rule-1",
    label: "Rule #1",
    short: "Rule #1",
    tag: "how I work",
    icon: "ruler",
    title: "Function first, always",
    body: "Function should always dictate the form, never the other way around. Lean UX and design thinking, minus the buzzwords.",
  },

  {
    id: "founder",
    label: "Founder",
    short: "Founder",
    tag: "startup",
    icon: "rocket",
    title: "I co-founded CSS Peeper",
    body: "A Chrome extension for designers, taken from first sketch to a profitable product. It's still in use today.",
    stat: ["500,000+", "users"],
  },

  {
    id: "proud-of",
    label: "Proud of",
    short: "Proud of",
    tag: "case study",
    icon: "star",
    title: "Newsweek's new design language",
    body: "I helped lead Newsweek from fragmented legacy components to a unified, token-driven design system.",
    stat: ["70%", "traffic growth at Newsweek"],
    links: [["Read the case study", "/work/newsweek-design-system"]],
  },

  {
    id: "google",
    label: "Google",
    short: "Google",
    tag: "open source",
    icon: "plug",
    title: "Working with Google",
    body: "On behalf of XWP, I worked with Google's product team on UX and new features for the open-source Material Design plugin for WordPress.",
    links: [["Read the case study", "/work/google-wordpress-plugin"]],
  },

  {
    id: "beatstars",
    label: "BeatStars",
    short: "Music",
    tag: "for producers",
    icon: "note",
    title: "Designing for music producers",
    body: "At BeatStars I shaped the experience across platforms, from a cross-platform design system to product pages that convert better.",
    links: [["Read the case study", "/work/beatstars-product-design"]],
  },

  /* ---------- Personal (9) ---------- */
  {
    id: "lotr",
    label: "LOTR",
    short: "LOTR",
    tag: "extended cut",
    icon: "ring",
    title: "Extended editions only",
    body: "I've rewatched the extended Lord of the Rings trilogy more times than I can count. Theatrical cuts are a crime.",
    stat: ["12 h", "per rewatch, and worth every minute"],
  },

  {
    id: "family",
    label: "Family",
    short: "Family",
    tag: "off the clock",
    icon: "heart",
    title: "Husband, dad, dog owner",
    body: "My favourite time is spent with my wife, our daughter and Tadzik, our dog. They keep me honest about screen time.",
  },

  {
    id: "tadzik",
    label: "Tadzik",
    short: "Tadzik",
    tag: "best colleague",
    icon: "paw",
    title: "Meet Thaddeus, aka Tadzik",
    body: "A lovely, medium-sized, black mixed breed. Head of security, judging by how much he barks.",
  },

  {
    id: "lego",
    label: "LEGO",
    short: "LEGO",
    tag: "collector",
    icon: "brick",
    title: "Castle & Pirates collector",
    body: "I collect classic LEGO Castle and Pirates sets. A good instruction booklet is basically a perfect onboarding flow.",
  },

  {
    id: "gaming",
    label: "Gaming",
    short: "Gaming",
    tag: "late nights",
    icon: "game",
    title: "Late-night gamer",
    body: "Currently dropping into Arc Raiders. When the house goes quiet, the late-night sessions begin.",
  },

  {
    id: "intj",
    label: "INTJ",
    short: "INTJ",
    tag: "the Architect",
    icon: "bulb",
    title: "Officially an INTJ",
    body: 'Also known as "the Architect". I have a plan, a backup plan, and some opinions about your plan.',
    chips: ["Plans ahead", "Questions everything", "Small talk: no"],
  },

  {
    id: "potterhead",
    label: "Potterhead",
    short: "Potter",
    tag: "books first",
    icon: "bolt",
    title: "Certified Potterhead",
    body: "I've read the books, and the books always win the argument. Yes, I have opinions about what the films left out.",
  },

  {
    id: "slytherin",
    label: "Slytherin",
    short: "Slyth.",
    tag: "every time",
    icon: "shield",
    title: "Sorted into Slytherin",
    body: "Every quiz, every time: very Slytherin. Ambitious, resourceful, and maybe a little too proud of it.",
  },

  {
    id: "glasses",
    label: "Glasses",
    short: "Glasses",
    tag: "trademark",
    icon: "glasses",
    title: "25 years behind glasses",
    body: "Almost 25 years of wearing glasses, and designer plastic frames for the last 15. So, my whole career.",
  },

  /* ---------- Contact (1) ---------- */
  {
    id: "say-hi",
    pinned: true,
    label: "Say hi",
    short: "Say hi",
    tag: "contact",
    icon: "mail",
    title: "Say hi",
    body: "Got a product that needs a designer? My inbox is open.",
    email: "hello@mlynarz.com",
    links: [
      ["LinkedIn", "https://www.linkedin.com/in/dawid-mlynarz"],
      ["Dribbble", "https://dribbble.com/dawidmlynarz"],
    ],
  },
];

/** How many thoughts pop out, picked at random on every open: phones (stage under 720px) / wider. */
export const MOBILE_COUNT = 4;
export const DESKTOP_COUNT = 10;

export const BELT = [
  "Self-taught product designer",
  "Poznań, Poland",
  "Design systems",
  "LEGO fan",
  "Late-night gamer",
  "Dog owner",
  "INTJ",
];

/** 24×24 stroke icons, drawn with currentColor. */
export const ICONS = {
  pen: '<path d="M4 20l4-1 11-11-3-3L5 16z"/><path d="M14 7l3 3"/>',
  grid: '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="3.5"/><rect x="4" y="13" width="7" height="7" rx="3.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
  search: '<circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5 5"/>',
  phone: '<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/>',
  people:
    '<circle cx="9" cy="8" r="3"/><path d="M3.5 19c.5-3.5 2.7-5.5 5.5-5.5s5 2 5.5 5.5"/><circle cx="17" cy="9" r="2.4"/><path d="M15.5 13.6c2.6-.3 4.6 1.4 5 4.4"/>',
  rocket:
    '<path d="M12 15l-3-3c1.5-4.5 4.5-8 10-9-1 5.5-4.5 8.5-9 10"/><path d="M9 12l-4 .5L4 16l3.5-.5M12 15l-.5 4 3.5-1 .5-4"/><circle cx="15" cy="9" r="1.4"/>',
  heart:
    '<path d="M12 20s-8-4.7-8-10.2A4.3 4.3 0 0 1 12 7.5a4.3 4.3 0 0 1 8 2.3C20 15.3 12 20 12 20z"/>',
  brick:
    '<rect x="3" y="10" width="18" height="9" rx="1.5"/><rect x="5.5" y="6.5" width="4" height="3.5" rx="1"/><rect x="14.5" y="6.5" width="4" height="3.5" rx="1"/>',
  game: '<path d="M7 8h10a4 4 0 0 1 4 4v2a3 3 0 0 1-5.4 1.8L14.5 14h-5l-1.1 1.8A3 3 0 0 1 3 14v-2a4 4 0 0 1 4-4zM8 10.5v3M6.5 12h3"/><circle cx="16" cy="11" r=".6"/><circle cx="17.5" cy="13" r=".6"/>',
  bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.5 6.5l8.5 7 8.5-7"/>',
  ruler:
    '<rect x="3" y="8" width="18" height="8" rx="1.5"/><path d="M7 8v3M11 8v4M15 8v3M18.5 8v2"/>',
  star: '<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/>',
  plug: '<path d="M9 3v5M15 3v5M6.5 8h11v3a5.5 5.5 0 0 1-11 0zM12 16.5V21"/>',
  note: '<path d="M9 18V5l11-2v13"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/>',
  ring: '<ellipse cx="11" cy="14" rx="8" ry="5.5"/><ellipse cx="11" cy="14" rx="4.8" ry="2.8"/><path d="M19 3.5v3.5M17.25 5.25h3.5"/>',
  paw: '<circle cx="6.5" cy="10.5" r="1.7"/><circle cx="10" cy="6.5" r="1.7"/><circle cx="14" cy="6.5" r="1.7"/><circle cx="17.5" cy="10.5" r="1.7"/><path d="M12 12c-3 0-5.5 3.2-5.5 5.2 0 1.6 1.4 2.3 2.8 1.9 1-.3 1.8-.6 2.7-.6s1.7.3 2.7.6c1.4.4 2.8-.3 2.8-1.9 0-2-2.5-5.2-5.5-5.2z"/>',
  bolt: '<path d="M13 2.5L5.5 13.5H11l-1 8 7.5-11H12z"/>',
  shield:
    '<path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z"/><path d="M14.5 9.5c-.6-1-3.6-1.3-3.9.3-.4 2 4.1 1.4 3.8 3.6-.3 1.7-3.5 1.5-4.2.3"/>',
  glasses:
    '<circle cx="6.5" cy="14" r="4"/><circle cx="17.5" cy="14" r="4"/><path d="M10.5 14q1.5-1.5 3 0M2.5 13L4 7M21.5 13L20 7"/>',
};
