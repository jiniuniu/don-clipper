// components/content-blocks/block-renderer.tsx
import React from "react";
import { MVPContentBlock } from "@/lib/schemas/mvp-schemas";
import { TextBlock } from "./text-block";
import { HeadingBlock } from "./heading-block";
import { HighlightBoxBlock } from "./highlight-box-block";
import { CalloutBlock } from "./callout-block";

interface BlockRendererProps {
  block: MVPContentBlock;
  className?: string;
}

export function BlockRenderer({ block, className }: BlockRendererProps) {
  switch (block.type) {
    case "text":
      return (
        <TextBlock
          content={block.content}
          textAlign={block.textAlign}
          style={block.style}
          className={className}
        />
      );

    case "heading":
      return (
        <HeadingBlock
          content={block.content}
          level={block.level as 1 | 2 | 3 | 4 | 5 | 6}
          style={block.style}
          className={className}
        />
      );

    case "highlight_box":
      return (
        <HighlightBoxBlock
          content={block.content}
          boxType={block.boxType}
          title={block.title}
          style={block.style}
          className={className}
        />
      );

    case "callout":
      return (
        <CalloutBlock
          content={block.content}
          calloutType={block.calloutType}
          title={block.title}
          style={block.style}
          className={className}
        />
      );

    default:
      // TypeScript 会确保这里永远不会被执行
      return (
        <div className="p-4 border border-red-300 bg-red-50 rounded-lg">
          <p className="text-red-700">未知的内容块类型</p>
        </div>
      );
  }
}
