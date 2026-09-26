import { serializeJsonLd } from "@/lib/seo";

/** Renders schema.org structured data as a JSON-LD script tag. */
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      // Content is escaped by serializeJsonLd so user text cannot break out of the tag
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
