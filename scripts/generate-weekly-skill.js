import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(SCRIPT_DIR, "..");
const TEMPLATE = path.join(SCRIPT_DIR, "templates/weekly-issues.SKILL.md");
const OUTPUT = path.join(ROOT, "public/skills/weekly-issues/SKILL.md");

export function assertApiSummary(apiSummary) {
  const latest = apiSummary?.issues?.find(
    (issue) => issue.issue === apiSummary.latestIssue,
  );
  if (
    !Number.isSafeInteger(apiSummary?.count) ||
    !Number.isSafeInteger(apiSummary?.englishCount) ||
    !Number.isSafeInteger(apiSummary?.latestIssue) ||
    apiSummary?.issues?.length !== apiSummary.count ||
    !latest
  ) {
    throw new Error("Built /api/posts.json has an invalid summary shape");
  }
  return latest;
}

export async function renderWeeklySkill(apiSummary) {
  const latest = assertApiSummary(apiSummary);
  const sample = {
    count: apiSummary.count,
    englishCount: apiSummary.englishCount,
    latestIssue: apiSummary.latestIssue,
    issues: [latest],
  };

  const template = await fs.readFile(TEMPLATE, "utf8");
  return template
    .replaceAll("{{LATEST_ISSUE}}", String(apiSummary.latestIssue))
    .replace("{{LATEST_ISSUE_SAMPLE}}", JSON.stringify(sample, null, 2));
}

export async function writeWeeklySkill(apiSummary) {
  await fs.writeFile(OUTPUT, await renderWeeklySkill(apiSummary));
}

export async function checkWeeklySkill(apiSummary) {
  const expected = await renderWeeklySkill(apiSummary);
  const actual = await fs.readFile(OUTPUT, "utf8");
  if (actual !== expected) {
    throw new Error(
      "public/skills/weekly-issues/SKILL.md is stale; run pnpm sync:content",
    );
  }
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const command = process.argv[2];
  const apiPath = process.argv[3];
  if (!apiPath || !["--write-from-api", "--check-from-api"].includes(command)) {
    console.error(
      "usage: generate-weekly-skill.js --write-from-api|--check-from-api <dist/api/posts.json>",
    );
    process.exitCode = 1;
  } else {
    const action =
      command === "--write-from-api" ? writeWeeklySkill : checkWeeklySkill;
    fs.readFile(path.resolve(ROOT, apiPath), "utf8")
      .then(JSON.parse)
      .then(action)
      .catch((error) => {
        console.error(error.message);
        process.exitCode = 1;
      });
  }
}
