// ===== 1. 依赖导入区域 =====
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// ===== 2. TODO待处理导入区域 =====

// ===== 3. 状态控制逻辑区域 =====
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

// ===== 4. 通用工具函数区域 =====
/**
 * 合并 Tailwind CSS 类名
 * @param inputs 类名输入
 * @returns 合并后的类名字符串
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ===== 5. 注释代码函数区 =====

// ===== 6. 错误处理函数区域 =====
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

// ===== 7. 数据处理函数区域 =====

// ===== 8. UI渲染逻辑区域 =====

// ===== 9. 页面初始化与事件绑定 =====
/**
 * 绑定全局控制台方法到调试处理函数
 */
export function bindDebugConsole() {
  // 仅在开发环境下绑定，防止生产环境意外泄漏
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

// ===== 10. TODO任务管理区域 =====

// ===== 11. 导出区域 =====
// 注意：常用工具函数已在各自区域通过 export 导出
