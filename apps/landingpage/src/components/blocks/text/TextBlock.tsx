import type { ThemeConfig } from "@repo/constants";
import { TextBlock as TextBlockT, sanitizeRichHtml } from "@repo/constants";
import { isHTML } from "@/lib/htmlutils";
import { EmailCollectionBlock } from "@/components/blocks/EmailCollectionBlock";
import { TelegramBlock } from "@/components/blocks/TelegramBlock";
import { TeamBlock } from "@/components/blocks/TeamBlock";

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

  const isHTML_ = isHTML(block.config.content);

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
