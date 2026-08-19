import rss from "@astrojs/rss";
import { getIndex, parseTitle, toNumericUrl } from "@/util";
import { renderSupportCalloutForRSS } from "@/supportCallout";
import { SITE } from "@/config";

export async function GET() {
  let posts = Object.values(import.meta.glob("./posts/*.md", { eager: true }));
  posts = posts.sort((a, b) => getIndex(b.url) - getIndex(a.url)).slice(0, 12);

  return rss({
    title: "拾遗周刊",
    description: "Notes worth keeping on technology, products, and life.",
    site: `${SITE.homePage}/en/`,
    items: await Promise.all(
      posts.map(async (item) => {
        const link = item.frontmatter.numericUrl ?? toNumericUrl(item.url);
        const html = await item.compiledContent();
        return {
          link,
          title: parseTitle(link, item.frontmatter.legacySlug, item.frontmatter.issueTitle, "en"),
          description: `${html}${renderSupportCalloutForRSS("en")}`,
          pubDate: item.frontmatter.date,
        };
      }),
    ),
  });
}
