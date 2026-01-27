// ===== 1. 依赖导入区域 =====
import type { LoginResponse, SliderCaptchaData } from "@/api/auth";

// ===== 11. 导出区域 =====

/**
 * 滑块验证码 Mock 数据
 */
export const MOCK_CAPTCHA_DATA: SliderCaptchaData = {
  uuid: "mock-uuid-default",
  bgUrl: "https://img.alicdn.com/tfs/TB1sW.QZpXXXXc.XXXXXXXXXXXX-400-200.jpg",
  puzzleUrl: "https://img.alicdn.com/tfs/TB1W8_QZpXXXXb.XXXXXXXXXXXX-400-200.jpg",
};

/**
 * 登录响应 Mock 数据
 */
export const MOCK_LOGIN_RESPONSE: LoginResponse = {
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
