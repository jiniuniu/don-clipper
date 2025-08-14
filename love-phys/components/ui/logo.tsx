// components/ui/logo.tsx
import React, { useState, useEffect } from "react";

interface LogoProps {
  className?: string;
  color?: string;
  hoverColor?: string;
  size?: number | string;
  width?: number | string;
  height?: number | string;
  animated?: boolean;
  clickable?: boolean;
}

export function Logo({
  className = "",
  color = "#000000",
  hoverColor,
  size,
  width = size || 32,
  height = size || 32,
  animated = true,
  clickable = false,
}: LogoProps) {
  const [isShaking, setIsShaking] = useState(false);
  const [currentColor, setCurrentColor] = useState(color);

  // 添加全局样式（仅在客户端）
  useEffect(() => {
    if (typeof document !== "undefined") {
      const styleId = "logo-shake-animation";
      if (!document.getElementById(styleId)) {
        const style = document.createElement("style");
        style.id = styleId;
        style.textContent = `
          @keyframes logo-shake {
            0%, 100% { 
              transform: translateX(0) rotate(0deg); 
            }
            10% { 
              transform: translateX(-2px) rotate(-1deg); 
            }
            20% { 
              transform: translateX(2px) rotate(1deg); 
            }
            30% { 
              transform: translateX(-2px) rotate(-1deg); 
            }
            40% { 
              transform: translateX(2px) rotate(1deg); 
            }
            50% { 
              transform: translateX(-1px) rotate(-0.5deg); 
            }
            60% { 
              transform: translateX(1px) rotate(0.5deg); 
            }
            70% { 
              transform: translateX(-1px) rotate(-0.5deg); 
            }
            80% { 
              transform: translateX(1px) rotate(0.5deg); 
            }
            90% { 
              transform: translateX(-0.5px) rotate(-0.25deg); 
            }
          }
          
          .logo-animate-shake {
            animation: logo-shake 0.6s ease-in-out;
          }
        `;
        document.head.appendChild(style);
      }
    }
  }, []);

  const handleMouseEnter = () => {
    if (!animated) return;

    // 开始抖动动画
    setIsShaking(true);

    // 改变颜色
    if (hoverColor) {
      setCurrentColor(hoverColor);
    }

    // 600ms后停止抖动
    setTimeout(() => {
      setIsShaking(false);
    }, 600);
  };

  const handleMouseLeave = () => {
    if (!animated) return;

    // 恢复原色
    setCurrentColor(color);
    setIsShaking(false);
  };

  const baseClasses = animated
    ? "transition-colors duration-300 ease-in-out"
    : "";
  const cursorClass = clickable ? "cursor-pointer" : "";
  const shakeClass = isShaking ? "logo-animate-shake" : "";

  const combinedClassName =
    `${baseClasses} ${cursorClass} ${shakeClass} ${className}`.trim();

  return (
    <svg
      className={combinedClassName}
      fill={currentColor}
      version="1.1"
      id="Capa_1"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      width={width}
      height={height}
      viewBox="0 0 519.643 519.643"
      xmlSpace="preserve"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <g>
        <path
          d="M334.398,467.832v-57.791h49.067v-20.925H246.458v20.925h49.078v57.791h-85.201
          c-34.477-44.361-105.333-156.883-84.741-232.825c19.717-72.736,101.48-59.938,124.309-54.894v95.723h50.749v-15.215h35.218v-20.184
          h35.195V46.539h-33.677V29.894h25.911V0H257.673v29.894h28.906v16.646h-36.666v71.721c-12.892-2.294-36.829-5.039-65.479-1.004
          c-59.57,8.402-100.96,44.671-116.537,102.117c-23.652,87.14,31.493,190.892,69.269,248.46H96.728v51.811h360.723v-51.811H334.398z
           M355.51,179.36l-90.089,32.322v-25.544l90.089-32.334V179.36z M319.135,245.091h-18.496v-29.526l18.496-6.632V245.091z
           M285.097,260.312h-19.676v-32.106l19.676-7.053v23.938v7.771V260.312z M334.678,224.907v-21.562l20.832-7.474v29.035H334.678z
           M286.556,62.07v6.183h50.819V62.07h18.135v75.224l-90.089,32.334V62.07H286.556z"
        />
      </g>
    </svg>
  );
}
