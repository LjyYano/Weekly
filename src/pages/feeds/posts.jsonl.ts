// Newline-delimited JSON-LD: one schema.org BlogPosting per issue, so agents
// can ingest the structured graph without scraping HTML.
import { getIssues, textResponse, type Issue } from "@/agents";
import { SITE } from "@/config";

const isoDate = (date: string) => date.replace(/\//g, "-");

const blogPosting = (issue: Issue) => ({
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "@id": `${issue.url}#blogposting`,
  identifier: issue.num,
  headline: issue.title,
  name: issue.title,
  description: issue.description || undefined,
  image: issue.image || undefined,
  inLanguage: issue.lang === "en" ? "en" : "zh-Hans",
  datePublished: isoDate(issue.date),
  dateModified: isoDate(issue.date),
  url: issue.url,
  encoding: {
    "@type": "MediaObject",
    encodingFormat: "text/markdown",
    contentUrl: issue.mdUrl,
  },
  isPartOf: {
    "@type": "Blog",
    "@id": `${SITE.homePage}/#blog`,
    name: SITE.title,
    url: SITE.homePage,
  },
  author: {
    "@type": "Person",
    "@id": `${SITE.homePage}/#author`,
    name: SITE.author,
    url: SITE.blogPage,
  },
  publisher: {
    "@type": "Organization",
    "@id": `${SITE.homePage}/#organization`,
    name: SITE.title,
    url: SITE.homePage,
  },
  license: `${SITE.homePage}/about`,
});

export const GET = () => {
  const lines = [...getIssues("zh"), ...getIssues("en")]
    .map((issue) => JSON.stringify(blogPosting(issue)))
    .join("\n");
  return textResponse(`${lines}\n`, "application/x-ndjson; charset=utf-8");
};
