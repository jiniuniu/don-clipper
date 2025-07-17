// components/content-blocks/callout-block.tsx
import React from "react";
import { cn } from "@/lib/utils";
import { StyleConfig } from "@/lib/schemas/mvp-schemas";
import { FileText, Lightbulb, AlertTriangle, Star } from "lucide-react";

interface CalloutBlockProps {
  content: string;
  calloutType: "note" | "tip" | "warning" | "important";
  title?: string;
  style?: StyleConfig;
  className?: string;
}

export function CalloutBlock({
  content,
  calloutType,
  title,
  style,
  className,
}: CalloutBlockProps) {
  const calloutConfig = {
    note: {
      icon: FileText,
      bgColor: "bg-gray-50 dark:bg-gray-950/20",
      borderColor: "border-l-gray-400 dark:border-l-gray-600",
      textColor: "text-gray-900 dark:text-gray-100",
      iconColor: "text-gray-600 dark:text-gray-400",
      label: "笔记",
    },
    tip: {
      icon: Lightbulb,
      bgColor: "bg-emerald-50 dark:bg-emerald-950/20",
      borderColor: "border-l-emerald-400 dark:border-l-emerald-600",
      textColor: "text-emerald-900 dark:text-emerald-100",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      label: "提示",
    },
    warning: {
      icon: AlertTriangle,
      bgColor: "bg-orange-50 dark:bg-orange-950/20",
      borderColor: "border-l-orange-400 dark:border-l-orange-600",
      textColor: "text-orange-900 dark:text-orange-100",
      iconColor: "text-orange-600 dark:text-orange-400",
      label: "警告",
    },
    important: {
      icon: Star,
      bgColor: "bg-purple-50 dark:bg-purple-950/20",
      borderColor: "border-l-purple-400 dark:border-l-purple-600",
      textColor: "text-purple-900 dark:text-purple-100",
      iconColor: "text-purple-600 dark:text-purple-400",
      label: "重要",
    },
  }[calloutType];

  const { icon: Icon } = calloutConfig;

  const fontSizeClass = style?.fontSize
    ? {
        xs: "text-xs",
        sm: "text-sm",
        md: "text-base",
        lg: "text-lg",
        xl: "text-xl",
      }[style.fontSize]
    : "text-sm";

  const paddingClass = style?.padding
    ? {
        sm: "p-3",
        md: "p-4",
        lg: "p-6",
      }[style.padding]
    : "p-4";

  return (
    <div
      className={cn(
        "rounded-r-lg border-l-4 border-y border-r",
        calloutConfig.bgColor,
        calloutConfig.borderColor,
        calloutConfig.textColor,
        "border-r-border border-y-border",
        paddingClass,
        className
      )}
      style={{
        backgroundColor: style?.backgroundColor || undefined,
        borderLeftColor: style?.borderColor || undefined,
        color: style?.textColor || undefined,
      }}
    >
      <div className="flex items-start gap-3">
        <Icon
          className={cn("h-4 w-4 flex-shrink-0 mt-1", calloutConfig.iconColor)}
        />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span
              className={cn(
                "text-xs font-semibold uppercase tracking-wide",
                calloutConfig.iconColor
              )}
            >
              {title || calloutConfig.label}
            </span>
          </div>
          <div className={cn("leading-relaxed", fontSizeClass)}>{content}</div>
        </div>
      </div>
    </div>
  );
}
