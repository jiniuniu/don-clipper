// components/explanation/svg-display.tsx - 重构后的主组件
"use client";

import React, { useEffect, useState } from "react";
import { AlertCircle, Edit3, Save, RotateCcw, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatSVGCode } from "@/lib/svg-formatter";
import { useAdmin } from "@/hooks/use-admin";

import { SVGControls, SVGTitle } from "./svg-controls";
import { SVGEditTabs } from "./svg-edit-tabs";
import { SVGFullscreenModal } from "./svg-fullscreen-modal";

interface SVGDisplayProps {
  svgCode: string;
  title: string;
  editable?: boolean;
  onSave?: (updates: {
    svgCode?: string;
    isPublic?: boolean;
    category?: string;
    subcategory?: string;
  }) => void;
  isSaving?: boolean;
  className?: string;
  requireAdmin?: boolean;
  currentSettings?: {
    isPublic?: boolean;
    category?: string;
    subcategory?: string;
  };
}

export function SVGDisplay({
  svgCode,
  title,
  editable = false,
  onSave,
  isSaving = false,
  className,
  currentSettings,
  requireAdmin = false,
}: SVGDisplayProps) {
  const [hasError, setHasError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [localSvgCode, setLocalSvgCode] = useState(svgCode);
  const [formattedCode, setFormattedCode] = useState("");

  const [settings, setSettings] = useState({
    isPublic: currentSettings?.isPublic || false,
    category: currentSettings?.category || "",
    subcategory: currentSettings?.subcategory || "",
  });

  // 获取管理员状态
  const { isAdmin, isLoaded } = useAdmin();

  // 检查是否有设置更改
  const hasSvgChanges = localSvgCode !== svgCode;
  const hasSettingsChanges =
    settings.isPublic !== (currentSettings?.isPublic || false) ||
    settings.category !== (currentSettings?.category || "") ||
    settings.subcategory !== (currentSettings?.subcategory || "");
  const hasChanges = hasSvgChanges || hasSettingsChanges;

  // 检查是否可以编辑（需要管理员权限时）
  const canEdit = editable && (!requireAdmin || isAdmin);

  // 格式化代码用于显示
  useEffect(() => {
    const formatted = formatSVGCode(localSvgCode);
    setFormattedCode(formatted);
  }, [localSvgCode]);

  // 简单的 SVG 验证
  const isSVGValid =
    localSvgCode.trim().startsWith("<svg") &&
    localSvgCode.trim().endsWith("</svg>");

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleSave = async () => {
    if (onSave && (hasChanges || hasSettingsChanges) && canEdit) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updates: any = {};
      if (hasSvgChanges) {
        updates.svgCode = localSvgCode;
      }
      if (hasSettingsChanges) {
        updates.isPublic = settings.isPublic;
        updates.category = settings.category || undefined;
        updates.subcategory = settings.subcategory || undefined;
      }
      await onSave(updates);
    }
  };

  const handleReset = () => {
    setLocalSvgCode(svgCode);
    setSettings({
      isPublic: currentSettings?.isPublic || false,
      category: currentSettings?.category || "",
      subcategory: currentSettings?.subcategory || "",
    });
  };

  const handleFormat = () => {
    const formatted = formatSVGCode(localSvgCode);
    setLocalSvgCode(formatted);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(formattedCode || localSvgCode);
  };

  const toggleEdit = () => {
    if (!canEdit) return;

    if (isEditing && hasChanges) {
      if (confirm("You have unsaved changes. Do you want to save them?")) {
        handleSave();
      } else {
        handleReset();
      }
    }
    setIsEditing(!isEditing);
  };

  // 如果需要加载权限信息，显示加载状态
  if (requireAdmin && !isLoaded) {
    return (
      <div
        className={cn(
          "bg-muted rounded-lg p-8 text-center border-2 border-dashed",
          className
        )}
      >
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground font-medium">Loading...</p>
      </div>
    );
  }

  // 错误状态
  if (!isSVGValid || hasError) {
    return (
      <div
        className={cn(
          "bg-muted rounded-lg p-8 text-center border-2 border-dashed",
          className
        )}
      >
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground font-medium">
          Failed to generate illustrations
        </p>
        <p className="text-sm text-muted-foreground/70 mt-1">
          SVG code format error or rendering failed
        </p>
        {canEdit && (
          <Button
            variant="outline"
            onClick={() => setIsEditing(true)}
            className="mt-4"
          >
            <Edit3 className="h-4 w-4 mr-2" />
            Fix SVG Code
          </Button>
        )}
      </div>
    );
  }

  // 编辑模式
  if (canEdit && isEditing) {
    return (
      <div className={cn("space-y-4", className)}>
        {/* 编辑状态指示器 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              <Edit3 className="h-3 w-3 mr-1" />
              Editing Mode
            </Badge>
            {isAdmin && requireAdmin && (
              <Badge
                variant="outline"
                className="bg-green-100 text-green-800 border-green-300"
              >
                <Shield className="h-3 w-3 mr-1" />
                Admin
              </Badge>
            )}
            {hasChanges && (
              <Badge
                variant="outline"
                className="bg-orange-100 text-orange-800 border-orange-300"
              >
                📝 Unsaved Changes
              </Badge>
            )}
          </div>
        </div>

        {/* 编辑标签页 */}
        <SVGEditTabs
          localSvgCode={localSvgCode}
          formattedCode={formattedCode}
          settings={settings}
          hasSettingsChanges={hasSettingsChanges}
          onSvgCodeChange={setLocalSvgCode}
          onSettingsChange={setSettings}
          onFormat={handleFormat}
          onCopy={handleCopy}
        />

        {/* 编辑操作按钮 */}
        <div className="flex justify-between pt-2 border-t">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={!hasChanges || isSaving}
              size="sm"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button variant="outline" onClick={toggleEdit} size="sm">
              Cancel
            </Button>
          </div>

          <Button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className="bg-blue-600 hover:bg-blue-700"
            size="sm"
          >
            {isSaving ? (
              <>
                <RotateCcw className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  // 正常显示模式
  return (
    <>
      <div className={cn("relative", className)}>
        <div className="relative group">
          {/* SVG 容器 */}
          <div className="bg-white rounded-lg border overflow-hidden shadow-sm">
            {/* 控制栏 */}
            <SVGControls
              canEdit={canEdit}
              requireAdmin={requireAdmin}
              isAdmin={isAdmin}
              onEdit={toggleEdit}
              onFullscreen={toggleFullscreen}
            />

            {/* SVG 内容 */}
            <div
              className="w-full max-h-[600px] overflow-hidden flex items-center justify-center"
              dangerouslySetInnerHTML={{ __html: svgCode }}
              onError={() => setHasError(true)}
            />
          </div>

          {/* 标题 */}
          <SVGTitle
            title={title}
            requireAdmin={requireAdmin}
            isAdmin={isAdmin}
          />
        </div>
      </div>

      {/* 全屏模态框 */}
      <SVGFullscreenModal
        isOpen={isFullscreen}
        onClose={toggleFullscreen}
        svgCode={svgCode}
        title={title}
        requireAdmin={requireAdmin}
        isAdmin={isAdmin}
      />
    </>
  );
}
