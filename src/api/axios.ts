import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig
} from "axios";
import { API_CONFIG } from "./config";
import type { ApiResponse } from "./types";
import Cookies from "js-cookie";

// 扩展 AxiosRequestConfig 以支持自定义配置
interface CustomRequestConfig extends AxiosRequestConfig {
  skipErrorHandler?: boolean; // 是否跳过全局错误处理
}

// 创建 axios 实例
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: API_CONFIG.headers
});

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

// 请求拦截器
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 1. 注入 Token
    // 假设 Token 存储在 Cookie 或 localStorage 中，key 为 "token"
    const token = Cookies.get("token") || localStorage.getItem("token");
    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }

    // 2. 注入用户信息 (如果需要)
    const userId = Cookies.get("userId") || localStorage.getItem("userId");
    if (userId) {
      config.headers.set("X-User-ID", userId);
    }
    
    // 3. 参数格式化 (针对 params 和 data)
    if (config.params) {
      config.params = formatParams(config.params);
    }
    if (config.data && !(config.data instanceof FormData)) {
      config.data = formatParams(config.data);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
axiosInstance.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const res = response.data;

    // 1. 校验响应格式
    if (!res || typeof res.code !== "number") {
      // 这里的处理取决于后端是否总是返回 { code, msg, data }
      // 如果是非标准响应 (如文件流)，直接返回
      return response;
    }

    // 2. 处理业务状态码
    if (res.code === 0 || res.code === 200) {
      // 成功，直接返回 response，由 request 方法解包
      return response;
    }

    // 3. 处理特定错误码
    if (res.code === 401) {
      // 未授权，跳转登录
      // 避免循环重定向，可加判断
      if (!window.location.pathname.includes("/login")) {
        // 清除 Token
        Cookies.remove("token");
        localStorage.removeItem("token");
        // 跳转
        window.location.href = `/auth/login?redirect=${encodeURIComponent(
          window.location.pathname + window.location.search
        )}`;
      }
      return Promise.reject(new Error(res.msg || "Unauthorized"));
    }

    if (res.code === 500) {
      // 服务器错误
      console.error("Server Error:", res.msg);
      // TODO: 集成全局 Message 组件提示错误
    }

    // 其他业务错误
    return Promise.reject(new Error(res.msg || "Unknown Error"));
  },
  (error) => {
    // 处理 HTTP 状态码错误
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
      message = "Unauthorized";
    } else if (status === 403) {
      message = "Forbidden";
    } else if (status === 404) {
      message = "Resource Not Found";
    } else if (status === 500) {
      message = "Internal Server Error";
    }

    console.error("Request Error:", message);
    return Promise.reject(error);
  }
);

// 封装通用请求方法
export const request = {
  get: <T = unknown>(url: string, config?: CustomRequestConfig): Promise<T> => {
    return axiosInstance.get<ApiResponse<T>>(url, config).then(res => res.data.data);
  },
  
  post: <T = unknown>(url: string, data?: unknown, config?: CustomRequestConfig): Promise<T> => {
    return axiosInstance.post<ApiResponse<T>>(url, data, config).then(res => res.data.data);
  },

  put: <T = unknown>(url: string, data?: unknown, config?: CustomRequestConfig): Promise<T> => {
    return axiosInstance.put<ApiResponse<T>>(url, data, config).then(res => res.data.data);
  },

  delete: <T = unknown>(url: string, config?: CustomRequestConfig): Promise<T> => {
    return axiosInstance.delete<ApiResponse<T>>(url, config).then(res => res.data.data);
  },

  // 暴露原始实例，用于特殊需求
  instance: axiosInstance
};
