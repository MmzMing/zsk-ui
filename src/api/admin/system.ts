import { request, handleRequest } from "../request";
import type { ApiResponse } from "../types";

// ===== 类型定义 =====

/**
 * 字典数据类型
 * @description 对应后端 sys_dict_data 表的实体结构
 */
export type SysDictData = {
  /** 字典编码（主键） */
  id?: number;
  /** 字典编码（业务编码） */
  dictCode?: string;
  /** 字典排序 */
  dictSort?: number;
  /** 字典标签 */
  dictLabel?: string;
  /** 字典键值 */
  dictValue?: string;
  /** 字典类型 */
  dictType?: string;
  /** 样式属性（CSS类名） */
  cssClass?: string;
  /** 表格回显样式 */
  listClass?: string;
  /** 是否默认（0-否 1-是） */
  isDefault?: string;
  /** 状态（0-正常 1-停用） */
  status?: string;
  /** 备注 */
  remark?: string;
  /** 创建时间 */
  createTime?: string;
  /** 更新时间 */
  updateTime?: string;
};

/**
 * 字典类型
 * @description 对应后端 sys_dict_type 表的实体结构
 */
export type SysDictType = {
  /** 字典主键 */
  id?: number;
  /** 字典名称 */
  dictName?: string;
  /** 字典类型 */
  dictType?: string;
  /** 状态（0-正常 1-停用） */
  status?: string;
  /** 备注 */
  remark?: string;
  /** 创建时间 */
  createTime?: string;
  /** 更新时间 */
  updateTime?: string;
};

/**
 * 系统配置类型
 * @description 对应后端 sys_config 表的实体结构
 */
export type SysConfig = {
  /** 参数主键 */
  id?: number;
  /** 参数名称 */
  configName?: string;
  /** 参数键名 */
  configKey?: string;
  /** 参数键值 */
  configValue?: string;
  /** 系统内置（0-是 1-否） */
  configType?: string;
  /** 备注 */
  remark?: string;
  /** 创建时间 */
  createTime?: string;
  /** 更新时间 */
  updateTime?: string;
};

/**
 * 令牌类型
 * @description 对应后端 sys_token 表的实体结构
 */
export type SysToken = {
  /** 令牌主键 */
  id?: number;
  /** 令牌名称 */
  tokenName?: string;
  /** 令牌值 */
  token?: string;
  /** 令牌值（别名） */
  tokenValue?: string;
  /** 令牌类型（api-接口令牌 personal-个人令牌 internal-内部令牌） */
  tokenType?: string;
  /** 绑定用户ID */
  boundUserId?: number;
  /** 绑定用户名 */
  boundUserName?: string;
  /** 用户名 */
  userName?: string;
  /** 过期时间 */
  expireTime?: string;
  /** 最后使用时间 */
  lastUsedTime?: string;
  /** 状态（active-有效 expired-过期 revoked-撤销） */
  status?: string;
  /** 备注 */
  remark?: string;
  /** 创建时间 */
  createTime?: string;
  /** 更新时间 */
  updateTime?: string;
};

/**
 * 权限项
 */
export type PermissionItem = {
  id: string;
  key: string;
  name: string;
  module: string;
  description: string;
  type: "menu" | "action" | "data";
  createdAt: string;
};

/**
 * 权限分组
 */
export type PermissionGroup = {
  id: string;
  label: string;
  items: PermissionItem[];
};

/**
 * 机器人配置
 */
export type BotConfig = {
  id: string;
  type: "dingtalk" | "wechat" | "qq" | "napcat";
  name: string;
  webhook?: string;
  secret?: string;
  token?: string;
  status: "active" | "inactive";
};

/**
 * 分页结果类型
 */
export type PageResult<T> = {
  rows: T[];
  total: number;
};

// ===== 字典管理 API =====

/**
 * 获取字典数据列表
 */
export async function fetchDictDataList(
  params?: { page?: number; pageSize?: number; keyword?: string; status?: string },
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<PageResult<SysDictData>>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<PageResult<SysDictData>>>("/system/dict/data/list", { params })
        .then((r) => r.data),
    apiName: "fetchDictDataList",
    setLoading,
  });
}

/**
 * 获取字典类型列表
 */
export async function fetchDictTypeList(
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<SysDictType[]>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<SysDictType[]>>("/system/dict/type/list")
        .then((r) => r.data),
    apiName: "fetchDictTypeList",
    setLoading,
  });
}

/**
 * 保存字典数据
 */
export async function saveDictData(
  data: Partial<SysDictData>,
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  const requestFn = data.id
    ? () =>
        request.instance
          .put<ApiResponse<boolean>>("/system/dict/data", data)
          .then((r) => r.data)
    : () =>
        request.instance
          .post<ApiResponse<boolean>>("/system/dict/data", data)
          .then((r) => r.data);

  return handleRequest({
    requestFn,
    apiName: "saveDictData",
    setLoading,
  });
}

/**
 * 切换字典状态
 */
export async function toggleDictStatus(
  id: number,
  status: string,
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .put<ApiResponse<boolean>>("/system/dict/data/toggleStatus", null, {
          params: { id, status },
        })
        .then((r) => r.data),
    apiName: "toggleDictStatus",
    setLoading,
  });
}

/**
 * 批量切换字典状态
 */
export async function batchToggleDictStatus(
  ids: number[],
  status: string,
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .put<ApiResponse<boolean>>("/system/dict/data/batchToggleStatus", ids, {
          params: { status },
        })
        .then((r) => r.data),
    apiName: "batchToggleDictStatus",
    setLoading,
  });
}

/**
 * 批量删除字典
 */
export async function batchDeleteDicts(
  ids: number[],
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  const idsStr = ids.join(",");
  return handleRequest({
    requestFn: () =>
      request.instance
        .delete<ApiResponse<boolean>>(`/system/dict/data/${idsStr}`)
        .then((r) => r.data),
    apiName: "batchDeleteDicts",
    setLoading,
  });
}

// ===== 参数配置 API =====

/**
 * 获取参数配置列表
 */
export async function fetchConfigList(
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<PageResult<SysConfig>>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<PageResult<SysConfig>>>("/system/config/list")
        .then((r) => r.data),
    apiName: "fetchConfigList",
    setLoading,
  });
}

/**
 * 保存参数配置
 */
export async function saveConfig(
  data: Partial<SysConfig>,
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  const requestFn = data.id
    ? () =>
        request.instance
          .put<ApiResponse<boolean>>("/system/config", data)
          .then((r) => r.data)
    : () =>
        request.instance
          .post<ApiResponse<boolean>>("/system/config", data)
          .then((r) => r.data);

  return handleRequest({
    requestFn,
    apiName: "saveConfig",
    setLoading,
  });
}

/**
 * 删除参数配置
 */
export async function deleteConfig(
  id: number,
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .delete<ApiResponse<boolean>>(`/system/config/${id}`)
        .then((r) => r.data),
    apiName: "deleteConfig",
    setLoading,
  });
}

/**
 * 批量删除参数配置
 */
export async function batchDeleteConfigs(
  ids: number[],
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  const idsStr = ids.join(",");
  return handleRequest({
    requestFn: () =>
      request.instance
        .delete<ApiResponse<boolean>>(`/system/config/${idsStr}`)
        .then((r) => r.data),
    apiName: "batchDeleteConfigs",
    setLoading,
  });
}

// ===== 令牌管理 API =====

/**
 * 获取令牌列表
 */
export async function fetchTokenList(
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<PageResult<SysToken>>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<PageResult<SysToken>>>("/system/token/list")
        .then((r) => r.data),
    apiName: "fetchTokenList",
    setLoading,
  });
}

/**
 * 保存令牌
 */
export async function saveToken(
  data: Partial<SysToken>,
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  const requestFn = data.id
    ? () =>
        request.instance
          .put<ApiResponse<boolean>>("/system/token", data)
          .then((r) => r.data)
    : () =>
        request.instance
          .post<ApiResponse<boolean>>("/system/token", data)
          .then((r) => r.data);

  return handleRequest({
    requestFn,
    apiName: "saveToken",
    setLoading,
  });
}

/**
 * 撤销令牌
 */
export async function revokeToken(
  id: number,
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .put<ApiResponse<boolean>>(`/system/token/revoke/${id}`)
        .then((r) => r.data),
    apiName: "revokeToken",
    setLoading,
  });
}

/**
 * 批量撤销令牌
 */
export async function batchRevokeTokens(
  ids: number[],
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .put<ApiResponse<boolean>>("/system/token/revokeBatch", ids)
        .then((r) => r.data),
    apiName: "batchRevokeTokens",
    setLoading,
  });
}

/**
 * 删除令牌
 */
export async function deleteToken(
  id: number,
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .delete<ApiResponse<boolean>>(`/system/token/${id}`)
        .then((r) => r.data),
    apiName: "deleteToken",
    setLoading,
  });
}

/**
 * 批量删除令牌
 */
export async function batchDeleteTokens(
  ids: number[],
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  const idsStr = ids.join(",");
  return handleRequest({
    requestFn: () =>
      request.instance
        .delete<ApiResponse<boolean>>(`/system/token/${idsStr}`)
        .then((r) => r.data),
    apiName: "batchDeleteTokens",
    setLoading,
  });
}

// ===== 权限管理 API =====

/**
 * 获取权限列表
 */
export async function fetchPermissionList(
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<PermissionGroup[]>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<PermissionGroup[]>>("/system/permission/list")
        .then((r) => r.data),
    apiName: "fetchPermissionList",
    setLoading,
  });
}

// ===== 机器人配置 API =====

/**
 * 获取机器人配置列表
 */
export async function fetchBotConfigs(
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<BotConfig[]>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<BotConfig[]>>("/system/bot/list")
        .then((r) => r.data),
    apiName: "fetchBotConfigs",
    setLoading,
  });
}

/**
 * 保存机器人配置
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
    apiName: "saveBotConfig",
    setLoading,
  });
}
