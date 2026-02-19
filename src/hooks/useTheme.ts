/**
 * 主题管理 Hook
 * 提供主题模式的切换和CSS变量的动态设置功能
 *
 * @module hooks/useTheme
 * @author wuhuaming
 * @date 2026-02-18
 * @version 1.0
 */

import { useEffect, useLayoutEffect } from "react";
import {
  ThemeMode,
  useAppStore
} from "../store";

/**
 * 获取系统主题模式
 * 通过媒体查询检测系统是否为深色模式
 *
 * @returns 系统主题模式（'dark' 或 'light'）
 */
const getSystemMode = (): ThemeMode => {
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
};

/**
 * 主题管理 Hook
 * 根据store中的主题配置，动态设置CSS变量和DOM属性
 *
 * 功能包括：
 * - 主题模式切换（亮色/暗色/跟随系统）
 * - 主色调设置
 * - 色弱模式
 * - 字体大小
 * - 圆角大小
 * - 内容内边距
 * - 文本是否可选
 *
 * @example
 * // 在组件中使用
 * useTheme();
 * // 主题会自动根据store中的配置应用到DOM
 */
export const useTheme = () => {
  const {
    themeMode,
    primaryColor,
    colorWeakMode,
    fontSize,
    borderRadius,
    contentPadding,
    textSelectable,
    hydrateFromStorage
  } = useAppStore();

  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  useLayoutEffect(() => {
    const root = document.documentElement;
    const mode = themeMode === "system" ? getSystemMode() : themeMode;
    root.setAttribute("data-theme", mode);
    if (mode === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    root.style.setProperty("--primary-color", primaryColor);
    root.style.setProperty("--color-primary", primaryColor);
    root.style.setProperty("--color-primary-foreground", "#ffffff");
    root.style.setProperty("--font-size-base", `${fontSize}px`);
    root.style.setProperty("--radius-base", `${borderRadius}px`);
    root.style.setProperty("--content-padding", `${contentPadding}px`);
    root.style.setProperty(
      "--color-weak-filter",
      colorWeakMode ? "grayscale(0.3)" : "none"
    );
    root.style.setProperty(
      "--text-select",
      textSelectable ? "text" : "none"
    );
  }, [
    themeMode,
    primaryColor,
    colorWeakMode,
    fontSize,
    borderRadius,
    contentPadding,
    textSelectable
  ]);
};
