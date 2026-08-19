import { textResponse } from "@/agents";
import { buildLlmsMarkdown } from "@/agentGuide";

export const GET = () => textResponse(buildLlmsMarkdown());
