import { getImage } from "astro:assets";
import portrait from "@/assets/portrait/portrait-photo.avif";
import { SITE, SOCIAL_LINKS } from "@/lib/site";

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
