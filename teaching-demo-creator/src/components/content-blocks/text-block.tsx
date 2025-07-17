// components/content-blocks/text-block.tsx
import React from "react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { StyleConfig } from "@/lib/schemas/mvp-schemas";

interface TextBlockProps {
  content: string;
  textAlign?: "left" | "center" | "right";
  style?: StyleConfig;
  className?: string;
}

export function TextBlock({
  content,
  textAlign = "left",
  style,
  className,
}: TextBlockProps) {
  const textAlignClass = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  }[textAlign];

  const fontSizeClass = style?.fontSize
    ? {
        xs: "text-xs",
        sm: "text-sm",
        md: "text-base",
        lg: "text-lg",
        xl: "text-xl",
      }[style.fontSize]
    : "text-base";

  const paddingClass = style?.padding
    ? {
        sm: "p-2",
        md: "p-4",
        lg: "p-6",
      }[style.padding]
    : "p-4";

  return (
    <div
      className={cn(
        "rounded-lg border",
        textAlignClass,
        fontSizeClass,
        paddingClass,
        className
      )}
      style={{
        backgroundColor: style?.backgroundColor,
        borderColor: style?.borderColor,
        color: style?.textColor,
      }}
    >
      <div className="prose prose-sm max-w-none dark:prose-invert">
        <ReactMarkdown
          components={{
            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
            ul: ({ children }) => (
              <ul className="mb-2 last:mb-0 pl-4">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="mb-2 last:mb-0 pl-4">{children}</ol>
            ),
            li: ({ children }) => <li className="mb-1">{children}</li>,
            strong: ({ children }) => (
              <strong className="font-semibold">{children}</strong>
            ),
            em: ({ children }) => <em className="italic">{children}</em>,
            code: ({ children }) => (
              <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono">
                {children}
              </code>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
