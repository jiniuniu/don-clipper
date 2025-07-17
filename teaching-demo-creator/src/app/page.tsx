// app/page.tsx
"use client";

import React from "react";
import { Layout } from "@/components/layout/layout";
import { ConceptForm } from "@/components/forms/concept-form";
import { GridCanvas } from "@/components/canvas/grid-canvas";
import { useGeneration } from "@/hooks/use-generation";
import { MVPUserInput } from "@/lib/schemas/mvp-schemas";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Download, Share, Settings, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const { status, result, error, projectId, generate, reset } = useGeneration();

  const handleGenerate = async (input: MVPUserInput) => {
    await generate(input);
  };

  const handleViewProject = () => {
    if (projectId) {
      router.push(`/project/${projectId}`);
    }
  };

  const renderContent = () => {
    switch (status) {
      case "idle":
        return (
          <div className="max-w-4xl mx-auto p-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-4">AI 教学演示创建器</h1>
              <p className="text-lg text-muted-foreground mb-8">
                输入任何学术概念，AI 将为你生成直观易懂的交互式教学内容
              </p>
            </div>

            <ConceptForm onSubmit={handleGenerate} loading={false} />
          </div>
        );

      case "generating":
        return (
          <div className="max-w-4xl mx-auto p-6">
            <div className="mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={reset}
                className="mb-4"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                返回
              </Button>
            </div>

            <Card className="w-full max-w-2xl mx-auto">
              <CardContent className="p-6 text-center">
                <div className="flex flex-col items-center space-y-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      正在生成教学内容
                    </h3>
                    <p className="text-muted-foreground">
                      AI 正在为你创建交互式教学演示，请稍候...
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={reset}
                    className="mt-4"
                  >
                    取消生成
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "success":
        return (
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="border-b bg-card px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="sm" onClick={reset}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    新建项目
                  </Button>

                  <div>
                    <h1 className="text-xl font-semibold">
                      {result?.page.title}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      {result?.explanation}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Settings className="mr-2 h-4 w-4" />
                    编辑
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share className="mr-2 h-4 w-4" />
                    分享
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    导出
                  </Button>
                  <Button onClick={handleViewProject}>查看项目</Button>
                </div>
              </div>
            </div>

            {/* Canvas */}
            <div className="flex-1 overflow-auto bg-muted/30">
              {result?.page && (
                <GridCanvas
                  contentBlocks={result.page.contentBlocks}
                  gridSize={result.page.layout.gridSize}
                  theme={result.page.layout.theme}
                  showGrid={false}
                  className="min-h-full"
                />
              )}
            </div>
          </div>
        );

      case "error":
        return (
          <div className="max-w-2xl mx-auto p-6">
            <div className="mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={reset}
                className="mb-4"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                返回
              </Button>
            </div>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-red-500 mb-4">
                  <svg
                    className="h-12 w-12 mx-auto"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.764 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">生成失败</h3>
                <p className="text-muted-foreground mb-4">
                  {error || "未知错误，请稍后重试"}
                </p>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" onClick={reset}>
                    重新开始
                  </Button>
                  <Button onClick={() => window.location.reload()}>
                    刷新页面
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return <Layout showSidebar={status !== "idle"}>{renderContent()}</Layout>;
}
