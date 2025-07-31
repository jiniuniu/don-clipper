// components/explanation/svg-display.tsx - 添加 admin 权限控制
"use client";

import React, { useEffect, useState } from "react";
import {
  AlertCircle,
  Maximize2,
  Minimize2,
  Edit3,
  Save,
  RotateCcw,
  Copy,
  Eye,
  Code,
  Sparkles,
  Shield,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { formatSVGCode } from "@/lib/svg-formatter";
import { useAdmin } from "@/hooks/use-admin";
import { Switch } from "@/components/ui/switch";
import { createPortal } from "react-dom";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PHYSICS_CATEGORIES } from "@/lib/constants";

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
  // 新增：传入当前解释的设置信息
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
  requireAdmin = false, // 默认不需要管理员权限
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

  // 检查是否有设置更改
  const hasSvgChanges = localSvgCode !== svgCode;
  const hasSettingsChanges =
    settings.isPublic !== (currentSettings?.isPublic || false) ||
    settings.category !== (currentSettings?.category || "") ||
    settings.subcategory !== (currentSettings?.subcategory || "");
  const hasChanges = hasSvgChanges || hasSettingsChanges;

  // 获取管理员状态
  const { isAdmin, isLoaded } = useAdmin();

  // 检查是否有未保存的更改

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
      if (hasChanges) {
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
    // 检查权限
    if (!canEdit) {
      return;
    }

    if (isEditing && hasChanges) {
      // 如果有未保存的更改，提示用户
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

  const renderContent = () => {
    if (canEdit && isEditing) {
      return (
        <div className="space-y-4">
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

          {/* Tab 切换 */}
          <Tabs defaultValue="preview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="preview" className="flex items-center">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </TabsTrigger>
              <TabsTrigger value="view-code" className="flex items-center">
                <Code className="h-4 w-4 mr-2" />
                View Code
              </TabsTrigger>
              <TabsTrigger value="edit-code" className="flex items-center">
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Code
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>
            <TabsContent value="preview" className="mt-4">
              <div className="bg-white rounded-lg border overflow-hidden shadow-sm min-h-[300px] flex items-center justify-center">
                {localSvgCode ? (
                  <div
                    className="w-full max-h-[400px] overflow-hidden flex items-center justify-center p-4"
                    dangerouslySetInnerHTML={{ __html: localSvgCode }}
                    onError={() => setHasError(true)}
                  />
                ) : (
                  <div className="text-center text-muted-foreground">
                    <Code className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No SVG code to preview</p>
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="view-code" className="mt-4">
              <div className="relative">
                <div className="absolute top-2 right-2 z-10">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopy}
                    className="h-7 px-2 bg-background/80 backdrop-blur"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </Button>
                </div>
                <div className="rounded-lg overflow-hidden border">
                  <SyntaxHighlighter
                    language="xml"
                    style={oneLight}
                    customStyle={{
                      margin: 0,
                      fontSize: "12px",
                      maxHeight: "400px",
                      minHeight: "300px",
                    }}
                    showLineNumbers={true}
                    wrapLines={true}
                  >
                    {formattedCode ||
                      localSvgCode ||
                      "<!-- No SVG code available -->"}
                  </SyntaxHighlighter>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="edit-code" className="mt-4">
              <div className="space-y-3">
                {/* 代码编辑工具栏 */}
                <div className="flex justify-between items-center">
                  <p className="text-xs text-muted-foreground">
                    💡 Tip: Use viewBox for responsive design. Switch to Preview
                    tab to see changes.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleFormat}
                      className="h-7 px-2"
                      title="Format code"
                    >
                      <Sparkles className="h-3 w-3 mr-1" />
                      Format
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCopy}
                      className="h-7 px-2"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </Button>
                  </div>
                </div>

                {/* 代码编辑区 */}
                <Textarea
                  value={localSvgCode}
                  onChange={(e) => setLocalSvgCode(e.target.value)}
                  className="font-mono text-xs min-h-[300px] max-h-[500px] resize-y"
                  placeholder="<svg viewBox='0 0 800 400' xmlns='http://www.w3.org/2000/svg'>
  <!-- Your SVG content here -->
</svg>"
                />
              </div>
            </TabsContent>
            <TabsContent value="settings" className="mt-4">
              <div className="space-y-6">
                {/* 公开设置 */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Visibility</h4>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm">Make this explanation public</p>
                      <p className="text-xs text-muted-foreground">
                        Public explanations will be visible on the homepage
                      </p>
                    </div>
                    <Switch
                      checked={settings.isPublic}
                      onCheckedChange={(checked) => {
                        setSettings((prev) => ({ ...prev, isPublic: checked }));
                      }}
                    />
                  </div>
                </div>

                {/* 分类设置 */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Category</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground">
                        Main Category
                      </label>
                      <Select
                        value={settings.category}
                        onValueChange={(value) => {
                          setSettings((prev) => ({
                            ...prev,
                            category: value,
                            subcategory: "", // 清空子分类
                          }));
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(PHYSICS_CATEGORIES).map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground">
                        Subcategory
                      </label>
                      <Select
                        value={settings.subcategory}
                        onValueChange={(value) => {
                          setSettings((prev) => ({
                            ...prev,
                            subcategory: value,
                          }));
                        }}
                        disabled={!settings.category}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select subcategory" />
                        </SelectTrigger>
                        <SelectContent>
                          {settings.category &&
                            PHYSICS_CATEGORIES[
                              settings.category as keyof typeof PHYSICS_CATEGORIES
                            ]?.map((subcategory) => (
                              <SelectItem key={subcategory} value={subcategory}>
                                {subcategory}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* 保存提示 */}
                {hasSettingsChanges && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs text-blue-800">
                      💡 Remember to save your changes using the main Save
                      button
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

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
      <div className="relative group">
        {/* SVG 容器 */}
        <div className="bg-white rounded-lg border overflow-hidden shadow-sm">
          {/* 控制栏 */}
          <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
            {canEdit && (
              <Button
                variant="secondary"
                size="sm"
                onClick={toggleEdit}
                className="h-8 w-8 p-0 bg-background/80 backdrop-blur"
                title={`Edit SVG${requireAdmin ? " (Admin Only)" : ""}`}
              >
                <Edit3 className="h-4 w-4" />
              </Button>
            )}
            {/* 如果需要管理员权限但用户不是管理员，显示禁用的编辑按钮 */}
            {editable && requireAdmin && !isAdmin && (
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
            <Button
              variant="secondary"
              size="sm"
              onClick={toggleFullscreen}
              className="h-8 w-8 p-0 bg-background/80 backdrop-blur"
              title="Fullscreen"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>

          {/* SVG 内容 */}
          <div
            className="w-full max-h-[600px] overflow-hidden flex items-center justify-center"
            dangerouslySetInnerHTML={{ __html: svgCode }}
            onError={() => setHasError(true)}
          />
        </div>

        {/* 标题 */}
        <div className="flex items-center justify-center gap-2 mt-2">
          <p className="text-xs text-muted-foreground text-center">
            📊 {title}
          </p>
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
      </div>
    );
  };

  return (
    <>
      <div className={cn("relative", className)}>{renderContent()}</div>

      {/* 全屏模态框 - 使用 Portal 渲染到 body */}
      {isFullscreen &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-full items-center justify-center p-4">
              <div className="relative max-w-6xl max-h-full w-full">
                {/* 关闭按钮 */}
                <div className="absolute top-4 right-4 z-10">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={toggleFullscreen}
                    className="h-10 w-10 p-0"
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
          document.body // 渲染到 body，脱离父容器限制
        )}
    </>
  );
}
