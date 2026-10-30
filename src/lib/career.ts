/**
 * Dawid's career for the About timeline, newest first. Built from the 2026 CV and LinkedIn;
 * where the two disagree, LinkedIn wins (it is the newer of the two). `end` left out = to date.
 * `fractional` marks work that runs next to a main role (consulting, CSS Peeper).
 */
/** "YYYY-MM" */
type Month = `${number}-${number}`;

export interface Role {
  id: string;
  company: string;
  role: string;
  start: Month;
  end?: Month;
  text: string;
  fractional?: boolean;
  /** [label, href]: case studies or other pages about this role. */
  links?: [string, string][];
}

export const CAREER: Role[] = [
  {
    id: "zazmic",
    company: "Zazmic",
    role: "Lead Product & AI Designer",
    start: "2026-05",
    text: "Designing enterprise AI products end to end: agentic UX, conversational flows, and the design system that holds them together.",
    links: [["Anvil UI case study", "/work/zazmic-anvil-ui"]],
  },
  {
    id: "freelance",
    company: "mlynarz.com",
    role: "Product Design Consultant",
    start: "2011-10",
    fractional: true,
    text: "My own practice, next to everything above. Among others I led a remote team of freelance designers for X-Team and redesigned the Passion.io app builder.",
  },
  {
    id: "csspeeper",
    company: "CSS Peeper",
    role: "Co-founder & Founding Designer",
    start: "2016-12",
    fractional: true,
    text: "My own product: a Chrome extension for inspecting styles, grown to 500,000+ users. In 2025 I led the relaunch and the move to a freemium model that pays its way.",
    links: [["Case study", "/work/csspeeper"]],
  },
  {
    id: "newsweek",
    company: "Newsweek",
    role: "Senior Product Designer, Design Systems",
    start: "2025-02",
    end: "2026-04",
    text: "The biggest redesign in Newsweek’s history. I co-led the design system that turned the new look into tokens and components, and worked on the AI reader features shown at Google’s AI Impact Summit.",
    links: [["Design system case study", "/work/newsweek-design-system"]],
  },
  {
    id: "yld",
    company: "YLD",
    role: "Design Systems Designer",
    start: "2024-08",
    end: "2025-02",
    text: "A design system for a large healthcare organisation. Accessibility and compliance shaped every component, and we tested it with a wide mix of people.",
  },
  {
    id: "xwp",
    company: "XWP",
    role: "Principal Product Designer & Design Lead",
    start: "2021-02",
    end: "2024-08",
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
    company: "BeatStars",
    role: "Senior Product Designer",
    start: "2020-08",
    end: "2021-02",
    text: "Redesigned the seller side for over 2 million music creators and moved the team from Sketch to one cross-platform design system in Figma.",
    links: [
      ["Product design", "/work/beatstars-product-design"],
      ["Design system", "/work/beatstars-design-system"],
    ],
  },
  {
    id: "holidaycheck",
    company: "HolidayCheck",
    role: "Senior Product Designer",
    start: "2016-05",
    end: "2020-07",
    text: "Launched a new product for cruise holidays that paid for itself in its first year, and rebuilt the B2B tool hoteliers use to run their listings.",
  },
  {
    id: "pearson",
    company: "Pearson",
    role: "UI/UX Designer",
    start: "2012-07",
    end: "2016-04",
    text: "Where I learned the job: e-learning products for web, desktop, mobile and interactive whiteboards, in a design team that grew fast around me.",
  },
];

const toMonths = (month: Month) => {
  const [year, m] = month.split("-").map(Number);
  return year * 12 + (m - 1);
};

const now = new Date();
const nowMonths = now.getFullYear() * 12 + now.getMonth();

/** "2021 – 2024", "2016 – now" */
export function years(role: Role) {
  return `${role.start.slice(0, 4)} – ${role.end ? role.end.slice(0, 4) : "now"}`;
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
