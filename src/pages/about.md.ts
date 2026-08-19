import { textResponse } from "@/agents";
import { renderAboutMarkdown } from "@/aboutMarkdown";

export const GET = () => textResponse(renderAboutMarkdown("zh"));
