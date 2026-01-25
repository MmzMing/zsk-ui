import { authRequest as request } from "../axios";

export type SliderCaptchaData = {
  uuid: string;
  bgUrl: string;
  puzzleUrl: string;
};

export type SliderVerifyResult = {
  passed: boolean;
};

export type SliderScene = "login_email" | "forgot_email" | "register_email";

export async function fetchSliderCaptcha(scene: SliderScene) {
  return request.get<SliderCaptchaData>("/auth/captcha/slider", {
    params: {
      scene
    }
  });
}

// New function for pre-check credentials and get captcha
export async function preCheckAndGetCaptcha(data: { account: string; password?: string; scene: SliderScene }) {
  try {
    return await request.post<SliderCaptchaData>("/auth/pre-check", data);
  } catch (error) {
    // In DEV environment, if API fails, fallback to mock data
    if (import.meta.env.DEV) {
      console.warn("Dev fallback: preCheckAndGetCaptcha failed, returning mock captcha");
      return {
        uuid: "mock-uuid-" + Date.now(),
        bgUrl: "https://img.alicdn.com/tfs/TB1sW.QZpXXXXc.XXXXXXXXXXXX-400-200.jpg",
        puzzleUrl: "https://img.alicdn.com/tfs/TB1W8_QZpXXXXb.XXXXXXXXXXXX-400-200.jpg"
      };
    }
    throw error;
  }
}

export async function verifySliderCaptcha(body: {
  scene: SliderScene;
  uuid: string;
  account?: string;
  email?: string;
  [key: string]: unknown;
}) {
  try {
    return await request.post<SliderVerifyResult>("/auth/captcha/slider/verify", body);
  } catch (error) {
    // In DEV environment, if API fails, fallback to mock success
    if (import.meta.env.DEV) {
      console.warn("Dev fallback: verifySliderCaptcha failed, returning mock success");
      return {
        passed: true
      };
    }
    throw error;
  }
}

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

export async function login(data: LoginRequest) {
  try {
    return await request.post<LoginResponse>("/auth/login", data);
  } catch (error) {
    // In DEV environment, if API fails, fallback to mock logic
    if (import.meta.env.DEV) {
      console.warn("Dev fallback: login failed, using mock logic");
      
      // Verify code if present (default mock code: 123456)
      if (data.code && data.code !== "123456") {
        throw new Error("验证码错误");
      }

      // Mock success response
      return {
        token: `mock-token-${Date.now()}`,
        refreshToken: `mock-refresh-${Date.now()}`,
        expiresIn: 3600,
        user: {
          id: "mock-user-id",
          username: data.username || data.email?.split('@')[0] || "MockUser",
          avatar: "https://i.pravatar.cc/150?u=mock",
          roles: ["admin"]
        }
      };
    }
    throw error;
  }
}

export type RegisterRequest = {
  username: string;
  email: string;
  password?: string;
  code?: string;
};

export async function register(data: RegisterRequest) {
  try {
    return await request.post<boolean>("/auth/register", data);
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn("Dev fallback: register failed, using mock logic");
      if (data.code && data.code !== "123456") {
        throw new Error("验证码错误");
      }
      return true;
    }
    throw error;
  }
}

export async function logout() {
  return request.post<boolean>("/auth/logout");
}

export async function refreshToken(token: string) {
  return request.post<{ token: string }>("/auth/refresh-token", { token });
}

export type ForgotPasswordRequest = {
  email: string;
  code: string;
  newPassword?: string;
};

export async function forgotPassword(data: ForgotPasswordRequest) {
  try {
    return await request.post<boolean>("/auth/forgot-password", data);
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn("Dev fallback: forgotPassword failed, using mock logic");
      if (data.code && data.code !== "123456") {
        throw new Error("验证码错误");
      }
      return true;
    }
    throw error;
  }
}
