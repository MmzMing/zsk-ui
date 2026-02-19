/**
 * 人员管理相关 API
 * @module api/admin/personnel
 * @description 提供用户管理、角色管理、权限管理等功能接口
 */

import { request, handleRequest } from "../request";
import type { ApiResponse } from "../types";

/**
 * 后端用户类型
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
 * 后端角色类型
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
  /** 创建时间 */
  createTime?: string;
};

/**
 * 用户状态类型
 * @description 用户账号的启用/停用状态
 */
export type UserStatus = "enabled" | "disabled";

/**
 * 用户列表项
 * @description 用于用户列表展示的单条数据
 */
export type UserItem = {
  /** 用户ID */
  id: string;
  /** 用户名（登录账号） */
  username: string;
  /** 用户姓名 */
  name: string;
  /** 手机号码 */
  phone: string;
  /** 角色列表 */
  roles: string[];
  /** 用户状态 */
  status: UserStatus;
  /** 创建时间 */
  createdAt: string;
};

/**
 * 用户列表查询参数
 * @description 分页查询用户列表的请求参数
 */
export type UserListParams = {
  /** 当前页码，从1开始 */
  page: number;
  /** 每页条数 */
  pageSize: number;
  /** 关键字搜索（用户名/姓名） */
  keyword?: string;
  /** 手机号码筛选 */
  phone?: string;
  /** 角色筛选 */
  role?: string;
  /** 状态筛选 */
  status?: string;
};

/**
 * 用户列表响应数据
 * @description 分页查询用户列表的返回结构
 */
export type UserListResponse = {
  /** 用户列表 */
  list: UserItem[];
  /** 总条数 */
  total: number;
};

/**
 * 用户表单状态
 * @description 用于用户创建/编辑表单的数据结构
 */
export type UserFormState = {
  /** 用户ID（编辑时存在） */
  id?: string;
  /** 用户名 */
  username: string;
  /** 用户姓名 */
  name: string;
  /** 手机号码 */
  phone: string;
  /** 角色名称 */
  role: string;
  /** 是否启用 */
  enabled: boolean;
};

/**
 * 角色分配状态
 * @description 用于角色分配弹窗的数据结构
 */
export type RoleAssignState = {
  /** 用户ID */
  userId: string;
  /** 用户姓名 */
  name: string;
  /** 已分配角色列表 */
  roles: string[];
};

/**
 * 所有角色列表
 * @description 系统预设的角色选项
 */
export const allRoles = ["管理员", "内容运营", "审核员", "访客"];

/**
 * 创建用户请求参数
 * @description 新建用户时提交的数据结构
 */
export type CreateUserRequest = {
  /** 用户名 */
  username: string;
  /** 用户姓名 */
  name: string;
  /** 手机号码 */
  phone: string;
  /** 角色列表 */
  roles: string[];
  /** 用户状态 */
  status: UserStatus;
};

/**
 * 更新用户请求参数
 * @description 更新用户信息时提交的数据结构
 */
export type UpdateUserRequest = {
  /** 用户ID */
  id: string;
  /** 用户名 */
  username: string;
  /** 用户姓名 */
  name: string;
  /** 手机号码 */
  phone: string;
  /** 角色列表 */
  roles: string[];
  /** 用户状态 */
  status: UserStatus;
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
 * 角色列表项
 * @description 用于角色列表展示的单条数据
 */
export type RoleItem = {
  /** 角色ID */
  id: string;
  /** 角色名称 */
  name: string;
  /** 角色描述 */
  description: string;
  /** 角色权限字符串 */
  roleKey: string;
  /** 显示顺序 */
  roleSort: number;
  /** 角色状态（0-正常 1-停用） */
  status: string;
  /** 创建时间 */
  createdAt: string;
  /** 已分配权限列表 */
  permissions: string[];
};

/**
 * 角色列表响应数据
 * @description 分页查询角色列表的返回结构
 */
export type RoleListResponse = {
  /** 角色列表 */
  list: RoleItem[];
  /** 总条数 */
  total: number;
};

/**
 * 创建角色请求参数
 * @description 新建角色时提交的数据结构
 */
export type CreateRoleRequest = {
  /** 角色名称 */
  name: string;
  /** 角色描述 */
  description: string;
  /** 权限列表 */
  permissions: string[];
};

/**
 * 更新角色请求参数
 * @description 更新角色信息时提交的数据结构
 */
export type UpdateRoleRequest = {
  /** 角色ID */
  id: string;
  /** 角色名称 */
  name: string;
  /** 角色描述 */
  description: string;
  /** 权限列表 */
  permissions: string[];
};

/**
 * 用户数据后端转前端字段映射
 * @description 将后端 SysUser 类型转换为前端 UserItem 类型
 * @param backendData 后端用户数据
 * @returns 前端用户数据
 */
const mapUserToFrontend = (backendData: SysUser): UserItem => ({
  id: String(backendData.id || ""),
  username: backendData.userName || "",
  name: backendData.nickName || "",
  phone: backendData.phonenumber || "",
  roles: [],
  status: backendData.status === "0" ? "enabled" : "disabled",
  createdAt: backendData.createTime || "",
});

/**
 * 用户数据前端转后端字段映射
 * @description 将前端 UserItem/CreateUserRequest/UpdateUserRequest 类型转换为后端 SysUser 类型
 * @param frontendData 前端用户数据
 * @returns 后端用户数据
 */
const mapUserToBackend = (
  frontendData: Partial<UserItem | CreateUserRequest | UpdateUserRequest>
): Partial<SysUser> => ({
  id: "id" in frontendData && frontendData.id ? Number(frontendData.id) : undefined,
  userName: frontendData.username,
  nickName: frontendData.name,
  phonenumber: frontendData.phone,
  status:
    frontendData.status === "enabled" || frontendData.status === undefined
      ? "0"
      : "1",
});

/**
 * 角色数据后端转前端字段映射
 * @description 将后端 SysRole 类型转换为前端 RoleItem 类型
 * @param backendData 后端角色数据
 * @returns 前端角色数据
 */
const mapRoleToFrontend = (backendData: SysRole): RoleItem => ({
  id: String(backendData.id || ""),
  name: backendData.roleName || "",
  description: backendData.roleKey || "",
  roleKey: backendData.roleKey || "",
  roleSort: backendData.roleSort || 0,
  status: backendData.status || "0",
  createdAt: backendData.createTime || "",
  permissions: (backendData.menuIds || []).map(String),
});

/**
 * 角色数据前端转后端字段映射
 * @description 将前端 RoleItem/CreateRoleRequest/UpdateRoleRequest 类型转换为后端 SysRole 类型
 * @param frontendData 前端角色数据
 * @returns 后端角色数据
 */
const mapRoleToBackend = (
  frontendData: Partial<RoleItem | CreateRoleRequest | UpdateRoleRequest>
): Partial<SysRole> => ({
  id: "id" in frontendData && frontendData.id ? Number(frontendData.id) : undefined,
  roleName: frontendData.name,
  roleKey: frontendData.description,
  menuIds: (frontendData.permissions || []).map(Number),
});

/**
 * 获取用户列表
 * @description 分页查询用户列表，支持关键字、手机号、角色、状态筛选
 * @param params 查询参数
 * @param setLoading 加载状态回调函数（可选）
 * @returns 用户列表及总数
 */
export async function fetchUserList(
  params: UserListParams,
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<UserListResponse>> {
  const res = await handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<{ rows: SysUser[]; total: number }>>("/system/user/list", {
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

  const list = (res.data?.rows || []).map(mapUserToFrontend);
  return { code: 200, msg: "ok", data: { list, total: res.data?.total || 0 } };
}

/**
 * 创建用户
 * @description 新建用户账号
 * @param data 用户创建数据
 * @param setLoading 加载状态回调函数（可选）
 * @returns 是否创建成功
 */
export async function createUser(
  data: CreateUserRequest,
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  const backendData = mapUserToBackend(data);
  return handleRequest({
    requestFn: () =>
      request.instance
        .post<ApiResponse<boolean>>("/system/user", backendData)
        .then((r) => r.data),
    apiName: "createUser",
    setLoading,
  });
}

/**
 * 更新用户
 * @description 更新指定用户的信息
 * @param data 用户更新数据，必须包含 id 字段
 * @param setLoading 加载状态回调函数（可选）
 * @returns 是否更新成功
 */
export async function updateUser(
  data: UpdateUserRequest,
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  const backendData = mapUserToBackend(data);
  return handleRequest({
    requestFn: () =>
      request.instance
        .put<ApiResponse<boolean>>("/system/user", backendData)
        .then((r) => r.data),
    apiName: "updateUser",
    setLoading,
  });
}

/**
 * 删除用户
 * @description 删除指定用户
 * @param id 用户ID
 * @param setLoading 加载状态回调函数（可选）
 * @returns 是否删除成功
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
 * @description 批量删除多个用户
 * @param ids 用户ID列表
 * @param setLoading 加载状态回调函数（可选）
 * @returns 是否删除成功
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
 * @description 启用或停用用户账号
 * @param id 用户ID
 * @param status 目标状态（enabled-启用，disabled-停用）
 * @param setLoading 加载状态回调函数（可选）
 * @returns 是否操作成功
 */
export async function toggleUserStatus(
  id: string,
  status: UserStatus,
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .put<ApiResponse<boolean>>(`/system/user/${id}/status`, {
          status: status === "enabled" ? "0" : "1",
        })
        .then((r) => r.data),
    apiName: "toggleUserStatus",
    setLoading,
  });
}

/**
 * 重置用户密码
 * @description 将用户密码重置为默认密码
 * @param id 用户ID
 * @param setLoading 加载状态回调函数（可选）
 * @returns 是否重置成功
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
 * @description 批量将多个用户的密码重置为默认密码
 * @param ids 用户ID列表
 * @param setLoading 加载状态回调函数（可选）
 * @returns 是否重置成功
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

/**
 * 获取角色列表
 * @description 分页查询角色列表
 * @param params 分页参数
 * @param setLoading 加载状态回调函数（可选）
 * @returns 角色列表及总数
 */
export async function fetchRoleList(
  params: { page: number; pageSize: number },
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<RoleListResponse>> {
  const res = await handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<SysRole[]>>("/system/role/list", { params })
        .then((r) => r.data),
    apiName: "fetchRoleList",
    setLoading,
  });

  const list = (res.data || []).map(mapRoleToFrontend);
  return { code: 200, msg: "ok", data: { list, total: list.length } };
}

/**
 * 创建角色
 * @description 新建角色并分配权限
 * @param data 角色创建数据
 * @param setLoading 加载状态回调函数（可选）
 * @returns 是否创建成功
 */
export async function createRole(
  data: CreateRoleRequest,
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  const backendData = mapRoleToBackend(data);
  return handleRequest({
    requestFn: () =>
      request.instance
        .post<ApiResponse<boolean>>("/system/role", backendData)
        .then((r) => r.data),
    apiName: "createRole",
    setLoading,
  });
}

/**
 * 更新角色
 * @description 更新指定角色的信息和权限
 * @param data 角色更新数据，必须包含 id 字段
 * @param setLoading 加载状态回调函数（可选）
 * @returns 是否更新成功
 */
export async function updateRole(
  data: UpdateRoleRequest,
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  const backendData = mapRoleToBackend(data);
  return handleRequest({
    requestFn: () =>
      request.instance
        .put<ApiResponse<boolean>>("/system/role", backendData)
        .then((r) => r.data),
    apiName: "updateRole",
    setLoading,
  });
}

/**
 * 删除角色
 * @description 删除指定角色，已分配用户的角色不可删除
 * @param id 角色ID
 * @param setLoading 加载状态回调函数（可选）
 * @returns 是否删除成功
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
 * @description 批量删除多个角色
 * @param ids 角色ID列表
 * @param setLoading 加载状态回调函数（可选）
 * @returns 是否删除成功
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
 * @description 复制多个角色及其权限配置
 * @param ids 角色ID列表
 * @param setLoading 加载状态回调函数（可选）
 * @returns 是否复制成功
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
 * @description 获取所有权限并按模块分组，用于角色权限分配
 * @param setLoading 加载状态回调函数（可选）
 * @returns 权限分组列表
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
