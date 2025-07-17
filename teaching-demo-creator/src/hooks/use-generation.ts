// hooks/use-generation.ts
"use client";

import { useState, useCallback } from "react";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { MVPUserInput, MVPGeneratedContent } from "@/lib/schemas/mvp-schemas";

interface UseGenerationState {
  status: "idle" | "generating" | "success" | "error";
  result: MVPGeneratedContent | null;
  error: string | null;
  projectId: string | null;
}

interface UseGenerationReturn extends UseGenerationState {
  generate: (input: MVPUserInput) => Promise<void>;
  reset: () => void;
}

export function useGeneration(): UseGenerationReturn {
  const [state, setState] = useState<UseGenerationState>({
    status: "idle",
    result: null,
    error: null,
    projectId: null,
  });

  const generateAction = useAction(
    api.actions.generateContent.generateTeachingContent
  );

  const generate = useCallback(
    async (input: MVPUserInput) => {
      try {
        setState({
          status: "generating",
          result: null,
          error: null,
          projectId: null,
        });

        const result = await generateAction({
          concept: input.concept,
          difficulty: input.difficulty,
          language: input.language,
        });

        if (result.success) {
          setState({
            status: "success",
            result: result.result,
            error: null,
            projectId: result.projectId,
          });
        } else {
          throw new Error("生成失败");
        }
      } catch (error) {
        setState({
          status: "error",
          result: null,
          error: error instanceof Error ? error.message : "生成失败",
          projectId: null,
        });
      }
    },
    [generateAction]
  );

  const reset = useCallback(() => {
    setState({
      status: "idle",
      result: null,
      error: null,
      projectId: null,
    });
  }, []);

  return {
    ...state,
    generate,
    reset,
  };
}
