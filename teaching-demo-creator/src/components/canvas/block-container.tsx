// components/canvas/block-container.tsx
import React from "react";
import { cn } from "@/lib/utils";
import { MVPContentBlock } from "@/lib/schemas/mvp-schemas";
import { BlockRenderer } from "../content-blocks/block-renderer";

interface BlockContainerProps {
  block: MVPContentBlock;
  style?: React.CSSProperties;
  className?: string;
}

export function BlockContainer({
  block,
  style,
  className,
}: BlockContainerProps) {
  return (
    <div
      className={cn(
        "w-full h-full",
        "transition-all duration-200",
        "hover:scale-[1.02] hover:z-10",
        className
      )}
      style={style}
    >
      <BlockRenderer block={block} className="w-full h-full" />
    </div>
  );
}
