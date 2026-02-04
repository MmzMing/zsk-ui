// ===== 1. 依赖导入区域 =====
import { request, handleRequestWithMock, handleApiCall } from "../axios";
import {
  mockSystemParams,
  mockInitialDicts,
  mockInitialTokens,
} from "../mock/admin/system";
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

/**
 * 参数范围类型
 */
export type ParamScope = "global" | "frontend" | "backend" | "task";

/**
 * 系统参数项类型
 */
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

/**
 * 字典状态类型
 */
export type DictStatus = "enabled" | "disabled";

/**
 * 字典项类型
 */
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

/**
 * 令牌状态类型
 */
export type TokenStatus = "active" | "expired" | "revoked";

/**
 * 令牌项类型
 */
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

/**
 * 权限项类型
 */
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

/**
 * 权限分组类型
 */
export type PermissionGroup = {
  /** 分组ID */
  id: string;
  /** 分组标签 */
  label: string;
  /** 权限项列表 */
  items: PermissionItem[];
};

/**
 * 字典列表查询参数
 */
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

/**
 * 字典列表响应类型
 */
export type DictListResponse = {
  /** 字典列表 */
  list: DictItem[];
  /** 总条数 */
  total: number;
};

/**
 * 保存字典请求参数
 */
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

/**
 * 机器人配置类型
 */
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

/**
 * 获取字典列表
 * @param params 查询参数
 * @param setLoading 设置加载状态的函数
 * @returns 字典列表响应
 */
export async function fetchDictList(
  params: DictListParams,
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<DictListResponse>> {
  return handleApiCall({
    requestFn: () =>
      handleRequestWithMock(
        () =>
          request.instance
            .get<ApiResponse<DictListResponse>>("/admin/system/dict/list", {
              params,
            })
            .then((r) => r.data),
        {
          list: mockInitialDicts,
          total: mockInitialDicts.length,
        },
        "fetchDictList"
      ),
    setLoading,
  });
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
  return handleApiCall({
    requestFn: () =>
      handleRequestWithMock(
        () =>
          request.instance
            .post<ApiResponse<boolean>>("/admin/system/dict/save", data)
            .then((r) => r.data),
        true,
        "saveDict"
      ),
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
  return handleApiCall({
    requestFn: () =>
      handleRequestWithMock(
        () =>
          request.instance
            .post<ApiResponse<boolean>>("/admin/system/dict/toggle-status", {
              id,
              status,
            })
            .then((r) => r.data),
        true,
        "toggleDictStatus"
      ),
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
  return handleApiCall({
    requestFn: () =>
      handleRequestWithMock(
        () =>
          request.instance
            .post<ApiResponse<boolean>>("/admin/system/dict/batch-toggle-status", {
              ids,
              status,
            })
            .then((r) => r.data),
        true,
        "batchToggleDictStatus"
      ),
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
  return handleApiCall({
    requestFn: () =>
      handleRequestWithMock(
        () =>
          request.instance
            .post<ApiResponse<boolean>>("/admin/system/dict/batch-delete", { ids })
            .then((r) => r.data),
        true,
        "batchDeleteDicts"
      ),
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
  return handleApiCall({
    requestFn: () =>
      handleRequestWithMock(
        () =>
          request.instance
            .get<ApiResponse<ParamItem[]>>("/admin/system/param/list")
            .then((r) => r.data),
        mockSystemParams,
        "fetchParamList"
      ),
    setLoading,
  });
}

/**
 * 保存参数
 * @param data 保存参数
 * @param setLoading 设置加载状态的函数
 * @returns 是否保存成功
 */
export async function saveParam(
  data: Partial<ParamItem>,
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  return handleApiCall({
    requestFn: () =>
      handleRequestWithMock(
        () =>
          request.instance
            .post<ApiResponse<boolean>>("/admin/system/param/save", data)
            .then((r) => r.data),
        true,
        "saveParam"
      ),
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
  return handleApiCall({
    requestFn: () =>
      handleRequestWithMock(
        () =>
          request.instance
            .post<ApiResponse<boolean>>("/admin/system/param/delete", { id })
            .then((r) => r.data),
        true,
        "deleteParam"
      ),
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
  return handleApiCall({
    requestFn: () =>
      handleRequestWithMock(
        () =>
          request.instance
            .post<ApiResponse<boolean>>("/admin/system/param/batch-delete", { ids })
            .then((r) => r.data),
        true,
        "batchDeleteParams"
      ),
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
  return handleApiCall({
    requestFn: () =>
      handleRequestWithMock(
        () =>
          request.instance
            .get<ApiResponse<TokenItem[]>>("/admin/system/token/list")
            .then((r) => r.data),
        mockInitialTokens,
        "fetchTokenList"
      ),
    setLoading,
  });
}

/**
 * 保存令牌
 * @param data 保存参数
 * @param setLoading 设置加载状态的函数
 * @returns 是否保存成功
 */
export async function saveToken(
  data: Partial<TokenItem>,
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  return handleApiCall({
    requestFn: () =>
      handleRequestWithMock(
        () =>
          request.instance
            .post<ApiResponse<boolean>>("/admin/system/token/save", data)
            .then((r) => r.data),
        true,
        "saveToken"
      ),
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
  return handleApiCall({
    requestFn: () =>
      handleRequestWithMock(
        () =>
          request.instance
            .post<ApiResponse<boolean>>("/admin/system/token/revoke", { id })
            .then((r) => r.data),
        true,
        "revokeToken"
      ),
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
  return handleApiCall({
    requestFn: () =>
      handleRequestWithMock(
        () =>
          request.instance
            .post<ApiResponse<boolean>>("/admin/system/token/batch-revoke", { ids })
            .then((r) => r.data),
        true,
        "batchRevokeTokens"
      ),
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
  return handleApiCall({
    requestFn: () =>
      handleRequestWithMock(
        () =>
          request.instance
            .post<ApiResponse<boolean>>("/admin/system/token/delete", { id })
            .then((r) => r.data),
        true,
        "deleteToken"
      ),
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
  return handleApiCall({
    requestFn: () =>
      handleRequestWithMock(
        () =>
          request.instance
            .post<ApiResponse<boolean>>("/admin/system/token/batch-delete", { ids })
            .then((r) => r.data),
        true,
        "batchDeleteTokens"
      ),
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
  return handleApiCall({
    requestFn: () =>
      handleRequestWithMock(
        () =>
          request.instance
            .get<ApiResponse<PermissionGroup[]>>("/admin/system/permission/list")
            .then((r) => r.data),
        mockPermissionGroups,
        "fetchPermissionList"
      ),
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
  return handleApiCall({
    requestFn: () =>
      handleRequestWithMock(
        () =>
          request.instance
            .get<ApiResponse<BotConfig[]>>("/admin/bot/list")
            .then((r) => r.data),
        [],
        "fetchBotConfigs"
      ),
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
  return handleApiCall({
    requestFn: () =>
      handleRequestWithMock(
        () =>
          request.instance
            .post<ApiResponse<boolean>>("/admin/bot/save", data)
            .then((r) => r.data),
        true,
        "saveBotConfig"
      ),
    setLoading,
  });
}
