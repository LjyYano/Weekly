import { textResponse } from "@/agents";
import { buildLlmsTxt } from "@/agentGuide";

export const GET = () =>
  textResponse(buildLlmsTxt(), "text/plain; charset=utf-8");
