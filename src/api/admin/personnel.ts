// ===== 1. 依赖导入区域 =====
import { request, handleRequest } from "../axios";
import { mockAdminUsers, mockAdminRoles } from "../mock/admin/personnel";
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
 * 用户状态类型
 */
export type UserStatus = "enabled" | "disabled";

/**
 * 用户项类型
 */
export type UserItem = {
  /** 用户ID */
  id: string;
  /** 用户名 */
  username: string;
  /** 姓名 */
  name: string;
  /** 手机号 */
  phone: string;
  /** 角色列表 */
  roles: string[];
  /** 状态 */
  status: UserStatus;
  /** 创建时间 */
  createdAt: string;
};

/**
 * 用户列表查询参数
 */
export type UserListParams = {
  /** 当前页码 */
  page: number;
  /** 每页条数 */
  pageSize: number;
  /** 关键词 */
  keyword?: string;
  /** 手机号 */
  phone?: string;
  /** 角色 */
  role?: string;
  /** 状态 */
  status?: string;
};

/**
 * 用户列表响应类型
 */
export type UserListResponse = {
  /** 用户列表 */
  list: UserItem[];
  /** 总条数 */
  total: number;
};

/**
 * 用户表单状态类型定义
 */
export type UserFormState = {
  /** 用户ID（可选） */
  id?: string;
  /** 用户名 */
  username: string;
  /** 姓名 */
  name: string;
  /** 手机号 */
  phone: string;
  /** 角色 */
  role: string;
  /** 启用状态 */
  enabled: boolean;
};

/**
 * 角色分配状态类型定义
 */
export type RoleAssignState = {
  /** 用户ID */
  userId: string;
  /** 用户姓名 */
  name: string;
  /** 角色列表 */
  roles: string[];
};

/**
 * 所有可用角色列表常量
 */
export const allRoles = ["管理员", "内容运营", "审核员", "访客"];

/**
 * 创建用户请求参数
 */
export type CreateUserRequest = {
  /** 用户名 */
  username: string;
  /** 姓名 */
  name: string;
  /** 手机号 */
  phone: string;
  /** 角色列表 */
  roles: string[];
  /** 状态 */
  status: UserStatus;
};

/**
 * 更新用户请求参数
 */
export type UpdateUserRequest = {
  /** 用户ID */
  id: string;
  /** 用户名 */
  username: string;
  /** 姓名 */
  name: string;
  /** 手机号 */
  phone: string;
  /** 角色列表 */
  roles: string[];
  /** 状态 */
  status: UserStatus;
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
 * 角色项类型
 */
export type RoleItem = {
  /** 角色ID */
  id: string;
  /** 角色名称 */
  name: string;
  /** 描述 */
  description: string;
  /** 创建时间 */
  createdAt: string;
  /** 权限列表 */
  permissions: string[];
};

/**
 * 角色列表响应类型
 */
export type RoleListResponse = {
  /** 角色列表 */
  list: RoleItem[];
  /** 总条数 */
  total: number;
};

/**
 * 创建角色请求参数
 */
export type CreateRoleRequest = {
  /** 角色名称 */
  name: string;
  /** 描述 */
  description: string;
  /** 权限列表 */
  permissions: string[];
};

/**
 * 更新角色请求参数
 */
export type UpdateRoleRequest = {
  /** 角色ID */
  id: string;
  /** 角色名称 */
  name: string;
  /** 描述 */
  description: string;
  /** 权限列表 */
  permissions: string[];
};

/**
 * 获取用户列表
 * @param params 查询参数
 * @param setLoading 加载状态回调
 * @returns 用户列表响应
 */
export async function fetchUserList(
  params: UserListParams,
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<UserListResponse>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<UserListResponse>>("/admin/personnel/user/list", {
          params,
        })
        .then((r) => r.data),
    mockData: {
      list: mockAdminUsers,
      total: mockAdminUsers.length,
    },
    apiName: "fetchUserList",
    setLoading,
  });
}

/**
 * 创建用户
 * @param data 创建参数
 * @param setLoading 加载状态回调
 * @returns 是否创建成功
 */
export async function createUser(
  data: CreateUserRequest,
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .post<ApiResponse<boolean>>("/admin/personnel/user/create", data)
        .then((r) => r.data),
    mockData: true,
    apiName: "createUser",
    setLoading,
  });
}

/**
 * 更新用户
 * @param data 更新参数
 * @param setLoading 加载状态回调
 * @returns 是否更新成功
 */
export async function updateUser(
  data: UpdateUserRequest,
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .post<ApiResponse<boolean>>("/admin/personnel/user/update", data)
        .then((r) => r.data),
    mockData: true,
    apiName: "updateUser",
    setLoading,
  });
}

/**
 * 删除用户
 * @param id 用户ID
 * @param setLoading 加载状态回调
 * @returns 是否删除成功
 */
export async function deleteUser(
  id: string,
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .post<ApiResponse<boolean>>("/admin/personnel/user/delete", { id })
        .then((r) => r.data),
    mockData: true,
    apiName: "deleteUser",
    setLoading,
  });
}

/**
 * 批量删除用户
 * @param ids 用户ID列表
 * @param setLoading 加载状态回调
 * @returns 是否删除成功
 */
export async function batchDeleteUsers(
  ids: string[],
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .post<ApiResponse<boolean>>("/admin/personnel/user/batch-delete", { ids })
        .then((r) => r.data),
    mockData: true,
    apiName: "batchDeleteUsers",
    setLoading,
  });
}

/**
 * 切换用户状态
 * @param id 用户ID
 * @param status 状态
 * @param setLoading 加载状态回调
 * @returns 是否切换成功
 */
export async function toggleUserStatus(
  id: string,
  status: UserStatus,
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .post<ApiResponse<boolean>>("/admin/personnel/user/toggle-status", {
          id,
          status,
        })
        .then((r) => r.data),
    mockData: true,
    apiName: "toggleUserStatus",
    setLoading,
  });
}

/**
 * 重置密码
 * @param id 用户ID
 * @param setLoading 加载状态回调
 * @returns 是否重置成功
 */
export async function resetPassword(
  id: string,
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .post<ApiResponse<boolean>>("/admin/personnel/user/reset-password", { id })
        .then((r) => r.data),
    mockData: true,
    apiName: "resetPassword",
    setLoading,
  });
}

/**
 * 批量重置密码
 * @param ids 用户ID列表
 * @param setLoading 加载状态回调
 * @returns 是否重置成功
 */
export async function batchResetPassword(
  ids: string[],
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .post<ApiResponse<boolean>>("/admin/personnel/user/batch-reset-password", {
          ids,
        })
        .then((r) => r.data),
    mockData: true,
    apiName: "batchResetPassword",
    setLoading,
  });
}

/**
 * 获取角色列表
 * @param params 分页参数
 * @param setLoading 加载状态回调
 * @returns 角色列表响应
 */
export async function fetchRoleList(
  params: {
    page: number;
    pageSize: number;
  },
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<RoleListResponse>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<RoleListResponse>>("/admin/personnel/role/list", {
          params,
        })
        .then((r) => r.data),
    mockData: {
      list: mockAdminRoles,
      total: mockAdminRoles.length,
    },
    apiName: "fetchRoleList",
    setLoading,
  });
}

/**
 * 创建角色
 * @param data 创建参数
 * @param setLoading 加载状态回调
 * @returns 是否创建成功
 */
export async function createRole(
  data: CreateRoleRequest,
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .post<ApiResponse<boolean>>("/admin/personnel/role/create", data)
        .then((r) => r.data),
    mockData: true,
    apiName: "createRole",
    setLoading,
  });
}

/**
 * 更新角色
 * @param data 更新参数
 * @param setLoading 加载状态回调
 * @returns 是否更新成功
 */
export async function updateRole(
  data: UpdateRoleRequest,
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .post<ApiResponse<boolean>>("/admin/personnel/role/update", data)
        .then((r) => r.data),
    mockData: true,
    apiName: "updateRole",
    setLoading,
  });
}

/**
 * 删除角色
 * @param id 角色ID
 * @param setLoading 加载状态回调
 * @returns 是否删除成功
 */
export async function deleteRole(
  id: string,
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .post<ApiResponse<boolean>>("/admin/personnel/role/delete", { id })
        .then((r) => r.data),
    mockData: true,
    apiName: "deleteRole",
    setLoading,
  });
}

/**
 * 批量删除角色
 * @param ids 角色ID列表
 * @param setLoading 加载状态回调
 * @returns 是否删除成功
 */
export async function batchDeleteRoles(
  ids: string[],
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .post<ApiResponse<boolean>>("/admin/personnel/role/batch-delete", {
          ids,
        })
        .then((r) => r.data),
    mockData: true,
    apiName: "batchDeleteRoles",
    setLoading,
  });
}

/**
 * 批量复制角色
 * @param ids 角色ID列表
 * @param setLoading 加载状态回调
 * @returns 是否复制成功
 */
export async function batchCopyRoles(
  ids: string[],
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .post<ApiResponse<boolean>>("/admin/personnel/role/batch-copy", {
          ids,
        })
        .then((r) => r.data),
    mockData: true,
    apiName: "batchCopyRoles",
    setLoading,
  });
}
