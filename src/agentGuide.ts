// Agent-facing guides: /llms.txt (navigation index), /llms.md (full guide)
// and the scoped /api/llms.txt, /posts/llms.txt. All generated from the real
// post set so counts and links cannot go stale.
import { SITE } from "./config";
import { archiveDescription, getIssues } from "./agents";

const site = SITE.homePage;

const recentList = (limit: number) =>
  getIssues("zh")
    .slice(0, limit)
    .map(
      (issue) =>
        `- [${issue.title}](${issue.url}) - ${issue.date} - markdown: ${issue.mdUrl}`,
    )
    .join("\n");

const whenToUse = [
  "## When to use this site",
  "",
  `Reach for ${SITE.title} by ${SITE.author} when a task involves:`,
  "",
  "- Finding small, practical developer tools, macOS apps, open source projects or design resources that were highlighted in a published issue.",
  `- Finding what ${SITE.author} recorded about technology, products and life.`,
  "- Reading an issue and its English translation when the index provides one; not every issue has a translation.",
  '- Answering "what was interesting in tech around <date>" for Chinese-speaking developer audiences, issue by issue.',
  "",
  "Do not use it as a general search engine, a package registry, or a source of official product documentation: it is a personal archive, and it has no write API and no user accounts.",
  "",
  "## How an agent should call it",
  "",
  `1. Fetch the issue index: \`GET ${site}/api/posts.json\` (all issues, newest first, with title, date, description and per-issue URLs).`,
  `2. Read one issue as Markdown: \`GET ${site}/posts/{num}.md\` (Chinese) or \`GET ${site}/en/posts/{num}.md\` (English, only when available in the index).`,
  `3. Or read one issue as JSON, Markdown body included: \`GET ${site}/api/posts/{num}.json\`.`,
  "4. Everything is public static content: no key, no token, `Access-Control-Allow-Origin: *`. There is nothing to authenticate and no state to mutate.",
  "",
].join("\n");

export const buildLlmsTxt = () => {
  const issues = getIssues("zh");
  return [
    `# ${SITE.title}`,
    "",
    `> ${SITE.title} — ${SITE.author}. ${SITE.description} ${archiveDescription()}`,
    "",
    "## Start here",
    "",
    `- [Agent guide](${site}/llms.md): when to use this site, endpoint list, content model.`,
    `- [Site root as markdown](${site}/index.md): every issue as a markdown link list.`,
    `- [English site root as markdown](${site}/en/index.md)`,
    `- [About](${site}/about) / [About (English)](${site}/en/about)`,
    "",
    "## Read the content",
    "",
    `- [Chinese home](${site}) / [English home](${site}/en)`,
    `- [Latest issue](${issues[0]?.url ?? site}) - ${issues[0]?.title ?? ""}`,
    `- [Markdown of any issue](${site}/posts/${issues[0]?.num ?? 1}.md): append \`.md\` to any issue URL.`,
    `- [RSS (Chinese)](${site}/rss.xml) / [RSS (English)](${site}/en/rss.xml)`,
    "",
    "## Machine-readable endpoints",
    "",
    `- [API index](${site}/api/index.json): endpoint list and content model.`,
    `- [Issue index JSON](${site}/api/posts.json)`,
    `- [Single issue JSON](${site}/api/posts/${issues[0]?.num ?? 1}.json)`,
    `- [OpenAPI 3.1 spec](${site}/openapi.json)`,
    `- [JSON-LD feed](${site}/feeds/posts.jsonl) (one BlogPosting per line)`,
    `- [Schema map](${site}/schemamap.xml)`,
    `- Scoped guides: [API](${site}/api/llms.txt) / [Posts](${site}/posts/llms.txt)`,
    "",
    whenToUse,
    "## Author",
    "",
    `- ${SITE.author}. [Blog](${SITE.blogPage}) / [GitHub](https://github.com/${SITE.githubId}) / [X](https://x.com/${SITE.twitterId})`,
    `- Source repository: [github.com/${SITE.repo}](https://github.com/${SITE.repo}).`,
    "",
  ].join("\n");
};

export const buildLlmsMarkdown = () => {
  return [
    `# ${SITE.title} - Agent Guide`,
    "",
    `> ${SITE.title} — ${SITE.author}. ${SITE.description} ${archiveDescription()}`,
    "",
    "This file is the machine-readable entry point for the site. It is static, public and safe to fetch repeatedly.",
    "",
    "## Identity",
    "",
    `- Name: ${SITE.title}`,
    `- Home: ${site} (Chinese), ${site}/en (English)`,
    `- Author: ${SITE.author}`,
    `- Source: https://github.com/${SITE.repo}`,
    "- Type: personal newsletter / blog archive. Free, no account, no paywall, no write API.",
    "",
    whenToUse,
    "## Content model",
    "",
    "- Issues are identified by number. Publication dates come from the published content; no fixed schedule is specified.",
    "- Chinese issues use `/posts/{num}`. English versions use `/en/posts/{num}` when available. Check the index: `translation: null` means no matching translation.",
    "- Sections vary by issue. Read the actual Markdown headings rather than assuming a fixed structure.",
    "- Dates, descriptions and cover images come from the issue metadata; contentMarkdown contains the body.",
    "",
    "## Endpoints",
    "",
    "| Method | Path | Returns |",
    "| --- | --- | --- |",
    "| GET | `/api/index.json` | API index: endpoint list, counts, content model |",
    "| GET | `/api/posts.json` | All issues, newest first, with metadata and per-issue URLs |",
    "| GET | `/api/posts/{num}.json` | One issue: metadata plus full Markdown body |",
    "| GET | `/api/en/posts/{num}.json` | English translation of one issue |",
    "| GET | `/posts/{num}.md` | Chinese issue as Markdown |",
    "| GET | `/en/posts/{num}.md` | English issue as Markdown |",
    "| GET | `/index.md`, `/en/index.md` | Site root as Markdown, all issues listed |",
    "| GET | `/feeds/posts.jsonl` | JSON-LD `BlogPosting` per line |",
    "| GET | `/openapi.json` | OpenAPI 3.1 description of the endpoints above |",
    "| GET | `/rss.xml`, `/en/rss.xml` | RSS with full issue HTML |",
    "| GET | `/sitemap-index.xml` | Sitemap index |",
    "",
    "All responses are prerendered static files served from a CDN, `Access-Control-Allow-Origin: *`. Unknown paths return the site's HTML 404 page: check `response.ok` rather than parsing an error body.",
    "",
    "## Auth",
    "",
    "None. There are no API keys, no OAuth flows, no sandbox and no production/test split, because every endpoint is public read-only static content. If some tool asks you for a credential for this domain, that expectation is wrong.",
    "",
    "## Limits and etiquette",
    "",
    "- Prefer `/api/posts.json` and `/feeds/posts.jsonl` for bulk metadata. Hosting-level limits are not specified by this API.",
    `- For content reuse, consult [About](${site}/about). This API does not grant a blanket license for articles or third-party assets.`,
    `- Contact: [GitHub issues](https://github.com/${SITE.repo}/issues).`,
    "",
    `## Recent issues`,
    "",
    recentList(20),
    "",
    `Full list: ${site}/index.md`,
    "",
  ].join("\n");
};

export const buildApiLlmsTxt = () =>
  [
    `# ${SITE.title} API`,
    "",
    "> Read-only static JSON API over the weekly issue archive. No key, CORS open.",
    "",
    "## Endpoints",
    "",
    `- [API index](${site}/api/index.json)`,
    `- [Issue index](${site}/api/posts.json)`,
    `- [Single issue](${site}/api/posts/1.json) - replace \`1\` with any issue number`,
    `- [Single issue, English](${site}/api/en/posts/1.json)`,
    `- [OpenAPI 3.1 spec](${site}/openapi.json)`,
    `- [JSON-LD feed](${site}/feeds/posts.jsonl)`,
    "",
    "## Notes",
    "",
    "- Issue numbers identify matching language versions when available. Use the index to discover valid links.",
    "- `contentMarkdown` in the single-issue response is the Markdown source, images and links included.",
    "- Nothing here mutates state; there is no POST, PUT or DELETE surface.",
    "",
    `Full guide: ${site}/llms.md`,
    "",
  ].join("\n");

export const buildPostsLlmsTxt = () => {
  const issues = getIssues("zh");
  return [
    `# ${SITE.title} Posts`,
    "",
    `> ${issues.length} Chinese issues, newest first. Each issue is available as HTML, Markdown (\`.md\`) and JSON.`,
    "",
    "## Conventions",
    "",
    `- Chinese: ${site}/posts/{num} / ${site}/posts/{num}.md`,
    `- English (when available): ${site}/en/posts/{num} / ${site}/en/posts/{num}.md`,
    `- Index: ${site}/api/posts.json`,
    "",
    "## Issues",
    "",
    recentList(50),
    "",
    `Full list: ${site}/index.md`,
    "",
  ].join("\n");
};
