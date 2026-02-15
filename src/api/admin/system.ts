// ===== 1. 依赖导入区域 =====
import { request, handleRequest } from "../axios";
import { mockPermissionGroups } from "../mock/admin/personnel";
import type { ApiResponse } from "../types";

// ===== 2. TODO待处理导入区域 =====

// ===== 3. 状态控制逻辑区域 =====

// ===== 4. 通用工具函数区域 =====

// ===== 5. 注释代码函数区 =====

// ===== 6. 错误处理函数区域 =====

// ===== 7. 数据处理函数区域 =====

// ===== 8. UI渲染逻辑区域 =====

// ===== 9. 页面初始化与事件绑定 =====

// ===== 10. TODO任务管理区域 =====

// ===== 11. 导出区域 =====

// ===== 后端类型定义 =====

/** 后端字典数据类型 */
export type SysDictData = {
  /** 主键ID（雪花算法） */
  id?: number;
  /** 字典排序 */
  dictSort?: number;
  /** 字典标签 */
  dictLabel?: string;
  /** 字典键值 */
  dictValue?: string;
  /** 字典类型 */
  dictType?: string;
  /** 样式属性 */
  cssClass?: string;
  /** 表格回显样式 */
  listClass?: string;
  /** 是否默认（Y是 N否） */
  isDefault?: string;
  /** 状态（0正常 1停用） */
  status?: string;
  /** 备注 */
  remark?: string;
  /** 创建时间 */
  createTime?: string;
  /** 更新时间 */
  updateTime?: string;
};

/** 后端字典类型 */
export type SysDictType = {
  /** 主键ID（雪花算法） */
  id?: number;
  /** 字典名称 */
  dictName?: string;
  /** 字典类型 */
  dictType?: string;
  /** 状态（0正常 1停用） */
  status?: string;
  /** 备注 */
  remark?: string;
  /** 创建时间 */
  createTime?: string;
  /** 更新时间 */
  updateTime?: string;
};

/** 后端参数配置类型 */
export type SysConfig = {
  /** 主键ID（雪花算法） */
  id?: number;
  /** 参数名称 */
  configName?: string;
  /** 参数键名 */
  configKey?: string;
  /** 参数键值 */
  configValue?: string;
  /** 系统内置（Y是 N否） */
  configType?: string;
  /** 备注 */
  remark?: string;
  /** 创建时间 */
  createTime?: string;
  /** 更新时间 */
  updateTime?: string;
};

/** 后端令牌类型 */
export type SysToken = {
  /** 主键ID（雪花算法） */
  id?: number;
  /** 令牌名称 */
  tokenName?: string;
  /** 令牌值 */
  tokenValue?: string;
  /** 令牌类型 */
  tokenType?: string;
  /** 绑定用户ID */
  boundUserId?: number;
  /** 绑定用户名 */
  boundUserName?: string;
  /** 过期时间 */
  expireTime?: string;
  /** 最后使用时间 */
  lastUsedTime?: string;
  /** 状态 */
  status?: string;
  /** 备注 */
  remark?: string;
  /** 创建时间 */
  createTime?: string;
  /** 更新时间 */
  updateTime?: string;
};

// ===== 前端类型定义 =====

/** 参数范围类型 */
export type ParamScope = "global" | "frontend" | "backend" | "task";

/** 系统参数项类型 */
export type ParamItem = {
  /** 参数ID */
  id: string;
  /** 参数键 */
  key: string;
  /** 参数名 */
  name: string;
  /** 参数值 */
  value: string;
  /** 作用范围 */
  scope: ParamScope;
  /** 描述 */
  description: string;
  /** 是否敏感 */
  sensitive: boolean;
  /** 更新时间 */
  updatedAt: string;
};

/** 字典状态类型 */
export type DictStatus = "enabled" | "disabled";

/** 字典项类型 */
export type DictItem = {
  /** 字典ID */
  id: string;
  /** 字典编码 */
  code: string;
  /** 字典名称 */
  name: string;
  /** 分类 */
  category: string;
  /** 描述 */
  description: string;
  /** 项数量 */
  itemCount: number;
  /** 状态 */
  status: DictStatus;
  /** 更新时间 */
  updatedAt: string;
};

/** 令牌状态类型 */
export type TokenStatus = "active" | "expired" | "revoked";

/** 令牌项类型 */
export type TokenItem = {
  /** 令牌ID */
  id: string;
  /** 令牌名称 */
  name: string;
  /** 令牌值 */
  token: string;
  /** 类型 */
  type: "api" | "personal" | "internal";
  /** 绑定用户 */
  boundUser: string;
  /** 创建时间 */
  createdAt: string;
  /** 过期时间 */
  expiredAt: string;
  /** 最后使用时间 */
  lastUsedAt: string | null;
  /** 状态 */
  status: TokenStatus;
  /** 备注 */
  remark: string;
};

/** 权限项类型 */
export type PermissionItem = {
  /** 权限ID */
  id: string;
  /** 权限标识 */
  key: string;
  /** 权限名称 */
  name: string;
  /** 所属模块 */
  module: string;
  /** 描述 */
  description: string;
  /** 类型 */
  type: "menu" | "action" | "data";
  /** 创建时间 */
  createdAt: string;
};

/** 权限分组类型 */
export type PermissionGroup = {
  /** 分组ID */
  id: string;
  /** 分组标签 */
  label: string;
  /** 权限项列表 */
  items: PermissionItem[];
};

/** 字典列表查询参数 */
export type DictListParams = {
  /** 当前页码 */
  page: number;
  /** 每页条数 */
  pageSize: number;
  /** 关键词 */
  keyword?: string;
  /** 状态 */
  status?: string;
};

/** 字典列表响应类型 */
export type DictListResponse = {
  /** 字典列表 */
  list: DictItem[];
  /** 总条数 */
  total: number;
};

/** 保存字典请求参数 */
export type SaveDictRequest = {
  /** 字典ID (更新时必传) */
  id?: string;
  /** 字典编码 */
  code: string;
  /** 字典名称 */
  name: string;
  /** 分类 */
  category: string;
  /** 描述 */
  description: string;
  /** 状态 */
  status: DictStatus;
};

/** 机器人配置类型 */
export type BotConfig = {
  /** 配置ID */
  id: string;
  /** 机器人类型 */
  type: "dingtalk" | "wechat" | "qq" | "napcat";
  /** 机器人名称 */
  name: string;
  /** Webhook地址 */
  webhook?: string;
  /** 密钥 */
  secret?: string;
  /** 令牌 */
  token?: string;
  /** 状态 */
  status: "active" | "inactive";
};

// ===== 字段映射函数 =====

/**
 * 字典数据后端转前端字段映射
 * @param backendData 后端字典数据
 * @returns 前端字典数据
 */
function mapDictDataToFrontend(backendData: SysDictData): DictItem {
  return {
    id: String(backendData.id || ""),
    code: backendData.dictType || "",
    name: backendData.dictLabel || "",
    description: backendData.remark || "",
    status: backendData.status === "0" ? "enabled" : "disabled",
    updatedAt: backendData.updateTime || "",
    category: "",
    itemCount: 0,
  };
}

/**
 * 字典数据前端转后端字段映射
 * @param frontendData 前端字典数据
 * @returns 后端字典数据
 */
function mapDictDataToBackend(frontendData: Partial<SaveDictRequest>): Partial<SysDictData> {
  return {
    id: frontendData.id ? Number(frontendData.id) : undefined,
    dictType: frontendData.code,
    dictLabel: frontendData.name,
    remark: frontendData.description,
    status: frontendData.status === "enabled" ? "0" : "1",
  };
}

/**
 * 参数配置后端转前端字段映射
 * @param backendData 后端参数数据
 * @returns 前端参数数据
 */
function mapConfigToFrontend(backendData: SysConfig): ParamItem {
  return {
    id: String(backendData.id || ""),
    key: backendData.configKey || "",
    name: backendData.configName || "",
    value: backendData.configValue || "",
    description: backendData.remark || "",
    scope: "global",
    sensitive: false,
    updatedAt: backendData.updateTime || "",
  };
}

/**
 * 参数配置前端转后端字段映射
 * @param frontendData 前端参数数据
 * @returns 后端参数数据
 */
function mapConfigToBackend(frontendData: Partial<ParamItem>): Partial<SysConfig> {
  return {
    id: frontendData.id ? Number(frontendData.id) : undefined,
    configKey: frontendData.key,
    configName: frontendData.name,
    configValue: frontendData.value,
    remark: frontendData.description,
  };
}

/**
 * 令牌后端转前端字段映射
 * @param backendData 后端令牌数据
 * @returns 前端令牌数据
 */
function mapTokenToFrontend(backendData: SysToken): TokenItem {
  return {
    id: String(backendData.id || ""),
    name: backendData.tokenName || "",
    token: backendData.tokenValue || "",
    type: (backendData.tokenType || "api") as "api" | "personal" | "internal",
    boundUser: backendData.boundUserName || "",
    createdAt: backendData.createTime || "",
    expiredAt: backendData.expireTime || "",
    lastUsedAt: backendData.lastUsedTime || null,
    status: (backendData.status || "active") as "active" | "expired" | "revoked",
    remark: backendData.remark || "",
  };
}

/**
 * 令牌前端转后端字段映射
 * @param frontendData 前端令牌数据
 * @returns 后端令牌数据
 */
function mapTokenToBackend(frontendData: Partial<TokenItem>): Partial<SysToken> {
  return {
    id: frontendData.id ? Number(frontendData.id) : undefined,
    tokenName: frontendData.name,
    tokenValue: frontendData.token,
    tokenType: frontendData.type,
    boundUserName: frontendData.boundUser,
    expireTime: frontendData.expiredAt,
    status: frontendData.status,
    remark: frontendData.remark,
  };
}

// ===== API 函数 =====

/**
 * 获取字典列表
 * @param params 查询参数
 * @returns 字典列表响应
 */
export async function fetchDictList(
  params: DictListParams
): Promise<ApiResponse<DictListResponse>> {
  /** 字典数据响应 */
  const [dataRes] = await Promise.all([
    handleRequest({
      requestFn: () =>
        request.instance
          .get<ApiResponse<SysDictData[]>>("/system/dict/data/list", { params })
          .then((r) => r.data),
      mockData: [],
      apiName: "fetchDictDataList",
    }),
    handleRequest({
      requestFn: () =>
        request.instance
          .get<ApiResponse<SysDictType[]>>("/system/dict/type/list")
          .then((r) => r.data),
      mockData: [],
      apiName: "fetchDictTypeList",
    }),
  ]);

  /** 合并数据并映射字段 */
  const dictDataList = (dataRes.data || []).map(mapDictDataToFrontend);
  return { code: 200, msg: "ok", data: { list: dictDataList, total: dictDataList.length } };
}

/**
 * 保存字典（新增或更新）
 * @param data 保存参数
 * @param setLoading 设置加载状态的函数
 * @returns 是否保存成功
 */
export async function saveDict(
  data: SaveDictRequest,
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  /** 后端字典数据 */
  const backendData = mapDictDataToBackend(data);

  /** 根据是否有id区分新增和修改 */
  const requestFn = data.id
    ? () => request.instance.put<ApiResponse<boolean>>("/system/dict/data", backendData).then((r) => r.data)
    : () => request.instance.post<ApiResponse<boolean>>("/system/dict/data", backendData).then((r) => r.data);

  return handleRequest({
    requestFn,
    mockData: true,
    apiName: "saveDict",
    setLoading,
  });
}

/**
 * 切换字典状态
 * @param id 字典ID
 * @param status 状态
 * @param setLoading 设置加载状态的函数
 * @returns 是否切换成功
 */
export async function toggleDictStatus(
  id: string,
  status: DictStatus,
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  /** 后端状态值 */
  const backendStatus = status === "enabled" ? "0" : "1";

  return handleRequest({
    requestFn: () =>
      request.instance
        .put<ApiResponse<boolean>>("/system/dict/data/toggleStatus", null, {
          params: { id, status: backendStatus },
        })
        .then((r) => r.data),
    mockData: true,
    apiName: "toggleDictStatus",
    setLoading,
  });
}

/**
 * 批量切换字典状态
 * @param ids 字典ID列表
 * @param status 状态
 * @param setLoading 设置加载状态的函数
 * @returns 是否切换成功
 */
export async function batchToggleDictStatus(
  ids: string[],
  status: DictStatus,
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  /** 后端状态值 */
  const backendStatus = status === "enabled" ? "0" : "1";
  /** 后端ID列表 */
  const backendIds = ids.map(Number);

  return handleRequest({
    requestFn: () =>
      request.instance
        .put<ApiResponse<boolean>>("/system/dict/data/batchToggleStatus", backendIds, {
          params: { status: backendStatus },
        })
        .then((r) => r.data),
    mockData: true,
    apiName: "batchToggleDictStatus",
    setLoading,
  });
}

/**
 * 批量删除字典
 * @param ids 字典ID列表
 * @param setLoading 设置加载状态的函数
 * @returns 是否删除成功
 */
export async function batchDeleteDicts(
  ids: string[],
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  /** 后端ID列表 */
  const backendIds = ids.map(Number).join(",");

  return handleRequest({
    requestFn: () =>
      request.instance
        .delete<ApiResponse<boolean>>(`/system/dict/data/${backendIds}`)
        .then((r) => r.data),
    mockData: true,
    apiName: "batchDeleteDicts",
    setLoading,
  });
}

/**
 * 获取参数列表
 * @param setLoading 设置加载状态的函数
 * @returns 参数列表响应
 */
export async function fetchParamList(
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<ParamItem[]>> {
  const { data } = await handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<SysConfig[]>>("/system/config/list")
        .then((r) => r.data),
    mockData: [],
    apiName: "fetchParamList",
    setLoading,
  });

  /** 映射字段 */
  return {
    code: 200,
    msg: "ok",
    data: (data || []).map(mapConfigToFrontend),
  };
}

/**
 * 保存参数（新增或修改）
 * @param data 参数数据
 * @param setLoading 设置加载状态的函数
 * @returns 是否保存成功
 */
export async function saveParam(
  data: Partial<ParamItem>,
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  /** 后端参数数据 */
  const backendData = mapConfigToBackend(data);

  /** 根据是否有id区分新增和修改 */
  const requestFn = data.id
    ? () => request.instance.put<ApiResponse<boolean>>("/system/config", backendData).then((r) => r.data)
    : () => request.instance.post<ApiResponse<boolean>>("/system/config", backendData).then((r) => r.data);

  return handleRequest({
    requestFn,
    mockData: true,
    apiName: "saveParam",
    setLoading,
  });
}

/**
 * 删除参数
 * @param id 参数ID
 * @param setLoading 设置加载状态的函数
 * @returns 是否删除成功
 */
export async function deleteParam(
  id: string,
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .delete<ApiResponse<boolean>>(`/system/config/${id}`)
        .then((r) => r.data),
    mockData: true,
    apiName: "deleteParam",
    setLoading,
  });
}

/**
 * 批量删除参数
 * @param ids 参数ID列表
 * @param setLoading 设置加载状态的函数
 * @returns 是否删除成功
 */
export async function batchDeleteParams(
  ids: string[],
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  /** 后端ID列表 */
  const backendIds = ids.map(Number).join(",");

  return handleRequest({
    requestFn: () =>
      request.instance
        .delete<ApiResponse<boolean>>(`/system/config/${backendIds}`)
        .then((r) => r.data),
    mockData: true,
    apiName: "batchDeleteParams",
    setLoading,
  });
}

/**
 * 获取令牌列表
 * @param setLoading 设置加载状态的函数
 * @returns 令牌列表响应
 */
export async function fetchTokenList(
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<TokenItem[]>> {
  const { data } = await handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<SysToken[]>>("/system/token/list")
        .then((r) => r.data),
    mockData: [],
    apiName: "fetchTokenList",
    setLoading,
  });

  return {
    code: 200,
    msg: "ok",
    data: (data || []).map(mapTokenToFrontend),
  };
}

/**
 * 保存令牌（新增或修改）
 * @param data 令牌数据
 * @param setLoading 设置加载状态的函数
 * @returns 是否保存成功
 */
export async function saveToken(
  data: Partial<TokenItem>,
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  /** 后端令牌数据 */
  const backendData = mapTokenToBackend(data);

  /** 根据是否有id区分新增和修改 */
  const requestFn = data.id
    ? () => request.instance.put<ApiResponse<boolean>>("/system/token", backendData).then((r) => r.data)
    : () => request.instance.post<ApiResponse<boolean>>("/system/token", backendData).then((r) => r.data);

  return handleRequest({
    requestFn,
    mockData: true,
    apiName: "saveToken",
    setLoading,
  });
}

/**
 * 吊销令牌
 * @param id 令牌ID
 * @param setLoading 设置加载状态的函数
 * @returns 是否吊销成功
 */
export async function revokeToken(
  id: string,
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .put<ApiResponse<boolean>>(`/system/token/revoke/${id}`)
        .then((r) => r.data),
    mockData: true,
    apiName: "revokeToken",
    setLoading,
  });
}

/**
 * 批量吊销令牌
 * @param ids 令牌ID列表
 * @param setLoading 设置加载状态的函数
 * @returns 是否吊销成功
 */
export async function batchRevokeTokens(
  ids: string[],
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  /** 后端ID列表 */
  const backendIds = ids.map(Number);

  return handleRequest({
    requestFn: () =>
      request.instance
        .put<ApiResponse<boolean>>("/system/token/revokeBatch", backendIds)
        .then((r) => r.data),
    mockData: true,
    apiName: "batchRevokeTokens",
    setLoading,
  });
}

/**
 * 删除令牌
 * @param id 令牌ID
 * @param setLoading 设置加载状态的函数
 * @returns 是否删除成功
 */
export async function deleteToken(
  id: string,
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .delete<ApiResponse<boolean>>(`/system/token/${id}`)
        .then((r) => r.data),
    mockData: true,
    apiName: "deleteToken",
    setLoading,
  });
}

/**
 * 批量删除令牌
 * @param ids 令牌ID列表
 * @param setLoading 设置加载状态的函数
 * @returns 是否删除成功
 */
export async function batchDeleteTokens(
  ids: string[],
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  /** 后端ID列表 */
  const backendIds = ids.map(Number).join(",");

  return handleRequest({
    requestFn: () =>
      request.instance
        .delete<ApiResponse<boolean>>(`/system/token/${backendIds}`)
        .then((r) => r.data),
    mockData: true,
    apiName: "batchDeleteTokens",
    setLoading,
  });
}

/**
 * 获取权限列表
 * @param setLoading 设置加载状态的函数
 * @returns 权限列表响应
 */
export async function fetchPermissionList(
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<PermissionGroup[]>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<PermissionGroup[]>>("/system/permission/list")
        .then((r) => r.data),
    mockData: mockPermissionGroups,
    apiName: "fetchPermissionList",
    setLoading,
  });
}

/**
 * 获取机器人配置列表
 * @param setLoading 设置加载状态的函数
 * @returns 机器人配置列表响应
 */
export async function fetchBotConfigs(
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<BotConfig[]>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<BotConfig[]>>("/system/bot/list")
        .then((r) => r.data),
    mockData: [],
    apiName: "fetchBotConfigs",
    setLoading,
  });
}

/**
 * 保存机器人配置
 * @param data 保存参数
 * @param setLoading 设置加载状态的函数
 * @returns 是否保存成功
 */
export async function saveBotConfig(
  data: BotConfig,
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .post<ApiResponse<boolean>>("/system/bot/save", data)
        .then((r) => r.data),
    mockData: true,
    apiName: "saveBotConfig",
    setLoading,
  });
}
