// app/project/[id]/page.tsx
"use client";

import React from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Layout } from "@/components/layout/layout";
import { GridCanvas } from "@/components/canvas/grid-canvas";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  Download,
  Share,
  Settings,
  Calendar,
  Clock,
  Layers,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { Id } from "../../../../convex/_generated/dataModel";

interface ProjectPageProps {
  params: {
    id: string;
  };
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const project = useQuery(api.functions.projects.getProject, {
    id: params.id as Id<"projects">,
  });

  if (project === undefined) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">加载项目中...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (project === null) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto p-6">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-muted-foreground mb-4">
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">项目不存在</h3>
              <p className="text-muted-foreground mb-4">
                该项目可能已被删除或链接无效
              </p>
              <Link href="/">
                <Button>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  返回首页
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "intermediate":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "advanced":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "初级";
      case "intermediate":
        return "中级";
      case "advanced":
        return "高级";
      default:
        return difficulty;
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Layout>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="border-b bg-card px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  返回
                </Button>
              </Link>

              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-xl font-semibold">{project.title}</h1>
                  <Badge
                    variant="secondary"
                    className={getDifficultyColor(project.difficulty)}
                  >
                    {getDifficultyLabel(project.difficulty)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {project.description}
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
            </div>
          </div>

          {/* Project Info */}
          <div className="flex items-center gap-6 mt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>创建于 {formatDate(project.createdAt)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>更新于 {formatDate(project.updatedAt)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Layers className="h-4 w-4" />
              <span>{project.contentBlocks?.length || 0} 个内容块</span>
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 overflow-auto bg-muted/30">
          <GridCanvas
            contentBlocks={project.contentBlocks || []}
            gridSize={project.layout.gridSize}
            theme={project.layout.theme}
            showGrid={false}
            className="min-h-full"
          />
        </div>
      </div>
    </Layout>
  );
}
