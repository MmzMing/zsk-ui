import axios, {
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig
} from "axios";
import { API_CONFIG } from "./config";
import type { ApiResponse } from "./types";
import Cookies from "js-cookie";
import { addToast } from "@heroui/react";

// 扩展 AxiosRequestConfig 以支持自定义配置
interface CustomRequestConfig extends AxiosRequestConfig {
  skipErrorHandler?: boolean; // 是否跳过全局错误处理
}

// 全局错误提示函数
const showGlobalError = (message: string) => {
  addToast({
    title: message,
    color: "danger"
  });
};

// 参数格式化工具：过滤 null, undefined, 空字符串
function formatParams(params: unknown): unknown {
  if (!params || typeof params !== "object") {
    return params;
  }

  if (Array.isArray(params)) {
    return params.map(item => formatParams(item));
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
        // 日期转换为 ISO 字符串或其他后端需要的格式
        result[key] = value.toISOString();
      } else {
        result[key] = value;
      }
    }
  }
  return result;
}

// 创建通用请求实例的工厂函数
function createRequestInstance(baseURL: string) {
  const instance = axios.create({
    baseURL,
    timeout: API_CONFIG.timeout,
    headers: API_CONFIG.headers
  });

  // 请求拦截器
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = Cookies.get("token") || localStorage.getItem("token");
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
          localStorage.removeItem("token");
          window.location.href = `/auth/login?redirect=${encodeURIComponent(
            window.location.pathname + window.location.search
          )}`;
        }
        const errorMsg = res.msg || "Unauthorized";
        const customConfig = response.config as CustomRequestConfig;
        if (!customConfig?.skipErrorHandler) {
          showGlobalError(errorMsg);
        }
        return Promise.reject(new Error(errorMsg));
      }

      const errorMsg = res.msg || "Unknown Error";
      const customConfig = response.config as CustomRequestConfig;
      if (!customConfig?.skipErrorHandler) {
        showGlobalError(errorMsg);
      }
      return Promise.reject(new Error(errorMsg));
    },
    (error) => {
      const config = error.config as CustomRequestConfig;
      const status = error.response?.status;
      let message = error.message;

      if (status === 401) {
        if (!window.location.pathname.includes("/login")) {
          Cookies.remove("token");
          localStorage.removeItem("token");
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
      }
      
      console.error("Request Error:", message);
      return Promise.reject(new Error(message));
    }
  );

  return {
    get: <T = unknown>(url: string, config?: CustomRequestConfig): Promise<T> => {
      return instance.get<ApiResponse<T>>(url, config).then(res => res.data.data);
    },
    post: <T = unknown>(url: string, data?: unknown, config?: CustomRequestConfig): Promise<T> => {
      return instance.post<ApiResponse<T>>(url, data, config).then(res => res.data.data);
    },
    put: <T = unknown>(url: string, data?: unknown, config?: CustomRequestConfig): Promise<T> => {
      return instance.put<ApiResponse<T>>(url, data, config).then(res => res.data.data);
    },
    delete: <T = unknown>(url: string, config?: CustomRequestConfig): Promise<T> => {
      return instance.delete<ApiResponse<T>>(url, config).then(res => res.data.data);
    },
    instance
  };
}

// 导出不同服务的请求实例
export const contentRequest = createRequestInstance(API_CONFIG.SERVICE_URLS.CONTENT);
export const userRequest = createRequestInstance(API_CONFIG.SERVICE_URLS.USER);
export const authRequest = createRequestInstance(API_CONFIG.SERVICE_URLS.AUTH);

// 为了兼容旧代码，默认导出 contentRequest 作为 request
export const request = contentRequest;
