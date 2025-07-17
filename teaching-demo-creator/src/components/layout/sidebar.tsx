// components/layout/sidebar.tsx
"use client";

import React from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Plus,
  Search,
  FileText,
  Clock,
  X,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const router = useRouter();
  const projects = useQuery(api.functions.projects.getProjects, {});

  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredProjects = React.useMemo(() => {
    if (!projects) return [];
    if (!searchQuery) return projects;

    return projects.filter(
      (project) =>
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.concept.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [projects, searchQuery]);

  const handleNewProject = () => {
    router.push("/");
    onClose?.();
  };

  const handleProjectClick = (projectId: string) => {
    router.push(`/project/${projectId}`);
    onClose?.();
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("zh-CN", {
      month: "short",
      day: "numeric",
    });
  };

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

  return (
    <div className="flex h-full flex-col border-r bg-card">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-sm">我的项目</h2>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="px-4 pb-4">
        {/* New Project Button */}
        <Button
          onClick={handleNewProject}
          className="w-full justify-start"
          size="sm"
        >
          <Plus className="mr-2 h-4 w-4" />
          新建项目
        </Button>

        {/* Search */}
        <div className="relative mt-3">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索项目..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 text-sm"
          />
        </div>
      </div>

      <Separator />

      {/* Projects List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {projects === undefined ? (
            // Loading state
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredProjects.length === 0 ? (
            // Empty state
            <div className="text-center py-8">
              <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                {searchQuery ? "没有找到匹配的项目" : "还没有项目"}
              </p>
              {!searchQuery && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNewProject}
                  className="mt-3"
                >
                  <Plus className="mr-2 h-3 w-3" />
                  创建第一个项目
                </Button>
              )}
            </div>
          ) : (
            // Projects list
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">
                  最近创建 ({filteredProjects.length})
                </span>
              </div>

              {filteredProjects.map((project) => (
                <div
                  key={project._id}
                  onClick={() => handleProjectClick(project._id)}
                  className="group cursor-pointer rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate group-hover:text-primary">
                        {project.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {project.concept}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className={`text-xs ${getDifficultyColor(project.difficulty)}`}
                    >
                      {getDifficultyLabel(project.difficulty)}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">
                      {formatDate(project.createdAt)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {project.contentBlocks?.length || 0} 个组件
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          回收站
        </Button>
      </div>
    </div>
  );
}
