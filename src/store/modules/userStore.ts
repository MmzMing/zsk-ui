/**
 * 用户状态管理
 * 管理用户认证信息，包括Token、用户ID、头像等
 *
 * @module store/modules/userStore
 * @author wuhuaming
 * @date 2026-02-18
 * @version 1.0
 */

import { create } from "zustand";
import Cookies from "js-cookie";

/**
 * 用户状态接口
 * 定义用户认证相关的状态属性
 */
export type UserState = {
  /** 用户令牌（从Cookie获取） */
  token: string | null;
  /** 用户ID */
  userId: string | null;
  /** 用户头像URL */
  avatar: string | null;
};

/**
 * 用户操作接口
 * 定义用户状态修改的操作方法
 */
export type UserActions = {
  /** 设置用户令牌 */
  setToken: (token: string | null) => void;
  /** 设置用户ID */
  setUserId: (id: string | null) => void;
  /** 设置用户头像 */
  setAvatar: (avatar: string | null) => void;
  /** 重置用户状态 */
  reset: () => void;
};

/** 用户Store类型（状态与操作的联合） */
export type UserStore = UserState & UserActions;

/** 空状态（未登录时的默认状态） */
const emptyState: UserState = {
  token: null,
  userId: null,
  avatar: null,
};

/**
 * 加载初始状态
 * 从Cookie和localStorage恢复用户认证信息
 *
 * Token优先从Cookie获取（支持HttpOnly安全模式）
 * userId和avatar从localStorage获取
 *
 * @returns 初始化后的用户状态
 */
function loadInitialState(): UserState {
  if (typeof window === "undefined") return emptyState;

  const token = Cookies.get("token") || null;

  let userId = null;
  let avatar = null;

  try {
    const raw = window.localStorage.getItem("auth_session");
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<UserState>;
      userId = parsed.userId ?? null;
      avatar = parsed.avatar ?? null;
      if (!token && parsed.token) {
        // 可选：迁移逻辑，这里暂不自动迁移，遵循 Cookie 优先
      }
    }
  } catch {
    window.localStorage.removeItem("auth_session");
  }

  return {
    token,
    userId,
    avatar,
  };
}

/**
 * 持久化用户状态
 * 将非敏感信息（userId、avatar）存储到localStorage
 * Token由Cookie管理，不存入localStorage
 *
 * @param state 需要持久化的用户状态
 */
function persistState(state: UserState) {
  try {
    window.localStorage.setItem(
      "auth_session",
      JSON.stringify({
        userId: state.userId,
        avatar: state.avatar,
      }),
    );
  } catch {
    void 0;
  }
}

/**
 * 用户状态 Store
 * 使用 Zustand 管理用户认证状态，支持Cookie和localStorage双重持久化
 *
 * 安全说明：
 * - Token存储在Cookie中，支持HttpOnly（需服务端配合）
 * - 非敏感信息（userId、avatar）存储在localStorage
 *
 * @example
 * const { token, userId, setToken, reset } = useUserStore();
 * setToken('your-token');
 */
export const useUserStore = create<UserStore>(set => ({
  ...loadInitialState(),
  setToken: token =>
    set(previous => {
      const next: UserState = { ...previous, token };

      if (token) {
        Cookies.set("token", token, {
          expires: 7,
          secure: true,
          sameSite: "Strict"
        });
      } else {
        Cookies.remove("token");
      }

      persistState(next);
      return next;
    }),
  setUserId: id =>
    set(previous => {
      const next: UserState = { ...previous, userId: id };
      persistState(next);
      return next;
    }),
  setAvatar: avatar =>
    set(previous => {
      const next: UserState = { ...previous, avatar };
      persistState(next);
      return next;
    }),
  reset: () =>
    set(() => {
      Cookies.remove("token");
      persistState(emptyState);
      return emptyState;
    }),
}));
