// components/explanation/svg-edit-tabs.tsx
"use client";

import React, { useState } from "react";
import {
  Eye,
  Code,
  Edit3,
  Settings,
  Copy,
  Check,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { PHYSICS_CATEGORIES } from "@/lib/constants";

interface SVGEditTabsProps {
  localSvgCode: string;
  formattedCode: string;
  settings: {
    isPublic: boolean;
    category: string;
    subcategory: string;
  };
  hasSettingsChanges: boolean;
  onSvgCodeChange: (code: string) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSettingsChange: (settings: any) => void;
  onFormat: () => void;
  onCopy: () => void;
}

export function SVGEditTabs({
  localSvgCode,
  formattedCode,
  settings,
  hasSettingsChanges,
  onSvgCodeChange,
  onSettingsChange,
  onFormat,
  onCopy,
}: SVGEditTabsProps) {
  const [copyStates, setCopyStates] = useState({
    viewCode: false,
    editCode: false,
  });

  const handleCopy = async (section: "viewCode" | "editCode") => {
    await onCopy();
    setCopyStates((prev) => ({ ...prev, [section]: true }));
    setTimeout(() => {
      setCopyStates((prev) => ({ ...prev, [section]: false }));
    }, 2000);
  };
  return (
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

      {/* Preview Tab */}
      <TabsContent value="preview" className="mt-4">
        <div className="bg-white rounded-lg border overflow-hidden shadow-sm min-h-[300px] flex items-center justify-center">
          {localSvgCode ? (
            <div
              className="w-full max-h-[400px] overflow-hidden flex items-center justify-center p-4"
              dangerouslySetInnerHTML={{ __html: localSvgCode }}
            />
          ) : (
            <div className="text-center text-muted-foreground">
              <Code className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No SVG code to preview</p>
            </div>
          )}
        </div>
      </TabsContent>

      {/* View Code Tab */}
      <TabsContent value="view-code" className="mt-4">
        <div className="relative">
          <div className="absolute top-2 right-2 z-10">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleCopy("viewCode")}
              className="h-7 px-2 bg-background/80 backdrop-blur"
              title={copyStates.viewCode ? "Copied!" : "Copy code"}
            >
              {copyStates.viewCode ? (
                <>
                  <Check className="h-3 w-3 mr-1 text-green-600" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3 mr-1" />
                  Copy
                </>
              )}
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

      {/* Edit Code Tab */}
      <TabsContent value="edit-code" className="mt-4">
        <div className="space-y-3">
          {/* 代码编辑工具栏 */}
          <div className="flex justify-between items-center">
            <p className="text-xs text-muted-foreground">
              💡 Tip: Use viewBox for responsive design. Switch to Preview tab
              to see changes.
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={onFormat}
                className="h-7 px-2"
                title="Format code"
              >
                <Sparkles className="h-3 w-3 mr-1" />
                Format
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={onCopy}
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
            onChange={(e) => onSvgCodeChange(e.target.value)}
            className="font-mono text-xs min-h-[300px] max-h-[500px] resize-y"
            placeholder="<svg viewBox='0 0 800 400' xmlns='http://www.w3.org/2000/svg'>
  <!-- Your SVG content here -->
</svg>"
          />
        </div>
      </TabsContent>

      {/* Settings Tab */}
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
                  onSettingsChange({ ...settings, isPublic: checked });
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
                    onSettingsChange({
                      ...settings,
                      category: value,
                      subcategory: "", // 清空子分类
                    });
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
                    onSettingsChange({
                      ...settings,
                      subcategory: value,
                    });
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
                💡 Remember to save your changes using the main Save button
              </p>
            </div>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
}
