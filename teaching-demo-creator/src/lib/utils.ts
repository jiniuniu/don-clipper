import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Position } from "./schemas/mvp-schemas";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 网格位置转换为 CSS Grid 样式
export function positionToGridStyle(position: Position) {
  return {
    gridColumn: `${position.x + 1} / span ${position.width}`,
    gridRow: `${position.y + 1} / span ${position.height}`,
  };
}

// 生成唯一 ID
export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

// 检查两个位置是否重叠
export function isPositionOverlapping(pos1: Position, pos2: Position): boolean {
  const pos1Right = pos1.x + pos1.width;
  const pos1Bottom = pos1.y + pos1.height;
  const pos2Right = pos2.x + pos2.width;
  const pos2Bottom = pos2.y + pos2.height;

  return !(
    pos1Right <= pos2.x ||
    pos2Right <= pos1.x ||
    pos1Bottom <= pos2.y ||
    pos2Bottom <= pos1.y
  );
}

// 验证位置是否在网格范围内
export function isPositionValid(
  position: Position,
  gridSize: { rows: number; cols: number }
): boolean {
  return (
    position.x >= 0 &&
    position.y >= 0 &&
    position.x + position.width <= gridSize.cols &&
    position.y + position.height <= gridSize.rows
  );
}
