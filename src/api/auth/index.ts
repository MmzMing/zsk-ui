import { request } from "../axios";

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

export async function verifySliderCaptcha(body: {
  scene: SliderScene;
  uuid: string;
  account?: string;
  email?: string;
  [key: string]: unknown;
}) {
  return request.post<SliderVerifyResult>("/auth/captcha/slider/verify", body);
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
  return request.post<LoginResponse>("/auth/login", data);
}

export type RegisterRequest = {
  username: string;
  email: string;
  password?: string;
  code?: string;
};

export async function register(data: RegisterRequest) {
  return request.post<boolean>("/auth/register", data);
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
  return request.post<boolean>("/auth/forgot-password", data);
}
