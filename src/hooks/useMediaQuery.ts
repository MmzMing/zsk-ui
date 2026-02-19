/**
 * 媒体查询 Hook
 * @module hooks/useMediaQuery
 * @description 提供响应式媒体查询功能
 */

import { useState, useEffect } from "react";

/** 默认断点配置 */
const DEFAULT_BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536
} as const;

type Breakpoint = keyof typeof DEFAULT_BREAKPOINTS;

interface UseMediaQueryOptions {
  /** 是否在服务端渲染时默认返回 false */
  defaultState?: boolean;
}

type UseMediaQueryReturn = boolean;

/**
 * 媒体查询 Hook
 * @param query 媒体查询字符串
 * @param options 配置选项
 * @returns 是否匹配媒体查询
 */
export const useMediaQuery = (
  query: string,
  options: UseMediaQueryOptions = {}
): boolean => {
  const { defaultState = false } = options;
  
  const [matches, setMatches] = useState<boolean>(defaultState);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia(query);

    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    const rafId = requestAnimationFrame(() => {
      setMatches(mediaQuery.matches);
    });

    mediaQuery.addEventListener("change", handler);
    return () => {
      cancelAnimationFrame(rafId);
      mediaQuery.removeEventListener("change", handler);
    };
  }, [query]);

  return matches;
};

/**
 * 移动端检测 Hook
 * @param breakpoint 断点值，默认 768px
 * @returns 是否为移动端
 */
export const useIsMobile = (breakpoint: number = 768): boolean => {
  return useMediaQuery(`(max-width: ${breakpoint - 1}px)`);
};

/**
 * 桌面端检测 Hook
 * @param breakpoint 断点值，默认 768px
 * @returns 是否为桌面端
 */
export const useIsDesktop = (breakpoint: number = 768): boolean => {
  return useMediaQuery(`(min-width: ${breakpoint}px)`);
};

/**
 * 断点检测 Hook
 * @param breakpoint 断点名称
 * @returns 是否匹配断点
 */
export const useBreakpoint = (breakpoint: Breakpoint): boolean => {
  const width = DEFAULT_BREAKPOINTS[breakpoint];
  return useMediaQuery(`(min-width: ${width}px)`);
};

/**
 * 屏幕尺寸 Hook
 * @returns 当前屏幕宽度和高度
 */
export const useScreenSize = (): { width: number; height: number } => {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateSize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return size;
};

/**
 * 响应式值选择 Hook
 * @param options 响应式配置
 * @returns 当前断点对应的值
 */
export const useResponsive = <T>(options: {
  mobile: T;
  desktop: T;
  breakpoint?: number;
}): T => {
  const { mobile, desktop, breakpoint = 768 } = options;
  const isDesktop = useIsDesktop(breakpoint);
  return isDesktop ? desktop : mobile;
};

export default useMediaQuery;
export type { UseMediaQueryOptions, UseMediaQueryReturn };
