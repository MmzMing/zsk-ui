"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, useScroll, useSpring } from "framer-motion";
import { cn } from "@/utils";

/**
 * 滚动进度条组件
 * @param className 自定义类名
 * @param vertical 是否为垂直模式 (默认为 false，即水平模式)
 */
interface ScrollProgressProps {
  className?: string;
  vertical?: boolean;
}

export const ScrollProgress: React.FC<ScrollProgressProps> = ({
  className,
  vertical = false,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  // 获取页面滚动进度 (0 到 1)
  const { scrollYProgress } = useScroll();
  
  // 使用弹簧动画使进度变化更平滑
  const scale = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const content = (
    <motion.div
      className={cn(
        "fixed z-[9999] origin-top rounded-r-full",
        // 七彩渐变背景：红、橙、黄、绿、蓝、靛、紫
        "bg-gradient-to-b from-[#ff0000] via-[#ff7f00] via-[#ffff00] via-[#00ff00] via-[#0000ff] via-[#4b0082] to-[#8b00ff]",
        // 柔和的阴影效果
        "shadow-[0_0_15px_rgba(255,255,255,0.3)]",
        vertical 
          ? "left-0 top-0 bottom-0 w-[4px]" 
          : "left-0 top-0 right-0 h-[4px] bg-gradient-to-r origin-left rounded-b-full",
        className
      )}
      style={{
        scaleY: vertical ? scale : 1,
        scaleX: vertical ? 1 : scale,
      }}
    />
  );

  if (!mounted) return null;

  return createPortal(content, document.body);
};
