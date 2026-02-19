/**
 * 滚动 Sticky 效果 Hook
 * @module hooks/useScrollSticky
 * @description 提供滚动时动态计算 sticky 位置的功能
 */

import { useEffect, useRef, useCallback, useState, useLayoutEffect } from "react";

interface UseScrollStickyOptions {
  /** 基础顶部距离（像素），默认 96px (对应 tailwind top-24) */
  stickyTop?: number;
  /** 是否启用，默认 true */
  enabled?: boolean;
  /** 响应式断点，低于此宽度禁用 sticky 效果，默认 768 */
  breakpoint?: number;
}

interface UseScrollStickyReturn {
  /** sticky 元素引用 */
  stickyRef: React.RefObject<HTMLDivElement | null>;
  /** 容器元素引用 */
  containerRef: React.RefObject<HTMLDivElement | null>;
  /** 哨兵元素引用 */
  sentinelRef: React.RefObject<HTMLDivElement | null>;
  /** 当前计算的 top 值 */
  currentTop: number;
}

/**
 * 滚动 Sticky 效果 Hook
 * 用于实现左侧 sticky 区域在接近底部时自动上推的效果
 * @param options 配置选项
 * @returns 引用和状态
 */
export const useScrollSticky = (
  options: UseScrollStickyOptions = {}
): UseScrollStickyReturn => {
  const {
    stickyTop = 96,
    enabled = true,
    breakpoint = 768
  } = options;

  const stickyRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [currentTop, setCurrentTop] = useState(stickyTop);

  /**
   * 处理滚动逻辑
   */
  const handleScroll = useCallback(() => {
    if (!stickyRef.current || !sentinelRef.current || !enabled) {
      return;
    }

    /** 响应式检查：移动端禁用 sticky 效果 */
    if (window.innerWidth < breakpoint) {
      setCurrentTop(stickyTop);
      return;
    }

    /** sticky 元素的位置信息 */
    const stickyRect = stickyRef.current.getBoundingClientRect();
    /** 哨兵元素的位置信息 */
    const sentinelRect = sentinelRef.current.getBoundingClientRect();

    /** 最大允许的 top 值 */
    const maxTop = sentinelRect.top - stickyRect.height;
    /** 最终计算的 top 值 */
    const finalTop = Math.min(stickyTop, maxTop);

    setCurrentTop(finalTop);
  }, [stickyTop, enabled, breakpoint]);

  /**
   * 绑定滚动和窗口调整事件
   */
  useEffect(() => {
    if (!enabled) return;

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [handleScroll, enabled]);

  /**
   * 初始化时执行一次（使用 requestAnimationFrame 避免同步 setState 警告）
   */
  useLayoutEffect(() => {
    const rafId = requestAnimationFrame(handleScroll);
    return () => cancelAnimationFrame(rafId);
  }, [handleScroll]);

  return {
    stickyRef,
    containerRef,
    sentinelRef,
    currentTop
  };
};

/**
 * 简单的滚动位置 Hook
 * @returns 当前滚动位置
 */
export const useScrollPosition = (): { x: number; y: number } => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleScroll = () => {
      setPosition({
        x: window.scrollX,
        y: window.scrollY
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return position;
};

/**
 * 滚动方向检测 Hook
 * @returns 滚动方向 ('up' | 'down' | null)
 */
export const useScrollDirection = (): "up" | "down" | null => {
  const [direction, setDirection] = useState<"up" | "down" | null>(null);
  const lastScrollY = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const diff = currentScrollY - lastScrollY.current;

      if (Math.abs(diff) < 5) return;

      setDirection(diff > 0 ? "down" : "up");
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return direction;
};

export default useScrollSticky;
export type { UseScrollStickyOptions, UseScrollStickyReturn };
