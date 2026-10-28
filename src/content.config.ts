import { defineCollection, reference } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { CLIENTS, type Client } from "./lib/clients";

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
      /** Page intro under the headline, when it differs from the card summary. */
      lead: z.string().optional(),
      company: z.string(),
      /** Logo above the case-study title: a key of CLIENTS (src/lib/clients.ts). */
      client: z.enum(Object.keys(CLIENTS) as [Client, ...Client[]]).optional(),
      role: z.string(),
      /** Agency or partner the work was done through, e.g. "XWP.co". */
      via: z.string().optional(),
      year: z.number().int().optional(),
      industry: z.string(),
      business: z.string(),
      /** Label shown before `business` on cards ("Model" for SaaS/agency/product work). */
      businessLabel: z.enum(["Business", "Model"]).default("Business"),
      tags: z.array(z.string()).default([]),
      cover: image(),
      coverAlt: z.string().min(1, "Cover images need alt text."),
      /** Headline numbers shown in the case-study header. */
      metrics: z.array(z.object({ value: z.string(), label: z.string() })).default([]),
      link: z.object({ href: z.url(), label: z.string() }).optional(),
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
       * Was password-protected on Webflow. A protected draft gets no page on previews either
       * (preview URLs are public) unless SHOW_PROTECTED_DRAFTS is set for an Access-protected
       * preview environment. Remove the flag once the content is cleared to be public.
       */
      protected: z.boolean().default(false),
    }),
});

export const collections = { work };
