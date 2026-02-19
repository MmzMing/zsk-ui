/**
 * Cookie工具类
 * @module utils/cookie
 * @description Cookie操作封装，提供安全的Cookie管理
 */

import Cookies from "js-cookie";
import { COOKIE_KEYS } from "@/constants";

const COOKIE_CONFIG: Cookies.CookieAttributes = {
  expires: 7,
  path: "/",
  sameSite: "strict",
  secure: import.meta.env.PROD,
};

export const cookieUtils = {
  setToken(token: string, tokenType: string = "Bearer"): void {
    Cookies.set(COOKIE_KEYS.TOKEN, token, COOKIE_CONFIG);
    Cookies.set(COOKIE_KEYS.TOKEN_TYPE, tokenType, COOKIE_CONFIG);
  },

  getToken(): string | undefined {
    return Cookies.get(COOKIE_KEYS.TOKEN);
  },

  getTokenType(): string | undefined {
    return Cookies.get(COOKIE_KEYS.TOKEN_TYPE);
  },

  getAuthorizationHeader(): string | undefined {
    const token = this.getToken();
    const tokenType = this.getTokenType();
    if (token && tokenType) {
      return `${tokenType} ${token}`;
    }
    return token;
  },

  setUserInfo(userInfo: Record<string, unknown>): void {
    Cookies.set(COOKIE_KEYS.USER_INFO, JSON.stringify(userInfo), COOKIE_CONFIG);
  },

  getUserInfo<T = Record<string, unknown>>(): T | null {
    const userInfo = Cookies.get(COOKIE_KEYS.USER_INFO);
    if (userInfo) {
      try {
        return JSON.parse(userInfo) as T;
      } catch {
        return null;
      }
    }
    return null;
  },

  setRememberMe(username: string): void {
    Cookies.set(COOKIE_KEYS.REMEMBER_ME, username, {
      expires: 30,
      path: "/",
      sameSite: "strict",
      secure: import.meta.env.PROD,
    });
  },

  getRememberMe(): string | undefined {
    return Cookies.get(COOKIE_KEYS.REMEMBER_ME);
  },

  clearRememberMe(): void {
    Cookies.remove(COOKIE_KEYS.REMEMBER_ME, { path: "/" });
  },

  setTheme(theme: string): void {
    Cookies.set(COOKIE_KEYS.THEME, theme, COOKIE_CONFIG);
  },

  getTheme(): string | undefined {
    return Cookies.get(COOKIE_KEYS.THEME);
  },

  clearAuth(): void {
    Cookies.remove(COOKIE_KEYS.TOKEN, { path: "/" });
    Cookies.remove(COOKIE_KEYS.TOKEN_TYPE, { path: "/" });
    Cookies.remove(COOKIE_KEYS.USER_INFO, { path: "/" });
  },

  clearAll(): void {
    Object.values(COOKIE_KEYS).forEach((key) => {
      Cookies.remove(key, { path: "/" });
    });
  },
};

export default cookieUtils;
