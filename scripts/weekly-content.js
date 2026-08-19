import { promises as fs } from "node:fs";
import path from "node:path";

export function parseIssueFilename(filename, label = "issue file") {
  const match = /^(\d+)-(.+)\.md$/.exec(filename);
  if (!match) {
    throw new Error(`${label} has invalid filename: ${filename}`);
  }

  const issue = Number.parseInt(match[1], 10);
  if (!Number.isSafeInteger(issue) || issue < 1) {
    throw new Error(`${label} has invalid issue number: ${filename}`);
  }

  return { issue, title: match[2], numberPart: match[1] };
}

export function canonicalIssueFilename(filename, width) {
  const { issue, title } = parseIssueFilename(filename);
  return `${String(issue).padStart(width, "0")}-${title}.md`;
}

export function indexIssueFiles(files, label) {
  const byIssue = new Map();

  for (const filename of files.filter((file) => file.endsWith(".md"))) {
    const { issue } = parseIssueFilename(filename, label);
    const existing = byIssue.get(issue);
    if (existing) {
      throw new Error(
        `${label} contains duplicate issue ${issue}: ${existing}, ${filename}`,
      );
    }
    byIssue.set(issue, filename);
  }

  return byIssue;
}

export function assertCanonicalIssueFilenames(files, label, width) {
  for (const filename of files.filter((file) => file.endsWith(".md"))) {
    const canonical = canonicalIssueFilename(filename, width);
    if (filename !== canonical) {
      throw new Error(
        `${label} filename must be ${canonical}, got ${filename}`,
      );
    }
  }
}

export function issueNumbers(byIssue) {
  return [...byIssue.keys()].sort((a, b) => b - a);
}

export async function readIssueArchive(directory, label, width) {
  const files = (await fs.readdir(directory)).filter((file) =>
    file.endsWith(".md"),
  );
  assertCanonicalIssueFilenames(files, label, width);
  const byIssue = indexIssueFiles(files, label);

  return Promise.all(
    issueNumbers(byIssue).map(async (issue) => {
      const filename = byIssue.get(issue);
      const { title } = parseIssueFilename(filename, label);
      const content = await fs.readFile(path.join(directory, filename), "utf8");
      const image = content.match(/<img\s+src="([^"]+)"/)?.[1] ?? "";
      const description =
        content.match(/<small>(.*?)<\/small>/s)?.[1]?.trim() ?? "";
      return {
        filename,
        post: {
          num: issue,
          title,
          url: `https://weekly.tw93.fun/posts/${issue}`,
          pic: image,
          description,
        },
      };
    }),
  );
}

export function assertPostRecordsEqual(actual, expected) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(
      "public/posts.json does not match the Chinese archive fields or order; run node build.js",
    );
  }
}
