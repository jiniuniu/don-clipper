"use client";

import React, { useState, useEffect } from "react";
import { Brain, Image, CheckCircle, Loader2, Clock } from "lucide-react";

interface LoadingExplanationProps {
  status: "generating" | "content_completed" | "svg_generating";
  className?: string;
}

// Define two main steps with estimated time
const LOADING_PHASES = [
  {
    key: "generating",
    icon: Brain,
    title: "Generating Physics Explanation",
    description:
      "Analyzing physical phenomena and generating detailed explanation...",
    estimatedTime: "30-60 seconds",
  },
  {
    key: "svg_generating",
    icon: Image,
    title: "Creating Demonstration Diagram",
    description: "Generating visualization charts based on explanation...",
    estimatedTime: "1-2 minutes",
  },
] as const;

export function LoadingExplanation({
  status,
  className,
}: LoadingExplanationProps) {
  const [startTime] = useState(() => Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [phaseStartTimes, setPhaseStartTimes] = useState<
    Record<string, number>
  >({});

  // Determine current phase based on status
  const statusToPhaseMap = {
    generating: 0,
    content_completed: 0, // Content completed still shows first phase
    svg_generating: 1,
  };

  const currentPhaseIndex = statusToPhaseMap[status];
  const currentPhase = LOADING_PHASES[currentPhaseIndex];
  const CurrentIcon = currentPhase?.icon || Loader2;

  // Record start time for each phase
  useEffect(() => {
    if (currentPhase && !phaseStartTimes[currentPhase.key]) {
      setPhaseStartTimes((prev) => ({
        ...prev,
        [currentPhase.key]: Date.now(),
      }));
    }
  }, [status, currentPhase, phaseStartTimes]);

  // Update total execution time
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(Date.now() - startTime);
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  // Format time display
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Execution time display */}
      <div className="flex justify-center">
        <div className="flex items-center space-x-2 px-3 py-1 bg-blue-50 rounded-full">
          <Clock className="h-4 w-4 text-blue-600" />
          <span className="text-blue-700 text-sm">
            Elapsed: {formatTime(elapsedTime)}
          </span>
        </div>
      </div>

      {/* Phase indicators */}
      <div className="flex justify-center space-x-6">
        {LOADING_PHASES.map((phase, index) => {
          const Icon = phase.icon;
          const isActive = index === currentPhaseIndex;
          const isCompleted = index < currentPhaseIndex;
          const isFuture = index > currentPhaseIndex;

          return (
            <div
              key={phase.key}
              className={`flex flex-col items-center space-y-2 transition-all duration-500 ${
                isActive
                  ? "scale-110"
                  : isCompleted
                    ? "scale-100 opacity-80"
                    : "scale-95 opacity-40"
              }`}
            >
              {/* Icon container */}
              <div
                className={`relative p-3 rounded-full border-2 transition-all duration-300 ${
                  isActive
                    ? "border-primary bg-primary/10 text-primary shadow-lg"
                    : isCompleted
                      ? "border-green-500 bg-green-50 text-green-600"
                      : "border-muted-foreground/30 bg-muted/30 text-muted-foreground"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <Icon
                    className={`h-5 w-5 ${isActive ? "animate-pulse" : ""}`}
                  />
                )}

                {/* Current phase glow effect */}
                {isActive && (
                  <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping" />
                )}
              </div>

              {/* Phase title and status */}
              <div className="text-center">
                <p
                  className={`text-xs font-medium transition-colors ${
                    isActive
                      ? "text-primary"
                      : isCompleted
                        ? "text-green-600"
                        : "text-muted-foreground"
                  }`}
                >
                  {phase.title}
                </p>

                {/* Status indicator */}
                <div className="mt-1">
                  {isCompleted && (
                    <div className="flex items-center justify-center space-x-1">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                      <span className="text-xs text-green-600">Completed</span>
                    </div>
                  )}
                  {isActive && (
                    <div className="flex items-center justify-center space-x-1">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                      <span className="text-xs text-primary">In Progress</span>
                    </div>
                  )}
                  {isFuture && (
                    <div className="flex items-center justify-center space-x-1">
                      <div className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full" />
                      <span className="text-xs text-muted-foreground">
                        Waiting
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Connection lines */}
      <div className="flex justify-center">
        <div className="flex items-center space-x-4">
          {LOADING_PHASES.map((_, index) => {
            if (index === LOADING_PHASES.length - 1) return null;

            const isCompleted = index < currentPhaseIndex;
            const isActive =
              index === currentPhaseIndex - 1 && currentPhaseIndex > 0;

            return (
              <div
                key={index}
                className={`h-0.5 w-12 transition-all duration-500 ${
                  isCompleted
                    ? "bg-green-500"
                    : isActive
                      ? "bg-gradient-to-r from-green-500 to-primary animate-pulse"
                      : "bg-muted-foreground/30"
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Current phase hint */}
      <div className="bg-muted/30 rounded-lg p-4 text-center">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <CurrentIcon className="h-4 w-4 animate-spin text-primary" />
          <span className="text-sm font-medium text-foreground">
            {currentPhase?.title}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mb-2">
          {currentPhase?.description}
        </p>

        {/* Special notice for diagram generation time */}
        {status === "svg_generating" && (
          <div className="mt-2 p-2 bg-amber-50 rounded border border-amber-200">
            <p className="text-xs text-amber-700">
              ⏰ Diagram generation takes 1-2 minutes, please be patient
            </p>
          </div>
        )}
      </div>

      {/* Hint text */}
      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          💡 AI is applying physics knowledge to generate detailed explanation
          for you...
        </p>
      </div>
    </div>
  );
}
