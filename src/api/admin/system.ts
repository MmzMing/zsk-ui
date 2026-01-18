import { request } from "../axios";

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
  return request.get<DictListResponse>("/admin/system/dict/list", {
    params
  });
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
  return request.post<boolean>("/admin/system/dict/save", data);
}

// 切换字典状态
export async function toggleDictStatus(id: string, status: DictStatus) {
  return request.post<boolean>("/admin/system/dict/toggle-status", {
    id,
    status
  });
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
  return request.get<BotConfig[]>("/admin/bot/list");
}

// 保存 Bot 配置
export async function saveBotConfig(data: BotConfig) {
  return request.post<boolean>("/admin/bot/save", data);
}
