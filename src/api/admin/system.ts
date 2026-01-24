import { userRequest as request } from "../axios";
import { 
  mockSystemParams, 
  mockInitialDicts, 
  mockInitialTokens 
} from "../mock/admin/system";
import { mockPermissionGroups } from "../mock/admin/personnel";

export type ParamScope = "global" | "frontend" | "backend" | "task";

export type ParamItem = {
  id: string;
  key: string;
  name: string;
  value: string;
  scope: ParamScope;
  description: string;
  sensitive: boolean;
  updatedAt: string;
};

export type DictStatus = "enabled" | "disabled";

export type DictItem = {
  id: string;
  code: string;
  name: string;
  category: string;
  description: string;
  itemCount: number;
  status: DictStatus;
  updatedAt: string;
};

export type TokenStatus = "active" | "expired" | "revoked";

export type TokenItem = {
  id: string;
  name: string;
  token: string;
  type: "api" | "personal" | "internal";
  boundUser: string;
  createdAt: string;
  expiredAt: string;
  lastUsedAt: string | null;
  status: TokenStatus;
  remark: string;
};

export type PermissionItem = {
  id: string;
  key: string;
  name: string;
  module: string;
  description: string;
  type: "menu" | "action" | "data";
  createdAt: string;
};

export type PermissionGroup = {
  id: string;
  label: string;
  items: PermissionItem[];
};

export type DictListParams = {
  page: number;
  pageSize: number;
  keyword?: string;
  status?: string;
};

export type DictListResponse = {
  list: DictItem[];
  total: number;
};

// 获取字典列表
export async function fetchDictList(params: DictListParams) {
  const isDev = import.meta.env.DEV;
  try {
    const res = await request.get<DictListResponse>("/admin/system/dict/list", {
      params
    });
    if (res) return res;
    throw new Error("Empty response");
  } catch (error) {
    console.error("fetchDictList Error:", error);
    if (isDev) {
      return {
        list: mockInitialDicts,
        total: mockInitialDicts.length
      };
    }
    throw error;
  }
}

export type SaveDictRequest = {
  id?: string;
  code: string;
  name: string;
  category: string;
  description: string;
  status: DictStatus;
};

// 保存字典（新增或更新）
export async function saveDict(data: SaveDictRequest) {
  try {
    return await request.post<boolean>("/admin/system/dict/save", data);
  } catch (error) {
    console.error("saveDict Error:", error);
    throw error;
  }
}

// 切换字典状态
export async function toggleDictStatus(id: string, status: DictStatus) {
  try {
    return await request.post<boolean>("/admin/system/dict/toggle-status", {
      id,
      status
    });
  } catch (error) {
    console.error("toggleDictStatus Error:", error);
    throw error;
  }
}

// 获取参数列表
export async function fetchParamList() {
  const isDev = import.meta.env.DEV;
  try {
    const res = await request.get<ParamItem[]>("/admin/system/param/list");
    if (res) return res;
    throw new Error("Empty response");
  } catch (error) {
    console.error("fetchParamList Error:", error);
    if (isDev) {
      return mockSystemParams;
    }
    throw error;
  }
}

// 保存参数
export async function saveParam(data: Partial<ParamItem>) {
  try {
    return await request.post<boolean>("/admin/system/param/save", data);
  } catch (error) {
    console.error("saveParam Error:", error);
    throw error;
  }
}

// 删除参数
export async function deleteParam(id: string) {
  try {
    return await request.post<boolean>("/admin/system/param/delete", { id });
  } catch (error) {
    console.error("deleteParam Error:", error);
    throw error;
  }
}

// 获取令牌列表
export async function fetchTokenList() {
  const isDev = import.meta.env.DEV;
  try {
    const res = await request.get<TokenItem[]>("/admin/system/token/list");
    if (res) return res;
    throw new Error("Empty response");
  } catch (error) {
    console.error("fetchTokenList Error:", error);
    if (isDev) {
      return mockInitialTokens;
    }
    throw error;
  }
}

// 保存令牌
export async function saveToken(data: Partial<TokenItem>) {
  try {
    return await request.post<boolean>("/admin/system/token/save", data);
  } catch (error) {
    console.error("saveToken Error:", error);
    throw error;
  }
}

// 吊销令牌
export async function revokeToken(id: string) {
  try {
    return await request.post<boolean>("/admin/system/token/revoke", { id });
  } catch (error) {
    console.error("revokeToken Error:", error);
    throw error;
  }
}

// 删除令牌
export async function deleteToken(id: string) {
  try {
    return await request.post<boolean>("/admin/system/token/delete", { id });
  } catch (error) {
    console.error("deleteToken Error:", error);
    throw error;
  }
}

// 获取权限列表
export async function fetchPermissionList() {
  const isDev = import.meta.env.DEV;
  try {
    const res = await request.get<PermissionGroup[]>("/admin/system/permission/list");
    if (res) return res;
    throw new Error("Empty response");
  } catch (error) {
    console.error("fetchPermissionList Error:", error);
    if (isDev) {
      return mockPermissionGroups;
    }
    throw error;
  }
}

export type BotConfig = {
  id: string;
  type: "dingtalk" | "wechat" | "qq" | "napcat";
  name: string;
  webhook?: string;
  secret?: string;
  token?: string;
  status: "active" | "inactive";
};

// 获取 Bot 配置列表
export async function fetchBotConfigs() {
  const isDev = import.meta.env.DEV;
  try {
    const res = await request.get<BotConfig[]>("/admin/bot/list");
    if (res) return res;
    throw new Error("Empty response");
  } catch (error) {
    console.error("fetchBotConfigs Error:", error);
    if (isDev) {
      return []; // No mock data for bots in system.ts yet, returning empty
    }
    throw error;
  }
}

// 保存 Bot 配置
export async function saveBotConfig(data: BotConfig) {
  try {
    return await request.post<boolean>("/admin/bot/save", data);
  } catch (error) {
    console.error("saveBotConfig Error:", error);
    throw error;
  }
}
