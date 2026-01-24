// 全局 API 配置
export const API_CONFIG = {
  // 不同服务的端口封装
  SERVICE_URLS: {
    CONTENT: "http://localhost:30030", // 视频和文档
    USER: "http://localhost:30010",    // 用户信息和系统信息
    AUTH: "http://localhost:20010",    // 登录
  },
  
  // 默认超时时间 (毫秒)
  timeout: 10000,
  
  // 默认请求头
  headers: {
    "Content-Type": "application/json",
    "X-Client-Version": "1.0.0", // 接口版本号
    "X-Device-Type": "Web" // 设备标识
  }
};
