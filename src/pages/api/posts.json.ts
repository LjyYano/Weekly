import { getIssues, issueSummary, jsonResponse } from "@/agents";
import { SITE } from "@/config";

export const GET = () => {
  const zhIssues = getIssues("zh");
  const enIssues = getIssues("en");
  const enByNum = new Map(enIssues.map((issue) => [issue.num, issue]));

  return jsonResponse({
    site: SITE.homePage,
    name: SITE.title,
    author: SITE.author,
    repository: `https://github.com/${SITE.repo}`,
    description: SITE.description,
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
