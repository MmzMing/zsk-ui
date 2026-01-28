import React from "react";
import { SimpleLoader, MultiStepLoader } from "../Aceternity/MultiStepLoader";

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
   * @default "md"
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
  /**
   * 多步骤加载状态列表
   * 如果提供，将使用 MultiStepLoader
   */
  loadingStates?: string[];
  /**
   * 是否全屏显示 (仅对 MultiStepLoader 有效)
   * @default false
   */
  isFullScreen?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({
  height = "100%",
  text = "正在加载",
  spinnerSize = "md",
  className = "",
  showSpinner = true,
  loadingStates,
  isFullScreen = false,
}) => {
  // 如果提供了 loadingStates，则使用 MultiStepLoader
  if (loadingStates && loadingStates.length > 0) {
    return (
      <MultiStepLoader 
        loadingStates={loadingStates} 
        loading={true} 
        isFullScreen={isFullScreen}
        className={className}
      />
    );
  }

  return (
    <div 
      className={`flex flex-col items-center justify-center gap-6 ${className}`}
      style={{ height }}
    >
      {showSpinner && (
        <SimpleLoader size={spinnerSize} />
      )}
      {text && (
        <p className={`font-medium text-[var(--text-color-secondary)] tracking-[0.2em] uppercase ${spinnerSize === 'sm' ? 'text-[10px]' : 'text-xs'}`}>
          {text}
        </p>
      )}
    </div>
  );
};

export default Loading;
