"use client";

import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/layout/user-avatar";
import { APP_NAME } from "@/lib/constants";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";

export function TopBar() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();

  const handleGetStarted = () => {
    router.push("/session");
  };

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Logo and Navigation */}
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl">🔬</span>
              <span className="text-xl font-bold text-gray-900">
                {APP_NAME}
              </span>
            </Link>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center space-x-6">
              {/* Dashboard link only for signed in users */}
              {isLoaded && isSignedIn && (
                <Link
                  href="/session"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  dashboard
                </Link>
              )}
            </nav>
          </div>

          {/* Right side - User actions */}
          <div className="flex items-center">
            {!isLoaded ? (
              // Loading state
              <div className="h-8 w-20 bg-muted animate-pulse rounded" />
            ) : isSignedIn ? (
              // Signed in - show user avatar
              <UserAvatar />
            ) : (
              // Not signed in - show get started button
              <Button
                onClick={handleGetStarted}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Get Started
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-4">
          <nav className="flex items-center space-x-4">
            <Link
              href="/browse"
              className="text-gray-600 hover:text-gray-900 transition-colors text-sm"
            >
              Browse
            </Link>
            <Link
              href="/about"
              className="text-gray-600 hover:text-gray-900 transition-colors text-sm"
            >
              About
            </Link>
            {isLoaded && isSignedIn && (
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-gray-900 transition-colors text-sm"
              >
                Dashboard
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
