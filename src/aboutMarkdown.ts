// Markdown twin of the About page, built from the same prose and FAQ source
// the HTML page renders, so the two can never drift.
import aboutZh from "./data/about.zh.md?raw";
import aboutEn from "./data/about.en.md?raw";
import { FAQ } from "./data/faq";
import { SITE } from "./config";

export const renderAboutMarkdown = (lang: "zh" | "en") => {
  const isEn = lang === "en";
  const heading = isEn ? "About 拾遗周刊" : "关于拾遗周刊";
  const faqHeading = isEn ? "Frequently asked questions" : "常见问题";
  const prose = (isEn ? aboutEn : aboutZh).trim();

  return [
    `# ${heading}`,
    "",
    `- HTML: ${SITE.homePage}${isEn ? "/en/about" : "/about"}`,
    `- ${isEn ? "Chinese version" : "英文版"}: ${SITE.homePage}${isEn ? "/about.md" : "/en/about.md"}`,
    "",
    "---",
    "",
    prose,
    "",
    `## ${faqHeading}`,
    "",
    ...FAQ[lang].flatMap((item) => [`### ${item.q}`, "", item.a, ""]),
  ].join("\n");
};
