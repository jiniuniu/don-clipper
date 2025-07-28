"use client";

import { Button } from "@/components/ui/button";
import { APP_NAME, APP_DESCRIPTION } from "@/lib/constants";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";

export default function HomePage() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();

  // 如果已登录，自动跳转到 /session
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push("/session");
    }
  }, [isLoaded, isSignedIn, router]);

  const handleGetStarted = () => {
    // 未登录时跳转到 /session，中间件会处理登录
    router.push("/session");
  };

  // 加载中状态
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>正在加载...</p>
        </div>
      </div>
    );
  }

  // 已登录会自动跳转，这里主要是未登录状态的展示
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      {/* 现有的页面内容保持不变 */}
      <div className="max-w-4xl mx-auto text-center px-6">
        {/* Hero Section */}
        <div className="space-y-8">
          {/* Logo */}
          <div className="text-8xl mb-8">🔬</div>

          {/* Title */}
          <h1 className="text-6xl font-bold text-gray-900 mb-6">{APP_NAME}</h1>

          {/* Description */}
          <p className="text-2xl text-gray-600 mb-8 max-w-2xl mx-auto">
            {APP_DESCRIPTION}
          </p>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 my-16">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="text-4xl mb-4">🌈</div>
              <h3 className="text-xl font-semibold mb-2">可视化解释</h3>
              <p className="text-gray-600">
                通过精美的图示帮助你理解复杂的物理现象
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold mb-2">AI 驱动</h3>
              <p className="text-gray-600">
                基于先进的AI技术，提供准确易懂的物理解释
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="text-4xl mb-4">💡</div>
              <h3 className="text-xl font-semibold mb-2">互动学习</h3>
              <p className="text-gray-600">
                通过问答式学习，激发你的好奇心和探索欲
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="space-y-4">
            <Button
              onClick={handleGetStarted}
              size="lg"
              className="text-xl px-8 py-4 bg-blue-600 hover:bg-blue-700"
            >
              开始探索物理世界 🚀
            </Button>

            <p className="text-gray-500 text-sm">免费使用，无需注册</p>
          </div>
        </div>
      </div>
    </div>
  );
}
