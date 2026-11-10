import { renderIndexMarkdown, textResponse } from "@/agents";

export const GET = () => textResponse(renderIndexMarkdown("en"));
