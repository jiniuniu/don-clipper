"use client";

import { useCredits } from "@/hooks/use-credits";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

export function CreditsTab() {
  const { isAdmin, remainingCredits, dailyCredits, isLoading } = useCredits();

  if (isLoading) {
    return (
      <div className="px-4 py-2 flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" />
        <span>Loading...</span>
      </div>
    );
  }

  if (isAdmin) {
    return (
      <div className="px-4 py-2">
        <Badge variant="secondary" className="text-xs">
          Admin - Unlimited
        </Badge>
      </div>
    );
  }

  // 计算已使用的积分数量
  const usedCredits = dailyCredits - remainingCredits;
  const isLow = remainingCredits <= 2;
  const isEmpty = remainingCredits === 0;

  return (
    <div className="px-4 py-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          Today&apos;s credits:
        </span>
        <Badge
          variant={isEmpty ? "destructive" : isLow ? "outline" : "secondary"}
          className="text-xs"
        >
          {usedCredits}/{dailyCredits}
        </Badge>
      </div>
    </div>
  );
}
