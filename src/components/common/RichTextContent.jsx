import { useMemo } from "react";
import { classNames, isRichTextEmpty, toRichTextHtml } from "@/utils";

export default function RichTextContent({ value, fallback = null, className }) {
  const html = useMemo(() => toRichTextHtml(value), [value]);

  if (isRichTextEmpty(html)) return fallback;

  return (
    <div
      className={classNames("rich-text", className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
