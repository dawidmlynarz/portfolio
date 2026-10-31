import { defineCollection, reference } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { CLIENTS, type Client } from "./lib/clients";
import { DROP_TYPES, RARITIES, RARITY_INFO, SEASONS, STATUSES } from "./lib/grist";

/**
 * Case studies: one folder per case study, src/content/work/<slug>/index.mdx, with its images
 * next to it. The folder name is the slug, so URLs stay /work/<slug>.
 */
const work = defineCollection({
  loader: glob({
    pattern: "*/index.mdx",
    base: "./src/content/work",
    generateId: ({ entry }) => entry.split("/")[0]!,
  }),
  schema: ({ image }) =>
    z.object({
      /** Page headline, also used on cards. */
      title: z.string(),
      /** <title> override when the headline is too long for search results. */
      seoTitle: z.string().optional(),
      /** One or two sentences: card summary, lead paragraph and meta description. */
      description: z.string(),
      /** Meta description override when `description` is too long for search results (~160). */
      seoDescription: z.string().optional(),
      /** Page intro under the headline, when it differs from the card summary. */
      lead: z.string().optional(),
      company: z.string(),
      /** Logo above the case-study title: a key of CLIENTS (src/lib/clients.ts). */
      client: z.enum(Object.keys(CLIENTS) as [Client, ...Client[]]).optional(),
      role: z.string(),
      /** Agency or partner the work was done through, e.g. "XWP.co". */
      via: z.string().optional(),
      year: z.number().int().optional(),
      /** "Date" in the case-study facts, as Dawid writes it ("2021", "2016–2025"). Falls back to `year`. */
      date: z.string().optional(),
      industry: z.string(),
      business: z.string(),
      /** Label shown before `business` on cards ("Model" for SaaS/agency/product work). */
      businessLabel: z.enum(["Business", "Model"]).default("Business"),
      tags: z.array(z.string()).default([]),
      cover: image(),
      coverAlt: z.string().min(1, "Cover images need alt text."),
      /** Headline numbers shown in the case-study header. */
      metrics: z.array(z.object({ value: z.string(), label: z.string() })).default([]),
      /** Sort order on the Work and Home pages (ascending). */
      order: z.number(),
      next: reference("work").optional(),
      /**
       * Drafts are not built as pages and are hidden in production. Preview builds list them
       * (unlinked) so the migration can be reviewed.
       */
      draft: z.boolean().default(false),
      /** false: listed as a card without its own case-study page (no write-up exists). */
      page: z.boolean().default(true),
      /**
       * Private work: the page is locked behind a password on every build. Only the locked state
       * (header and cover, blurred) is public; the content is served by a Pages Function once the
       * password is entered (tooling/protected-work.mjs, functions/work/_middleware.ts).
       */
      protected: z.boolean().default(false),
    }),
});

/**
 * Grist drops: one folder per drop, src/content/grist/<slug>/, holding index.mdx (the note, in
 * Dawid's words) and drop.md (the loot itself, served raw at /grist/<slug>/drop.md). The drop type
 * is its format, the rarity how deep it goes, and the season slot sets the drop day (src/lib/grist.ts).
 */
const keys = <T extends Record<string, unknown>>(object: T) =>
  Object.keys(object) as [Extract<keyof T, string>, ...Extract<keyof T, string>[]];

const grist = defineCollection({
  loader: glob({
    pattern: "*/index.mdx",
    base: "./src/content/grist",
    generateId: ({ entry }) => entry.split("/")[0]!,
  }),
  schema: z
    .object({
      title: z.string(),
      /** One sentence: the card line, the tl;dr and the meta description. */
      summary: z.string(),
      /** One sentence at the top: when to use it and what you get. */
      hint: z.string(),
      /** How to use it, step by step. Prompt and up. */
      steps: z.array(z.string()).default([]),
      /** The body has a "## Example" section. Spec and up. */
      example: z.boolean().default(false),
      /** One line: when not to use it. Skill only. */
      limits: z.string().optional(),
      season: z.enum(keys(SEASONS)),
      drop: z.enum(keys(DROP_TYPES)),
      /** Set by hand: how deep the drop goes (RARITY_INFO). */
      rarity: z.enum(RARITIES),
      /** Used on real work, or something Dawid is trying (STATUSES). */
      status: z.enum(keys(STATUSES)),
      /** Where the idea came from, one plain sentence in Dawid's words. Guides and research, no
       * product names. Mostly for Trying drops. */
      source: z.string().optional(),
      /** Its place in the season, 1 to 8. The slot sets the drop day (src/lib/grist.ts). */
      slot: z.number().int().min(1).max(8),
      /** Slugs for See also. */
      related: z.array(z.string()).default([]),
      /** Drafts show on preview builds only. */
      draft: z.boolean().default(false),
    })
    .superRefine((data, ctx) => {
      for (const need of RARITY_INFO[data.rarity].needs) {
        const missing =
          need === "steps"
            ? data.steps.length === 0
            : need === "example"
              ? !data.example
              : !data.limits;
        if (missing)
          ctx.addIssue({
            code: "custom",
            path: [need],
            message: `A ${data.rarity} drop needs \`${need}\` (see RARITY_INFO in src/lib/grist.ts).`,
          });
      }
    }),
});

export const collections = { work, grist };
