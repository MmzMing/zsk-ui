import { create } from "zustand";

export type UserState = {
  token: string | null;
  userId: string | null;
};

export type UserActions = {
  setToken: (token: string | null) => void;
  setUserId: (id: string | null) => void;
  reset: () => void;
};

export type UserStore = UserState & UserActions;

const emptyState: UserState = {
  token: null,
  userId: null,
};

function loadInitialState(): UserState {
  if (typeof window === "undefined") return emptyState;
  try {
    const raw = window.localStorage.getItem("auth_session");
    if (!raw) return emptyState;
    const parsed = JSON.parse(raw) as Partial<UserState>;
    return {
      token: parsed.token ?? null,
      userId: parsed.userId ?? null,
    };
  } catch {
    return emptyState;
  }
}

function persistState(state: UserState) {
  try {
    window.localStorage.setItem(
      "auth_session",
      JSON.stringify({
        token: state.token,
        userId: state.userId,
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
      persistState(next);
      return next;
    }),
  setUserId: id =>
    set(previous => {
      const next: UserState = { ...previous, userId: id };
      persistState(next);
      return next;
    }),
  reset: () =>
    set(() => {
      persistState(emptyState);
      return emptyState;
    }),
}));
