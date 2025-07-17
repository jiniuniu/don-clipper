// components/content-blocks/heading-block.tsx
import React from "react";
import { cn } from "@/lib/utils";
import { StyleConfig } from "@/lib/schemas/mvp-schemas";

interface HeadingBlockProps {
  content: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
  style?: StyleConfig;
  className?: string;
}

export function HeadingBlock({
  content,
  level,
  style,
  className,
}: HeadingBlockProps) {
  const Tag = `h${level}` as keyof React.JSX.IntrinsicElements;

  const headingClasses = {
    1: "text-4xl font-bold",
    2: "text-3xl font-bold",
    3: "text-2xl font-semibold",
    4: "text-xl font-semibold",
    5: "text-lg font-medium",
    6: "text-base font-medium",
  }[level];

  const fontSizeClass = style?.fontSize
    ? {
        xs: level <= 2 ? "text-lg" : "text-sm",
        sm: level <= 2 ? "text-xl" : "text-base",
        md: headingClasses,
        lg:
          level <= 2
            ? "text-5xl font-bold"
            : level <= 4
              ? "text-3xl font-bold"
              : "text-xl font-semibold",
        xl:
          level <= 2
            ? "text-6xl font-bold"
            : level <= 4
              ? "text-4xl font-bold"
              : "text-2xl font-bold",
      }[style.fontSize]
    : headingClasses;

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
        "rounded-lg border-l-4 border-primary/20",
        paddingClass,
        className
      )}
      style={{
        backgroundColor: style?.backgroundColor,
        borderColor: style?.borderColor,
      }}
    >
      <Tag
        className={cn(fontSizeClass, "leading-tight")}
        style={{
          color: style?.textColor,
        }}
      >
        {content}
      </Tag>
    </div>
  );
}
