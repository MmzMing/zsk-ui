import { create } from "zustand";
import Cookies from "js-cookie";

export type UserState = {
  token: string | null;
  userId: string | null;
  avatar: string | null;
};

export type UserActions = {
  setToken: (token: string | null) => void;
  setUserId: (id: string | null) => void;
  setAvatar: (avatar: string | null) => void;
  reset: () => void;
};

export type UserStore = UserState & UserActions;

const emptyState: UserState = {
  token: null,
  userId: null,
  avatar: null,
};

function loadInitialState(): UserState {
  if (typeof window === "undefined") return emptyState;
  
  // 优先从 Cookie 获取 Token (Dev环境/客户端模拟)
  // 注意：如果是 HttpOnly Cookie，JS 无法读取，此处 token 为 null，但请求会自动携带 Cookie
  const token = Cookies.get("token") || null;
  
  let userId = null;
  let avatar = null;

  try {
    const raw = window.localStorage.getItem("auth_session");
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<UserState>;
      userId = parsed.userId ?? null;
      avatar = parsed.avatar ?? null;
      // 兼容旧的 localStorage Token (如果 Cookie 中没有，尝试从 storage 迁移或读取)
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

function persistState(state: UserState) {
  try {
    // 仅将非敏感信息(userId, avatar)持久化到 localStorage
    // Token 由 Cookie 管理
    window.localStorage.setItem(
      "auth_session",
      JSON.stringify({
        // token: state.token, // 不再存入 localStorage
        userId: state.userId,
        avatar: state.avatar,
      }),
    );
  } catch {
    void 0;
  }
}

export const useUserStore = create<UserStore>(set => ({
  ...loadInitialState(),
  setToken: token =>
    set(previous => {
      const next: UserState = { ...previous, token };
      
      // 处理 Cookie 存储
      if (token) {
        // 设置 Cookie 配置
        // 注意：HttpOnly 属性只能由服务端设置，客户端无法设置
        // 这里在 Dev 环境或客户端模拟时，设置 Secure 和 SameSite
        Cookies.set("token", token, { 
          expires: 7, // 7天过期
          secure: true, // 仅 HTTPS (或 localhost)
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
