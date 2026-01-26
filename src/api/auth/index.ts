// ===== 1. 依赖导入区域 =====
import { authRequest as request, handleRequestWithMock } from "../axios";
import type { ApiResponse } from "../types";

// ===== 2. TODO待处理导入区域 =====

// ===== 3. 状态控制逻辑区域 =====

// ===== 4. 通用工具函数区域 =====

// ===== 5. 注释代码函数区 =====

// ===== 6. 错误处理函数区域 =====

// ===== 7. 数据处理函数区域 =====

// ===== 8. UI渲染逻辑区域 =====

// ===== 9. 页面初始化与事件绑定 =====

// ===== 10. TODO任务管理区域 =====

// ===== 11. 导出区域 =====

// --- 类型定义 ---

export type SliderCaptchaData = {
  uuid: string;
  bgUrl: string;
  puzzleUrl: string;
};

export type SliderVerifyResult = {
  passed: boolean;
};

export type SliderScene = "login_email" | "forgot_email" | "register_email";

export type LoginRequest = {
  username?: string;
  email?: string;
  password?: string;
  code?: string;
  type: "account" | "email" | "phone";
};

export type LoginResponse = {
  token: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    username: string;
    avatar: string;
    roles: string[];
  };
};

export type RegisterRequest = {
  username: string;
  email: string;
  password?: string;
  code?: string;
};

export type ForgotPasswordRequest = {
  email: string;
  code: string;
  newPassword?: string;
};

// --- Mock 数据定义 ---

const MOCK_CAPTCHA_DATA: SliderCaptchaData = {
  uuid: "mock-uuid-default",
  bgUrl: "https://img.alicdn.com/tfs/TB1sW.QZpXXXXc.XXXXXXXXXXXX-400-200.jpg",
  puzzleUrl: "https://img.alicdn.com/tfs/TB1W8_QZpXXXXb.XXXXXXXXXXXX-400-200.jpg",
};

const MOCK_LOGIN_RESPONSE: LoginResponse = {
  token: "mock-token-default",
  refreshToken: "mock-refresh-default",
  expiresIn: 3600,
  user: {
    id: "mock-user-id",
    username: "MockUser",
    avatar: "https://i.pravatar.cc/150?u=mock",
    roles: ["admin"],
  },
};

// --- API 函数 ---

/**
 * 获取滑块验证码
 * @param scene 验证场景
 */
export async function fetchSliderCaptcha(scene: SliderScene) {
  return request.get<SliderCaptchaData>("/auth/captcha/slider", {
    params: {
      scene,
    },
  });
}

/**
 * 预检查凭证并获取滑块验证码
 * @param data 预检查数据
 */
export async function preCheckAndGetCaptcha(data: {
  account: string;
  password?: string;
  scene: SliderScene;
}) {
  const res = await handleRequestWithMock(
    () =>
      request.instance
        .post<ApiResponse<SliderCaptchaData>>("/auth/pre-check", data)
        .then((r) => r.data),
    { ...MOCK_CAPTCHA_DATA, uuid: "mock-uuid-" + Date.now() },
    "preCheckAndGetCaptcha"
  );
  return res.data;
}

/**
 * 验证滑块验证码
 * @param body 验证数据
 */
export async function verifySliderCaptcha(body: {
  scene: SliderScene;
  uuid: string;
  account?: string;
  email?: string;
  [key: string]: unknown;
}) {
  const res = await handleRequestWithMock(
    () =>
      request.instance
        .post<ApiResponse<SliderVerifyResult>>("/auth/captcha/slider/verify", body)
        .then((r) => r.data),
    { passed: true },
    "verifySliderCaptcha"
  );
  return res.data;
}

/**
 * 用户登录
 * @param data 登录请求数据
 */
export async function login(data: LoginRequest) {
  const res = await handleRequestWithMock(
    async () => {
      // 模拟验证码校验逻辑（如果后端还未实现，可以在这里抛错触发 Mock）
      const response = await request.instance.post<ApiResponse<LoginResponse>>(
        "/auth/login",
        data
      );
      return response.data;
    },
    {
      ...MOCK_LOGIN_RESPONSE,
      user: {
        ...MOCK_LOGIN_RESPONSE.user,
        username: data.username || data.email?.split("@")[0] || "MockUser",
      },
    },
    "login"
  );

  // 针对 Mock 数据的额外逻辑处理（如模拟验证码错误）
  if (import.meta.env.DEV && res.msg?.includes("[MOCK兜底]")) {
    if (data.code && data.code !== "123456") {
      throw new Error("验证码错误");
    }
  }

  return res.data;
}

/**
 * 用户注册
 * @param data 注册请求数据
 */
export async function register(data: RegisterRequest) {
  const res = await handleRequestWithMock(
    () =>
      request.instance
        .post<ApiResponse<boolean>>("/auth/register", data)
        .then((r) => r.data),
    true,
    "register"
  );

  if (import.meta.env.DEV && res.msg?.includes("[MOCK兜底]")) {
    if (data.code && data.code !== "123456") {
      throw new Error("验证码错误");
    }
  }

  return res.data;
}

/**
 * 用户登出
 */
export async function logout() {
  return request.post<boolean>("/auth/logout");
}

/**
 * 刷新 Token
 * @param token 旧 Token
 */
export async function refreshToken(token: string) {
  return request.post<{ token: string }>("/auth/refresh-token", { token });
}

/**
 * 忘记密码
 * @param data 忘记密码请求数据
 */
export async function forgotPassword(data: ForgotPasswordRequest) {
  const res = await handleRequestWithMock(
    () =>
      request.instance
        .post<ApiResponse<boolean>>("/auth/forgot-password", data)
        .then((r) => r.data),
    true,
    "forgotPassword"
  );

  if (import.meta.env.DEV && res.msg?.includes("[MOCK兜底]")) {
    if (data.code && data.code !== "123456") {
      throw new Error("验证码错误");
    }
  }

  return res.data;
}
