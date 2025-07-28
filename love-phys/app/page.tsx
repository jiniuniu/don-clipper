"use client";

import { Button } from "@/components/ui/button";
import { APP_NAME, APP_DESCRIPTION } from "@/lib/constants";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";

export default function HomePage() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();

  // If already logged in, automatically redirect to /session
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push("/session");
    }
  }, [isLoaded, isSignedIn, router]);

  const handleGetStarted = () => {
    // When not logged in, redirect to /session, middleware will handle login
    router.push("/session");
  };

  // Loading state
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Logged in users will auto-redirect, this is mainly for displaying the not-logged-in state
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
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
              <h3 className="text-xl font-semibold mb-2">
                Visual Explanations
              </h3>
              <p className="text-gray-600">
                Understand complex physical phenomena through beautiful
                illustrations
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold mb-2">AI-Powered</h3>
              <p className="text-gray-600">
                Provides accurate and accessible physics explanations using
                advanced AI technology
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="text-4xl mb-4">💡</div>
              <h3 className="text-xl font-semibold mb-2">
                Interactive Learning
              </h3>
              <p className="text-gray-600">
                Spark your curiosity and desire to explore through Q&A-style
                learning
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
              Start Exploring Physics 🚀
            </Button>

            <p className="text-gray-500 text-sm">
              Free to use, no registration required
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
