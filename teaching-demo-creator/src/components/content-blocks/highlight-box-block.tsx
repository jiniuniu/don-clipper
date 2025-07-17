// components/content-blocks/highlight-box-block.tsx
import React from "react";
import { cn } from "@/lib/utils";
import { StyleConfig } from "@/lib/schemas/mvp-schemas";
import { AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react";

interface HighlightBoxBlockProps {
  content: string;
  boxType: "info" | "warning" | "success" | "error";
  title?: string;
  style?: StyleConfig;
  className?: string;
}

export function HighlightBoxBlock({
  content,
  boxType,
  title,
  style,
  className,
}: HighlightBoxBlockProps) {
  const boxConfig = {
    info: {
      icon: Info,
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
      borderColor: "border-blue-200 dark:border-blue-800",
      textColor: "text-blue-900 dark:text-blue-100",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    warning: {
      icon: AlertTriangle,
      bgColor: "bg-yellow-50 dark:bg-yellow-950/20",
      borderColor: "border-yellow-200 dark:border-yellow-800",
      textColor: "text-yellow-900 dark:text-yellow-100",
      iconColor: "text-yellow-600 dark:text-yellow-400",
    },
    success: {
      icon: CheckCircle,
      bgColor: "bg-green-50 dark:bg-green-950/20",
      borderColor: "border-green-200 dark:border-green-800",
      textColor: "text-green-900 dark:text-green-100",
      iconColor: "text-green-600 dark:text-green-400",
    },
    error: {
      icon: AlertCircle,
      bgColor: "bg-red-50 dark:bg-red-950/20",
      borderColor: "border-red-200 dark:border-red-800",
      textColor: "text-red-900 dark:text-red-100",
      iconColor: "text-red-600 dark:text-red-400",
    },
  }[boxType];

  const { icon: Icon } = boxConfig;

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
        "rounded-lg border",
        boxConfig.bgColor,
        boxConfig.borderColor,
        boxConfig.textColor,
        paddingClass,
        className
      )}
      style={{
        backgroundColor: style?.backgroundColor || undefined,
        borderColor: style?.borderColor || undefined,
        color: style?.textColor || undefined,
      }}
    >
      <div className="flex items-start gap-3">
        <Icon
          className={cn("h-5 w-5 flex-shrink-0 mt-0.5", boxConfig.iconColor)}
        />
        <div className="flex-1">
          {title && (
            <h4 className={cn("font-semibold mb-2", fontSizeClass)}>{title}</h4>
          )}
          <div className={cn("leading-relaxed", fontSizeClass)}>{content}</div>
        </div>
      </div>
    </div>
  );
}
