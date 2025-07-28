"use client";

import React from "react";

interface ExplanationTextProps {
  explanation: string;
  className?: string;
}

export function ExplanationText({
  explanation,
  className,
}: ExplanationTextProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-semibold flex items-center">
        🔍 Physics Principles
      </h3>
      <div className="prose prose-sm max-w-none">
        <p className="text-foreground leading-relaxed whitespace-pre-line">
          {explanation}
        </p>
      </div>
    </div>
  );
}
