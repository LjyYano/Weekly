import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  assertCanonicalIssueFilenames,
  assertPostRecordsEqual,
  canonicalIssueFilename,
  indexIssueFiles,
  issueNumbers,
  parseIssueFilename,
} from "../scripts/weekly-content.js";
import {
  assertTranslationCanRun,
  missingTranslationIssues,
} from "../scripts/translate_posts.js";

test("normalizes issue prefixes across 001, 099, 100, and 277", () => {
  assert.equal(canonicalIssueFilename("01-安吉黄昏.md", 3), "001-安吉黄昏.md");
  assert.equal(canonicalIssueFilename("99-自驾回家.md", 3), "099-自驾回家.md");
  assert.equal(canonicalIssueFilename("100-冬天来了.md", 3), "100-冬天来了.md");
  assert.equal(canonicalIssueFilename("277-小叶赤楠.md", 3), "277-小叶赤楠.md");
  assert.deepEqual(parseIssueFilename("001-Anji-Dusk.md"), {
    issue: 1,
    title: "Anji-Dusk",
    numberPart: "001",
  });
});

test("matches translations by numeric issue and rejects duplicate spellings", () => {
  const index = indexIssueFiles(
    [
      "001-Anji-Dusk.md",
      "099-Drive-Home.md",
      "100-Winter.md",
      "277-Brush-Cherry.md",
    ],
    "English posts",
  );
  assert.deepEqual(issueNumbers(index), [277, 100, 99, 1]);
  assert.throws(
    () => indexIssueFiles(["001-One.md", "01-Duplicate.md"], "English posts"),
    /duplicate issue 1/,
  );
});

test("enforces language-specific canonical prefix widths", () => {
  assert.doesNotThrow(() =>
    assertCanonicalIssueFilenames(
      ["01-一.md", "99-九十九.md", "100-一百.md"],
      "Chinese posts",
      2,
    ),
  );
  assert.doesNotThrow(() =>
    assertCanonicalIssueFilenames(
      ["001-One.md", "099-Ninety-Nine.md", "100-One-Hundred.md"],
      "English posts",
      3,
    ),
  );
  assert.throws(
    () => assertCanonicalIssueFilenames(["01-One.md"], "English posts", 3),
    /must be 001-One\.md/,
  );
});

test("rejects stale post fields even when the issue numbers still match", () => {
  const current = [
    { num: 277, title: "旧标题", url: "/277", pic: "", description: "" },
  ];
  const expected = [{ ...current[0], title: "新标题" }];
  assert.throws(
    () => assertPostRecordsEqual(current, expected),
    /does not match/,
  );
});

test("missing translations require an API key and cannot report success", () => {
  const source = new Map([[277, "277-小叶赤楠.md"]]);
  const target = new Map();
  const missing = missingTranslationIssues(source, target);
  assert.deepEqual(missing, [277]);
  assert.throws(
    () => assertTranslationCanRun(missing, ""),
    /GROK_API_KEY is required/,
  );
  assert.doesNotThrow(() => assertTranslationCanRun([], ""));
});

test("keeps the Claude GitHub operations Skill mirror exact", async () => {
  const [canonical, mirror] = await Promise.all([
    readFile(".agents/skills/github-ops/SKILL.md", "utf8"),
    readFile(".claude/skills/github-ops/SKILL.md", "utf8"),
  ]);
  assert.equal(mirror, canonical);
});
