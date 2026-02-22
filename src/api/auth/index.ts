import { request, handleRequest } from "../axios";
import type { ApiResponse } from "../types";

// ===== 类型定义 =====

/**
 * 后端登录响应类型
 * @description 用户登录成功后后端返回的数据结构
 */
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

/**
 * 后端验证码响应类型
 * @description 获取滑块验证码时后端返回的数据结构
 */
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

/**
 * RSA公钥响应
 * @description 获取RSA公钥用于密码加密
 */
export type PublicKeyResponse = {
  /** RSA公钥（Base64编码） */
  publicKey: string;
  /** 密钥有效期（秒） */
  keyExpire: number;
  /** 密钥版本号 */
  keyVersion: string;
};

/**
 * 登录请求
 * @description 用户登录时提交的数据结构，支持多种登录方式
 */
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
  loginType?: "password" | "email" | "phone";
  /** 邮箱验证码（备用字段） */
  emailCode?: string;
};

/**
 * 注册请求
 * @description 用户注册时提交的数据结构
 */
export type RegisterRequest = {
  /** 用户名 */
  username: string;
  /** 邮箱 */
  email: string;
  /** 密码（RSA加密后） */
  password?: string;
  /** 确认密码（RSA加密后） */
  confirmPassword?: string;
  /** 邮箱验证码 */
  code?: string;
  /** 验证码UUID */
  uuid?: string;
};

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
  return res.data as BackendCaptchaResponse;
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
  return res.data as BackendCaptchaResponse;
}

/**
 * 根据用户名发送邮箱验证码
 * @param username 用户名
 * @returns 是否发送成功
 */
export async function sendEmailCodeByUsername(username: string, captchaVerification?: string) {
  const res = await handleRequest({
    requestFn: () =>
      request.instance
        .post<ApiResponse<boolean>>("/auth/email/code/username", null, {
          params: { username, captchaVerification },
        })
        .then((r) => r.data),
    apiName: "sendEmailCodeByUsername"
  });
  return res.data;
}

/**
 * 验证滑块验证码
 * @param body 验证数据
 * @returns 验证结果
 */
export async function verifySliderCaptcha(body: {
  scene: "login_email" | "forgot_email" | "register_email";
  uuid: string;
  account?: string;
  email?: string;
  x?: number;
  [key: string]: unknown;
}) {
  let verifyToken: string | undefined;

  if (body.x !== undefined) {
    const checkRes = await handleRequest({
      requestFn: () =>
        request.instance
          .post<ApiResponse<string>>("/auth/captcha/check", {
            uuid: body.uuid,
            code: String(Math.round(body.x as number)),
          })
          .then((r) => r.data),
      apiName: "checkCaptcha"
    });
    
    if (checkRes.code !== 200) {
      return { passed: false };
    }
    verifyToken = checkRes.data;
  }

  const account = body.email || body.account;
  
  if (account) {
    const isEmail = account.includes("@");
    
    if (isEmail) {
      const res = await handleRequest({
        requestFn: () =>
          request.instance
            .post<ApiResponse<boolean>>("/auth/email/code", null, {
              params: { email: account, captchaVerification: verifyToken },
            })
            .then((r) => r.data),
        apiName: "sendEmailCode"
      });
      return { passed: !!(res && res.code === 200), verifyToken };
    }
    
    if (!isEmail && body.scene === "login_email") {
      const res = await handleRequest({
        requestFn: () =>
          request.instance
            .post<ApiResponse<boolean>>("/auth/email/code/username", null, {
              params: { username: account, captchaVerification: verifyToken },
            })
            .then((r) => r.data),
        apiName: "sendEmailCodeByUsername"
      });
      return { passed: !!(res && res.code === 200), verifyToken };
    }
  }

  return { passed: true, verifyToken };
}

/**
 * 用户登录
 * @param data 登录请求数据
 * @returns 登录响应
 */
export async function login(data: LoginRequest) {
  const res = await handleRequest({
    requestFn: () =>
      request.instance
        .post<ApiResponse<BackendLoginResponse>>("/auth/login", data)
        .then((r) => r.data),
    apiName: "login"
  });

  return res.data as BackendLoginResponse;
}

/**
 * 用户注册
 * @param data 注册请求数据
 * @returns 是否注册成功
 */
export async function register(data: RegisterRequest) {
  const res = await handleRequest({
    requestFn: () =>
      request.instance
        .post<ApiResponse<boolean>>("/auth/register", data)
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
export async function sendPasswordResetCode(email: string, captchaVerification?: string) {
  const res = await handleRequest({
    requestFn: () =>
      request.instance
        .post<ApiResponse<boolean>>("/auth/password/reset/code", null, {
          params: { email, captchaVerification },
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
export async function sendEmailCode(email: string, captchaVerification?: string) {
  const res = await handleRequest({
    requestFn: () =>
      request.instance
        .post<ApiResponse<boolean>>("/auth/email/code", null, {
            params: { email, captchaVerification },
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
  return res.data as BackendLoginResponse;
}
