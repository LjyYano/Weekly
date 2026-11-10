---
name: weekly-issues
description: Read published issues of {{SITE_TITLE}} by {{SITE_AUTHOR}}. Find topics, tools and notes in the archive; translations are available only when linked in the issue index.
homepage: {{SITE_URL}}
---

# {{SITE_TITLE}}

{{SITE_TITLE}} is a personal newsletter by {{SITE_AUTHOR}}. {{SITE_DESCRIPTION}} Dates and available translations come from the issue index; no fixed publication schedule is specified.

Everything below is public static content: no API key, no token, `Access-Control-Allow-Origin: *`, and no write operations.

## When to use this

- A question names an issue number, or asks what a given week or month of {{SITE_TITLE}} covered.
- A task needs the tools, projects or articles {{SITE_AUTHOR}} highlighted, with the original wording and outbound links.
- A quote is needed from a published issue, or from a translation when available.

Do not use it as a general search engine or as official documentation for the products it mentions: it is one person's curation, and the products are third-party.

## Locate an issue

```
GET {{SITE_URL}}/api/posts.json
```

Returns every issue, newest first. This sample is generated from the current archive:

```json
{{LATEST_ISSUE_SAMPLE}}
```

For a compact human-readable index of the whole archive, fetch `{{SITE_URL}}/index.md`.

## Read an issue

Append `.md` to any issue URL to get the Markdown source:

```
GET {{SITE_URL}}/posts/{{LATEST_ISSUE}}.md      # Chinese
# English: follow translation.markdownUrl only when translation is non-null.
```

Or take metadata and body together as JSON:

```
GET {{SITE_URL}}/api/posts/{{LATEST_ISSUE}}.json
# English: follow translation.jsonUrl only when translation is non-null.
```

The JSON response carries `contentMarkdown` (the full Markdown body), `translation`, `newerIssue` and `olderIssue`.

## Bulk ingest

```
GET {{SITE_URL}}/feeds/posts.jsonl
```

One schema.org `BlogPosting` JSON-LD object per line, both languages. Prefer this plus `/api/posts.json` over crawling the HTML pages.

## Issue anatomy

- Dates, cover images and descriptions come from issue metadata.
- Section headings vary by issue; read contentMarkdown for the actual structure.
- Follow outbound links for original sources and product documentation.

## Errors and attribution

- Unknown issue numbers return HTTP 404; check response.ok before parsing a response body.
- For reuse terms, consult {{SITE_URL}}/about. The API does not grant a blanket license for articles or third-party assets.
- Source of every issue: {{REPOSITORY_URL}}
