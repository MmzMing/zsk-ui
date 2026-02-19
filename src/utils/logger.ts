/**
 * 日志工具类
 * @module utils/logger
 * @description 统一的日志输出工具，开发环境输出日志，生产环境静默
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LoggerConfig {
  enabled: boolean;
  prefix: string;
}

const config: LoggerConfig = {
  enabled: import.meta.env.DEV,
  prefix: "[ZSK-UI]",
};

const getLogStyle = (level: LogLevel): string => {
  const styles: Record<LogLevel, string> = {
    debug: "color: #888; font-weight: bold;",
    info: "color: #537BF9; font-weight: bold;",
    warn: "color: #FF7416; font-weight: bold;",
    error: "color: #F31260; font-weight: bold;",
  };
  return styles[level];
};

const formatMessage = (level: LogLevel, message: string): string[] => {
  const timestamp = new Date().toISOString();
  return [
    `%c${config.prefix} [${timestamp}] [${level.toUpperCase()}]`,
    getLogStyle(level),
    message,
  ];
};

export const logDebug = (message: string, ...args: unknown[]): void => {
  if (!config.enabled) return;
  console.debug(...formatMessage("debug", message), ...args);
};

export const logInfo = (message: string, ...args: unknown[]): void => {
  if (!config.enabled) return;
  console.info(...formatMessage("info", message), ...args);
};

export const logWarn = (message: string, ...args: unknown[]): void => {
  if (!config.enabled) return;
  console.warn(...formatMessage("warn", message), ...args);
};

export const logError = (message: string, ...args: unknown[]): void => {
  if (!config.enabled) return;
  console.error(...formatMessage("error", message), ...args);
};

export const setLoggerEnabled = (enabled: boolean): void => {
  config.enabled = enabled;
};

export const logger = {
  debug: logDebug,
  info: logInfo,
  warn: logWarn,
  error: logError,
  setEnabled: setLoggerEnabled,
};

export default logger;
