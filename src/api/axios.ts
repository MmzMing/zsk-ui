// ===== 1. 依赖导入区域 =====
import axios, {
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { API_CONFIG } from "./config";
import type { ApiResponse } from "./types";
import Cookies from "js-cookie";
import { addToast } from "@heroui/react";
import { handleDebugOutput } from "@/lib/utils";

// ===== 2. TODO待处理导入区域 =====

// ===== 3. 状态控制逻辑区域 =====
/**
 * 获取是否启用 Mock 数据状态
 * @returns 是否启用 Mock
 */
const isMockEnabled = (): boolean => {
  return import.meta.env.DEV || import.meta.env.VITE_USE_MOCK === "true";
};

// ===== 4. 通用工具函数区域 =====
/**
 * 扩展错误类型，增加是否已处理标记
 */
interface HandledError extends Error {
  __isHandled?: boolean;
}

/**
 * 创建通用请求实例的工厂函数
 * @param baseURL 基础URL
 * @returns 请求实例对象
 */
function createRequestInstance(baseURL: string) {
  const instance = axios.create({
    baseURL,
    timeout: API_CONFIG.timeout,
    headers: API_CONFIG.headers,
    withCredentials: true, // 允许携带 Cookie
  });

  // 请求拦截器
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // 优先从 Cookie 获取 Token
      const token = Cookies.get("token");
      
      if (token) {
        config.headers.set("Authorization", `Bearer ${token}`);
      }

      const userId = Cookies.get("userId") || localStorage.getItem("userId");
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

  // 响应拦截器
  instance.interceptors.response.use(
    (response: AxiosResponse<ApiResponse>) => {
      const res = response.data;

      if (!res || typeof res.code !== "number") {
        return response;
      }

      if (res.code === 0 || res.code === 200) {
        return response;
      }

      if (res.code === 401) {
        if (!window.location.pathname.includes("/login")) {
          Cookies.remove("token");
          window.location.href = `/auth/login?redirect=${encodeURIComponent(
            window.location.pathname + window.location.search
          )}`;
        }
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

      if (status === 401) {
        if (!window.location.pathname.includes("/login")) {
          Cookies.remove("token");
          window.location.href = `/auth/login?redirect=${encodeURIComponent(
            window.location.pathname + window.location.search
          )}`;
        }
        message = "未授权，请登录";
      } else if (status === 403) {
        message = "无权访问";
      } else if (status === 404) {
        message = "请求的资源不存在";
      } else if (status === 500) {
        message = "服务器内部错误";
      }

      if (!config?.skipErrorHandler) {
        showGlobalError(message);
        if (error && typeof error === "object") {
          (error as HandledError).__isHandled = true;
        }
      }

      handleDebugOutput({
        debugLevel: "error",
        debugMessage: "请求异常:",
        debugDetail: message,
      });
      return Promise.reject(error);
    }
  );

  return {
    /**
     * GET 请求
     * @param url 请求地址
     * @param config 请求配置
     * @returns 响应数据 (注意：此处返回 data 部分)
     */
    get: <T = unknown>(url: string, config?: CustomRequestConfig): Promise<T> => {
      return instance
        .get<ApiResponse<T>>(url, config)
        .then((res) => res.data.data);
    },
    /**
     * POST 请求
     * @param url 请求地址
     * @param data 请求数据
     * @param config 请求配置
     * @returns 响应数据
     */
    post: <T = unknown>(
      url: string,
      data?: unknown,
      config?: CustomRequestConfig
    ): Promise<T> => {
      return instance
        .post<ApiResponse<T>>(url, data, config)
        .then((res) => res.data.data);
    },
    /**
     * PUT 请求
     * @param url 请求地址
     * @param data 请求数据
     * @param config 请求配置
     * @returns 响应数据
     */
    put: <T = unknown>(
      url: string,
      data?: unknown,
      config?: CustomRequestConfig
    ): Promise<T> => {
      return instance
        .put<ApiResponse<T>>(url, data, config)
        .then((res) => res.data.data);
    },
    /**
     * DELETE 请求
     * @param url 请求地址
     * @param config 请求配置
     * @returns 响应数据
     */
    delete: <T = unknown>(
      url: string,
      config?: CustomRequestConfig
    ): Promise<T> => {
      return instance
        .delete<ApiResponse<T>>(url, config)
        .then((res) => res.data.data);
    },
    instance,
  };
}

// ===== 5. 注释代码函数区 =====

// ===== 6. 错误处理函数区域 =====
/**
 * 全局错误提示配置接口
 */
interface CustomRequestConfig extends AxiosRequestConfig {
  skipErrorHandler?: boolean; // 是否跳过全局错误处理
  mockFallback?: boolean; // 是否启用 Mock 兜底
}

/**
 * API 请求配置选项
 */
export interface RequestOptions<T> {
  /** 核心请求函数 */
  requestFn: () => Promise<ApiResponse<T>>;
  /** Mock数据 (兜底用) */
  mockData?: T;
  /** 接口名称 (调试用) */
  apiName?: string;
  /** Loading状态回调 */
  setLoading?: (loading: boolean) => void;
  /** 自定义错误处理 */
  onError?: (error: unknown) => void;
}

/**
 * 全局错误提示函数
 * @param message 错误信息
 */
function showGlobalError(message: string) {
  addToast({
    title: message,
    color: "danger",
  });
}

/**
 * 统一请求处理函数 (替代 handleApiCall 和 handleRequestWithMock)
 * @param options 请求配置
 * @returns 响应对象 (ApiResponse)
 */
export async function handleRequest<T>(options: RequestOptions<T>): Promise<ApiResponse<T>> {
  const { requestFn, mockData, apiName, setLoading, onError } = options;
  const mockEnabled = isMockEnabled();

  if (setLoading) {
    setLoading(true);
  }

  try {
    const response = await requestFn();

    // 检查业务状态码
    if (response.code === 200) {
      return response;
    }

    // 业务错误 (非200) 尝试 Mock 兜底
    if (mockEnabled && mockData !== undefined) {
      handleDebugOutput({
        debugLevel: "warn",
        debugMessage: `[Mock兜底] ${apiName || "Unknown API"}`,
        debugDetail: { reason: "接口返回非200", response, mockData },
      });
      return {
        code: 200,
        data: mockData,
        msg: `[MOCK兜底] 接口 ${apiName} 异常，已使用 Mock`,
      };
    }

    return response;
  } catch (error) {
    // 自定义错误处理
    if (onError) {
      onError(error);
    }

    // 请求异常尝试 Mock 兜底
    if (mockEnabled && mockData !== undefined) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      handleDebugOutput({
        debugLevel: "error",
        debugMessage: `[Mock兜底] ${apiName || "Unknown API"}`,
        debugDetail: { reason: "接口请求异常", errorMsg, mockData },
      });
      return {
        code: 200,
        data: mockData,
        msg: `[MOCK兜底] 接口 ${apiName} 请求失败，已使用 Mock`,
      };
    }
    
    // 如果没有 Mock 兜底，抛出错误
    throw error;
  } finally {
    if (setLoading) {
      setLoading(false);
    }
  }
}

// ===== 7. 数据处理函数区域 =====
/**
 * 参数格式化工具：过滤 null, undefined, 空字符串
 * @param params 待格式化参数
 * @returns 格式化后的参数
 */
function formatParams(params: unknown): unknown {
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
}

// ===== 8. UI渲染逻辑区域 =====

// ===== 9. 页面初始化与事件绑定 =====

// ===== 10. TODO任务管理区域 =====

// ===== 11. 导出区域 =====
export const request = createRequestInstance(API_CONFIG.BASE_URL);
export default request;
