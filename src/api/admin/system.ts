/**
 * 系统管理相关 API
 * @module api/admin/system
 * @description 提供字典管理、参数配置、令牌管理、权限管理、机器人配置等功能接口
 */

import { request, handleRequest } from "../request";
import type { ApiResponse } from "../types";

/**
 * 后端字典数据类型
 * @description 对应后端 sys_dict_data 表的实体结构
 */
export type SysDictData = {
  /** 字典编码（主键） */
  id?: number;
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
 * 后端字典类型
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
 * 后端系统配置类型
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
 * 后端令牌类型
 * @description 对应后端 sys_token 表的实体结构
 */
export type SysToken = {
  /** 令牌主键 */
  id?: number;
  /** 令牌名称 */
  tokenName?: string;
  /** 令牌值 */
  tokenValue?: string;
  /** 令牌类型（api-接口令牌 personal-个人令牌 internal-内部令牌） */
  tokenType?: string;
  /** 绑定用户ID */
  boundUserId?: number;
  /** 绑定用户名 */
  boundUserName?: string;
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
 * 参数作用域类型
 * @description 参数配置的作用范围
 * - global: 全局参数
 * - frontend: 前端参数
 * - backend: 后端参数
 * - task: 任务参数
 */
export type ParamScope = "global" | "frontend" | "backend" | "task";

/**
 * 参数配置项
 * @description 用于系统参数配置列表展示
 */
export type ParamItem = {
  /** 参数ID */
  id: string;
  /** 参数键名 */
  key: string;
  /** 参数名称 */
  name: string;
  /** 参数值 */
  value: string;
  /** 作用域 */
  scope: ParamScope;
  /** 参数描述 */
  description: string;
  /** 是否敏感参数 */
  sensitive: boolean;
  /** 更新时间 */
  updatedAt: string;
};

/**
 * 字典状态类型
 * @description 字典的启用/停用状态
 */
export type DictStatus = "enabled" | "disabled";

/**
 * 字典项
 * @description 用于字典列表展示的单条数据
 */
export type DictItem = {
  /** 字典ID */
  id: string;
  /** 字典编码 */
  code: string;
  /** 字典名称 */
  name: string;
  /** 字典分类 */
  category: string;
  /** 字典描述 */
  description: string;
  /** 字典项数量 */
  itemCount: number;
  /** 字典状态 */
  status: DictStatus;
  /** 更新时间 */
  updatedAt: string;
};

/**
 * 令牌状态类型
 * @description 令牌的有效性状态
 * - active: 有效
 * - expired: 已过期
 * - revoked: 已撤销
 */
export type TokenStatus = "active" | "expired" | "revoked";

/**
 * 令牌项
 * @description 用于令牌列表展示的单条数据
 */
export type TokenItem = {
  /** 令牌ID */
  id: string;
  /** 令牌名称 */
  name: string;
  /** 令牌值（脱敏显示） */
  token: string;
  /** 令牌类型：api-接口令牌，personal-个人令牌，internal-内部令牌 */
  type: "api" | "personal" | "internal";
  /** 绑定用户 */
  boundUser: string;
  /** 创建时间 */
  createdAt: string;
  /** 过期时间 */
  expiredAt: string;
  /** 最后使用时间 */
  lastUsedAt: string | null;
  /** 令牌状态 */
  status: TokenStatus;
  /** 备注 */
  remark: string;
};

/**
 * 权限项
 * @description 单个权限的详细信息
 */
export type PermissionItem = {
  /** 权限ID */
  id: string;
  /** 权限标识键 */
  key: string;
  /** 权限名称 */
  name: string;
  /** 所属模块 */
  module: string;
  /** 权限描述 */
  description: string;
  /** 权限类型：menu-菜单权限，action-操作权限，data-数据权限 */
  type: "menu" | "action" | "data";
  /** 创建时间 */
  createdAt: string;
};

/**
 * 权限分组
 * @description 按模块分组的权限列表
 */
export type PermissionGroup = {
  /** 分组ID */
  id: string;
  /** 分组名称 */
  label: string;
  /** 权限项列表 */
  items: PermissionItem[];
};

/**
 * 字典列表查询参数
 * @description 分页查询字典列表的请求参数
 */
export type DictListParams = {
  /** 当前页码，从1开始 */
  page: number;
  /** 每页条数 */
  pageSize: number;
  /** 关键字搜索 */
  keyword?: string;
  /** 状态筛选 */
  status?: string;
};

/**
 * 字典列表响应数据
 * @description 分页查询字典列表的返回结构
 */
export type DictListResponse = {
  /** 字典列表 */
  list: DictItem[];
  /** 总条数 */
  total: number;
};

/**
 * 保存字典请求参数
 * @description 创建或更新字典时提交的数据结构
 */
export type SaveDictRequest = {
  /** 字典ID（更新时存在） */
  id?: string;
  /** 字典编码 */
  code: string;
  /** 字典名称 */
  name: string;
  /** 字典分类 */
  category: string;
  /** 字典描述 */
  description: string;
  /** 字典状态 */
  status: DictStatus;
};

/**
 * 机器人配置
 * @description 第三方机器人通知配置
 */
export type BotConfig = {
  /** 配置ID */
  id: string;
  /** 机器人类型：dingtalk-钉钉，wechat-企业微信，qq-QQ机器人，napcat-NapCat */
  type: "dingtalk" | "wechat" | "qq" | "napcat";
  /** 配置名称 */
  name: string;
  /** Webhook地址 */
  webhook?: string;
  /** 密钥 */
  secret?: string;
  /** 访问令牌 */
  token?: string;
  /** 配置状态：active-启用，inactive-停用 */
  status: "active" | "inactive";
};

/**
 * 字典数据后端转前端字段映射
 * @description 将后端 SysDictData 类型转换为前端 DictItem 类型
 * @param backendData 后端字典数据
 * @returns 前端字典数据
 */
const mapDictDataToFrontend = (backendData: SysDictData): DictItem => ({
  id: String(backendData.id || ""),
  code: backendData.dictType || "",
  name: backendData.dictLabel || "",
  description: backendData.remark || "",
  status: backendData.status === "0" ? "enabled" : "disabled",
  updatedAt: backendData.updateTime || "",
  category: "",
  itemCount: 0,
});

/**
 * 字典数据前端转后端字段映射
 * @description 将前端 SaveDictRequest 类型转换为后端 SysDictData 类型
 * @param frontendData 前端字典数据
 * @returns 后端字典数据
 */
const mapDictDataToBackend = (
  frontendData: Partial<SaveDictRequest>
): Partial<SysDictData> => ({
  id: frontendData.id ? Number(frontendData.id) : undefined,
  dictType: frontendData.code,
  dictLabel: frontendData.name,
  remark: frontendData.description,
  status: frontendData.status === "enabled" ? "0" : "1",
});

/**
 * 系统配置后端转前端字段映射
 * @description 将后端 SysConfig 类型转换为前端 ParamItem 类型
 * @param backendData 后端配置数据
 * @returns 前端参数数据
 */
const mapConfigToFrontend = (backendData: SysConfig): ParamItem => ({
  id: String(backendData.id || ""),
  key: backendData.configKey || "",
  name: backendData.configName || "",
  value: backendData.configValue || "",
  description: backendData.remark || "",
  scope: "global",
  sensitive: false,
  updatedAt: backendData.updateTime || "",
});

/**
 * 系统配置前端转后端字段映射
 * @description 将前端 ParamItem 类型转换为后端 SysConfig 类型
 * @param frontendData 前端参数数据
 * @returns 后端配置数据
 */
const mapConfigToBackend = (
  frontendData: Partial<ParamItem>
): Partial<SysConfig> => ({
  id: frontendData.id ? Number(frontendData.id) : undefined,
  configKey: frontendData.key,
  configName: frontendData.name,
  configValue: frontendData.value,
  remark: frontendData.description,
});

/**
 * 令牌数据后端转前端字段映射
 * @description 将后端 SysToken 类型转换为前端 TokenItem 类型
 * @param backendData 后端令牌数据
 * @returns 前端令牌数据
 */
const mapTokenToFrontend = (backendData: SysToken): TokenItem => ({
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
});

/**
 * 令牌数据前端转后端字段映射
 * @description 将前端 TokenItem 类型转换为后端 SysToken 类型
 * @param frontendData 前端令牌数据
 * @returns 后端令牌数据
 */
const mapTokenToBackend = (
  frontendData: Partial<TokenItem>
): Partial<SysToken> => ({
  id: frontendData.id ? Number(frontendData.id) : undefined,
  tokenName: frontendData.name,
  tokenValue: frontendData.token,
  tokenType: frontendData.type,
  boundUserName: frontendData.boundUser,
  expireTime: frontendData.expiredAt,
  status: frontendData.status,
  remark: frontendData.remark,
});

/**
 * 获取字典列表
 * @description 分页查询字典数据列表，同时获取字典类型
 * @param params 查询参数
 * @returns 字典列表及总数
 */
export async function fetchDictList(
  params: DictListParams
): Promise<ApiResponse<DictListResponse>> {
  const [dataRes] = await Promise.all([
    handleRequest({
      requestFn: () =>
        request.instance
          .get<ApiResponse<SysDictData[]>>("/system/dict/data/list", { params })
          .then((r) => r.data),
      apiName: "fetchDictDataList",
    }),
    handleRequest({
      requestFn: () =>
        request.instance
          .get<ApiResponse<SysDictType[]>>("/system/dict/type/list")
          .then((r) => r.data),
      apiName: "fetchDictTypeList",
    }),
  ]);

  const dictDataList = (dataRes.data || []).map(mapDictDataToFrontend);
  return { code: 200, msg: "ok", data: { list: dictDataList, total: dictDataList.length } };
}

/**
 * 保存字典
 * @description 创建或更新字典数据
 * @param data 字典数据，有id时为更新，无id时为创建
 * @param setLoading 加载状态回调函数（可选）
 * @returns 是否保存成功
 */
export async function saveDict(
  data: SaveDictRequest,
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  const backendData = mapDictDataToBackend(data);

  const requestFn = data.id
    ? () =>
        request.instance
          .put<ApiResponse<boolean>>("/system/dict/data", backendData)
          .then((r) => r.data)
    : () =>
        request.instance
          .post<ApiResponse<boolean>>("/system/dict/data", backendData)
          .then((r) => r.data);

  return handleRequest({
    requestFn,
    apiName: "saveDict",
    setLoading,
  });
}

/**
 * 切换字典状态
 * @description 启用或停用指定字典
 * @param id 字典ID
 * @param status 目标状态（enabled-启用，disabled-停用）
 * @param setLoading 加载状态回调函数（可选）
 * @returns 是否操作成功
 */
export async function toggleDictStatus(
  id: string,
  status: DictStatus,
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  const backendStatus = status === "enabled" ? "0" : "1";

  return handleRequest({
    requestFn: () =>
      request.instance
        .put<ApiResponse<boolean>>("/system/dict/data/toggleStatus", null, {
          params: { id, status: backendStatus },
        })
        .then((r) => r.data),
    apiName: "toggleDictStatus",
    setLoading,
  });
}

/**
 * 批量切换字典状态
 * @description 批量启用或停用多个字典
 * @param ids 字典ID列表
 * @param status 目标状态（enabled-启用，disabled-停用）
 * @param setLoading 加载状态回调函数（可选）
 * @returns 是否操作成功
 */
export async function batchToggleDictStatus(
  ids: string[],
  status: DictStatus,
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  const backendStatus = status === "enabled" ? "0" : "1";
  const backendIds = ids.map(Number);

  return handleRequest({
    requestFn: () =>
      request.instance
        .put<ApiResponse<boolean>>(
          "/system/dict/data/batchToggleStatus",
          backendIds,
          { params: { status: backendStatus } }
        )
        .then((r) => r.data),
    apiName: "batchToggleDictStatus",
    setLoading,
  });
}

/**
 * 批量删除字典
 * @description 批量删除多个字典数据
 * @param ids 字典ID列表
 * @param setLoading 加载状态回调函数（可选）
 * @returns 是否删除成功
 */
export async function batchDeleteDicts(
  ids: string[],
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  const backendIds = ids.map(Number).join(",");

  return handleRequest({
    requestFn: () =>
      request.instance
        .delete<ApiResponse<boolean>>(`/system/dict/data/${backendIds}`)
        .then((r) => r.data),
    apiName: "batchDeleteDicts",
    setLoading,
  });
}

/**
 * 获取参数配置列表
 * @description 获取所有系统参数配置
 * @param setLoading 加载状态回调函数（可选）
 * @returns 参数配置列表
 */
export async function fetchParamList(
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<ParamItem[]>> {
  const { data } = await handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<SysConfig[]>>("/system/config/list")
        .then((r) => r.data),
    apiName: "fetchParamList",
    setLoading,
  });

  return {
    code: 200,
    msg: "ok",
    data: (data || []).map(mapConfigToFrontend),
  };
}

/**
 * 保存参数配置
 * @description 创建或更新系统参数配置
 * @param data 参数数据，有id时为更新，无id时为创建
 * @param setLoading 加载状态回调函数（可选）
 * @returns 是否保存成功
 */
export async function saveParam(
  data: Partial<ParamItem>,
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  const backendData = mapConfigToBackend(data);

  const requestFn = data.id
    ? () =>
        request.instance
          .put<ApiResponse<boolean>>("/system/config", backendData)
          .then((r) => r.data)
    : () =>
        request.instance
          .post<ApiResponse<boolean>>("/system/config", backendData)
          .then((r) => r.data);

  return handleRequest({
    requestFn,
    apiName: "saveParam",
    setLoading,
  });
}

/**
 * 删除参数配置
 * @description 删除指定的系统参数配置
 * @param id 参数ID
 * @param setLoading 加载状态回调函数（可选）
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
    apiName: "deleteParam",
    setLoading,
  });
}

/**
 * 批量删除参数配置
 * @description 批量删除多个系统参数配置
 * @param ids 参数ID列表
 * @param setLoading 加载状态回调函数（可选）
 * @returns 是否删除成功
 */
export async function batchDeleteParams(
  ids: string[],
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  const backendIds = ids.map(Number).join(",");

  return handleRequest({
    requestFn: () =>
      request.instance
        .delete<ApiResponse<boolean>>(`/system/config/${backendIds}`)
        .then((r) => r.data),
    apiName: "batchDeleteParams",
    setLoading,
  });
}

/**
 * 获取令牌列表
 * @description 获取所有API令牌和个人访问令牌
 * @param setLoading 加载状态回调函数（可选）
 * @returns 令牌列表
 */
export async function fetchTokenList(
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<TokenItem[]>> {
  const { data } = await handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<SysToken[]>>("/system/token/list")
        .then((r) => r.data),
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
 * 保存令牌
 * @description 创建或更新令牌
 * @param data 令牌数据，有id时为更新，无id时为创建
 * @param setLoading 加载状态回调函数（可选）
 * @returns 是否保存成功
 */
export async function saveToken(
  data: Partial<TokenItem>,
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  const backendData = mapTokenToBackend(data);

  const requestFn = data.id
    ? () =>
        request.instance
          .put<ApiResponse<boolean>>("/system/token", backendData)
          .then((r) => r.data)
    : () =>
        request.instance
          .post<ApiResponse<boolean>>("/system/token", backendData)
          .then((r) => r.data);

  return handleRequest({
    requestFn,
    apiName: "saveToken",
    setLoading,
  });
}

/**
 * 撤销令牌
 * @description 撤销指定令牌，使其立即失效
 * @param id 令牌ID
 * @param setLoading 加载状态回调函数（可选）
 * @returns 是否撤销成功
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
    apiName: "revokeToken",
    setLoading,
  });
}

/**
 * 批量撤销令牌
 * @description 批量撤销多个令牌，使其立即失效
 * @param ids 令牌ID列表
 * @param setLoading 加载状态回调函数（可选）
 * @returns 是否撤销成功
 */
export async function batchRevokeTokens(
  ids: string[],
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  const backendIds = ids.map(Number);

  return handleRequest({
    requestFn: () =>
      request.instance
        .put<ApiResponse<boolean>>("/system/token/revokeBatch", backendIds)
        .then((r) => r.data),
    apiName: "batchRevokeTokens",
    setLoading,
  });
}

/**
 * 删除令牌
 * @description 删除指定令牌记录
 * @param id 令牌ID
 * @param setLoading 加载状态回调函数（可选）
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
    apiName: "deleteToken",
    setLoading,
  });
}

/**
 * 批量删除令牌
 * @description 批量删除多个令牌记录
 * @param ids 令牌ID列表
 * @param setLoading 加载状态回调函数（可选）
 * @returns 是否删除成功
 */
export async function batchDeleteTokens(
  ids: string[],
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  const backendIds = ids.map(Number).join(",");

  return handleRequest({
    requestFn: () =>
      request.instance
        .delete<ApiResponse<boolean>>(`/system/token/${backendIds}`)
        .then((r) => r.data),
    apiName: "batchDeleteTokens",
    setLoading,
  });
}

/**
 * 获取权限列表
 * @description 获取所有权限并按模块分组
 * @param setLoading 加载状态回调函数（可选）
 * @returns 权限分组列表
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

/**
 * 获取机器人配置列表
 * @description 获取所有第三方机器人通知配置
 * @param setLoading 加载状态回调函数（可选）
 * @returns 机器人配置列表
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
 * @description 创建或更新机器人通知配置
 * @param data 机器人配置数据
 * @param setLoading 加载状态回调函数（可选）
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
    apiName: "saveBotConfig",
    setLoading,
  });
}
