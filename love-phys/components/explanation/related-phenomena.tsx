"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";

interface RelatedPhenomenaProps {
  phenomena: string[];
  className?: string;
}

export function RelatedPhenomena({
  phenomena,
  className,
}: RelatedPhenomenaProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      <h3 className="text-base font-semibold flex items-center text-primary">
        💡 Related Phenomena
      </h3>
      <div className="flex flex-wrap gap-2">
        {phenomena.map((phenomenon, index) => (
          <Badge
            key={index}
            variant="secondary"
            className="text-sm py-1.5 px-3 hover:scale-105 transition-transform cursor-default"
          >
            {phenomenon}
          </Badge>
        ))}
      </div>
    </div>
  );
}
