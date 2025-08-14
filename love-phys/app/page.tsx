/* eslint-disable react/no-unescaped-entities */
// app/page.tsx - Marketing Homepage
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_NAME, APP_DESCRIPTION } from "@/lib/constants";
import { ArrowRight, Brain, Lightbulb, Zap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/ui/logo";

export default function HomePage() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push("/session");
  };

  const handleBrowseExamples = () => {
    router.push("/browse");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <section className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            {/* Logo */}
            <div className="mb-8 flex justify-center">
              <Logo
                size={192}
                color="#1f2937"
                hoverColor="#3b82f6"
                className="w-32 h-32 md:w-48 md:h-48"
                animated={true}
              />
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              {APP_NAME}
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              {APP_DESCRIPTION}
            </p>

            <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto">
              Discover the science behind everyday wonders. From the shimmer of
              soap bubbles to the roar of rocket engines, unlock the physics
              that shapes our world with AI-powered explanations and stunning
              visual demonstrations.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                className="text-lg px-8 py-4"
                onClick={handleGetStarted}
              >
                Start Exploring
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="text-lg px-8 py-4"
                onClick={handleBrowseExamples}
              >
                Browse Examples
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600">
              Simple, powerful, and educational
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Ask Anything</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  From "Why is the sky blue?" to "How do rockets escape
                  gravity?" — Ask about any phenomenon that sparks your
                  curiosity.
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lightbulb className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-xl">Understand Deeply</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Get crystal-clear explanations that connect complex physics to
                  your everyday experiences, making science truly accessible.
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle className="text-xl">Watch It Come Alive</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Experience physics through interactive animations and elegant
                  diagrams that transform abstract concepts into visual stories.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to See the World Through New Eyes?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of curious minds exploring the elegant laws that
            govern everything around us. Your next "aha!" moment is just a
            question away.
          </p>
          <Button
            size="lg"
            className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-4"
            onClick={handleGetStarted}
          >
            Get Started for Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Logo
                size={32}
                color="#ffffff"
                hoverColor="#93c5fd"
                className="w-8 h-8 mr-2"
                animated={true}
              />
              <span className="text-2xl font-bold">{APP_NAME}</span>
            </div>
            <p className="text-gray-400 mb-4">
              Illuminating the science behind everyday wonders
            </p>
            <div className="flex justify-center space-x-6">
              <Link
                href="/browse"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Browse
              </Link>
              <Link
                href="/session"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Ask Question
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
