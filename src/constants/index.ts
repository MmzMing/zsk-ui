/**
 * 全局常量定义
 * @module constants
 */

// ===== API 相关常量 =====

/** API 配置 */
export const API_CONFIG = {
  BASE_URL: import.meta.env.PROD ? "/api" : "http://localhost:8080/api",
  TIMEOUT: 10000,
  HEADERS: {
    "Content-Type": "application/json",
    "X-Client-Version": "1.0.0",
    "X-Device-Type": "Web",
  },
} as const;

/** 响应状态码 */
export const RESPONSE_CODE = {
  SUCCESS: 0,
  SUCCESS_ALT: 200,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
  TOKEN_EXPIRED: 10401,
} as const;

// ===== Cookie 键名常量 =====

/** Cookie 存储键名 */
export const COOKIE_KEYS = {
  TOKEN: "token",
  TOKEN_TYPE: "token_type",
  USER_INFO: "user_info",
  REMEMBER_ME: "remember_me",
  THEME: "theme",
  LANGUAGE: "language",
} as const;

// ===== 存储键名常量 =====

/** LocalStorage 存储键名 */
export const STORAGE_KEYS = {
  AUTH_SESSION: "auth_session",
  APP_SETTINGS: "zx-ui-app-settings",
  USER_PREFERENCES: "user_preferences",
} as const;

// ===== 主题相关常量 =====

/** 主题模式 */
export const THEME_MODE = {
  LIGHT: "light",
  DARK: "dark",
  SYSTEM: "system",
} as const;

/** 预设主题色 */
export const PRESET_COLORS = [
  "#537BF9",
  "#18A058",
  "#2080F0",
  "#F0A020",
  "#D03050",
  "#8A2BE2",
] as const;

// ===== 分页默认值 =====

/** 分页配置 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const;

// ===== 文件上传限制 =====

/** 文件上传配置 */
export const UPLOAD_CONFIG = {
  MAX_SIZE: 100 * 1024 * 1024,
  IMAGE_MAX_SIZE: 10 * 1024 * 1024,
  VIDEO_MAX_SIZE: 500 * 1024 * 1024,
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  ALLOWED_VIDEO_TYPES: ["video/mp4", "video/webm", "video/ogg"],
  ALLOWED_DOC_TYPES: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
} as const;

// ===== 正则表达式 =====

/** 常用正则表达式 */
export const REGEX = {
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  PHONE: /^1[3-9]\d{9}$/,
  PASSWORD: /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d@$!%*#?&]{8,20}$/,
  URL: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
  USERNAME: /^[a-zA-Z0-9_]{4,20}$/,
} as const;

// ===== 时间格式 =====

/** 日期时间格式 */
export const DATE_FORMAT = {
  DATE: "YYYY-MM-DD",
  TIME: "HH:mm:ss",
  DATETIME: "YYYY-MM-DD HH:mm:ss",
  DATETIME_SHORT: "YYYY-MM-DD HH:mm",
} as const;
