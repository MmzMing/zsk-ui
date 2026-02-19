/**
 * 通用工具函数模块
 * @module utils
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// ===== 类名合并工具 =====

export const cn = (...inputs: ClassValue[]): string => {
  return twMerge(clsx(inputs));
};

// ===== 调试工具 =====

/**
 * 调试模式启用状态
 */
let isDebugEnabled = import.meta.env.DEV;

/**
 * 设置调试模式启用状态
 * @param value 是否启用
 */
export function setDebugEnabled(value: boolean) {
  if (value === undefined) {
    return;
  }
  isDebugEnabled = value;
}

/**
 * 获取当前调试模式是否启用
 * @returns 是否启用
 */
export function getIsDebugEnabled() {
  return isDebugEnabled;
}

/**
 * 原始控制台方法引用，防止递归调用导致栈溢出
 */
const originalConsole = {
  log: globalThis.console.log.bind(globalThis.console),
  warn: globalThis.console.warn.bind(globalThis.console),
  error: globalThis.console.error.bind(globalThis.console),
  info: (globalThis.console.info || globalThis.console.log).bind(globalThis.console),
};

/**
 * 统一处理调试输出
 * @param params 调试参数
 */
export function handleDebugOutput(params: {
  debugLevel: "log" | "warn" | "error" | "info";
  debugMessage?: unknown;
  debugDetail?: unknown;
  debugExtra?: unknown;
}) {
  if (!isDebugEnabled) {
    return;
  }
  if (!params) {
    return;
  }
  const { debugLevel, debugMessage, debugDetail, debugExtra } = params;
  const outputItems = [debugMessage, debugDetail, debugExtra].filter(
    (item) => item !== undefined
  );

  if (debugLevel === "warn") {
    originalConsole.warn(...outputItems);
    return;
  }
  if (debugLevel === "error") {
    originalConsole.error(...outputItems);
    return;
  }
  if (debugLevel === "info") {
    originalConsole.info(...outputItems);
    return;
  }
  originalConsole.log(...outputItems);
}

/**
 * 显示调试弹窗
 * @param params 弹窗参数
 */
export function showDebugAlert(params: { alertMessage?: string }) {
  if (!isDebugEnabled) {
    return;
  }
  if (!params || !params.alertMessage) {
    return;
  }
  alert(params.alertMessage);
}

/**
 * 绑定全局控制台方法到调试处理函数
 */
export function bindDebugConsole() {
  if (!import.meta.env.DEV) return;

  console.log = (msg, detail, extra) =>
    handleDebugOutput({
      debugLevel: "log",
      debugMessage: msg,
      debugDetail: detail,
      debugExtra: extra,
    });
  console.warn = (msg, detail, extra) =>
    handleDebugOutput({
      debugLevel: "warn",
      debugMessage: msg,
      debugDetail: detail,
      debugExtra: extra,
    });
  console.error = (msg, detail, extra) =>
    handleDebugOutput({
      debugLevel: "error",
      debugMessage: msg,
      debugDetail: detail,
      debugExtra: extra,
    });
}

// ===== 类型判断工具 =====

export const isObject = (value: unknown): value is Record<string, unknown> => {
  return value !== null && typeof value === "object" && !Array.isArray(value);
};

export const isArray = (value: unknown): value is unknown[] => {
  return Array.isArray(value);
};

export const isFunction = (
  value: unknown
): value is (...args: unknown[]) => unknown => {
  return typeof value === "function";
};

export const isString = (value: unknown): value is string => {
  return typeof value === "string";
};

export const isNumber = (value: unknown): value is number => {
  return typeof value === "number" && !isNaN(value);
};

export const isBoolean = (value: unknown): value is boolean => {
  return typeof value === "boolean";
};

export const isEmpty = (value: unknown): boolean => {
  if (value === null || value === undefined) return true;
  if (isString(value)) return value.trim().length === 0;
  if (isArray(value)) return value.length === 0;
  if (isObject(value)) return Object.keys(value).length === 0;
  return false;
};

// ===== 函数增强工具 =====

export const debounce = <T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), wait);
  };
};

export const throttle = <T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle = false;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// ===== 格式化工具 =====

export const formatNumber = (num: number, decimals: number = 2): string => {
  if (num >= 10000) {
    return (num / 10000).toFixed(decimals) + "w";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(decimals) + "k";
  }
  return num.toString();
};

export const formatDate = (
  date: string | Date,
  format: string = "YYYY-MM-DD"
): string => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const seconds = String(d.getSeconds()).padStart(2, "0");

  return format
    .replace("YYYY", String(year))
    .replace("MM", month)
    .replace("DD", day)
    .replace("HH", hours)
    .replace("mm", minutes)
    .replace("ss", seconds);
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export const formatDuration = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${m}:${String(s).padStart(2, "0")}`;
};

// ===== 异步工具 =====

export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// ===== UUID生成 =====

export const generateUUID = (): string => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// ===== 字符串工具 =====

export const truncate = (str: string, length: number): string => {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
};

export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const camelCase = (str: string): string => {
  return str
    .replace(/[-_\s](.)/g, (_, c) => c.toUpperCase())
    .replace(/^(.)/, (_, c) => c.toLowerCase());
};

export const kebabCase = (str: string): string => {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();
};

// ===== 对象工具 =====

export const pick = <T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> => {
  const result = {} as Pick<T, K>;
  keys.forEach((key) => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
};

export const omit = <T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> => {
  const result = { ...obj };
  keys.forEach((key) => {
    delete result[key];
  });
  return result;
};

export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(deepClone) as T;
  const cloned = {} as T;
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  return cloned;
};

// ===== 数组工具 =====

export const unique = <T>(arr: T[]): T[] => {
  return [...new Set(arr)];
};

export const groupBy = <T, K extends string | number>(
  arr: T[],
  key: (item: T) => K
): Record<K, T[]> => {
  return arr.reduce(
    (result, item) => {
      const groupKey = key(item);
      if (!result[groupKey]) {
        result[groupKey] = [];
      }
      result[groupKey].push(item);
      return result;
    },
    {} as Record<K, T[]>
  );
};

export const chunk = <T>(arr: T[], size: number): T[][] => {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
};

// ===== URL工具 =====

export const parseQuery = (url: string): Record<string, string> => {
  const query: Record<string, string> = {};
  const searchParams = new URL(url, window.location.origin).searchParams;
  searchParams.forEach((value, key) => {
    query[key] = value;
  });
  return query;
};

export const buildQuery = (params: Record<string, unknown>): string => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, String(value));
    }
  });
  return searchParams.toString();
};

// ===== 导出所有工具 =====

export * from "./logger";
export * from "./cookie";
export * from "./crypto";
export * from "./authValidators";
export * from "./rsaEncrypt";
export * from "./textUtils";
export * from "./videoUtils";
export * from "./dateUtils";
export * from "./formatUtils";
export * from "./errorUtils";
