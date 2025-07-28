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
  // 为不同的现象分配不同的颜色样式
  const getVariant = (index: number) => {
    const variants = ["default", "secondary", "outline"] as const;
    return variants[index % variants.length];
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <h3 className="text-base font-semibold flex items-center text-primary">
        💡 Related Phenomena
      </h3>
      <div className="flex flex-wrap gap-2">
        {phenomena.map((phenomenon, index) => (
          <Badge
            key={index}
            variant={getVariant(index)}
            className="text-sm py-1.5 px-3 hover:scale-105 transition-transform cursor-default"
          >
            {phenomenon}
          </Badge>
        ))}
      </div>
    </div>
  );
}
