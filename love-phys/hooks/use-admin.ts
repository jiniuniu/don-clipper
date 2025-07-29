// hooks/use-admin.ts
"use client";

import { useUser } from "@clerk/nextjs";

export function useAdmin() {
  const { user, isLoaded } = useUser();

  // 检查用户是否为管理员
  const isAdmin = user?.publicMetadata?.isAdmin === true;

  return {
    isAdmin,
    isLoaded,
    user,
  };
}
