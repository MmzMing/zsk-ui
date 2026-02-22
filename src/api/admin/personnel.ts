import { request, handleRequest } from "../request";
import type { ApiResponse } from "../types";

// ===== 类型定义 =====

/**
 * 用户类型
 * @description 对应后端 sys_user 表的实体结构
 */
export type SysUser = {
  /** 用户ID（主键，自增） */
  id?: number;
  /** 用户名（登录账号，唯一） */
  userName?: string;
  /** 用户昵称 */
  nickName?: string;
  /** 用户类型（00-系统用户 01-普通用户） */
  userType?: string;
  /** 用户邮箱 */
  email?: string;
  /** 手机号码 */
  phonenumber?: string;
  /** 用户性别（0-男 1-女 2-未知） */
  sex?: string;
  /** 头像地址 */
  avatar?: string;
  /** 帐号状态（0-正常 1-停用） */
  status?: string;
  /** 角色ID列表 */
  roleIds?: number[];
  /** 创建时间 */
  createTime?: string;
};

/**
 * 角色类型
 * @description 对应后端 sys_role 表的实体结构
 */
export type SysRole = {
  /** 角色ID（主键） */
  id?: number;
  /** 角色名称 */
  roleName?: string;
  /** 角色权限字符串 */
  roleKey?: string;
  /** 显示顺序 */
  roleSort?: number;
  /** 角色状态（0-正常 1-停用） */
  status?: string;
  /** 菜单ID列表 */
  menuIds?: number[];
  /** 角色描述 */
  description?: string;
  /** 权限列表 */
  permissions?: string[];
  /** 创建时间 */
  createTime?: string;
};

/**
 * 分页结果类型
 */
export type PageResult<T> = {
  rows: T[];
  total: number;
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

// ===== 用户管理 API =====

/**
 * 获取用户列表
 */
export async function fetchUserList(
  params: {
    page: number;
    pageSize: number;
    keyword?: string;
    phone?: string;
    status?: string;
  },
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<PageResult<SysUser>>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<PageResult<SysUser>>>("/system/user/list", {
          params: {
            pageNum: params.page,
            pageSize: params.pageSize,
            userName: params.keyword,
            phonenumber: params.phone,
            status: params.status,
          },
        })
        .then((r) => r.data),
    apiName: "fetchUserList",
    setLoading,
  });
}

/**
 * 创建用户
 */
export async function createUser(
  data: Partial<SysUser>,
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .post<ApiResponse<boolean>>("/system/user", data)
        .then((r) => r.data),
    apiName: "createUser",
    setLoading,
  });
}

/**
 * 更新用户
 */
export async function updateUser(
  data: Partial<SysUser>,
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .put<ApiResponse<boolean>>("/system/user", data)
        .then((r) => r.data),
    apiName: "updateUser",
    setLoading,
  });
}

/**
 * 删除用户
 */
export async function deleteUser(
  id: string,
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .delete<ApiResponse<boolean>>(`/system/user/${id}`)
        .then((r) => r.data),
    apiName: "deleteUser",
    setLoading,
  });
}

/**
 * 批量删除用户
 */
export async function batchDeleteUsers(
  ids: string[],
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  const idsStr = ids.join(",");
  return handleRequest({
    requestFn: () =>
      request.instance
        .delete<ApiResponse<boolean>>(`/system/user/${idsStr}`)
        .then((r) => r.data),
    apiName: "batchDeleteUsers",
    setLoading,
  });
}

/**
 * 切换用户状态
 */
export async function toggleUserStatus(
  id: string,
  status: string,
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .put<ApiResponse<boolean>>(`/system/user/${id}/status`, { status })
        .then((r) => r.data),
    apiName: "toggleUserStatus",
    setLoading,
  });
}

/**
 * 重置用户密码
 */
export async function resetPassword(
  id: string,
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .put<ApiResponse<boolean>>(`/system/user/${id}/reset-password`)
        .then((r) => r.data),
    apiName: "resetPassword",
    setLoading,
  });
}

/**
 * 批量重置用户密码
 */
export async function batchResetPassword(
  ids: string[],
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  const idsStr = ids.join(",");
  return handleRequest({
    requestFn: () =>
      request.instance
        .put<ApiResponse<boolean>>(`/system/user/${idsStr}/reset-password`)
        .then((r) => r.data),
    apiName: "batchResetPassword",
    setLoading,
  });
}

// ===== 角色管理 API =====

/**
 * 获取角色列表
 */
export async function fetchRoleList(
  params: { page: number; pageSize: number },
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<SysRole[]>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<SysRole[]>>("/system/role/list", { params })
        .then((r) => r.data),
    apiName: "fetchRoleList",
    setLoading,
  });
}

/**
 * 创建角色
 */
export async function createRole(
  data: Partial<SysRole>,
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .post<ApiResponse<boolean>>("/system/role", data)
        .then((r) => r.data),
    apiName: "createRole",
    setLoading,
  });
}

/**
 * 更新角色
 */
export async function updateRole(
  data: Partial<SysRole>,
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .put<ApiResponse<boolean>>("/system/role", data)
        .then((r) => r.data),
    apiName: "updateRole",
    setLoading,
  });
}

/**
 * 删除角色
 */
export async function deleteRole(
  id: string,
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .delete<ApiResponse<boolean>>(`/system/role/${id}`)
        .then((r) => r.data),
    apiName: "deleteRole",
    setLoading,
  });
}

/**
 * 批量删除角色
 */
export async function batchDeleteRoles(
  ids: string[],
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  const idsStr = ids.join(",");
  return handleRequest({
    requestFn: () =>
      request.instance
        .delete<ApiResponse<boolean>>(`/system/role/${idsStr}`)
        .then((r) => r.data),
    apiName: "batchDeleteRoles",
    setLoading,
  });
}

/**
 * 批量复制角色
 */
export async function batchCopyRoles(
  ids: string[],
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .post<ApiResponse<boolean>>("/system/role/copy", { ids })
        .then((r) => r.data),
    apiName: "batchCopyRoles",
    setLoading,
  });
}

/**
 * 获取权限分组列表
 */
export async function fetchPermissionGroups(
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<PermissionGroup[]>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<PermissionGroup[]>>("/system/permission/groups")
        .then((r) => r.data),
    apiName: "fetchPermissionGroups",
    setLoading,
  });
}
