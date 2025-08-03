"use client";

import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/layout/user-avatar";
import { APP_NAME } from "@/lib/constants";
import { useRouter, usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";

export function TopBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { isSignedIn, isLoaded } = useUser();

  const handleGetStarted = () => {
    router.push("/session");
  };

  // Helper function to determine if a link is active
  const isActiveLink = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  // Ghost button variant based on active state
  const getButtonVariant = (href: string) =>
    isActiveLink(href) ? "default" : "ghost";

  const getButtonClassName = (href: string) =>
    isActiveLink(href) ? "bg-gray-900/80 text-white hover:bg-gray-900/90" : "";

  return (
    <header className="bg-white/10 backdrop-blur-md shadow-sm border-b sticky top-0 z-50">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Logo and Navigation */}
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl">🔬</span>
              <span className="text-xl md:text-xl font-bold text-gray-900 hidden sm:block">
                {APP_NAME}
              </span>
            </Link>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center space-x-2">
              <Button
                variant={getButtonVariant("/browse")}
                className={getButtonClassName("/browse")}
                asChild
              >
                <Link href="/browse">Browse</Link>
              </Button>
              {/* Dashboard link only for signed in users */}
              {isLoaded && isSignedIn && (
                <Button
                  variant={getButtonVariant("/session")}
                  className={getButtonClassName("/session")}
                  asChild
                >
                  <Link href="/session">Dashboard</Link>
                </Button>
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
              <Button variant="ghost" onClick={handleGetStarted}>
                Get Started
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-3 pt-1">
          <nav className="flex items-center justify-center space-x-4">
            <Button
              variant={getButtonVariant("/browse")}
              className={getButtonClassName("/browse")}
              size="sm"
              asChild
            >
              <Link href="/browse">Browse</Link>
            </Button>
            {isLoaded && isSignedIn && (
              <Button
                variant={getButtonVariant("/session")}
                className={getButtonClassName("/session")}
                size="sm"
                asChild
              >
                <Link href="/session">Chat</Link>
              </Button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
