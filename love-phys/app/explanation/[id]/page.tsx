// app/explanation/[id]/page.tsx
"use client";

import React, { use } from "react";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";
import { ExplanationDetailCard } from "@/components/explanation/explanation-detail-card";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { notFound } from "next/navigation";

interface ExplanationDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

// 验证ID格式是否为有效的Convex ID
function isValidConvexId(id: string): boolean {
  // Convex ID 通常是以特定前缀开头的字符串，这里做基本格式检查
  // 可以根据实际的Convex ID格式调整这个验证逻辑
  return /^[a-zA-Z0-9_-]+$/.test(id) && id.length > 10;
}

export default function ExplanationDetailPage({
  params,
}: ExplanationDetailPageProps) {
  const router = useRouter();

  // 使用 React.use() 来解包 Promise
  const resolvedParams = use(params);

  // 首先验证ID格式
  if (!isValidConvexId(resolvedParams.id)) {
    notFound();
  }

  const explanation = useQuery(api.queries.getPublicExplanation, {
    explanationId: resolvedParams.id as Id<"explanations">,
  });

  // 加载状态
  if (explanation === undefined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading explanation...</p>
        </div>
      </div>
    );
  }

  // 不存在、不公开、或查询出错时都返回404
  if (explanation === null) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto p-6">
        {/* 导航栏 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="bg-white/80 backdrop-blur"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button
              variant="ghost"
              onClick={() => router.push("/")}
              className="bg-white/80 backdrop-blur"
            >
              <Home className="h-4 w-4 mr-2" />
              Home
            </Button>
          </div>
        </div>

        {/* 详情卡片 */}
        <ExplanationDetailCard
          explanation={explanation}
          className="bg-white/90 backdrop-blur shadow-lg"
        />
      </div>
    </div>
  );
}
