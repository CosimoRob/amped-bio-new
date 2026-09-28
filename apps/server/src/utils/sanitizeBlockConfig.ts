import { sanitizeRichHtml } from "@repo/constants";

/**
 * Runs the shared rich text sanitizer over any HTML a block config carries.
 * Today only text blocks hold HTML (config.content). Other block types pass through.
 * Used when a block is saved and when blocks are served to public pages.
 */
export function sanitizeBlockConfig<T>(type: string, config: T): T {
  if (type !== "text" || !config || typeof config !== "object") return config;
  const content = (config as { content?: unknown }).content;
  if (typeof content !== "string") return config;
  return { ...config, content: sanitizeRichHtml(content) };
}
