// components/explanation/svg-controls.tsx
"use client";

import React from "react";
import { Edit3, Maximize2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SVGControlsProps {
  canEdit: boolean;
  requireAdmin: boolean;
  isAdmin: boolean;
  onEdit: () => void;
  onFullscreen: () => void;
  className?: string;
}

export function SVGControls({
  canEdit,
  requireAdmin,
  isAdmin,
  onEdit,
  onFullscreen,
  className,
}: SVGControlsProps) {
  return (
    <div
      className={cn(
        "absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1",
        className
      )}
    >
      {/* 编辑按钮 */}
      {canEdit && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onEdit}
          className="h-8 w-8 p-0 bg-background/80 backdrop-blur"
          title={`Edit SVG${requireAdmin ? " (Admin Only)" : ""}`}
        >
          <Edit3 className="h-4 w-4" />
        </Button>
      )}

      {/* 权限限制提示按钮 */}
      {requireAdmin && !isAdmin && (
        <Button
          variant="secondary"
          size="sm"
          disabled
          className="h-8 w-8 p-0 bg-background/80 backdrop-blur opacity-50"
          title="Admin Only"
        >
          <Shield className="h-4 w-4" />
        </Button>
      )}

      {/* 全屏按钮 */}
      <Button
        variant="secondary"
        size="sm"
        onClick={onFullscreen}
        className="h-8 w-8 p-0 bg-background/80 backdrop-blur"
        title="Fullscreen"
      >
        <Maximize2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

interface SVGTitleProps {
  title: string;
  requireAdmin: boolean;
  isAdmin: boolean;
}

export function SVGTitle({ title, requireAdmin, isAdmin }: SVGTitleProps) {
  return (
    <div className="flex items-center justify-center gap-2 mt-2">
      <p className="text-xs text-muted-foreground text-center">📊 {title}</p>
      {requireAdmin && isAdmin && (
        <Badge
          variant="outline"
          className="text-xs bg-green-100 text-green-800 border-green-300"
        >
          <Shield className="h-2 w-2 mr-1" />
          Admin
        </Badge>
      )}
    </div>
  );
}
