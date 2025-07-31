// app/page.tsx - 使用 Convex 官方分页的主页修改
"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ExplanationPreviewCard } from "@/components/explanation/explanation-preview-card";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();

  // 分类筛选状态
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedCategory, setSelectedCategory] = useState<
    string | undefined
  >();

  // 使用 Convex 官方的分页 hook
  const {
    results: explanations,
    status,
    loadMore,
  } = usePaginatedQuery(
    api.queries.getPublicExplanations,
    { category: selectedCategory }, // 只传业务参数，不需要 paginationOpts
    { initialNumItems: 12 } // 首次加载 12 个
  );

  const handleGetStarted = () => {
    router.push("/session");
  };

  // 加载状态
  if (!isLoaded) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center min-h-screen">
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

          {/* Explanations Grid */}
          <div className="space-y-8">
            {/* Loading State for Initial Load */}
            {status === "LoadingFirstPage" ? (
              <div className="flex justify-center py-12">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                  <p className="text-gray-600">
                    Loading physics explanations...
                  </p>
                </div>
              </div>
            ) : explanations && explanations.length === 0 ? (
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
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {explanations?.map((explanation) => (
                    <ExplanationPreviewCard
                      key={explanation._id}
                      explanation={explanation}
                    />
                  ))}
                </div>

                {/* Load More Button */}
                {status === "CanLoadMore" && (
                  <div className="flex justify-center pt-8">
                    <Button
                      onClick={() => loadMore(12)} // 每次加载 12 个
                      variant="outline"
                      size="lg"
                      className="bg-white/80 backdrop-blur"
                    >
                      Load More Explanations
                    </Button>
                  </div>
                )}

                {/* Loading More State */}
                {status === "LoadingMore" && (
                  <div className="flex justify-center pt-8">
                    <Button
                      disabled
                      variant="outline"
                      size="lg"
                      className="bg-white/80 backdrop-blur"
                    >
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Loading more...
                    </Button>
                  </div>
                )}

                {/* End Message */}
                {status === "Exhausted" &&
                  explanations &&
                  explanations.length > 0 && (
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
          <Button onClick={handleGetStarted} size="lg">
            {isSignedIn ? "Go to Dashboard" : "Get Started for Free"}
          </Button>
        </div>
      </div>
    </div>
  );
}
