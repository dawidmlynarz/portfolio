/**
 * Dawid's career for the About timeline, newest first. Built from the 2026 CV and LinkedIn;
 * where the two disagree, LinkedIn wins (it is the newer of the two). `end` left out = to date.
 * `alongside` marks work that ran next to a full-time role (CSS Peeper, freelance), drawn as an
 * outlined bar so overlaps read at a glance.
 */
import type { Client } from "@/lib/clients";

/** "YYYY-MM" */
type Month = `${number}-${number}`;

export interface Role {
  id: string;
  /** Logo key from src/assets/clients; without one, the company name is set in type. */
  logo?: Client;
  company: string;
  role: string;
  start: Month;
  end?: Month;
  place: string;
  text: string;
  alongside?: boolean;
  /** [label, href]: case studies or other pages about this role. */
  links?: [string, string][];
}

export const CAREER: Role[] = [
  {
    id: "zazmic",
    logo: "zazmic",
    company: "Zazmic",
    role: "Lead Product & AI Transformation Designer",
    start: "2026-05",
    place: "Remote",
    text: "Designing enterprise AI products end to end: agentic UX, conversational flows, and the design system that holds them together.",
    links: [["Anvil UI case study", "/work/zazmic-anvil-ui"]],
  },
  {
    id: "newsweek",
    logo: "newsweek",
    company: "Newsweek",
    role: "Senior Product Designer, Design Systems",
    start: "2025-02",
    end: "2026-04",
    place: "New York · Remote",
    text: "The biggest redesign in Newsweek’s history. I co-led the design system that turned the new look into tokens and components, and worked on the AI reader features shown at Google’s AI Impact Summit.",
    links: [["Design system case study", "/work/newsweek-design-system"]],
  },
  {
    id: "yld",
    company: "YLD",
    role: "Design Systems Designer (contract)",
    start: "2024-08",
    end: "2025-02",
    place: "United Kingdom · Remote",
    text: "A design system for a large healthcare organisation. Accessibility and compliance shaped every component, and we tested it with a wide mix of people.",
  },
  {
    id: "xwp",
    logo: "xwp",
    company: "XWP",
    role: "Senior → Principal Product Designer, Design Lead",
    start: "2021-02",
    end: "2024-08",
    place: "Remote",
    text: "I led a remote design team across time zones on client work for NerdWallet, Pantheon and Google. The internal design system and processes we set up made the team about 30% faster.",
    links: [
      ["XWP", "/work/xwp"],
      ["NerdWallet", "/work/nerdwallet"],
      ["Pantheon", "/work/pantheon"],
      ["Google", "/work/google-wordpress-plugin"],
    ],
  },
  {
    id: "beatstars",
    logo: "beatstars",
    company: "BeatStars",
    role: "Senior Product Designer",
    start: "2020-08",
    end: "2021-02",
    place: "Austin · Remote",
    text: "Redesigned the seller side for over 2 million music creators and moved the team from Sketch to one cross-platform design system in Figma.",
    links: [
      ["Product design", "/work/beatstars-product-design"],
      ["Design system", "/work/beatstars-design-system"],
    ],
  },
  {
    id: "holidaycheck",
    logo: "holidaycheck",
    company: "HolidayCheck",
    role: "UI Designer → Senior Product Designer",
    start: "2016-05",
    end: "2020-07",
    place: "Poznań",
    text: "Launched a new product for cruise holidays that paid for itself in its first year, and rebuilt the B2B tool hoteliers use to run their listings.",
  },
  {
    id: "csspeeper",
    logo: "csspeeper",
    company: "CSS Peeper",
    role: "Co-founder & Founding Designer",
    start: "2016-12",
    place: "Remote",
    alongside: true,
    text: "My own product: a Chrome extension for inspecting styles, grown to 500,000+ users. In 2025 I led the relaunch and the move to a freemium model that pays its way.",
    links: [["Case study", "/work/csspeeper"]],
  },
  {
    id: "pearson",
    logo: "pearson",
    company: "Pearson",
    role: "Visual Designer → UI/UX Designer",
    start: "2012-07",
    end: "2016-04",
    place: "Poznań",
    text: "Where I learned the job: e-learning products for web, desktop, mobile and interactive whiteboards, in a design team that grew fast around me.",
  },
  {
    id: "freelance",
    company: "mlynarz.com",
    role: "Product Design Consultant",
    start: "2011-10",
    place: "Remote",
    alongside: true,
    text: "My own practice, next to everything above. Among others I led a remote team of freelance designers for X-Team and redesigned the Passion.io app builder.",
  },
  {
    id: "university",
    company: "Adam Mickiewicz University",
    role: "BA, Linguistics and Information Science",
    start: "2010-10",
    end: "2013-06",
    place: "Poznań",
    text: "My degree is in language, not design. The design part I taught myself.",
  },
];

/** The timeline's axis runs from the first start to the end of the current year. */
const toMonths = (month: Month) => {
  const [year, m] = month.split("-").map(Number);
  return year * 12 + (m - 1);
};

const now = new Date();
const nowMonths = now.getFullYear() * 12 + now.getMonth();
export const AXIS_START = Math.min(...CAREER.map((role) => Math.floor(toMonths(role.start) / 12)));
export const AXIS_END = now.getFullYear() + 1;
const span = (AXIS_END - AXIS_START) * 12;

/** Where the role's bar starts and how wide it is, as fractions of the axis. */
export function bar(role: Role) {
  const start = toMonths(role.start) - AXIS_START * 12;
  const end = (role.end ? toMonths(role.end) + 1 : nowMonths + 1) - AXIS_START * 12;
  return { start: start / span, size: (end - start) / span };
}

/** "Feb 2025 – Apr 2026", "Dec 2016 – now" */
export function dates(role: Role) {
  const label = (month: Month) => {
    const [year, m] = month.split("-").map(Number);
    return new Date(Date.UTC(year, m - 1)).toLocaleString("en-GB", {
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
  };
  return `${label(role.start)} – ${role.end ? label(role.end) : "now"}`;
}

/** "3 yrs 7 mos", counting both the first and the last month. */
export function duration(role: Role) {
  const months = (role.end ? toMonths(role.end) : nowMonths) - toMonths(role.start) + 1;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const parts = [];
  if (years) parts.push(`${years} yr${years > 1 ? "s" : ""}`);
  if (rest) parts.push(`${rest} mo${rest > 1 ? "s" : ""}`);
  return parts.join(" ") || "1 mo";
}
