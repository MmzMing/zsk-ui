import { userRequest as request } from "../axios";
import { mockAdminUsers, mockAdminRoles } from "../mock/admin/personnel";
import type { ApiResponse } from "../types";

export type UserStatus = "enabled" | "disabled";

export type UserItem = {
  id: string;
  username: string;
  name: string;
  phone: string;
  roles: string[];
  status: UserStatus;
  createdAt: string;
};

export type UserListParams = {
  page: number;
  pageSize: number;
  keyword?: string;
  phone?: string;
  role?: string;
  status?: string;
};

export type UserListResponse = {
  list: UserItem[];
  total: number;
};

// 获取用户列表
export async function fetchUserList(params: UserListParams): Promise<ApiResponse<UserListResponse>> {
  const isDev = import.meta.env.DEV;
  try {
    const res = await request.instance.get<ApiResponse<UserListResponse>>("/admin/personnel/user/list", {
      params
    });
    if (res.data) return res.data;
    throw new Error("Empty response");
  } catch (error) {
    if (isDev) {
      console.error("Backend error in fetchUserList (mock fallback):", error);
      return {
        code: 200,
        msg: "",
        data: {
          list: mockAdminUsers,
          total: mockAdminUsers.length
        }
      };
    }
    throw error;
  }
}

export type CreateUserRequest = {
  username: string;
  name: string;
  phone: string;
  roles: string[];
  status: UserStatus;
};

// 创建用户
export async function createUser(data: CreateUserRequest): Promise<ApiResponse<boolean>> {
  try {
    const res = await request.instance.post<ApiResponse<boolean>>("/admin/personnel/user/create", data);
    return res.data;
  } catch (error) {
    console.error("Backend error in createUser:", error);
    throw error;
  }
}

export type UpdateUserRequest = {
  id: string;
  username: string;
  name: string;
  phone: string;
  roles: string[];
  status: UserStatus;
};

// 更新用户
export async function updateUser(data: UpdateUserRequest): Promise<ApiResponse<boolean>> {
  try {
    const res = await request.instance.post<ApiResponse<boolean>>("/admin/personnel/user/update", data);
    return res.data;
  } catch (error) {
    console.error("Backend error in updateUser:", error);
    throw error;
  }
}

// 删除用户
export async function deleteUser(id: string): Promise<ApiResponse<boolean>> {
  try {
    const res = await request.instance.post<ApiResponse<boolean>>("/admin/personnel/user/delete", { id });
    return res.data;
  } catch (error) {
    console.error("Backend error in deleteUser:", error);
    throw error;
  }
}

// 批量删除用户
export async function batchDeleteUsers(ids: string[]): Promise<ApiResponse<boolean>> {
  try {
    const res = await request.instance.post<ApiResponse<boolean>>("/admin/personnel/user/batch-delete", { ids });
    return res.data;
  } catch (error) {
    console.error("Backend error in batchDeleteUsers:", error);
    throw error;
  }
}

// 切换用户状态
export async function toggleUserStatus(id: string, status: UserStatus): Promise<ApiResponse<boolean>> {
  try {
    const res = await request.instance.post<ApiResponse<boolean>>("/admin/personnel/user/toggle-status", {
      id,
      status
    });
    return res.data;
  } catch (error) {
    console.error("Backend error in toggleUserStatus:", error);
    throw error;
  }
}

// 重置密码
export async function resetPassword(id: string): Promise<ApiResponse<boolean>> {
  try {
    const res = await request.instance.post<ApiResponse<boolean>>("/admin/personnel/user/reset-password", { id });
    return res.data;
  } catch (error) {
    console.error("Backend error in resetPassword:", error);
    throw error;
  }
}

// 批量重置密码
export async function batchResetPassword(ids: string[]): Promise<ApiResponse<boolean>> {
  try {
    const res = await request.instance.post<ApiResponse<boolean>>("/admin/personnel/user/batch-reset-password", {
      ids
    });
    return res.data;
  } catch (error) {
    console.error("Backend error in batchResetPassword:", error);
    throw error;
  }
}

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

export type RoleItem = {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  permissions: string[];
};

export type RoleListResponse = {
  list: RoleItem[];
  total: number;
};

// 获取角色列表
export async function fetchRoleList(params: { page: number; pageSize: number }): Promise<ApiResponse<RoleListResponse>> {
  const isDev = import.meta.env.DEV;
  try {
    const res = await request.instance.get<ApiResponse<RoleListResponse>>("/admin/personnel/role/list", {
      params
    });
    if (res.data) return res.data;
    throw new Error("Empty response");
  } catch (error) {
    if (isDev) {
      console.error("Backend error in fetchRoleList (mock fallback):", error);
      return {
        code: 200,
        msg: "",
        data: {
          list: mockAdminRoles,
          total: mockAdminRoles.length
        }
      };
    }
    throw error;
  }
}

export type CreateRoleRequest = {
  name: string;
  description: string;
  permissions: string[];
};

// 创建角色
export async function createRole(data: CreateRoleRequest): Promise<ApiResponse<boolean>> {
  try {
    const res = await request.instance.post<ApiResponse<boolean>>("/admin/personnel/role/create", data);
    return res.data;
  } catch (error) {
    console.error("Backend error in createRole:", error);
    throw error;
  }
}

export type UpdateRoleRequest = {
  id: string;
  name: string;
  description: string;
  permissions: string[];
};

// 更新角色
export async function updateRole(data: UpdateRoleRequest): Promise<ApiResponse<boolean>> {
  try {
    const res = await request.instance.post<ApiResponse<boolean>>("/admin/personnel/role/update", data);
    return res.data;
  } catch (error) {
    console.error("Backend error in updateRole:", error);
    throw error;
  }
}

// 删除角色
export async function deleteRole(id: string): Promise<ApiResponse<boolean>> {
  try {
    const res = await request.instance.post<ApiResponse<boolean>>("/admin/personnel/role/delete", { id });
    return res.data;
  } catch (error) {
    console.error("Backend error in deleteRole:", error);
    throw error;
  }
}
