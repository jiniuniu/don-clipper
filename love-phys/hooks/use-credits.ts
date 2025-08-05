"use client";

import { useQuery, useMutation } from "convex/react";
import { useCallback, useEffect } from "react";
import { api } from "@/convex/_generated/api";
import { useAdmin } from "./use-admin";
import { useUser } from "@clerk/nextjs";
import { CREDITS_CONFIG } from "@/lib/constants";

export function useCredits() {
  const { user: clerkUser } = useUser();
  const { isAdmin } = useAdmin();

  const userCredits = useQuery(api.queries.getUserCredits);
  const createOrUpdateUser = useMutation(api.mutations.createOrUpdateUser);
  const resetDailyCredits = useMutation(api.mutations.resetDailyCredits);
  const consumeCredits = useMutation(api.mutations.consumeCredits);

  // 确保用户存在于数据库中
  useEffect(() => {
    if (clerkUser?.emailAddresses?.[0]?.emailAddress) {
      createOrUpdateUser({
        email: clerkUser.emailAddresses[0].emailAddress,
        name: clerkUser.fullName || undefined,
      }).catch(console.error);
    }
  }, [clerkUser, createOrUpdateUser]);

  // 自动重置每日积分
  useEffect(() => {
    if (userCredits?.needsReset && userCredits.userId) {
      resetDailyCredits({ userId: userCredits.userId }).catch(console.error);
    }
  }, [userCredits, resetDailyCredits]);

  const remainingCredits = userCredits
    ? userCredits.dailyCredits - userCredits.usedCredits
    : 0;

  const canUseFeature = isAdmin || remainingCredits > 0;

  const checkAndConsumeCredits = useCallback(
    async (amount: number = CREDITS_CONFIG.CREDITS_PER_QUESTION) => {
      if (isAdmin) {
        return true; // 管理员跳过检查
      }

      if (!userCredits) {
        throw new Error("User data not loaded");
      }

      if (remainingCredits < amount) {
        throw new Error("Insufficient credits");
      }

      await consumeCredits({
        userId: userCredits.userId,
        amount,
      });

      return true;
    },
    [isAdmin, userCredits, remainingCredits, consumeCredits]
  );

  return {
    isAdmin,
    userCredits,
    remainingCredits,
    dailyCredits: userCredits?.dailyCredits || 0,
    canUseFeature,
    checkAndConsumeCredits,
    isLoading: userCredits === undefined,
  };
}
