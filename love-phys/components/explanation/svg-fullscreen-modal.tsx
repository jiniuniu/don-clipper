// components/explanation/svg-fullscreen-modal.tsx
"use client";

import React from "react";
import { createPortal } from "react-dom";
import { Minimize2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SVGFullscreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  svgCode: string;
  title: string;
  requireAdmin: boolean;
  isAdmin: boolean;
}

export function SVGFullscreenModal({
  isOpen,
  onClose,
  svgCode,
  title,
  requireAdmin,
  isAdmin,
}: SVGFullscreenModalProps) {
  const handleBackdropClick = (e: React.MouseEvent) => {
    // 只有点击背景时才关闭，点击内容区域不关闭
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 cursor-pointer"
      onClick={handleBackdropClick}
    >
      <div className="flex h-full items-center justify-center p-4">
        <div className="relative max-w-6xl max-h-full w-full cursor-default">
          {/* 控制栏 */}
          <div className="absolute top-4 right-4 z-10">
            {/* 关闭按钮 */}
            <Button
              variant="secondary"
              size="sm"
              onClick={onClose}
              className="h-10 w-10 p-0"
              title="Close (or click outside)"
            >
              <Minimize2 className="h-5 w-5" />
            </Button>
          </div>

          {/* 全屏 SVG */}
          <div className="bg-white rounded-lg border shadow-lg overflow-hidden">
            <div
              className="w-full h-full min-h-[400px] flex items-center justify-center p-8"
              dangerouslySetInnerHTML={{ __html: svgCode }}
            />
          </div>

          {/* 全屏标题 */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <p className="text-center text-lg font-medium">📊 {title}</p>
            {requireAdmin && isAdmin && (
              <Badge
                variant="outline"
                className="bg-green-100 text-green-800 border-green-300"
              >
                <Shield className="h-3 w-3 mr-1" />
                Admin
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
