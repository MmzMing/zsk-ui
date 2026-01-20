import { create } from "zustand";

export type ThemeMode = "light" | "dark" | "system";

export type LayoutMode = "vertical" | "horizontal" | "mixed" | "double" | "dock";

export type Language = "zh-CN" | "en-US";

export type FontSize = 12 | 14 | 16 | 18;

export type ContentPadding = 8 | 16 | 24;

export type PageTransition =
  | "none"
  | "fade"
  | "slide"
  | "scale"
  | "layer";

export type AppState = {
  themeMode: ThemeMode;
  layoutMode: LayoutMode;
  language: Language;
  primaryColor: string;
  boxBorderEnabled: boolean;
  boxShadowEnabled: boolean;
  multiTabEnabled: boolean;
  breadcrumbEnabled: boolean;
  sidebarAccordion: boolean;
  textSelectable: boolean;
  colorWeakMode: boolean;
  menuWidth: number;
  borderRadius: number;
  fontSize: FontSize;
  contentPadding: ContentPadding;
  pageTransition: PageTransition;
  clickSparkEnabled: boolean;
  showTopNav: boolean;
  isLoading: boolean;
};

export type AppActions = {
  setThemeMode: (mode: ThemeMode) => void;
  setLayoutMode: (mode: LayoutMode) => void;
  setLanguage: (language: Language) => void;
  setPrimaryColor: (color: string) => void;
  setBoxBorderEnabled: (value: boolean) => void;
  setBoxShadowEnabled: (value: boolean) => void;
  setMultiTabEnabled: (value: boolean) => void;
  setBreadcrumbEnabled: (value: boolean) => void;
  setSidebarAccordion: (value: boolean) => void;
  setTextSelectable: (value: boolean) => void;
  setColorWeakMode: (value: boolean) => void;
  setMenuWidth: (width: number) => void;
  setBorderRadius: (radius: number) => void;
  setFontSize: (size: FontSize) => void;
  setContentPadding: (padding: ContentPadding) => void;
  setPageTransition: (transition: PageTransition) => void;
  setClickSparkEnabled: (value: boolean) => void;
  setShowTopNav: (value: boolean) => void;
  setIsLoading: (value: boolean) => void;
  hydrateFromStorage: () => void;
  resetSettings: () => void;
};

export type AppStore = AppState & AppActions;

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

const storageKey = "zx-ui-app-settings";

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

const saveState = (state: AppState) => {
  window.localStorage.setItem(storageKey, JSON.stringify(state));
};

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
