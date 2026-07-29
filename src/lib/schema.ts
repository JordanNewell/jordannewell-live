import { SITE } from "./site";

export function personSchema() {
  return {
    "@type": "Person",
    "@id": `${SITE.url}/#person`,
    name: SITE.author.name,
    email: SITE.author.email,
    url: SITE.author.url,
    sameAs: SITE.author.sameAs,
    jobTitle: "Operator",
    description: SITE.description,
  };
}

export function websiteSchema() {
  return {
    "@type": "WebSite",
    "@id": `${SITE.url}/#website`,
    url: SITE.url,
    name: SITE.title,
    description: SITE.description,
    publisher: { "@id": `${SITE.url}/#person` },
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE.url}/tags/{search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function articleSchema(opts: {
  title: string;
  description: string;
  pubDate: Date;
  updatedDate?: Date;
  slug: string;
  tags: string[];
}) {
  return {
    "@type": "BlogPosting",
    "@id": `${SITE.url}/posts/${opts.slug}#article`,
    headline: opts.title,
    description: opts.description,
    datePublished: opts.pubDate.toISOString(),
    dateModified: (opts.updatedDate ?? opts.pubDate).toISOString(),
    author: { "@id": `${SITE.url}/#person` },
    publisher: { "@id": `${SITE.url}/#person` },
    mainEntityOfPage: `${SITE.url}/posts/${opts.slug}`,
    keywords: opts.tags.join(", "),
  };
}

export function organizationSchema(opts: {
  name: string;
  url: string; // external org URL (e.g. https://dwtrimco.com)
  description: string;
  employeeRole?: string; // e.g. "Managing Partner"
  pageUrl?: string; // canonical page on this site (defaults to /ventures/)
}) {
  return {
    "@type": "Organization",
    "@id": `${opts.pageUrl ?? `${SITE.url}/ventures/`}#org-${opts.name.toLowerCase().replace(/\s+/g, "-")}`,
    name: opts.name,
    url: opts.url,
    description: opts.description,
    employee: {
      "@type": "Person",
      "@id": `${SITE.url}/#person`,
      jobTitle: opts.employeeRole ?? "Member",
    },
  };
}

export function creativeWorkSchema(opts: {
  name: string;
  description: string;
  slug: string; // project slug for URL
  repo?: string;
  status?: string;
  tags?: string[];
}) {
  return {
    "@type": "CreativeWork",
    "@id": `${SITE.url}/projects/${opts.slug}#work`,
    name: opts.name,
    description: opts.description,
    url: `${SITE.url}/projects/${opts.slug}`,
    author: { "@id": `${SITE.url}/#person` },
    ...(opts.repo && { codeRepository: opts.repo }),
    ...(opts.status && { creativeWorkStatus: opts.status }),
    ...(opts.tags && opts.tags.length > 0 && { keywords: opts.tags.join(", ") }),
  };
}

export function softwareApplicationSchema(opts: {
  name: string;
  description: string;
  slug: string;
  repo?: string;
  homepage?: string;
  license?: string;
  shipDate?: Date;
  pricing?: string;
  faq?: Array<{ q: string; a: string }>;
}) {
  const pageUrl = `${SITE.url}/products/${opts.slug}`;
  return {
    "@type": "SoftwareApplication",
    "@id": `${pageUrl}#app`,
    name: opts.name,
    description: opts.description,
    url: pageUrl,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Cross-platform",
    author: { "@id": `${SITE.url}/#person` },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    ...(opts.repo && { codeRepository: opts.repo }),
    ...(opts.homepage && { isBasedOn: opts.homepage }),
    ...(opts.license && {
      license: opts.license === "MIT"
        ? "https://opensource.org/licenses/MIT"
        : opts.license,
    }),
    ...(opts.shipDate && { datePublished: opts.shipDate.toISOString() }),
    ...(opts.faq && opts.faq.length > 0 && {
      mainEntity: opts.faq.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    }),
  };
}

export function graphSchema(...types: object[]) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      personSchema(),
      websiteSchema(),
      ...types,
    ],
  };
}
