// components/category/category-filter.tsx
"use client";

import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { PHYSICS_CATEGORIES } from "@/lib/constants";
import { Filter } from "lucide-react";

interface CategoryFilterProps {
  selectedCategory?: string;
  onCategoryChange: (category: string | undefined) => void;
  categoryCounts?: Array<{ category: string; count: number }>;
  className?: string;
}

export function CategoryFilter({
  selectedCategory,
  onCategoryChange,
  categoryCounts = [],
  className,
}: CategoryFilterProps) {
  const getCategoryCount = (category: string) => {
    return categoryCounts.find((c) => c.category === category)?.count || 0;
  };

  const totalCount = categoryCounts.reduce((sum, c) => sum + c.count, 0);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 筛选标题 */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <h3 className="font-medium text-sm">Browse by Category</h3>
      </div>

      {/* 分类选择器 */}
      <div className="space-y-2">
        <Select
          value={selectedCategory || "all"}
          onValueChange={(value) => {
            onCategoryChange(value === "all" ? undefined : value);
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              <div className="flex items-center justify-between w-full">
                <span>All Categories</span>
                <Badge variant="secondary" className="ml-2 text-xs">
                  {totalCount}
                </Badge>
              </div>
            </SelectItem>
            {Object.keys(PHYSICS_CATEGORIES).map((category) => {
              const count = getCategoryCount(category);
              return (
                <SelectItem
                  key={category}
                  value={category}
                  disabled={count === 0}
                >
                  <div className="flex items-center justify-between w-full">
                    <span>{category}</span>
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {count}
                    </Badge>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {/* 当前选择显示 */}
      {selectedCategory && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Showing:</span>
          <Badge variant="default" className="text-xs">
            {selectedCategory}
            <span className="ml-1">({getCategoryCount(selectedCategory)})</span>
          </Badge>
        </div>
      )}
    </div>
  );
}
