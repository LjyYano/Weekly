import type { APIRoute } from "astro";
import {
  getIssues,
  getIssue,
  getIssueBody,
  renderIssueMarkdown,
  textResponse,
} from "@/agents";

export const getStaticPaths = () =>
  getIssues("en").map((issue) => ({ params: { id: String(issue.num) } }));

export const GET: APIRoute = async ({ params }) => {
  const num = Number(params.id);
  const issue = getIssue("en", num);
  const body = await getIssueBody("en", num);
  if (!issue || body === null) return new Response(null, { status: 404 });
  return textResponse(renderIssueMarkdown(issue, body));
};
