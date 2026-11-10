import type { APIRoute } from "astro";
import {
  getIssues,
  getIssue,
  getIssueBody,
  renderIssueMarkdown,
  textResponse,
} from "@/agents";

export const getStaticPaths = () =>
  getIssues("zh").map((issue) => ({ params: { id: String(issue.num) } }));

export const GET: APIRoute = async ({ params }) => {
  const num = Number(params.id);
  const issue = getIssue("zh", num);
  const body = await getIssueBody("zh", num);
  if (!issue || body === null) return new Response(null, { status: 404 });
  return textResponse(renderIssueMarkdown(issue, body));
};
