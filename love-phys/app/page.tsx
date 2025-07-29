// app/page.tsx - 完整的主页修改
"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ExplanationPreviewCard } from "@/components/explanation/explanation-preview-card";
import { CategoryFilter } from "@/components/category/category-filter";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();

  // 分类筛选状态
  const [selectedCategory, setSelectedCategory] = useState<
    string | undefined
  >();

  // 无限滚动状态
  const [currentCursor, setCurrentCursor] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [allExplanations, setAllExplanations] = useState<any[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // 查询数据
  const publicExplanationsQuery = useQuery(api.queries.getPublicExplanations, {
    category: selectedCategory,
    limit: 12, // 每次加载12个
    cursor: currentCursor,
  });

  const categoryCounts = useQuery(api.queries.getUsedCategories);

  // 处理数据更新
  useEffect(() => {
    if (publicExplanationsQuery) {
      if (currentCursor === 0) {
        // 新的查询或重置
        setAllExplanations(publicExplanationsQuery.explanations);
      } else {
        // 加载更多
        setAllExplanations((prev) => [
          ...prev,
          ...publicExplanationsQuery.explanations,
        ]);
      }
      setHasMore(publicExplanationsQuery.hasMore);
      setIsLoadingMore(false);
    }
  }, [publicExplanationsQuery, currentCursor]);

  // 重置数据当分类改变时
  useEffect(() => {
    setCurrentCursor(0);
    setAllExplanations([]);
    setHasMore(true);
  }, [selectedCategory]);

  // 加载更多
  const loadMore = () => {
    if (publicExplanationsQuery && hasMore && !isLoadingMore) {
      setIsLoadingMore(true);
      setCurrentCursor(publicExplanationsQuery.nextCursor);
    }
  };

  const handleGetStarted = () => {
    router.push("/session");
  };

  // 加载状态
  if (!isLoaded) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center min-h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-full">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Public Explanations Section */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              🌟 Explore Physics Phenomena
            </h2>
            <p className="text-gray-600 text-lg">
              Discover fascinating explanations created by our community
            </p>
          </div>

          {/* Category Filter */}
          <div className="max-w-md mx-auto">
            <CategoryFilter
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              categoryCounts={categoryCounts || []}
            />
          </div>

          {/* Explanations Grid */}
          <div className="space-y-8">
            {/* Loading State for Initial Load */}
            {publicExplanationsQuery === undefined ? (
              <div className="flex justify-center py-12">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                  <p className="text-gray-600">
                    Loading physics explanations...
                  </p>
                </div>
              </div>
            ) : allExplanations.length === 0 ? (
              /* Empty State */
              <div className="text-center py-12">
                <div className="text-6xl mb-6">🔍</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-700">
                  {selectedCategory
                    ? "No explanations in this category yet"
                    : "No public explanations yet"}
                </h3>
                <p className="text-gray-500 mb-6">
                  {selectedCategory
                    ? "Try selecting a different category or check back later."
                    : "Be the first to create and share a physics explanation!"}
                </p>
                <Button onClick={handleGetStarted} variant="outline">
                  Create First Explanation
                </Button>
              </div>
            ) : (
              /* Explanations Grid */
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {allExplanations.map((explanation) => (
                    <ExplanationPreviewCard
                      key={explanation._id}
                      explanation={explanation}
                    />
                  ))}
                </div>

                {/* Load More Button */}
                {hasMore && (
                  <div className="flex justify-center pt-8">
                    <Button
                      onClick={loadMore}
                      disabled={isLoadingMore}
                      variant="outline"
                      size="lg"
                      className="bg-white/80 backdrop-blur"
                    >
                      {isLoadingMore ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Loading more...
                        </>
                      ) : (
                        "Load More Explanations"
                      )}
                    </Button>
                  </div>
                )}

                {/* End Message */}
                {!hasMore && allExplanations.length > 0 && (
                  <div className="text-center pt-8">
                    <p className="text-gray-500 text-sm">
                      🎉 You&apos;ve seen all available explanations!
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16 p-8 bg-white/60 backdrop-blur rounded-lg">
          <h3 className="text-2xl font-bold mb-4">Ready to Explore More?</h3>
          <p className="text-gray-600 mb-6">
            Join our community and create your own physics explanations
          </p>
          <Button
            onClick={handleGetStarted}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSignedIn ? "Go to Dashboard" : "Get Started for Free"}
          </Button>
        </div>
      </div>
    </div>
  );
}
