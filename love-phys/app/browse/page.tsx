// app/browse/page.tsx
"use client";

import React, { useState } from "react";
import { useQuery } from "convex/react";
import { usePaginatedQuery } from "convex/react";
import { ExplanationPreviewCard } from "@/components/explanation/explanation-preview-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/convex/_generated/api";
import { Loader2, Filter } from "lucide-react";
import { PHYSICS_CATEGORIES } from "@/lib/constants";

export default function BrowsePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  // 获取可用分类
  const categoriesData = useQuery(api.queries.getUsedCategories);

  // 使用分页查询，要求有 slug
  const {
    results: explanations,
    status,
    loadMore,
  } = usePaginatedQuery(
    api.queries.getPublicExplanations,
    {
      category: selectedCategory || undefined,
      requireSlug: true, // 只显示有 slug 的内容
    },
    { initialNumItems: 12 }
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🌟 Explore Physics Explanations
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover popular physics questions from social media and forums,
            explained with detailed interactive demonstrations and visual aids
            powered by AI.
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          {categoriesData && categoriesData.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2">
              <Badge
                variant={selectedCategory === "" ? "default" : "outline"}
                className="cursor-pointer hover:scale-105 transition-transform"
                onClick={() => setSelectedCategory("")}
              >
                All Categories ({explanations?.length || 0})
              </Badge>
              {categoriesData.map(({ category, count }) => (
                <Badge
                  key={category}
                  variant={
                    selectedCategory === category ? "default" : "outline"
                  }
                  className="cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category.replace(/_/g, " ")} ({count})
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Loading State */}
        {status === "LoadingFirstPage" && (
          <div className="flex justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading explanations...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {status === "Exhausted" && explanations?.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No explanations found
            </h3>
            <p className="text-gray-600 mb-6">
              {selectedCategory
                ? "Try selecting a different category or view all explanations."
                : "Be the first to create a public explanation!"}
            </p>
            <Button onClick={() => (window.location.href = "/session")}>
              Ask a Question
            </Button>
          </div>
        )}

        {/* Explanations Grid */}
        {explanations && explanations.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {explanations.map((explanation) => (
                <ExplanationPreviewCard
                  key={explanation._id}
                  explanation={explanation}
                  className="hover:shadow-xl transition-all duration-300"
                />
              ))}
            </div>

            {/* Load More Button */}
            {status === "CanLoadMore" && (
              <div className="text-center">
                <Button
                  onClick={() => loadMore(12)}
                  variant="outline"
                  size="lg"
                  className="px-8"
                >
                  Load More
                </Button>
              </div>
            )}

            {/* Loading More */}
            {status === "LoadingMore" && (
              <div className="text-center">
                <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                <p className="text-sm text-gray-600 mt-2">Loading more...</p>
              </div>
            )}
          </>
        )}

        {/* Category Guide */}
        <div className="mt-16 bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Filter className="mr-2 h-6 w-6" />
            Physics Categories
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(PHYSICS_CATEGORIES)
              .slice(0, 6)
              .map(([key, subcategories]) => (
                <div key={key} className="space-y-2">
                  <h3 className="font-semibold text-gray-800 capitalize">
                    {key.replace(/_/g, " ")}
                  </h3>
                  <div className="text-sm text-gray-600">
                    {subcategories.slice(0, 3).map((sub, idx) => (
                      <span key={sub}>
                        {sub.replace(/_/g, " ")}
                        {idx < 2 && idx < subcategories.length - 1 ? ", " : ""}
                      </span>
                    ))}
                    {subcategories.length > 3 && "..."}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
