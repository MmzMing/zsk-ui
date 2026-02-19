// ===== 1. 依赖导入区域 =====
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/utils";

// ===== 2. TODO待处理导入区域 =====

// ===== 3. 状态控制逻辑区域 =====

// ===== 4. 通用工具函数区域 =====

// ===== 5. 注释代码函数区 =====

// ===== 6. 错误处理函数区域 =====

// ===== 7. 数据处理函数区域 =====

// ===== 8. UI渲染逻辑区域 =====
/**
 * 彩色文字组件
 * 实现文字逐字变色、缩放及滤镜动画效果
 */
export default function ColourfulText({
  text,
  className,
}: {
  /** 显示文本 */
  text: string;
  /** 自定义类名 */
  className?: string;
}) {
  /** 颜色配置库 */
  const colors = [
    "rgb(131, 110, 249)",
    "rgb(45, 212, 191)",
    "rgb(34, 197, 94)",
    "rgb(245, 158, 11)",
    "rgb(239, 68, 68)",
    "rgb(217, 70, 239)",
    "rgb(99, 102, 241)",
    "rgb(14, 165, 233)",
  ];

  /** 当前颜色索引状态 */
  const [colorIndex, setColorIndex] = useState(0);

  /**
   * 定时更新颜色索引
   */
  useEffect(() => {
    const interval = setInterval(() => {
      setColorIndex((prev) => (prev + 1) % colors.length);
    }, 5000); // 每 5 秒切换一次整体基调
    return () => clearInterval(interval);
  }, [colors.length]);

  return (
    <span className={cn("inline-block", className)}>
      {text.split("").map((char, index) => (
        <motion.span
          key={`${char}-${index}-${colorIndex}`}
          initial={{
            y: 0,
          }}
          animate={{
            color: colors[(colorIndex + index) % colors.length],
            y: [0, -3, 0],
            scale: [1, 1.01, 1],
            filter: ["blur(0px)", "blur(2px)", "blur(0px)"],
            opacity: [1, 0.8, 1],
          }}
          transition={{
            duration: 0.5,
            delay: index * 0.05,
          }}
          className="inline-block whitespace-pre"
        >
          {char}
        </motion.span>
      ))}
    </span>
  );
}

// ===== 9. 页面初始化与事件绑定 =====

// ===== 10. TODO任务管理区域 =====

// ===== 11. 导出区域 =====
