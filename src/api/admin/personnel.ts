import { request } from "../axios";

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
export async function fetchUserList(params: UserListParams) {
  return request.get<UserListResponse>("/admin/personnel/user/list", {
    params
  });
}

export type CreateUserRequest = {
  username: string;
  name: string;
  phone: string;
  roles: string[];
  status: UserStatus;
};

// 创建用户
export async function createUser(data: CreateUserRequest) {
  return request.post<boolean>("/admin/personnel/user/create", data);
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
export async function updateUser(data: UpdateUserRequest) {
  return request.post<boolean>("/admin/personnel/user/update", data);
}

// 删除用户
export async function deleteUser(id: string) {
  return request.post<boolean>("/admin/personnel/user/delete", { id });
}

// 批量删除用户
export async function batchDeleteUsers(ids: string[]) {
  return request.post<boolean>("/admin/personnel/user/batch-delete", { ids });
}

// 切换用户状态
export async function toggleUserStatus(id: string, status: UserStatus) {
  return request.post<boolean>("/admin/personnel/user/toggle-status", {
    id,
    status
  });
}

// 重置密码
export async function resetPassword(id: string) {
  return request.post<boolean>("/admin/personnel/user/reset-password", { id });
}

// 批量重置密码
export async function batchResetPassword(ids: string[]) {
  return request.post<boolean>("/admin/personnel/user/batch-reset-password", {
    ids
  });
}

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
export async function fetchRoleList(params: { page: number; pageSize: number }) {
  return request.get<RoleListResponse>("/admin/personnel/role/list", {
    params
  });
}

export type CreateRoleRequest = {
  name: string;
  description: string;
  permissions: string[];
};

// 创建角色
export async function createRole(data: CreateRoleRequest) {
  return request.post<boolean>("/admin/personnel/role/create", data);
}

export type UpdateRoleRequest = {
  id: string;
  name: string;
  description: string;
  permissions: string[];
};

// 更新角色
export async function updateRole(data: UpdateRoleRequest) {
  return request.post<boolean>("/admin/personnel/role/update", data);
}

// 删除角色
export async function deleteRole(id: string) {
  return request.post<boolean>("/admin/personnel/role/delete", { id });
}

export type MenuNode = {
  id: string;
  name: string;
  path: string;
  iconName: string;
  order: number;
  visible: boolean;
  permissionKey: string;
  parentId: string | null;
  children?: MenuNode[];
};

// 获取菜单树（管理端）
export async function fetchMenuTree() {
  return request.get<MenuNode[]>("/admin/personnel/menu/tree");
}

export type UpdateMenuRequest = {
  id: string;
  name: string;
  path: string;
  iconName: string;
  visible: boolean;
  permissionKey: string;
  order: number;
};

// 更新菜单节点
export async function updateMenu(data: UpdateMenuRequest) {
  return request.post<boolean>("/admin/personnel/menu/update", data);
}

// 删除菜单节点
export async function deleteMenu(id: string) {
  return request.post<boolean>("/admin/personnel/menu/delete", { id });
}
