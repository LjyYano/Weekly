import { getIssues, jsonResponse } from "@/agents";
import { SITE } from "@/config";

const site = SITE.homePage;

export const GET = () => {
  const zhIssues = getIssues("zh");
  const enIssues = getIssues("en");
  const latest = zhIssues[0]?.num ?? 1;

  return jsonResponse({
    name: `${SITE.title} content API`,
    description: SITE.description,
    version: "1.0.0",
    site,
    documentation: `${site}/llms.md`,
    openapi: `${site}/openapi.json`,
    agentIndex: `${site}/llms.txt`,
    auth: {
      required: false,
      scheme: null,
      note: "All endpoints are public prerendered files. There are no API keys, no OAuth flows, no sandbox and no write operations.",
    },
    cors: "*",
    counts: {
      chineseIssues: zhIssues.length,
      englishIssues: enIssues.length,
      latestIssue: latest,
      firstIssue: zhIssues[zhIssues.length - 1]?.num ?? null,
    },
    contentModel: {
      identifier: "issue number, stable across languages and never reused",
      publication: "Publication dates are recorded per issue; no fixed schedule is specified.",
      languages: [
        ...(zhIssues.length ? ["zh-Hans"] : []),
        ...(enIssues.length ? ["en"] : []),
      ],
      translations: "Available only when a matching issue exists; otherwise translation is null.",
      sections: "Headings vary by issue; read contentMarkdown for the actual sections.",
    },
    endpoints: [
      {
        method: "GET",
        path: "/api/index.json",
        description: "This document: endpoint list, counts and content model.",
      },
      {
        method: "GET",
        path: "/api/posts.json",
        description:
          "All issues, newest first, with title, date, description, cover image and per-issue URLs.",
      },
      {
        method: "GET",
        path: "/api/posts/{issue}.json",
        description:
          "One Chinese issue: metadata plus the full Markdown body and neighbour links.",
        example: `${site}/api/posts/${latest}.json`,
      },
      {
        method: "GET",
        path: "/api/en/posts/{issue}.json",
        description: "English translation when available; same response shape.",
        ...(enIssues[0] ? { example: enIssues[0].jsonUrl } : {}),
      },
      {
        method: "GET",
        path: "/posts/{issue}.md",
        description: "Chinese issue as Markdown (text/markdown).",
        example: `${site}/posts/${latest}.md`,
      },
      {
        method: "GET",
        path: "/en/posts/{issue}.md",
        description: "English issue when available, as Markdown (text/markdown).",
        ...(enIssues[0] ? { example: enIssues[0].mdUrl } : {}),
      },
      {
        method: "GET",
        path: "/index.md",
        description: "Site root as Markdown, every issue listed as a link.",
      },
      {
        method: "GET",
        path: "/feeds/posts.jsonl",
        description: "One schema.org BlogPosting JSON-LD object per line.",
      },
      {
        method: "GET",
        path: "/rss.xml",
        description: "RSS feed with the full HTML of recent issues.",
      },
    ],
    contact: {
      author: SITE.author,
      github: `https://github.com/${SITE.githubId}`,
      x: `https://x.com/${SITE.twitterId}`,
      issues: `https://github.com/${SITE.repo}/issues`,
    },
  });
};
