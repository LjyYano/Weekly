import type { APIRoute } from "astro";
import { getIssues, issueDetail, jsonResponse, JSON_HEADERS } from "@/agents";

export const getStaticPaths = () =>
  getIssues("en").map((issue) => ({ params: { id: String(issue.num) } }));

export const GET: APIRoute = async ({ params }) => {
  const detail = await issueDetail("en", Number.parseInt(params.id ?? "", 10));
  if (!detail) {
    return new Response(
      JSON.stringify(
        {
          error: {
            code: "issue_not_found",
            message: `No English issue numbered ${params.id} exists.`,
            hint: "List the available issue numbers at /api/posts.json.",
          },
        },
        null,
        2,
      ),
      { status: 404, headers: JSON_HEADERS },
    );
  }
  return jsonResponse(detail);
};
