/* eslint-disable @typescript-eslint/no-explicit-any */
// components/forms/concept-form.tsx
"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MVPUserInputSchema, MVPUserInput } from "@/lib/schemas/mvp-schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Sparkles } from "lucide-react";

interface ConceptFormProps {
  onSubmit: (data: MVPUserInput) => void;
  loading?: boolean;
}

export function ConceptForm({ onSubmit, loading = false }: ConceptFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<MVPUserInput>({
    resolver: zodResolver(MVPUserInputSchema) as any,
    defaultValues: {
      concept: "",
      difficulty: "intermediate",
      language: "zh-CN",
    },
  });

  const watchedValues = watch();

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          创建教学演示
        </CardTitle>
        <CardDescription>
          输入一个学术概念，AI 将为你生成直观易懂的教学内容
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* 概念输入 */}
          <div className="space-y-2">
            <Label htmlFor="concept" className="text-sm font-medium">
              学习概念 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="concept"
              placeholder="例如：注意力机制、二分查找、牛顿第二定律..."
              className="text-base"
              disabled={loading}
              {...register("concept")}
            />
            {errors.concept && (
              <p className="text-sm text-red-600">{errors.concept.message}</p>
            )}
          </div>

          {/* 难度选择 */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">难度级别</Label>
            <Select
              value={watchedValues.difficulty}
              onValueChange={(value) => setValue("difficulty", value as any)}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">初学者</span>
                    <span className="text-xs text-muted-foreground">
                      基础概念，详细解释
                    </span>
                  </div>
                </SelectItem>
                <SelectItem value="intermediate">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">中级</span>
                    <span className="text-xs text-muted-foreground">
                      有一定基础，重点突出
                    </span>
                  </div>
                </SelectItem>
                <SelectItem value="advanced">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">高级</span>
                    <span className="text-xs text-muted-foreground">
                      深入分析，专业术语
                    </span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 语言选择 */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">语言</Label>
            <Select
              value={watchedValues.language}
              onValueChange={(value) => setValue("language", value)}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="zh-CN">中文（简体）</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 提交按钮 */}
          <Button
            type="submit"
            className="w-full"
            disabled={!isValid || loading}
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                正在生成内容...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                生成教学演示
              </>
            )}
          </Button>

          {/* 示例提示 */}
          {!watchedValues.concept && (
            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">
                💡 试试这些概念：
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  "注意力机制",
                  "二分查找算法",
                  "机器学习",
                  "量子纠缠",
                  "递归算法",
                ].map((example) => (
                  <Button
                    key={example}
                    variant="outline"
                    size="sm"
                    type="button"
                    disabled={loading}
                    onClick={() => setValue("concept", example)}
                  >
                    {example}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
