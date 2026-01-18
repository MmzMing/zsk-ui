// 全局 API 配置
export const API_CONFIG = {
  // 基础 URL，优先从环境变量获取，否则使用默认值
  baseURL: (import.meta.env.VITE_API_BASE_URL as string) || "/api",
  
  // 默认超时时间 (毫秒)
  timeout: 10000,
  
  // 默认请求头
  headers: {
    "Content-Type": "application/json",
    "X-Client-Version": "1.0.0", // 接口版本号
    "X-Device-Type": "Web" // 设备标识
  }
};
