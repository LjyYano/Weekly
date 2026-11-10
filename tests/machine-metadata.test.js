import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import test from "node:test";
import { renderWeeklySkill } from "../scripts/generate-weekly-skill.js";

const read = (path) =>
  readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
// config.ts contains plain JavaScript; use a data URL so tests also run on Node 20.
const { SITE } = await import(
  `data:text/javascript;base64,${Buffer.from(read("src/config.ts")).toString("base64")}`
);
const built = (path) => read(`dist/${path}`);
const json = (path) => JSON.parse(built(path));
const index = json("api/posts.json");
const api = json("api/index.json");
const spec = json("openapi.json");
const legacy =
  /Tw93|tw93|潮流周刊|2020|every Monday|每周一|CC BY|no rate limit/i;
const records = (lang) => {
  const dir = `src/pages/${lang === "en" ? "en/" : ""}posts`;
  return readdirSync(new URL(`../${dir}`, import.meta.url))
    .filter((file) => /^\d+.*\.md$/.test(file))
    .map((file) => ({
      num: Number.parseInt(file, 10),
      raw: read(`${dir}/${file}`),
    }));
};
const zh = records("zh");
const en = records("en");
const dateOf = (raw) => raw.match(/^date:\s*(.+)$/m)[1].trim();
const bodyOf = (raw) =>
  raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "").trim();

function assertLocalUrl(url) {
  const parsed = new URL(url, SITE.homePage);
  if (parsed.origin !== new URL(SITE.homePage).origin) return;
  const path = `dist${decodeURIComponent(parsed.pathname)}`;
  assert.ok(
    [path, `${path}/index.html`, `${path}.html`].some(existsSync),
    `Missing output: ${url}`,
  );
}

test("identity, counts, dates and examples match SITE and the actual archive", () => {
  assert.equal(index.name, SITE.title);
  assert.equal(index.author, SITE.author);
  assert.equal(index.description, SITE.description);
  assert.equal(index.site, SITE.homePage);
  assert.equal(index.count, zh.length);
  assert.equal(index.englishCount, en.length);
  assert.equal(index.latestIssue, Math.max(...zh.map((p) => p.num)));
  assert.equal(api.contact.author, SITE.author);
  assert.equal(api.contact.issues, `https://github.com/${SITE.repo}/issues`);
  assert.equal(spec.info.title, `${SITE.title} content API`);
  assert.equal(spec.info.contact.name, SITE.author);
  assert.equal(spec.info.summary, SITE.description);
  assert.ok(!("license" in api) && !("license" in spec.info));
  assert.ok(!("email" in api.contact) && !("email" in spec.info.contact));
  assert.ok(!("cadence" in api.contentModel));
  for (const endpoint of api.endpoints)
    if (endpoint.example) assertLocalUrl(endpoint.example);
  for (const guide of ["llms.txt", "llms.md", "index.md"]) {
    const text = built(guide);
    const dates = zh.map((p) => dateOf(p.raw)).sort();
    assert.ok(text.includes(dates[0]) && text.includes(dates.at(-1)));
  }
});

test("JSON and Markdown preserve bodies and only link existing translations", () => {
  for (const lang of ["zh", "en"]) {
    for (const post of lang === "zh" ? zh : en) {
      const prefix = lang === "en" ? "en/" : "";
      const detail = json(`api/${prefix}posts/${post.num}.json`);
      assert.equal(detail.contentMarkdown, bodyOf(post.raw));
      assert.equal(detail.date, dateOf(post.raw));
      const md = built(`${prefix}posts/${post.num}.md`);
      assert.ok(md.endsWith(`${detail.contentMarkdown}\n`));
      const header = md.split("\n---\n")[0];
      const other = (lang === "zh" ? en : zh).find((p) => p.num === post.num);
      assert.equal(Boolean(detail.translation), Boolean(other));
      assert.equal(
        /^- (English translation|Chinese original):/m.test(header),
        Boolean(other),
      );
      if (other) assertLocalUrl(detail.translation.markdownUrl);
    }
  }
});

test("guides and indexes have no template identity or dead local links", async () => {
  const paths = [
    "llms.txt",
    "llms.md",
    "api/llms.txt",
    "posts/llms.txt",
    "index.md",
    "en/index.md",
  ];
  const skill = await renderWeeklySkill(index);
  assert.doesNotMatch(skill, /\{\{[A-Z_]+\}\}/);
  for (const text of [
    ...paths.map(built),
    skill,
    JSON.stringify(api),
    JSON.stringify(spec),
  ]) {
    assert.doesNotMatch(text, legacy);
    for (const url of text.matchAll(/https?:\/\/[^\s)<>`"}]+/g)) {
      if (!url[0].includes("{")) assertLocalUrl(url[0].replace(/[.,;]+$/, ""));
    }
  }
});

test("Chinese and English HTML JSON-LD and feed identify Yano without invented biography", () => {
  for (const path of [
    "index.html",
    "en/index.html",
    "posts/10/index.html",
    "en/posts/1/index.html",
  ]) {
    const html = built(path);
    const blocks = [
      ...html.matchAll(
        /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,
      ),
    ];
    assert.ok(blocks.length);
    for (const [, raw] of blocks) {
      assert.doesNotMatch(raw, legacy);
      assert.doesNotMatch(
        raw,
        /Hangzhou|Zhejiang|Product Engineer|foundingDate|"email"/,
      );
      const graph = JSON.parse(raw)["@graph"];
      assert.equal(
        graph.find((n) => n["@type"] === "Person").name,
        SITE.author,
      );
      assert.equal(
        graph.find((n) => n["@type"] === "Organization").name,
        SITE.title,
      );
    }
  }
  const feed = built("feeds/posts.jsonl").trim().split("\n").map(JSON.parse);
  assert.equal(feed.length, zh.length + en.length);
  for (const post of feed) {
    assert.equal(post.author.name, SITE.author);
    assert.equal(post.publisher.name, SITE.title);
    assert.ok(!("license" in post));
    assertLocalUrl(post.encoding.contentUrl);
  }
});
