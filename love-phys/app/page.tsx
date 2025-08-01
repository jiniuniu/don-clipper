// app/page.tsx - Marketing Homepage
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_NAME, APP_DESCRIPTION, EXAMPLE_QUESTIONS } from "@/lib/constants";
import { ArrowRight, Brain, Lightbulb, Zap, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
            <div className="text-8xl mb-8">🔬</div>

            {/* Headline */}
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              {APP_NAME}
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              {APP_DESCRIPTION}
            </p>

            <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto">
              Ask any question about natural phenomena, and get detailed physics
              explanations with beautiful visual demonstrations powered by AI.
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
                  Describe any natural phenomenon you&apos;re curious about.
                  From rainbows to rockets, we&apos;ve got you covered.
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lightbulb className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-xl">Get Explanations</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Receive detailed physics explanations in clear, accessible
                  language with real-world examples.
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle className="text-xl">See Visuals</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Interactive diagrams and animations help you visualize complex
                  physics concepts.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Example Questions Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Popular Questions
            </h2>
            <p className="text-lg text-gray-600">
              See what others are exploring
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {EXAMPLE_QUESTIONS.slice(0, 6).map((question, index) => (
              <Card
                key={index}
                className="hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() =>
                  router.push(`/session?q=${encodeURIComponent(question)}`)
                }
              >
                <CardContent className="p-6">
                  <p className="text-gray-700 group-hover:text-primary transition-colors">
                    {question}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Link href="/browse">
              <Button variant="outline" size="lg">
                <Users className="mr-2 h-5 w-5" />
                Explore Community Questions
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Explore Physics?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Start your journey of discovery today. Ask any question and get
            instant, detailed explanations with beautiful visualizations.
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
              <span className="text-3xl mr-2">🔬</span>
              <span className="text-2xl font-bold">{APP_NAME}</span>
            </div>
            <p className="text-gray-400 mb-4">
              Making physics accessible to everyone
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
