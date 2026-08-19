/**
 * This script automates the translation of weekly posts using the Grok API (xAI).
 * It checks for missing English translations and generates them.
 * Run with: GROK_API_KEY=your_key node scripts/translate_posts.js
 */
import fs from "fs";
import path from "path";
import axios from "axios";
import { fileURLToPath } from "url";
import { canonicalIssueFilename, indexIssueFiles } from "./weekly-content.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- CONFIGURATION ---
const SOURCE_DIR = path.join(__dirname, "../src/pages/posts");
const TARGET_DIR = path.join(__dirname, "../src/pages/en/posts");
const API_URL = "https://api.x.ai/v1/chat/completions";
const API_KEY = process.env.GROK_API_KEY;
const MODEL = "grok-beta";

// --- PROMPT ---
const SYSTEM_PROMPT = `You are a professional tech blogger and translator.
Translate the following Markdown content from Chinese to English.

Rules:
1. Tone: Engineer's cool, interesting, and professional tone.
2. Formatting: STRICTLY preserve all Markdown formatting (links, images, bold, lists, code blocks, etc.).
3. Content: Translate all text, including titles and descriptions.
4. Accuracy: Ensure technical terms are translated accurately.
5. Output: Return ONLY the translated Markdown content, no explanations or conversational text.`;

async function translateContent(content) {
  try {
    const response = await axios.post(
      API_URL,
      {
        model: MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: content },
        ],
        temperature: 0.3,
        stream: false,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
      },
    );

    const translated = response.data?.choices?.[0]?.message?.content;
    if (!translated?.trim()) {
      throw new Error("translation API returned no content");
    }
    return translated;
  } catch (error) {
    throw new Error(
      `Translation API failed: ${error.response?.status ?? error.message}`,
    );
  }
}

export function missingTranslationIssues(sourceByIssue, targetByIssue) {
  return [...sourceByIssue.keys()].filter((issue) => !targetByIssue.has(issue));
}

export function assertTranslationCanRun(missingIssues, apiKey) {
  if (missingIssues.length > 0 && !apiKey) {
    throw new Error(
      `GROK_API_KEY is required for missing English issues: ${missingIssues.join(", ")}`,
    );
  }
}

function parseFrontmatter(fileContent) {
  const match = fileContent.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (match) {
    return {
      frontmatter: match[1],
      body: match[2],
      hasFrontmatter: true,
    };
  }
  return {
    frontmatter: "",
    body: fileContent,
    hasFrontmatter: false,
  };
}

async function run() {
  if (!fs.existsSync(TARGET_DIR)) {
    fs.mkdirSync(TARGET_DIR, { recursive: true });
  }

  const files = fs.readdirSync(SOURCE_DIR).filter((f) => f.endsWith(".md"));
  const sourceByIssue = indexIssueFiles(files, "Chinese posts");
  const targetByIssue = indexIssueFiles(
    fs.readdirSync(TARGET_DIR).filter((f) => f.endsWith(".md")),
    "English posts",
  );
  const missingIssues = missingTranslationIssues(sourceByIssue, targetByIssue);
  assertTranslationCanRun(missingIssues, API_KEY);
  let processedCount = 0;

  console.log(`🔍 Checking ${files.length} posts for missing translations...`);

  for (const [issueNumber, file] of sourceByIssue) {
    if (targetByIssue.has(issueNumber)) {
      continue;
    }

    console.log(`\n🚀 Translating Issue #${issueNumber} (${file})...`);

    const sourcePath = path.join(SOURCE_DIR, file);
    const rawContent = fs.readFileSync(sourcePath, "utf-8");
    const { frontmatter, body, hasFrontmatter } = parseFrontmatter(rawContent);

    if (!body.trim()) {
      throw new Error(`Cannot translate empty post body: ${file}`);
    }

    const translatedBody = await translateContent(body);
    let finalContent = "";
    if (hasFrontmatter) {
      finalContent = `---\n${frontmatter}\n---\n\n${translatedBody.trim()}\n`;
    } else {
      finalContent = `${translatedBody.trim()}\n`;
    }

    // Issue identity is numeric. English filenames always use the canonical
    // three-digit prefix, even when the Chinese source uses 01- or 99-.
    const targetFilename = canonicalIssueFilename(file, 3);
    const targetPath = path.join(TARGET_DIR, targetFilename);

    fs.writeFileSync(targetPath, finalContent);
    targetByIssue.set(issueNumber, targetFilename);
    console.log(
      `✅ Saved translation to: src/pages/en/posts/${targetFilename}`,
    );
    processedCount++;

    // Rate limiting (gentle)
    await new Promise((r) => setTimeout(r, 2000));
  }

  const stillMissing = missingTranslationIssues(sourceByIssue, targetByIssue);
  if (stillMissing.length > 0) {
    throw new Error(
      `English translations still missing: ${stillMissing.join(", ")}`,
    );
  } else if (processedCount === 0) {
    console.log("\n✨ All posts have English translations. Nothing to do.");
  } else {
    console.log(`\n🎉 Successfully translated ${processedCount} posts.`);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  run().catch((error) => {
    console.error(`❌ Translation failed: ${error.message}`);
    process.exitCode = 1;
  });
}
