import { buildPostsLlmsTxt } from "@/agentGuide";
import { textResponse } from "@/agents";

export const GET = () =>
  textResponse(buildPostsLlmsTxt(), "text/plain; charset=utf-8");
