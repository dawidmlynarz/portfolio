import { defineCollection, reference } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { CLIENTS, type Client } from "./lib/clients";
import { QUEST_TYPES, STATUSES, VOLUMES } from "./lib/grist";

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
 * Grist quests: one MDX file per quest, src/content/grist/<slug>.mdx. The body holds the sections
 * (My current take, Anatomy, Known issues…); rarity, version and dates shown on the page are
 * derived from `started` and `levelUps` in src/lib/grist.ts, never stored.
 */
const keys = <T extends Record<string, unknown>>(object: T) =>
  Object.keys(object) as [Extract<keyof T, string>, ...Extract<keyof T, string>[]];

const grist = defineCollection({
  loader: glob({ pattern: "*.mdx", base: "./src/content/grist" }),
  schema: z.object({
    title: z.string(),
    volume: z.enum(keys(VOLUMES)),
    /** The tl;dr: one sentence, also the meta description. */
    definition: z.string(),
    /** Shorter line under the title in quest rows. Falls back to `definition`. */
    summary: z.string().optional(),
    status: z.enum(keys(STATUSES)),
    type: z.enum(keys(QUEST_TYPES)),
    /** Real publish date. Never backdated; a future date stays off production until then. */
    started: z.coerce.date(),
    /** Level-ups that have actually happened, oldest first. Each one raises the rarity a tier. */
    levelUps: z
      .array(z.object({ version: z.string(), date: z.coerce.date(), grew: z.string() }))
      .default([]),
    /** What the next level-up will probably bring (Next rank). */
    next: z.string().optional(),
    /** Slugs for See also. */
    related: z.array(z.string()).default([]),
    /** Tie-break among quests started the same day: lower comes first. */
    order: z.number().default(0),
    /** Drafts show on preview builds only. */
    draft: z.boolean().default(false),
  }),
});

export const collections = { work, grist };
