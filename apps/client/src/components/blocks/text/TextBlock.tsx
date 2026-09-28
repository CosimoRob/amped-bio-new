import type { ThemeConfig } from "../../../types/editor";
import { EmailCollectionBlock } from "../EmailCollectionBlock";
import { TelegramBlock } from "../TelegramBlock";
import { TeamBlock } from "../TeamBlock";
import { TextBlock as TextBlockT, sanitizeRichHtml } from "@repo/constants";
import { isHTML } from "@/utils/htmlutils";

interface TextBlockProps {
  block: TextBlockT;
  theme: ThemeConfig;
}

export function TextBlock({ block, theme }: TextBlockProps) {
  // Check if this is a special text block type
  if (block.config.platform === "email-collect") {
    return <EmailCollectionBlock block={block} theme={theme} />;
  }
  if (block.config.platform === "telegram") {
    return <TelegramBlock block={block} theme={theme} />;
  }
  if (block.config.platform === "team") {
    return <TeamBlock block={block} theme={theme} />;
  }

  // Check if content contains HTML
  const isHTML_ = isHTML(block.config.content);

  // Regular text block
  return (
    <div
      className="w-full p-4 rounded-lg bg-white/50 backdrop-blur-sm"
      style={{ fontFamily: theme.fontFamily }}
    >
      {isHTML_ ? (
        <div
          className="text-content"
          dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(block.config.content) }}
          style={{
            color: theme.fontColor,
            fontSize: theme.fontSize,
          }}
        />
      ) : (
        <p
          className="whitespace-pre-wrap"
          style={{
            color: theme.fontColor,
            fontSize: theme.fontSize,
          }}
        >
          {block.config.content}
        </p>
      )}
    </div>
  );
}
