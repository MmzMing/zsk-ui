// ===== 1. 依赖导入区域 =====
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";

// ===== 2. TODO待处理导入区域 =====

// ===== 3. 状态控制逻辑区域 =====

// ===== 4. 通用工具函数区域 =====

// ===== 5. 注释代码函数区 =====

// ===== 6. 错误处理函数区域 =====

// ===== 7. 数据处理函数区域 =====

// ===== 8. UI渲染逻辑区域 =====

/**
 * 加载状态项组件
 */
const LoaderItem = ({
  text,
  active,
  completed,
}: {
  /** 状态文本 */
  text: string;
  /** 是否为当前活动状态 */
  active: boolean;
  /** 是否已完成 */
  completed: boolean;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        "flex items-center gap-3 py-2 transition-colors duration-300",
        active ? "text-[var(--primary-color)]" : "text-[var(--text-color-secondary)]",
        completed && "text-emerald-500"
      )}
    >
      <div className="relative flex h-6 w-6 items-center justify-center">
        {completed ? (
          <motion.svg
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <polyline points="20 6 9 17 4 12" />
          </motion.svg>
        ) : active ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="h-4 w-4 rounded-full border-2 border-[var(--primary-color)] border-t-transparent"
          />
        ) : (
          <div className="h-2 w-2 rounded-full bg-neutral-300 dark:bg-neutral-700" />
        )}
      </div>
      <span className={cn("text-sm font-medium tracking-wide", active && "scale-105 origin-left transition-transform")}>
        {text}
      </span>
    </motion.div>
  );
};

/**
 * 简单加载器组件 (Aceternity 风格)
 */
export const SimpleLoader = ({
  size = "md",
  className,
}: {
  /** 大小 */
  size?: "sm" | "md" | "lg";
  /** 自定义类名 */
  className?: string;
}) => {
  const sizeMap = {
    sm: "h-6 w-6 border-2",
    md: "h-10 w-10 border-3",
    lg: "h-16 w-16 border-4",
  };

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      {/* 外层旋转圆环 */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        className={cn(
          "rounded-full border-t-[var(--primary-color)] border-r-transparent border-b-transparent border-l-transparent",
          sizeMap[size]
        )}
      />
      {/* 内层反向旋转圆环 */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className={cn(
          "absolute rounded-full border-b-[var(--primary-color)]/30 border-t-transparent border-r-transparent border-l-transparent opacity-50",
          sizeMap[size]
        )}
      />
      {/* 中间脉冲点 */}
      <motion.div
        animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className={cn(
          "absolute rounded-full bg-[var(--primary-color)]",
          size === "sm" ? "h-1 w-1" : size === "md" ? "h-2 w-2" : "h-3 w-3"
        )}
      />
    </div>
  );
};

/**
 * Aceternity UI 多步骤加载器
 */
export const MultiStepLoader = ({
  loadingStates,
  loading,
  duration = 2000,
  loop = true,
  className,
  isFullScreen = true,
}: {
  /** 加载状态列表 */
  loadingStates: string[];
  /** 是否显示加载器 */
  loading?: boolean;
  /** 每个状态持续时间 (ms) */
  duration?: number;
  /** 是否循环播放 */
  loop?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 是否全屏显示 */
  isFullScreen?: boolean;
}) => {
  /** 当前状态索引 */
  const [currentState, setCurrentState] = useState(0);

  /**
   * 状态切换逻辑
   */
  useEffect(() => {
    if (!loading) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentState((prev) => {
        if (prev === loadingStates.length - 1) {
          return loop ? 0 : prev;
        }
        return prev + 1;
      });
    }, duration);

    return () => clearInterval(interval);
  }, [loading, loadingStates.length, duration, loop]);

  /**
   * 重置状态逻辑
   */
  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        setCurrentState(0);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  const content = (
    <div className="relative flex flex-col gap-1 px-8 py-12 rounded-3xl border border-white/10 bg-black/20 shadow-2xl backdrop-blur-sm">
      {loadingStates.map((state, index) => (
        <LoaderItem
          key={state + index}
          text={state}
          active={index === currentState}
          completed={index < currentState}
        />
      ))}
      
      {/* 底部渐变装饰 */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent rounded-b-3xl pointer-events-none" />
    </div>
  );

  return (
    <AnimatePresence mode="wait">
      {loading && (
        isFullScreen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn(
              "fixed inset-0 z-[999] flex flex-col items-center justify-center bg-black/60 backdrop-blur-xl",
              className
            )}
          >
            {content}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={cn("w-full flex justify-center py-8", className)}
          >
            {content}
          </motion.div>
        )
      )}
    </AnimatePresence>
  );
};

// ===== 9. 页面初始化与事件绑定 =====

// ===== 10. TODO任务管理区域 =====

// ===== 11. 导出区域 =====
export default MultiStepLoader;
