/**
 * 统一请求封装模块
 * @module api/request
 * @description 基于 Axios 封装的 HTTP 请求客户端，提供统一的请求/响应拦截、错误处理和认证管理
 */

import axios, {
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { addToast } from "@heroui/react";
import { cookieUtils } from "@/utils/cookie";
import { logger } from "@/utils/logger";
import { API_CONFIG, RESPONSE_CODE } from "@/constants";
import type { ApiResponse } from "./types";

/**
 * 扩展的请求配置接口
 * @description 在 Axios 默认配置基础上增加自定义选项
 */
interface CustomRequestConfig extends AxiosRequestConfig {
  /** 跳过全局错误处理器，用于需要自行处理错误的场景 */
  skipErrorHandler?: boolean;
}

/**
 * 已处理的错误类型
 * @description 标记错误是否已被全局处理器处理，避免重复处理
 */
interface HandledError extends Error {
  __isHandled?: boolean;
}

/**
 * 格式化请求参数
 * @description 递归过滤空值参数，避免向后端传递 null/undefined/空字符串
 * @param params - 待格式化的参数对象
 * @returns 格式化后的参数
 */
const formatParams = (params: unknown): unknown => {
  if (!params || typeof params !== "object") {
    return params;
  }

  if (Array.isArray(params)) {
    return params.map((item) => formatParams(item));
  }

  if (params instanceof FormData) {
    return params;
  }

  const result: Record<string, unknown> = {};
  const record = params as Record<string, unknown>;

  for (const key in record) {
    const value = record[key];
    if (value !== null && value !== undefined && value !== "") {
      if (typeof value === "object" && !(value instanceof Date)) {
        result[key] = formatParams(value);
      } else if (value instanceof Date) {
        result[key] = value.toISOString();
      } else {
        result[key] = value;
      }
    }
  }
  return result;
};

/**
 * 显示全局错误提示
 * @description 使用 HeroUI Toast 组件展示错误信息，统一用户错误感知体验
 * @param message - 错误提示信息
 */
const showGlobalError = (message: string): void => {
  addToast({
    title: message,
    color: "danger",
  });
};

/**
 * 处理未授权状态
 * @description 清除认证信息并重定向到登录页，保留当前路径用于登录后跳回
 */
const handleUnauthorized = (): void => {
  if (!window.location.pathname.includes("/login")) {
    cookieUtils.clearAuth();
    window.location.href = `/auth/login?redirect=${encodeURIComponent(
      window.location.pathname + window.location.search
    )}`;
  }
};

/**
 * 创建 Axios 实例
 * @description 配置基础参数并注册请求/响应拦截器，实现认证注入和统一错误处理
 * @returns 配置完成的 Axios 实例
 */
const createAxiosInstance = () => {
  const instance = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    headers: API_CONFIG.HEADERS,
    withCredentials: true,
  });

  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = cookieUtils.getToken();
      if (token) {
        config.headers.set("Authorization", `Bearer ${token}`);
      }

      const userId = localStorage.getItem("userId");
      if (userId) {
        config.headers.set("X-User-ID", userId);
      }

      if (config.params) {
        config.params = formatParams(config.params);
      }
      if (config.data && !(config.data instanceof FormData)) {
        config.data = formatParams(config.data);
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  instance.interceptors.response.use(
    (response: AxiosResponse<ApiResponse>) => {
      const res = response.data;

      if (!res || typeof res.code !== "number") {
        return response;
      }

      if (res.code === RESPONSE_CODE.SUCCESS || res.code === RESPONSE_CODE.SUCCESS_ALT) {
        return response;
      }

      if (res.code === RESPONSE_CODE.UNAUTHORIZED) {
        handleUnauthorized();
        const errorMsg = res.msg || "未授权，请重新登录";
        const customConfig = response.config as CustomRequestConfig;
        const error = new Error(errorMsg);
        if (!customConfig?.skipErrorHandler) {
          showGlobalError(errorMsg);
          (error as HandledError).__isHandled = true;
        }
        return Promise.reject(error);
      }

      const errorMsg = res.msg || "未知错误";
      const customConfig = response.config as CustomRequestConfig;
      const error = new Error(errorMsg);
      if (!customConfig?.skipErrorHandler) {
        showGlobalError(errorMsg);
        (error as HandledError).__isHandled = true;
      }
      return Promise.reject(error);
    },
    (error) => {
      const config = error.config as CustomRequestConfig;
      const status = error.response?.status;
      let message = error.message;

      if (message === "Network Error") {
        message = "网络错误，请检查网络连接";
      } else if (message.includes("timeout")) {
        message = "请求超时，请稍后重试";
      }

      if (status === RESPONSE_CODE.UNAUTHORIZED) {
        handleUnauthorized();
        message = "未授权，请登录";
      } else if (status === RESPONSE_CODE.FORBIDDEN) {
        message = "无权访问";
      } else if (status === RESPONSE_CODE.NOT_FOUND) {
        message = "请求的资源不存在";
      } else if (status === RESPONSE_CODE.SERVER_ERROR) {
        message = "服务器内部错误";
      }

      if (!config?.skipErrorHandler) {
        showGlobalError(message);
        if (error && typeof error === "object") {
          (error as HandledError).__isHandled = true;
        }
      }

      logger.error("请求异常:", message);
      return Promise.reject(error);
    }
  );

  return instance;
};

const axiosInstance = createAxiosInstance();

/**
 * 统一请求方法集合
 * @description 提供类型安全的 HTTP 请求方法，自动提取响应数据
 */
export const request = {
  /**
   * 发送 GET 请求
   * @template T - 响应数据类型
   * @param url - 请求地址
   * @param config - 请求配置
   * @returns Promise 包含响应数据
   */
  get: <T = unknown>(url: string, config?: CustomRequestConfig): Promise<T> => {
    return axiosInstance
      .get<ApiResponse<T>>(url, config)
      .then((res) => res.data.data);
  },

  /**
   * 发送 POST 请求
   * @template T - 响应数据类型
   * @param url - 请求地址
   * @param data - 请求体数据
   * @param config - 请求配置
   * @returns Promise 包含响应数据
   */
  post: <T = unknown>(
    url: string,
    data?: unknown,
    config?: CustomRequestConfig
  ): Promise<T> => {
    return axiosInstance
      .post<ApiResponse<T>>(url, data, config)
      .then((res) => res.data.data);
  },

  /**
   * 发送 PUT 请求
   * @template T - 响应数据类型
   * @param url - 请求地址
   * @param data - 请求体数据
   * @param config - 请求配置
   * @returns Promise 包含响应数据
   */
  put: <T = unknown>(
    url: string,
    data?: unknown,
    config?: CustomRequestConfig
  ): Promise<T> => {
    return axiosInstance
      .put<ApiResponse<T>>(url, data, config)
      .then((res) => res.data.data);
  },

  /**
   * 发送 DELETE 请求
   * @template T - 响应数据类型
   * @param url - 请求地址
   * @param config - 请求配置
   * @returns Promise 包含响应数据
   */
  delete: <T = unknown>(url: string, config?: CustomRequestConfig): Promise<T> => {
    return axiosInstance
      .delete<ApiResponse<T>>(url, config)
      .then((res) => res.data.data);
  },

  /** 原始 Axios 实例，用于特殊场景 */
  instance: axiosInstance,
};

/**
 * 请求处理选项
 * @template T - 响应数据类型
 */
export interface RequestOptions<T> {
  /** 实际执行的请求函数 */
  requestFn: () => Promise<ApiResponse<T>>;
  /** API 名称，用于日志标识 */
  apiName?: string;
  /** 加载状态设置函数 */
  setLoading?: (loading: boolean) => void;
  /** 自定义错误处理函数 */
  onError?: (error: unknown) => void;
}

/**
 * 统一请求处理函数
 * @description 封装请求生命周期管理，包括加载状态、错误处理和日志记录
 * @template T - 响应数据类型
 * @param options - 请求处理选项
 * @returns Promise 包含完整 API 响应
 *
 * @example
 * ```typescript
 * const result = await handleRequest({
 *   requestFn: () => request.instance.get('/api/users'),
 *   apiName: '获取用户列表',
 *   setLoading: setIsLoading,
 *   onError: (err) => console.error(err)
 * });
 * ```
 */
export async function handleRequest<T>(
  options: RequestOptions<T>
): Promise<ApiResponse<T>> {
  const { requestFn, apiName, setLoading, onError } = options;

  if (setLoading) {
    setLoading(true);
  }

  try {
    const response = await requestFn();

    if (response.code === RESPONSE_CODE.SUCCESS || response.code === RESPONSE_CODE.SUCCESS_ALT) {
      return response;
    }

    logger.warn(`[${apiName || "API"}] 业务错误:`, response.msg);
    return response;
  } catch (error) {
    if (onError) {
      onError(error);
    }

    logger.error(`[${apiName || "API"}] 请求异常:`, error);
    throw error;
  } finally {
    if (setLoading) {
      setLoading(false);
    }
  }
}

export default request;
