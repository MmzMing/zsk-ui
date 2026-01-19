import { useEffect, useLayoutEffect } from "react";
import {
  ThemeMode,
  useAppStore
} from "../store";

const getSystemMode = (): ThemeMode => {
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
};

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
