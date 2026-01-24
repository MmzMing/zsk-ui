import React from "react";
import { Spinner } from "@heroui/react";

interface LoadingProps {
  /**
   * 容器的高度
   * @default "100%"
   */
  height?: string | number;
  /**
   * 加载提示文字
   * @default "正在加载"
   */
  text?: string;
  /**
   * Spinner 的大小
   * @default "lg"
   */
  spinnerSize?: "sm" | "md" | "lg";
  /**
   * 额外的容器样式类
   */
  className?: string;
  /**
   * 是否显示 Spinner
   * @default true
   */
  showSpinner?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({
  height = "100%",
  text = "正在加载",
  spinnerSize = "lg",
  className = "",
  showSpinner = true,
}) => {
  return (
    <div 
      className={`flex flex-col items-center justify-center gap-4 ${className}`}
      style={{ height }}
    >
      {showSpinner && (
        <Spinner 
          size={spinnerSize} 
          color="white" 
          classNames={{
            circle1: "border-b-[var(--primary-color)]",
            circle2: "border-b-[var(--primary-color)]"
          }}
        />
      )}
      {text && (
        <p className={`font-medium text-[var(--text-color)] tracking-wider ${spinnerSize === 'sm' ? 'text-xs' : 'text-sm'}`}>
          {text}
        </p>
      )}
    </div>
  );
};

export default Loading;
