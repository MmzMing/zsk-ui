/**
 * 应用全局状态管理
 * 管理主题、布局、语言等应用级别的配置状态
 *
 * @module store/modules/appStore
 * @author wuhuaming
 * @date 2026-02-18
 * @version 1.0
 */

import { create } from "zustand";

/** 主题模式类型（light-亮色, dark-暗色, system-跟随系统） */
export type ThemeMode = "light" | "dark" | "system";

/** 布局模式类型（vertical-垂直, horizontal-水平, mixed-混合, double-双栏, dock-停靠） */
export type LayoutMode = "vertical" | "horizontal" | "mixed" | "double" | "dock";

/** 语言类型（zh-CN-简体中文, en-US-英文） */
export type Language = "zh-CN" | "en-US";

/** 字体大小类型（12/14/16/18像素） */
export type FontSize = 12 | 14 | 16 | 18;

/** 内容内边距类型（8/16/24像素） */
export type ContentPadding = 8 | 16 | 24;

/** 页面过渡动画类型（none-无, fade-淡入淡出, slide-滑动, scale-缩放, layer-层叠） */
export type PageTransition =
  | "none"
  | "fade"
  | "slide"
  | "scale"
  | "layer";

/**
 * 应用状态接口
 * 定义应用级别的所有状态属性
 */
export type AppState = {
  /** 主题模式 */
  themeMode: ThemeMode;
  /** 布局模式 */
  layoutMode: LayoutMode;
  /** 当前语言 */
  language: Language;
  /** 主题色（十六进制颜色值） */
  primaryColor: string;
  /** 是否启用边框 */
  boxBorderEnabled: boolean;
  /** 是否启用阴影 */
  boxShadowEnabled: boolean;
  /** 是否启用多标签页 */
  multiTabEnabled: boolean;
  /** 是否启用面包屑导航 */
  breadcrumbEnabled: boolean;
  /** 侧边栏是否手风琴模式 */
  sidebarAccordion: boolean;
  /** 文本是否可选中 */
  textSelectable: boolean;
  /** 是否启用色弱模式 */
  colorWeakMode: boolean;
  /** 菜单宽度（像素） */
  menuWidth: number;
  /** 圆角大小（像素） */
  borderRadius: number;
  /** 字体大小 */
  fontSize: FontSize;
  /** 内容区域内边距 */
  contentPadding: ContentPadding;
  /** 页面过渡动画类型 */
  pageTransition: PageTransition;
  /** 是否启用点击火花效果 */
  clickSparkEnabled: boolean;
  /** 是否显示顶部导航 */
  showTopNav: boolean;
  /** 全局加载状态 */
  isLoading: boolean;
};

/**
 * 应用操作接口
 * 定义状态修改的所有操作方法
 */
export type AppActions = {
  /** 设置主题模式 */
  setThemeMode: (mode: ThemeMode) => void;
  /** 设置布局模式 */
  setLayoutMode: (mode: LayoutMode) => void;
  /** 设置语言 */
  setLanguage: (language: Language) => void;
  /** 设置主题色 */
  setPrimaryColor: (color: string) => void;
  /** 设置是否启用边框 */
  setBoxBorderEnabled: (value: boolean) => void;
  /** 设置是否启用阴影 */
  setBoxShadowEnabled: (value: boolean) => void;
  /** 设置是否启用多标签页 */
  setMultiTabEnabled: (value: boolean) => void;
  /** 设置是否启用面包屑导航 */
  setBreadcrumbEnabled: (value: boolean) => void;
  /** 设置侧边栏是否手风琴模式 */
  setSidebarAccordion: (value: boolean) => void;
  /** 设置文本是否可选中 */
  setTextSelectable: (value: boolean) => void;
  /** 设置是否启用色弱模式 */
  setColorWeakMode: (value: boolean) => void;
  /** 设置菜单宽度 */
  setMenuWidth: (width: number) => void;
  /** 设置圆角大小 */
  setBorderRadius: (radius: number) => void;
  /** 设置字体大小 */
  setFontSize: (size: FontSize) => void;
  /** 设置内容区域内边距 */
  setContentPadding: (padding: ContentPadding) => void;
  /** 设置页面过渡动画类型 */
  setPageTransition: (transition: PageTransition) => void;
  /** 设置是否启用点击火花效果 */
  setClickSparkEnabled: (value: boolean) => void;
  /** 设置是否显示顶部导航 */
  setShowTopNav: (value: boolean) => void;
  /** 设置全局加载状态 */
  setIsLoading: (value: boolean) => void;
  /** 从本地存储恢复状态 */
  hydrateFromStorage: () => void;
  /** 重置所有设置为默认值 */
  resetSettings: () => void;
};

/** 应用Store类型（状态与操作的联合） */
export type AppStore = AppState & AppActions;

/** 默认应用状态 */
const defaultState: AppState = {
  themeMode: "system",
  layoutMode: "vertical",
  language: "zh-CN",
  primaryColor: "#537BF9",
  boxBorderEnabled: false,
  boxShadowEnabled: false,
  multiTabEnabled: false,
  breadcrumbEnabled: false,
  sidebarAccordion: true,
  textSelectable: false,
  colorWeakMode: false,
  menuWidth: 220,
  borderRadius: 12,
  fontSize: 14,
  contentPadding: 16,
  pageTransition: "fade",
  clickSparkEnabled: true,
  showTopNav: true,
  isLoading: false
};

/** 本地存储键名 */
const storageKey = "zx-ui-app-settings";

/**
 * 从本地存储加载状态
 * @returns 解析后的状态对象，解析失败返回null
 */
const loadState = (): Partial<AppState> | null => {
  const raw = window.localStorage.getItem(storageKey);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as Partial<AppState>;
  } catch {
    window.localStorage.removeItem(storageKey);
    return null;
  }
};

/**
 * 保存状态到本地存储
 * @param state 需要保存的状态对象
 */
const saveState = (state: AppState) => {
  window.localStorage.setItem(storageKey, JSON.stringify(state));
};

/**
 * 应用全局状态 Store
 * 使用 Zustand 管理应用级别的配置状态，支持本地存储持久化
 *
 * @example
 * const { themeMode, setThemeMode, primaryColor, setPrimaryColor } = useAppStore();
 * setThemeMode('dark');
 */
export const useAppStore = create<AppStore>((set, get) => ({
  ...defaultState,
  setThemeMode: mode => {
    set({ themeMode: mode });
    saveState(get());
  },
  setLayoutMode: mode => {
    set({ layoutMode: mode });
    saveState(get());
  },
  setLanguage: language => {
    set({ language });
    saveState(get());
  },
  setPrimaryColor: color => {
    set({ primaryColor: color });
    saveState(get());
  },
  setBoxBorderEnabled: value => {
    set({ boxBorderEnabled: value });
    saveState(get());
  },
  setBoxShadowEnabled: value => {
    set({ boxShadowEnabled: value });
    saveState(get());
  },
  setMultiTabEnabled: value => {
    set({ multiTabEnabled: value });
    saveState(get());
  },
  setBreadcrumbEnabled: value => {
    set({ breadcrumbEnabled: value });
    saveState(get());
  },
  setSidebarAccordion: value => {
    set({ sidebarAccordion: value });
    saveState(get());
  },
  setTextSelectable: value => {
    set({ textSelectable: value });
    saveState(get());
  },
  setColorWeakMode: value => {
    set({ colorWeakMode: value });
    saveState(get());
  },
  setMenuWidth: width => {
    set({ menuWidth: width });
    saveState(get());
  },
  setBorderRadius: radius => {
    set({ borderRadius: radius });
    saveState(get());
  },
  setFontSize: size => {
    set({ fontSize: size });
    saveState(get());
  },
  setContentPadding: padding => {
    set({ contentPadding: padding });
    saveState(get());
  },
  setPageTransition: transition => {
    set({ pageTransition: transition });
    saveState(get());
  },
  setClickSparkEnabled: value => {
    set({ clickSparkEnabled: value });
    saveState(get());
  },
  setShowTopNav: value => {
    set({ showTopNav: value });
    saveState(get());
  },
  setIsLoading: (value: boolean) => {
    set({ isLoading: value });
  },
  hydrateFromStorage: () => {
    const persisted = loadState();
    if (persisted) {
      set({ ...defaultState, ...persisted });
    }
  },
  resetSettings: () => {
    set(defaultState);
    saveState(defaultState);
  }
}));
