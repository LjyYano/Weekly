// Rendered on the About page and mirrored into FAQPage JSON-LD from the same
// source, so the structured data never claims answers the page does not show.
export const FAQ: Record<"zh" | "en", { q: string; a: string }[]> = {
  zh: [
    {
      q: "拾遗周刊多久更新一期？",
      a: "以周为单位持续记录，期号从 01 开始递增。不强求固定在某一天发布，优先保证这一期有值得留下来的内容。",
    },
    {
      q: "主要写什么？",
      a: "主要记录 AI、技术、产品、开发工具、独立开发，以及读书、游戏和生活中的一些观察。主题不会被限制在单一领域。",
    },
    {
      q: "怎么订阅？",
      a: "可以订阅 /rss.xml，也可以关注 GitHub 上的 LjyYano/Weekly 仓库或 X 上的 @yanobuilds。",
    },
    {
      q: "可以引用周刊里的内容吗？",
      a: "可以。保留原期链接并注明出处为拾遗周刊即可。站点代码遵循原项目的 MIT 协议，周刊正文内容版权归作者所有。",
    },
  ],
  en: [
    {
      q: "How often is 拾遗周刊 published?",
      a: "It is written on a weekly cadence with issue numbers starting at 01. There is no fixed publication weekday; useful content matters more than a rigid schedule.",
    },
    {
      q: "What does 拾遗周刊 cover?",
      a: "AI, technology, products, developer tools, indie building, books, games, and observations from everyday life.",
    },
    {
      q: "How do I subscribe?",
      a: "Subscribe to /rss.xml, follow the LjyYano/Weekly repository on GitHub, or follow @yanobuilds on X.",
    },
    {
      q: "Can I quote the content?",
      a: "Yes. Keep a link to the original issue and attribute it to 拾遗周刊. Site code follows the upstream MIT license; written content remains the author's copyright.",
    },
  ],
};
