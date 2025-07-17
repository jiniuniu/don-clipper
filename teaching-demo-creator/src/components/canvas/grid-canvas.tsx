// components/canvas/grid-canvas.tsx
import React from "react";
import { cn, positionToGridStyle } from "@/lib/utils";
import { MVPContentBlock } from "@/lib/schemas/mvp-schemas";
import { BlockContainer } from "./block-container";

interface GridCanvasProps {
  contentBlocks: MVPContentBlock[];
  gridSize: { rows: number; cols: number };
  theme?: "light" | "dark";
  showGrid?: boolean;
  className?: string;
}

export function GridCanvas({
  contentBlocks,
  gridSize,
  theme = "light",
  showGrid = false,
  className,
}: GridCanvasProps) {
  return (
    <div
      className={cn(
        "relative w-full h-full min-h-[600px]",
        "grid gap-2 p-4",
        showGrid && "border border-dashed border-gray-300",
        theme === "dark" && "bg-gray-900",
        className
      )}
      style={{
        gridTemplateColumns: `repeat(${gridSize.cols}, 1fr)`,
        gridTemplateRows: `repeat(${gridSize.rows}, minmax(60px, 1fr))`,
      }}
    >
      {/* 网格线 (开发时可见) */}
      {showGrid && (
        <div className="absolute inset-0 pointer-events-none">
          {/* 垂直线 */}
          {Array.from({ length: gridSize.cols - 1 }).map((_, i) => (
            <div
              key={`v-${i}`}
              className="absolute top-0 bottom-0 border-l border-gray-200"
              style={{
                left: `${((i + 1) / gridSize.cols) * 100}%`,
              }}
            />
          ))}
          {/* 水平线 */}
          {Array.from({ length: gridSize.rows - 1 }).map((_, i) => (
            <div
              key={`h-${i}`}
              className="absolute left-0 right-0 border-t border-gray-200"
              style={{
                top: `${((i + 1) / gridSize.rows) * 100}%`,
              }}
            />
          ))}
        </div>
      )}

      {/* 内容块 */}
      {contentBlocks.map((block) => (
        <BlockContainer
          key={block.id}
          block={block}
          style={positionToGridStyle(block.position)}
        />
      ))}
    </div>
  );
}
