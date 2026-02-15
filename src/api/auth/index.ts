// ===== 1. 依赖导入区域 =====
import { request, handleRequest } from "../axios";
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

// ===== 后端类型定义 =====

/** 后端登录响应类型 */
export type BackendLoginResponse = {
  /** 访问令牌 */
  accessToken: string;
  /** 刷新令牌 */
  refreshToken: string;
  /** 令牌类型 */
  tokenType: string;
  /** 过期时间（秒） */
  expiresIn: number;
  /** 用户ID */
  userId: number;
  /** 用户名 */
  username: string;
  /** 昵称 */
  nickname: string;
  /** 头像 */
  avatar: string;
};

/** 后端验证码响应类型 */
export type BackendCaptchaResponse = {
  /** 验证码UUID */
  uuid: string;
  /** 背景图片（Base64） */
  bgUrl: string;
  /** 滑块图片（Base64） */
  puzzleUrl: string;
  /** 滑块Y坐标 */
  y?: number;
  /** 滑块X坐标 */
  x?: number;
};

/** 后端注册请求类型 */
export type BackendRegisterRequest = {
  /** 用户名 */
  userName: string;
  /** 邮箱 */
  email: string;
  /** 密码 */
  password: string;
  /** 验证码 */
  code: string;
};

// ===== 前端类型定义 =====

/** 滑块验证码数据 */
export type SliderCaptchaData = {
  /** 验证码UUID */
  uuid: string;
  /** 背景图URL */
  bgUrl: string;
  /** 滑块图URL */
  puzzleUrl: string;
  /** 滑块Y坐标 */
  y?: number;
};

/** 滑块验证结果 */
export type SliderVerifyResult = {
  /** 是否验证通过 */
  passed: boolean;
};

/** 验证码场景 */
export type SliderScene = "login_email" | "forgot_email" | "register_email";

/** RSA公钥响应 */
export type PublicKeyResponse = {
  /** RSA公钥（Base64编码） */
  publicKey: string;
  /** 密钥有效期（秒） */
  keyExpire: number;
  /** 密钥版本号 */
  keyVersion: string;
};

/** 登录请求 */
export type LoginRequest = {
  /** 用户名 */
  username?: string;
  /** 邮箱 */
  email?: string;
  /** 密码（RSA加密后） */
  password?: string;
  /** 邮箱验证码 */
  code?: string;
  /** 验证码UUID */
  uuid?: string;
  /** 登录类型 */
  type: "account" | "email" | "phone";
};

/** 登录响应 */
export type LoginResponse = {
  /** 访问令牌 */
  token: string;
  /** 刷新令牌 */
  refreshToken: string;
  /** 过期时间（秒） */
  expiresIn: number;
  /** 用户信息 */
  user: {
    /** 用户ID */
    id: string;
    /** 用户名 */
    username: string;
    /** 头像 */
    avatar: string;
    /** 角色列表 */
    roles: string[];
  };
};

/** 注册请求 */
export type RegisterRequest = {
  /** 用户名 */
  username: string;
  /** 邮箱 */
  email: string;
  /** 密码（RSA加密后） */
  password?: string;
  /** 邮箱验证码 */
  code?: string;
};

/** 忘记密码请求 */
export type ForgotPasswordRequest = {
  /** 邮箱 */
  email: string;
  /** 验证码 */
  code: string;
  /** 新密码（RSA加密后） */
  newPassword?: string;
};

// ===== 字段映射函数 =====

/**
 * 登录请求前端转后端字段映射
 * @param frontendData 前端登录请求
 * @returns 后端登录请求
 */
function mapLoginRequestToBackend(frontendData: LoginRequest): Record<string, unknown> {
  /** 登录类型映射 */
  const loginTypeMap: Record<string, string> = {
    account: "password",
    email: "email",
    phone: "phone",
  };

  return {
    username: frontendData.username,
    email: frontendData.email,
    password: frontendData.password,
    code: frontendData.code,
    uuid: frontendData.uuid,
    emailCode: frontendData.code,
    loginType: loginTypeMap[frontendData.type] || frontendData.type,
  };
}

/**
 * 登录响应后端转前端字段映射
 * @param backendData 后端登录响应
 * @returns 前端登录响应
 */
function mapLoginResponseToFrontend(backendData: BackendLoginResponse): LoginResponse {
  return {
    token: backendData.accessToken,
    refreshToken: backendData.refreshToken,
    expiresIn: backendData.expiresIn,
    user: {
      id: String(backendData.userId),
      username: backendData.username || backendData.nickname,
      avatar: backendData.avatar || "",
      roles: [],
    },
  };
}

/**
 * 验证码响应后端转前端字段映射
 * @param backendData 后端验证码响应
 * @returns 前端验证码数据
 */
function mapCaptchaToFrontend(backendData: BackendCaptchaResponse): SliderCaptchaData {
  return {
    uuid: backendData.uuid,
    bgUrl: backendData.bgUrl,
    puzzleUrl: backendData.puzzleUrl,
    y: backendData.y
  };
}

// ===== API 函数 =====

/**
 * 获取滑块验证码
 * @returns 验证码数据
 */
export async function fetchSliderCaptcha() {
  const res = await handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<BackendCaptchaResponse>>("/auth/captcha")
        .then((r) => r.data),
    apiName: "fetchSliderCaptcha"
  });
  return mapCaptchaToFrontend(res.data as BackendCaptchaResponse);
}

/**
 * 预检查凭证并获取滑块验证码
 * @returns 验证码数据
 */
export async function preCheckAndGetCaptcha() {
  const res = await handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<BackendCaptchaResponse>>("/auth/captcha")
        .then((r) => r.data),
    apiName: "preCheckAndGetCaptcha"
  });
  return mapCaptchaToFrontend(res.data as BackendCaptchaResponse);
}

/**
 * 验证滑块验证码（使用邮箱验证码代替）
 * @param body 验证数据
 * @returns 验证结果
 */
export async function verifySliderCaptcha(body: {
  scene: SliderScene;
  uuid: string;
  account?: string;
  email?: string;
  x?: number;
  [key: string]: unknown;
}) {
  /** 1. 如果有邮箱且需要发送验证码 (scene 为 register 或 forgot) */
  const email = body.email || body.account;
  if (email && email.includes("@") && body.scene !== "login_email") {
     const res = await handleRequest({
      requestFn: () =>
        request.instance
          .post<ApiResponse<boolean>>("/auth/email/code", null, {
            params: { email },
          })
          .then((r) => r.data),
      apiName: "sendEmailCode"
    });
    return { passed: res.data === true };
  }

  /** 2. 如果是登录场景或纯滑块验证，调用后端验证接口 */
  if (body.x !== undefined || body.scene === "login_email") {
    await handleRequest({
      requestFn: () =>
        request.instance
          .post<ApiResponse<void>>("/auth/captcha/check", {
            uuid: body.uuid,
            code: String(Math.round(body.x as number))
          })
          .then((r) => r.data),
      apiName: "checkCaptcha"
    });
    return { passed: true };
  }

  return { passed: false };
}

/**
 * 用户登录
 * @param data 登录请求数据
 * @returns 登录响应
 */
export async function login(data: LoginRequest) {
  /** 映射后的后端请求数据 */
  const backendData = mapLoginRequestToBackend(data);

  const res = await handleRequest({
    requestFn: () =>
      request.instance
        .post<ApiResponse<BackendLoginResponse>>("/auth/login", backendData)
        .then((r) => r.data),
    apiName: "login"
  });

  return mapLoginResponseToFrontend(res.data as BackendLoginResponse);
}

/**
 * 用户注册
 * @param data 注册请求数据
 * @returns 是否注册成功
 */
export async function register(data: RegisterRequest) {
  /** 映射后的后端请求数据 */
  const backendData: BackendRegisterRequest = {
    userName: data.username,
    email: data.email,
    password: data.password || "",
    code: data.code || "",
  };

  const res = await handleRequest({
    requestFn: () =>
      request.instance
        .post<ApiResponse<boolean>>("/auth/register", backendData)
        .then((r) => r.data),
    apiName: "register"
  });

  return res.data;
}

/**
 * 用户登出
 * @returns 是否登出成功
 */
export async function logout() {
  const res = await handleRequest({
    requestFn: () =>
      request.instance
        .post<ApiResponse<boolean>>("/auth/logout")
        .then((r) => r.data),
    apiName: "logout"
  });
  return res.data;
}

/**
 * 刷新令牌
 * @param refreshToken 刷新令牌
 * @returns 新的访问令牌
 */
export async function refreshToken(refreshToken: string) {
  const res = await handleRequest({
    requestFn: () =>
      request.instance
        .post<ApiResponse<{ accessToken: string; expiresIn: number }>>(
          "/auth/refresh",
          {},
          { headers: { Authorization: refreshToken } }
        )
        .then((r) => r.data),
    apiName: "refreshToken"
  });
  return res.data;
}

/**
 * 忘记密码 - 发送重置验证码
 * @param email 邮箱地址
 * @returns 是否发送成功
 */
export async function sendPasswordResetCode(email: string) {
  const res = await handleRequest({
    requestFn: () =>
      request.instance
        .post<ApiResponse<boolean>>("/auth/password/reset/code", null, {
          params: { email },
        })
        .then((r) => r.data),
    apiName: "sendPasswordResetCode"
  });
  return res.data;
}

/**
 * 忘记密码 - 验证重置验证码
 * @param email 邮箱地址
 * @param code 验证码
 * @returns 验证令牌（用于后续重置密码）
 */
export async function verifyResetCode(email: string, code: string) {
  const res = await handleRequest({
    requestFn: () =>
      request.instance
        .post<ApiResponse<string>>("/auth/password/reset/verify", null, {
          params: { email, code },
        })
        .then((r) => r.data),
    apiName: "verifyResetCode"
  });

  return res.data;
}

/**
 * 忘记密码 - 重置密码
 * @param email 邮箱地址
 * @param verifyToken 验证令牌
 * @param newPassword 新密码（RSA加密后）
 * @returns 是否成功
 */
export async function resetPassword(
  email: string,
  verifyToken: string,
  newPassword: string
) {
  const res = await handleRequest({
    requestFn: () =>
      request.instance
        .post<ApiResponse<boolean>>("/auth/password/reset", null, {
          params: {
            email,
            verifyToken,
            newPassword,
          },
        })
        .then((r) => r.data),
    apiName: "resetPassword"
  });

  return res.data;
}

/**
 * 忘记密码（旧版，已废弃）
 * @deprecated 请使用 sendPasswordResetCode, verifyResetCode, resetPassword 三步流程
 * @param data 忘记密码请求数据
 * @returns 是否成功
 */
export async function forgotPassword(data: ForgotPasswordRequest) {
  const res = await handleRequest({
    requestFn: () =>
      request.instance
        .post<ApiResponse<boolean>>("/auth/forgot-password", null, {
          params: {
            email: data.email,
            code: data.code,
            newPassword: data.newPassword,
          },
        })
        .then((r) => r.data),
    apiName: "forgotPassword"
  });

  return res.data;
}

/**
 * 获取RSA公钥
 * @returns 公钥响应对象
 */
export async function getPublicKey() {
  const res = await handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<PublicKeyResponse>>("/auth/public-key")
        .then((r) => r.data),
    apiName: "getPublicKey"
  });
  return res.data;
}

/**
 * 发送邮箱验证码
 * @param email 邮箱地址
 * @returns 是否发送成功
 */
export async function sendEmailCode(email: string) {
  const res = await handleRequest({
    requestFn: () =>
      request.instance
        .post<ApiResponse<boolean>>("/auth/email/code", null, {
            params: { email },
          })
        .then((r) => r.data),
      apiName: "sendEmailCode"
    });
  return res.data;
}

/**
 * 获取第三方登录授权URL
 * @param loginType 登录类型（qq/wechat/github）
 * @returns 授权URL
 */
export async function getThirdPartyAuthUrl(loginType: string) {
  const res = await handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<string>>("/auth/third-party/url", {
          params: { loginType },
        })
        .then((r) => r.data),
    apiName: "getThirdPartyAuthUrl"
  });
  return res.data;
}

/**
 * 第三方登录回调
 * @param loginType 登录类型
 * @param code 授权码
 * @param state 状态码
 * @returns 登录响应
 */
export async function thirdPartyCallback(
  loginType: string,
  code: string,
  state: string
) {
  const res = await handleRequest({
    requestFn: () =>
      request.instance
        .post<ApiResponse<BackendLoginResponse>>("/auth/third-party/callback", null, {
          params: { loginType, code, state },
        })
        .then((r) => r.data),
    apiName: "thirdPartyCallback"
  });
  return mapLoginResponseToFrontend(res.data as BackendLoginResponse);
}
