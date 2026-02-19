/**
 * 认证相关 Hook
 * 提供用户认证状态管理和登录登出操作
 *
 * @module hooks/useAuth
 * @author wuhuaming
 * @date 2026-02-18
 * @version 1.0
 */

import { useCallback, useMemo } from "react";
import { useUserStore } from "@/store/modules/userStore";
import { cookieUtils } from "@/utils/cookie";
import { logger } from "@/utils/logger";

/**
 * 认证状态接口
 * 包含用户认证相关的状态信息
 */
export interface AuthState {
  /** 是否已认证（根据token是否存在判断） */
  isAuthenticated: boolean;
  /** 用户令牌 */
  token: string | null;
  /** 用户ID */
  userId: string | null;
  /** 用户头像URL */
  avatar: string | null;
}

/**
 * 认证操作接口
 * 提供登录、登出、设置用户信息等操作方法
 */
export interface AuthActions {
  /**
   * 用户登录
   * @param token 登录令牌
   * @param userId 用户ID（可选）
   */
  login: (token: string, userId?: string) => void;
  /** 用户登出，清除认证状态 */
  logout: () => void;
  /**
   * 设置用户信息
   * @param userId 用户ID
   * @param avatar 用户头像URL（可选）
   */
  setUserInfo: (userId: string, avatar?: string) => void;
}

/** useAuth Hook 返回值类型（状态与操作的联合） */
export type UseAuthReturn = AuthState & AuthActions;

/**
 * 认证状态管理 Hook
 * 封装用户认证相关的状态和操作，统一管理登录状态
 *
 * @returns 认证状态和操作方法
 * @example
 * const { isAuthenticated, token, login, logout } = useAuth();
 * if (!isAuthenticated) {
 *   login('your-token', 'user-id');
 * }
 */
export const useAuth = (): UseAuthReturn => {
  const { token, userId, avatar, setToken, setUserId, setAvatar, reset } = useUserStore();

  /** 是否已认证（根据token是否存在计算得出） */
  const isAuthenticated = useMemo(() => !!token, [token]);

  /**
   * 用户登录
   * 设置token和可选的userId，记录登录日志
   *
   * @param newToken 登录令牌
   * @param newUserId 用户ID（可选）
   */
  const login = useCallback(
    (newToken: string, newUserId?: string) => {
      setToken(newToken);
      if (newUserId) {
        setUserId(newUserId);
      }
      logger.info("用户登录成功");
    },
    [setToken, setUserId]
  );

  /**
   * 用户登出
   * 重置用户状态并清除认证Cookie
   */
  const logout = useCallback(() => {
    reset();
    cookieUtils.clearAuth();
    logger.info("用户已登出");
  }, [reset]);

  /**
   * 设置用户信息
   * 更新用户ID和头像信息
   *
   * @param newUserId 用户ID
   * @param newAvatar 用户头像URL（可选）
   */
  const setUserInfo = useCallback(
    (newUserId: string, newAvatar?: string) => {
      setUserId(newUserId);
      if (newAvatar) {
        setAvatar(newAvatar);
      }
    },
    [setUserId, setAvatar]
  );

  return {
    isAuthenticated,
    token,
    userId,
    avatar,
    login,
    logout,
    setUserInfo,
  };
};

export default useAuth;
