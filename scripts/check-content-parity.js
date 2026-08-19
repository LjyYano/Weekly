import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { checkWeeklySkill } from "./generate-weekly-skill.js";
import {
  assertCanonicalIssueFilenames,
  assertPostRecordsEqual,
  indexIssueFiles,
  issueNumbers,
  readIssueArchive,
} from "./weekly-content.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ZH_DIR = path.join(ROOT, "src/pages/posts");
const EN_DIR = path.join(ROOT, "src/pages/en/posts");
const apiFlag = process.argv.indexOf("--dist-api");
if (apiFlag === -1 || !process.argv[apiFlag + 1]) {
  throw new Error(
    "content parity requires the built API; run pnpm test or pass --dist-api <path>",
  );
}
const apiPath = path.resolve(ROOT, process.argv[apiFlag + 1]);

const markdownFiles = async (directory) =>
  (await fs.readdir(directory)).filter((filename) => filename.endsWith(".md"));

const zhFiles = await markdownFiles(ZH_DIR);
const enFiles = await markdownFiles(EN_DIR);
assertCanonicalIssueFilenames(zhFiles, "Chinese posts", 2);
assertCanonicalIssueFilenames(enFiles, "English posts", 3);

const zhByIssue = indexIssueFiles(zhFiles, "Chinese posts");
const enByIssue = indexIssueFiles(enFiles, "English posts");
const zhIssues = issueNumbers(zhByIssue);
const enIssues = issueNumbers(enByIssue);

if (JSON.stringify(zhIssues) !== JSON.stringify(enIssues)) {
  const missingEnglish = zhIssues.filter((issue) => !enByIssue.has(issue));
  const missingChinese = enIssues.filter((issue) => !zhByIssue.has(issue));
  throw new Error(
    `Translation parity failed; missing English: ${missingEnglish.join(", ") || "none"}; missing Chinese: ${missingChinese.join(", ") || "none"}`,
  );
}

const posts = JSON.parse(
  await fs.readFile(path.join(ROOT, "public/posts.json"), "utf8"),
);
const expectedPosts = (await readIssueArchive(ZH_DIR, "Chinese posts", 2)).map(
  ({ post }) => post,
);
assertPostRecordsEqual(posts, expectedPosts);

const apiSummary = JSON.parse(await fs.readFile(apiPath, "utf8"));
const apiIssues = apiSummary.issues?.map((issue) => issue.issue) ?? [];
if (
  apiSummary.count !== zhIssues.length ||
  apiSummary.englishCount !== enIssues.length ||
  apiSummary.latestIssue !== zhIssues[0] ||
  JSON.stringify(apiIssues) !== JSON.stringify(zhIssues) ||
  apiSummary.issues?.some((issue) => !issue.translation)
) {
  throw new Error("built /api/posts.json does not match the bilingual archive");
}
await checkWeeklySkill(apiSummary);
console.log(`content parity: ok (${zhIssues.length} bilingual issues)`);
