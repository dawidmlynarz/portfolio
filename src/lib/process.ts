/**
 * Copy for two /services sections: how a project runs, start to finish (the Process timeline),
 * and what Dawid believes about design and AI (Beliefs). Both are Dawid's own wording.
 */
export interface Step {
  title: string;
  text: string;
}

export const STEPS: Step[] = [
  {
    title: "A 30-minute call",
    text: "No deck. You describe the problem in your own words. You leave with my honest read, even if we never work together.",
  },
  {
    title: "A one-page proposal in two business days",
    text: "Scope, timeline, investment, and how we’ll measure success.",
  },
  {
    title: "Kickoff within two weeks",
    text: "I’m in your Slack, Figma and repo from day one.",
  },
  {
    title: "A weekly rhythm",
    text: "A short written update, one live session, and decisions recorded as we go.",
  },
  {
    title: "Humans stay in charge of quality",
    text: "I design the review gates so your people spend their judgment on decisions, not on catching the same mistake in every PR.",
  },
  {
    title: "A clean handover",
    text: "A recorded walkthrough, documentation your team owns and a 30-day check-in. You own everything, so it keeps working after I’m gone.",
  },
];

/** Each belief reads as one sentence in two tones: the claim (ink), then why (muted). */
export interface Belief {
  claim: string;
  reason: string;
}

export const BELIEFS: Belief[] = [
  {
    claim: "Prompts are the new handoff.",
    reason: "If a machine can’t read your design system, it isn’t finished.",
  },
  {
    claim: "An agent that can’t say “I’m not sure”",
    reason: "is a liability, not a feature.",
  },
  {
    claim: "Speed without review",
    reason: "is just a faster way to ship the wrong thing.",
  },
  {
    claim: "The best AI strategy",
    reason: "includes a list of what not to automate.",
  },
  {
    claim: "Designers aren’t being replaced.",
    reason: "They’re being promoted to the decisions only a designer can make.",
  },
  {
    claim: "Measure it or it didn’t happen.",
    reason: "Impact should be a number, not a mood.",
  },
];
