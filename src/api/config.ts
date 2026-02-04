// 全局 API 配置
export const API_CONFIG = {
  // 统一网关地址
  BASE_URL: import.meta.env.PROD ? "/api" : "http://localhost:20010/api",
  
  // 默认超时时间 (毫秒)
  timeout: 10000,
  
  // 默认请求头
  headers: {
    "Content-Type": "application/json",
    "X-Client-Version": "1.0.0", // 接口版本号
    "X-Device-Type": "Web" // 设备标识
  }
};
