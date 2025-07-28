"use client";

import { UserButton, useUser, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

interface UserAvatarProps {
  className?: string;
}

export function UserAvatar({ className }: UserAvatarProps) {
  const { isSignedIn, isLoaded, user } = useUser();

  // 加载中状态
  if (!isLoaded) {
    return (
      <div className={`flex items-center ${className}`}>
        <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
      </div>
    );
  }

  // 已登录状态
  if (isSignedIn) {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        <div className="hidden sm:block text-sm text-muted-foreground">
          {user.firstName || user.emailAddresses[0]?.emailAddress}
        </div>
        <UserButton
          appearance={{
            elements: {
              avatarBox: "h-8 w-8",
              userButtonPopoverCard: "shadow-lg border",
              userButtonPopoverActions: "text-sm",
            },
          }}
          showName={false}
        />
      </div>
    );
  }

  // 未登录状态
  return (
    <div className={`flex items-center ${className}`}>
      <SignInButton mode="modal">
        <Button variant="outline" size="sm" className="h-8">
          <LogIn className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">登录</span>
        </Button>
      </SignInButton>
    </div>
  );
}
