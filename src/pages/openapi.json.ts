import { getIssues, jsonResponse } from "@/agents";
import { SITE } from "@/config";

const issueParam = {
  name: "issue",
  in: "path",
  required: true,
  description:
    "Issue number, stable across languages. 274 means the 274th weekly issue.",
  schema: { type: "integer", minimum: 1 },
};

const markdownResponse = (description: string) => ({
  "200": {
    description,
    content: {
      "text/markdown": { schema: { type: "string" } },
    },
  },
  "404": { description: "No issue with that number." },
});

export const GET = () => {
  const issues = getIssues("zh");
  const latest = issues[0]?.num ?? 1;

  return jsonResponse({
    openapi: "3.1.0",
    info: {
      title: "潮流周刊 (Tw93 Weekly) content API",
      summary:
        "Read-only access to every issue of the 潮流周刊 weekly newsletter.",
      description:
        "潮流周刊 (Tw93 Weekly) is a Chinese-language weekly newsletter of developer tools, engineering notes, design and life, written by Tw93 and translated into English. This API exposes the archive as JSON and Markdown. Every endpoint is a public prerendered static file: no authentication, no rate limit, no write operations, CORS open to all origins.",
      version: "1.0.0",
      contact: {
        name: "Tw93",
        url: SITE.homePage,
        email: "tw93@qq.com",
      },
      license: {
        name: "MIT (site code)",
        url: `https://github.com/${SITE.repo}/blob/main/LICENSE`,
      },
      termsOfService: `${SITE.homePage}/about`,
    },
    externalDocs: {
      description: "Agent guide: when to use this site and how to call it",
      url: `${SITE.homePage}/llms.md`,
    },
    servers: [{ url: SITE.homePage, description: "Production (static CDN)" }],
    security: [],
    tags: [
      { name: "index", description: "Service description and issue listings" },
      {
        name: "issues",
        description: "Single weekly issue in JSON or Markdown",
      },
      { name: "feeds", description: "Bulk and syndication formats" },
    ],
    paths: {
      "/api/index.json": {
        get: {
          operationId: "getApiIndex",
          tags: ["index"],
          summary: "Service description",
          description:
            "Endpoint list, issue counts, content model, licensing and contact details for the archive.",
          responses: {
            "200": {
              description: "Service description document.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ApiIndex" },
                },
              },
            },
          },
        },
      },
      "/api/posts.json": {
        get: {
          operationId: "listIssues",
          tags: ["index"],
          summary: "List every issue, newest first",
          description:
            "The complete archive index with title, publication date, one-line description, cover image and per-issue URLs, including the matching English translation when one exists.",
          responses: {
            "200": {
              description: "Issue index.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/IssueIndex" },
                },
              },
            },
          },
        },
      },
      "/api/posts/{issue}.json": {
        get: {
          operationId: "getIssue",
          tags: ["issues"],
          summary: "Get one Chinese issue with its Markdown body",
          description:
            "Metadata plus the full Markdown source of a single Chinese issue, with links to the English translation and the neighbouring issues.",
          parameters: [issueParam],
          responses: {
            "200": {
              description: "Issue with content.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/IssueDetail" },
                },
              },
            },
            "404": {
              description: "No issue with that number.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Error" },
                },
              },
            },
          },
        },
      },
      "/api/en/posts/{issue}.json": {
        get: {
          operationId: "getIssueEnglish",
          tags: ["issues"],
          summary: "Get the English translation of one issue",
          description:
            "Same shape as getIssue, returning the English translation of the issue with that number.",
          parameters: [issueParam],
          responses: {
            "200": {
              description: "Issue with content.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/IssueDetail" },
                },
              },
            },
            "404": {
              description: "No English issue with that number.",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Error" },
                },
              },
            },
          },
        },
      },
      "/posts/{issue}.md": {
        get: {
          operationId: "getIssueMarkdown",
          tags: ["issues"],
          summary: "Get one Chinese issue as Markdown",
          description:
            "The Markdown twin of the HTML issue page, headed by the issue title and its canonical links.",
          parameters: [issueParam],
          responses: markdownResponse("Issue as Markdown."),
        },
      },
      "/en/posts/{issue}.md": {
        get: {
          operationId: "getIssueMarkdownEnglish",
          tags: ["issues"],
          summary: "Get one English issue as Markdown",
          parameters: [issueParam],
          responses: markdownResponse("Issue as Markdown."),
        },
      },
      "/index.md": {
        get: {
          operationId: "getSiteMarkdown",
          tags: ["index"],
          summary: "Site root as Markdown",
          description:
            "Site description, endpoint map and a link to every issue.",
          responses: markdownResponse("Site root as Markdown."),
        },
      },
      "/en/index.md": {
        get: {
          operationId: "getSiteMarkdownEnglish",
          tags: ["index"],
          summary: "English site root as Markdown",
          responses: markdownResponse("English site root as Markdown."),
        },
      },
      "/llms.md": {
        get: {
          operationId: "getAgentGuide",
          tags: ["index"],
          summary: "Agent guide",
          description:
            "When to use this site, how to call it, content model, limits and attribution rules.",
          responses: markdownResponse("Agent guide as Markdown."),
        },
      },
      "/feeds/posts.jsonl": {
        get: {
          operationId: "getIssueFeed",
          tags: ["feeds"],
          summary: "JSON-LD feed of every issue",
          description:
            "Newline-delimited JSON: one schema.org BlogPosting object per issue, newest first.",
          responses: {
            "200": {
              description: "Newline-delimited JSON-LD.",
              content: {
                "application/x-ndjson": { schema: { type: "string" } },
              },
            },
          },
        },
      },
      "/rss.xml": {
        get: {
          operationId: "getRssFeed",
          tags: ["feeds"],
          summary: "RSS feed of recent Chinese issues",
          responses: {
            "200": {
              description: "RSS 2.0 feed.",
              content: {
                "application/rss+xml": { schema: { type: "string" } },
              },
            },
          },
        },
      },
    },
    components: {
      schemas: {
        Translation: {
          type: "object",
          description: "The same issue in the other language.",
          properties: {
            language: { type: "string", enum: ["zh-Hans", "en"] },
            title: { type: "string" },
            url: { type: "string", format: "uri" },
            markdownUrl: { type: "string", format: "uri" },
            jsonUrl: { type: "string", format: "uri" },
          },
        },
        IssueSummary: {
          type: "object",
          required: ["issue", "title", "date", "url", "markdownUrl"],
          properties: {
            issue: {
              type: "integer",
              description: "Issue number.",
              examples: [latest],
            },
            title: {
              type: "string",
              description: "Display title, e.g. 第 274 期 - 海阔天空.",
            },
            name: {
              type: "string",
              description: "Title without the issue number.",
            },
            language: { type: "string", enum: ["zh-Hans", "en"] },
            date: {
              type: "string",
              description: "Publication date, YYYY/MM/DD.",
              examples: ["2026/07/20"],
            },
            description: {
              type: "string",
              description: "One-line summary of the issue.",
            },
            coverImage: { type: ["string", "null"], format: "uri" },
            url: {
              type: "string",
              format: "uri",
              description: "Canonical HTML page.",
            },
            markdownUrl: { type: "string", format: "uri" },
            jsonUrl: { type: "string", format: "uri" },
            translation: {
              anyOf: [
                { $ref: "#/components/schemas/Translation" },
                { type: "null" },
              ],
            },
          },
        },
        IssueDetail: {
          allOf: [
            { $ref: "#/components/schemas/IssueSummary" },
            {
              type: "object",
              required: ["contentMarkdown"],
              properties: {
                contentMarkdown: {
                  type: "string",
                  description:
                    "Full Markdown source of the issue, frontmatter removed.",
                },
                contentFormat: { type: "string", const: "markdown" },
                source: {
                  type: "string",
                  format: "uri",
                  description: "File on GitHub.",
                },
                newerIssue: {
                  anyOf: [
                    { $ref: "#/components/schemas/IssueRef" },
                    { type: "null" },
                  ],
                },
                olderIssue: {
                  anyOf: [
                    { $ref: "#/components/schemas/IssueRef" },
                    { type: "null" },
                  ],
                },
              },
            },
          ],
        },
        IssueRef: {
          type: "object",
          properties: {
            issue: { type: "integer" },
            title: { type: "string" },
            url: { type: "string", format: "uri" },
          },
        },
        IssueIndex: {
          type: "object",
          required: ["count", "issues"],
          properties: {
            site: { type: "string", format: "uri" },
            name: { type: "string" },
            description: { type: "string" },
            count: {
              type: "integer",
              description: "Number of Chinese issues.",
            },
            englishCount: { type: "integer" },
            latestIssue: { type: "integer" },
            issues: {
              type: "array",
              items: { $ref: "#/components/schemas/IssueSummary" },
            },
          },
        },
        ApiIndex: {
          type: "object",
          properties: {
            name: { type: "string" },
            description: { type: "string" },
            version: { type: "string" },
            auth: {
              type: "object",
              description: "Always unauthenticated.",
              properties: {
                required: { type: "boolean", const: false },
                scheme: { type: ["string", "null"] },
                note: { type: "string" },
              },
            },
            counts: {
              type: "object",
              additionalProperties: { type: ["integer", "null"] },
            },
            endpoints: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  method: { type: "string" },
                  path: { type: "string" },
                  description: { type: "string" },
                  example: { type: "string", format: "uri" },
                },
              },
            },
          },
        },
        Error: {
          type: "object",
          required: ["error"],
          properties: {
            error: {
              type: "object",
              required: ["code", "message"],
              properties: {
                code: { type: "string", examples: ["issue_not_found"] },
                message: { type: "string" },
                hint: {
                  type: "string",
                  description: "How to recover from the error.",
                },
              },
            },
          },
        },
      },
    },
  });
};
