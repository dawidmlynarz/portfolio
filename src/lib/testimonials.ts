/**
 * Quotes on /services, trimmed from LinkedIn recommendations (Dawid's export, October 2026) to the
 * lines about the services he offers. Wording stays the recommender's own; only cuts and the odd
 * "he" for "Dawid" are changed. Role and company are the recommender's current LinkedIn headline.
 * Newest first.
 */
export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  company?: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "As a lead on the Newsweek Design System, he accomplished what typically takes teams over a year to build, in less than three months.",
    name: "George Yoon",
    role: "Director of Product Design",
    company: "Newsweek",
  },
  {
    quote:
      "A talented, forward-thinking product designer with great technical acuity, fantastic taste and strong design skill. I’d work with him again in a heartbeat.",
    name: "Chris Beaumont",
    role: "Director of Product Management",
    company: "Newsweek",
  },
  {
    quote:
      "He works seamlessly across engineering, product and leadership teams, and elevates the quality of the work around him.",
    name: "Anthony A. Marin",
    role: "Software Engineering",
    company: "Newsweek",
  },
  {
    quote:
      "We collaborated on several large-scale projects, including two major site redesigns. His proactive, ‘outside the box’ thinking consistently led to visually stunning and effective solutions.",
    name: "Scott Batchelor",
    role: "Fractional Marketing Lead",
  },
  {
    quote:
      "An incredibly effective and experienced design leader. His ability to structure process and develop scalable design solutions is invaluable to the people he works with.",
    name: "Rohan Mohana",
    role: "Lead Product Designer",
    company: "CoinGecko",
  },
];
