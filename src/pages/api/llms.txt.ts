import { textResponse } from "@/agents";
import { buildApiLlmsTxt } from "@/agentGuide";

export const GET = () =>
  textResponse(buildApiLlmsTxt(), "text/plain; charset=utf-8");
