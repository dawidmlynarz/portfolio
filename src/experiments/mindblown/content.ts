/**
 * Mindblown About: the thought cards and the stripe. Edit copy here; the animation lives in
 * mindblown.ts. `short` is the label on screens under 1000px wide; `icon` is a key of ICONS.
 */
export type IconName = keyof typeof ICONS;

export interface Thought {
  label: string;
  short: string;
  tag: string;
  icon: IconName;
  title: string;
  body?: string;
  stat?: [string, string];
  chips?: string[];
  email?: string;
  links?: [string, string][];
}

export const ITEMS: Thought[] = [
  {
    label: "Product design",
    short: "Design",
    tag: "what I do",
    icon: "pen",
    title: "Self-taught product designer",
    stat: ["Millions", "of people use products I've worked on"],
    body: "I help companies build meaningful, user-centered digital experiences, across B2C, B2B, enterprise and SaaS.",
    chips: ["B2C", "B2B", "Enterprise", "SaaS"],
  },
  {
    label: "Design systems",
    short: "Systems",
    tag: "build & scale",
    icon: "grid",
    title: "Design systems, from zero to scale",
    body: "I set up design systems and help them grow with the product, so teams ship faster and the UI stays consistent.",
  },
  {
    label: "Research",
    short: "Research",
    tag: "evidence first",
    icon: "search",
    title: "Research before pixels",
    body: "Qualitative and quantitative UX research, usability testing and A/B tests. Opinions are welcome; data settles them.",
    chips: ["Interviews", "Usability tests", "A/B tests", "Analytics"],
  },
  {
    label: "Mobile apps",
    short: "Apps",
    tag: "iOS & Android",
    icon: "phone",
    title: "Native apps for iOS and Android",
    body: "Native app design, plus the structure underneath it: information architecture and interaction design.",
    chips: ["iOS", "Android", "Information architecture", "Interaction design"],
  },
  {
    label: "Leading teams",
    short: "Leading",
    tag: "people",
    icon: "people",
    title: "Leading and mentoring designers",
    body: "I manage design teams, mentor designers, and work with stakeholders inside and outside the company.",
  },
  {
    label: "How I work",
    short: "Process",
    tag: "process",
    icon: "loop",
    title: "How I work",
    body: "Lean UX, Agile and design thinking, with human-centered and customer-focused design as the default.",
    chips: ["Lean UX", "Agile", "Design thinking", "HCD", "CX"],
  },
  {
    label: "Founder",
    short: "Founder",
    tag: "startup",
    icon: "rocket",
    title: "Startup founder",
    body: "I've founded a startup, so I know the other side of the table too.",
  },
  {
    label: "Poznań",
    short: "Poznań",
    tag: "home base",
    icon: "pin",
    title: "Based in Poznań, Poland",
    body: "Working from Poznań, on Central European Time.",
  },
  {
    label: "Family",
    short: "Family",
    tag: "off the clock",
    icon: "heart",
    title: "Husband, dad and dog owner",
    body: "My favourite time is spent with my wife, our daughter and our dog.",
  },
  {
    label: "LEGO",
    short: "LEGO",
    tag: "fan",
    icon: "brick",
    title: "LEGO fan",
    body: "I assemble LEGO. A good instruction booklet is basically a perfect onboarding flow.",
  },
  {
    label: "Gaming",
    short: "Gaming",
    tag: "late nights",
    icon: "game",
    title: "Late-night gamer",
    body: "When the house goes quiet, the controller comes out.",
  },
  {
    label: "INTJ",
    short: "INTJ",
    tag: "personality",
    icon: "bulb",
    title: "INTJ",
    body: "Officially an INTJ. I plan things, then I plan the plan.",
  },
  {
    label: "YouTube",
    short: "YouTube",
    tag: "past life",
    icon: "play",
    title: "Ex-YouTuber",
    body: "I used to make YouTube videos. Ask me about them.",
  },
  {
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

/** Card landing spots above 1000px, as fractions of the stage (centre of card). */
export const SLOTS_WIDE: [number, number][] = [
  [0.1, 0.14],
  [0.29, 0.1],
  [0.5, 0.08],
  [0.71, 0.1],
  [0.9, 0.14],
  [0.11, 0.37],
  [0.27, 0.25],
  [0.71, 0.3],
  [0.89, 0.37],
  [0.24, 0.5],
  [0.76, 0.5],
  [0.11, 0.62],
  [0.89, 0.62],
  [0.13, 0.8],
];

/** Phones and tablets: 3 columns (fraction of the width) by row number. */
export const SLOTS_NARROW: [number, number][] = [
  [0.19, 0],
  [0.5, 0],
  [0.81, 0],
  [0.19, 1],
  [0.5, 1],
  [0.81, 1],
  [0.19, 2],
  [0.5, 2],
  [0.81, 2],
  [0.19, 3],
  [0.5, 3],
  [0.81, 3],
  [0.3, 4],
  [0.7, 4],
];

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
  loop: '<path d="M20 12a8 8 0 0 1-14 5.3M4 12a8 8 0 0 1 14-5.3"/><path d="M18 3v4h-4M6 21v-4h4"/>',
  rocket:
    '<path d="M12 15l-3-3c1.5-4.5 4.5-8 10-9-1 5.5-4.5 8.5-9 10"/><path d="M9 12l-4 .5L4 16l3.5-.5M12 15l-.5 4 3.5-1 .5-4"/><circle cx="15" cy="9" r="1.4"/>',
  pin: '<path d="M12 21s-7-6.5-7-12a7 7 0 0 1 14 0c0 5.5-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/>',
  heart:
    '<path d="M12 20s-8-4.7-8-10.2A4.3 4.3 0 0 1 12 7.5a4.3 4.3 0 0 1 8 2.3C20 15.3 12 20 12 20z"/>',
  brick:
    '<rect x="3" y="10" width="18" height="9" rx="1.5"/><rect x="5.5" y="6.5" width="4" height="3.5" rx="1"/><rect x="14.5" y="6.5" width="4" height="3.5" rx="1"/>',
  game: '<path d="M7 8h10a4 4 0 0 1 4 4v2a3 3 0 0 1-5.4 1.8L14.5 14h-5l-1.1 1.8A3 3 0 0 1 3 14v-2a4 4 0 0 1 4-4zM8 10.5v3M6.5 12h3"/><circle cx="16" cy="11" r=".6"/><circle cx="17.5" cy="13" r=".6"/>',
  bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>',
  play: '<rect x="3" y="5.5" width="18" height="13" rx="3.5"/><path d="M10.5 9.5v5l4.5-2.5z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.5 6.5l8.5 7 8.5-7"/>',
};
