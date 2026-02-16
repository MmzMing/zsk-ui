// ===== 1. 依赖导入区域 =====
import { request, handleRequest } from "../axios";
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

/** 后端用户类型 */
export type SysUser = {
  /** 主键ID */
  id?: number;
  /** 用户账号 */
  userName?: string;
  /** 用户昵称 */
  nickName?: string;
  /** 用户类型 */
  userType?: string;
  /** 用户邮箱 */
  email?: string;
  /** 手机号码 */
  phonenumber?: string;
  /** 用户性别（0男 1女 2未知） */
  sex?: string;
  /** 头像地址 */
  avatar?: string;
  /** 帐号状态（0正常 1停用） */
  status?: string;
  /** 角色ID列表 */
  roleIds?: number[];
  /** 创建时间 */
  createTime?: string;
};

/** 后端角色类型 */
export type SysRole = {
  /** 主键ID */
  id?: number;
  /** 角色名称 */
  roleName?: string;
  /** 角色权限字符串 */
  roleKey?: string;
  /** 显示顺序 */
  roleSort?: number;
  /** 角色状态（0正常 1停用） */
  status?: string;
  /** 菜单ID列表 */
  menuIds?: number[];
  /** 创建时间 */
  createTime?: string;
};

// ===== 前端类型定义 =====

/** 用户状态类型 */
export type UserStatus = "enabled" | "disabled";

/** 用户项类型 */
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

/** 用户列表查询参数 */
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

/** 用户列表响应类型 */
export type UserListResponse = {
  /** 用户列表 */
  list: UserItem[];
  /** 总条数 */
  total: number;
};

/** 用户表单状态类型定义 */
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

/** 角色分配状态类型定义 */
export type RoleAssignState = {
  /** 用户ID */
  userId: string;
  /** 用户姓名 */
  name: string;
  /** 角色列表 */
  roles: string[];
};

/** 所有可用角色列表常量 */
export const allRoles = ["管理员", "内容运营", "审核员", "访客"];

/** 创建用户请求参数 */
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

/** 更新用户请求参数 */
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

/** 角色项类型 */
export type RoleItem = {
  /** 角色ID */
  id: string;
  /** 角色名称 */
  name: string;
  /** 描述 */
  description: string;
  /** 角色权限字符串 */
  roleKey: string;
  /** 显示顺序 */
  roleSort: number;
  /** 角色状态 */
  status: string;
  /** 创建时间 */
  createdAt: string;
  /** 权限列表 */
  permissions: string[];
};

/** 角色列表响应类型 */
export type RoleListResponse = {
  /** 角色列表 */
  list: RoleItem[];
  /** 总条数 */
  total: number;
};

/** 创建角色请求参数 */
export type CreateRoleRequest = {
  /** 角色名称 */
  name: string;
  /** 描述 */
  description: string;
  /** 权限列表 */
  permissions: string[];
};

/** 更新角色请求参数 */
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

// ===== 字段映射函数 =====

/**
 * 用户后端转前端字段映射
 * @param backendData 后端用户数据
 * @returns 前端用户数据
 */
function mapUserToFrontend(backendData: SysUser): UserItem {
  return {
    id: String(backendData.id || ""),
    username: backendData.userName || "",
    name: backendData.nickName || "",
    phone: backendData.phonenumber || "",
    roles: [], // 需要单独查询用户角色关联
    status: backendData.status === "0" ? "enabled" : "disabled",
    createdAt: backendData.createTime || "",
  };
}

/**
 * 用户前端转后端字段映射
 * @param frontendData 前端用户数据
 * @returns 后端用户数据
 */
function mapUserToBackend(
  frontendData: Partial<UserItem | CreateUserRequest | UpdateUserRequest>
): Partial<SysUser> {
  return {
    id: "id" in frontendData && frontendData.id ? Number(frontendData.id) : undefined,
    userName: frontendData.username,
    nickName: frontendData.name,
    phonenumber: frontendData.phone,
    status:
      frontendData.status === "enabled" || frontendData.status === undefined
        ? "0"
        : "1",
  };
}

/**
 * 角色后端转前端字段映射
 * @param backendData 后端角色数据
 * @returns 前端角色数据
 */
function mapRoleToFrontend(backendData: SysRole): RoleItem {
  return {
    id: String(backendData.id || ""),
    name: backendData.roleName || "",
    description: backendData.roleKey || "",
    roleKey: backendData.roleKey || "",
    roleSort: backendData.roleSort || 0,
    status: backendData.status || "0",
    createdAt: backendData.createTime || "",
    permissions: (backendData.menuIds || []).map(String),
  };
}

/**
 * 角色前端转后端字段映射
 * @param frontendData 前端角色数据
 * @returns 后端角色数据
 */
function mapRoleToBackend(
  frontendData: Partial<RoleItem | CreateRoleRequest | UpdateRoleRequest>
): Partial<SysRole> {
  return {
    id: "id" in frontendData && frontendData.id ? Number(frontendData.id) : undefined,
    roleName: frontendData.name,
    roleKey: frontendData.description,
    menuIds: (frontendData.permissions || []).map(Number),
  };
}

// ===== 用户管理 API =====

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
          }
        })
        .then((r) => r.data),
    apiName: "fetchUserList",
    setLoading,
  });

  /** 用户列表映射 */
  const list = (res.data?.rows || []).map(mapUserToFrontend);
  return { code: 200, msg: "ok", data: { list, total: res.data?.total || 0 } };
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
  /** 后端用户数据 */
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
 * @param data 更新参数
 * @param setLoading 加载状态回调
 * @returns 是否更新成功
 */
export async function updateUser(
  data: UpdateUserRequest,
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  /** 后端用户数据 */
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
        .delete<ApiResponse<boolean>>(`/system/user/${id}`)
        .then((r) => r.data),
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
  /** ID列表转逗号分隔字符串 */
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
        .put<ApiResponse<boolean>>(`/system/user/${id}/status`, {
          status: status === "enabled" ? "0" : "1",
        })
        .then((r) => r.data),
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
        .put<ApiResponse<boolean>>(`/system/user/${id}/reset-password`)
        .then((r) => r.data),
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
  /** ID列表转逗号分隔字符串 */
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
 * @param params 分页参数
 * @param setLoading 加载状态回调
 * @returns 角色列表响应
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

  /** 角色列表映射 */
  const list = (res.data || []).map(mapRoleToFrontend);
  return { code: 200, msg: "ok", data: { list, total: list.length } };
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
  /** 后端角色数据 */
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
 * @param data 更新参数
 * @param setLoading 加载状态回调
 * @returns 是否更新成功
 */
export async function updateRole(
  data: UpdateRoleRequest,
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  /** 后端角色数据 */
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
        .delete<ApiResponse<boolean>>(`/system/role/${id}`)
        .then((r) => r.data),
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
  /** ID列表转逗号分隔字符串 */
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
        .post<ApiResponse<boolean>>("/system/role/copy", { ids })
        .then((r) => r.data),
    apiName: "batchCopyRoles",
    setLoading,
  });
}
