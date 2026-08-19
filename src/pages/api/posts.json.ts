import { getIssues, issueSummary, jsonResponse } from "@/agents";
import { SITE } from "@/config";

export const GET = () => {
  const zhIssues = getIssues("zh");
  const enIssues = getIssues("en");
  const enByNum = new Map(enIssues.map((issue) => [issue.num, issue]));

  return jsonResponse({
    site: SITE.homePage,
    name: "潮流周刊 (Tw93 Weekly)",
    description:
      "Weekly curation of developer tools, engineering notes, design and life by Tw93. One issue per week since November 2020, Chinese original with English translation.",
    documentation: `${SITE.homePage}/llms.md`,
    openapi: `${SITE.homePage}/openapi.json`,
    count: zhIssues.length,
    englishCount: enIssues.length,
    latestIssue: zhIssues[0]?.num ?? null,
    issues: zhIssues.map((issue) =>
      issueSummary(issue, enByNum.get(issue.num)),
    ),
  });
};
