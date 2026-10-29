import { getImage } from "astro:assets";
import portrait from "@/assets/portrait/portrait-photo.avif";
import { SITE, SOCIAL_LINKS } from "@/lib/site";
import type { Service } from "@/lib/services";
import type { Plan } from "@/lib/plans";

/**
 * Structured data (JSON-LD) shared across pages. The Person and WebSite nodes have stable `@id`s,
 * so every page can point at the same entity instead of repeating it.
 */
export const personId = (site: URL) => new URL("/#person", site).href;
export const websiteId = (site: URL) => new URL("/#website", site).href;

/** Dawid as a schema.org Person, with a real headshot (not the share card). */
export async function person(site: URL) {
  const headshot = await getImage({ src: portrait, width: 800, format: "jpeg", quality: 82 });

  return {
    "@type": "Person",
    "@id": personId(site),
    name: SITE.name,
    alternateName: SITE.alternateName,
    jobTitle: SITE.jobTitle,
    url: site.href,
    email: `mailto:${SITE.email}`,
    image: new URL(headshot.src, site).href,
    address: { "@type": "PostalAddress", addressCountry: SITE.country },
    knowsAbout: SITE.knowsAbout,
    sameAs: SOCIAL_LINKS.map((link) => link.href),
  };
}

export const website = (site: URL) => ({
  "@type": "WebSite",
  "@id": websiteId(site),
  name: SITE.name,
  url: site.href,
  inLanguage: SITE.locale,
  publisher: { "@id": personId(site) },
});

/** Home › … › current page. `trail` is [name, path] pairs after Home. */
export const breadcrumbs = (site: URL, trail: [name: string, path: string][]) => ({
  "@type": "BreadcrumbList",
  itemListElement: [["Home", "/"] as const, ...trail].map(([name, path], index) => ({
    "@type": "ListItem",
    position: index + 1,
    name,
    item: new URL(path, site).href,
  })),
});

/** One of the services on /services, offered by Dawid. Each has an anchor on that page. */
export const service = (site: URL, { id, title, description }: Service) => ({
  "@type": "Service",
  "@id": new URL(`/services#${id}`, site).href,
  name: title,
  serviceType: title,
  description,
  url: new URL(`/services#${id}`, site).href,
  // Named as well as referenced: the full Person node lives on Home and About, not on /services.
  provider: { "@type": "Person", "@id": personId(site), name: SITE.name },
});

/** The plans on /services as one catalogue of offers, priced in USD. Custom plans carry no price. */
export const offerCatalog = (site: URL, plans: Plan[]) => ({
  "@type": "OfferCatalog",
  "@id": new URL("/services#plans", site).href,
  name: "Ways to work together",
  itemListElement: plans.map(({ id, title, promise, price, billing }) => ({
    "@type": "Offer",
    name: title,
    description: promise,
    url: new URL(`/services#${id}`, site).href,
    seller: { "@type": "Person", "@id": personId(site), name: SITE.name },
    ...(price && {
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price,
        priceCurrency: "USD",
        // UN/CEFACT code for month; one-off prices have no unit.
        ...(billing === "month" && { unitCode: "MON" }),
      },
    }),
  })),
});
