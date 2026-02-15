# personnel.ts（人员管理）前后端接口对接文档

> 文档创建时间：2026-02-15  
> 对接策略：前端修改路径适配后端，后端补充缺失接口

---

## 一、模块总览

| 子模块 | 前端接口数 | 后端状态 | 对接方案 |
|-------|----------|---------|---------|
| 用户管理 | 8个 | ⚠️ 部分缺失 | 前端修改路径+后端新增接口 |
| 角色管理 | 6个 | ⚠️ 部分缺失 | 前端修改路径+后端新增接口 |

---

## 二、用户管理接口映射表

| 前端接口 | HTTP | 后端接口 | 对接方案 |
|---------|------|---------|---------|
| `GET /admin/personnel/user/list` | GET | `GET /user/list` | 前端修改路径 |
| `POST /admin/personnel/user/create` | POST | `POST /user` | 前端修改路径 |
| `POST /admin/personnel/user/update` | POST | `PUT /user` | 前端修改路径+改用PUT |
| `POST /admin/personnel/user/delete` | POST | `DELETE /user/{id}` | 前端修改路径+改用DELETE |
| `POST /admin/personnel/user/batch-delete` | POST | `DELETE /user/{ids}` | 前端修改路径+改用DELETE |
| `POST /admin/personnel/user/toggle-status` | POST | ❌ 缺失 | **后端新增**：切换用户状态 |
| `POST /admin/personnel/user/reset-password` | POST | ❌ 缺失 | **后端新增**：重置密码 |
| `POST /admin/personnel/user/batch-reset-password` | POST | ❌ 缺失 | **后端新增**：批量重置密码 |

---

## 三、角色管理接口映射表

| 前端接口 | HTTP | 后端接口 | 对接方案 |
|---------|------|---------|---------|
| `GET /admin/personnel/role/list` | GET | `GET /role/list` | 前端修改路径 |
| `POST /admin/personnel/role/create` | POST | `POST /role` | 前端修改路径 |
| `POST /admin/personnel/role/update` | POST | `PUT /role` | 前端修改路径+改用PUT |
| `POST /admin/personnel/role/delete` | POST | `DELETE /role/{id}` | 前端修改路径+改用DELETE |
| `POST /admin/personnel/role/batch-delete` | POST | `DELETE /role/{ids}` | 前端修改路径+改用DELETE |
| `POST /admin/personnel/role/batch-copy` | POST | ❌ 缺失 | **后端新增**：批量复制角色 |

---

## 四、字段映射表

### 4.1 用户实体字段映射

| 前端字段 | 后端字段 | 类型 | 说明 |
|---------|---------|------|------|
| id | id | String/Long | 主键（雪花算法） |
| username | userName | String | **需映射**：用户账号 |
| name | nickName | String | **需映射**：用户昵称 |
| phone | phonenumber | String | **需映射**：手机号码 |
| roles | roleIds | Array | **需映射**：角色ID列表 |
| status | status | String | 状态（后端：0正常 1停用） |
| createdAt | createTime | String | **需映射**：创建时间 |

### 4.2 状态值映射

| 前端status | 后端status | 说明 |
|------------|-------------|------|
| "enabled" | "0" | 正常 |
| "disabled" | "1" | 停用 |

### 4.3 角色实体字段映射

| 前端字段 | 后端字段 | 类型 | 说明 |
|---------|---------|------|------|
| id | id | String/Long | 主键 |
| name | roleName | String | **需映射**：角色名称 |
| description | - | String | 后端无此字段，需新增或忽略 |
| permissions | menuIds | Array | **需映射**：权限/菜单ID列表 |
| createdAt | createTime | String | **需映射**：创建时间 |

---

## 五、前端修改清单

### 5.1 类型定义修改

```typescript
// ===== 后端用户类型定义 =====

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
```

### 5.2 字段映射函数

```typescript
// ===== 字段映射函数 =====

/**
 * 用户后端转前端字段映射
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
 */
function mapUserToBackend(frontendData: Partial<UserItem>): Partial<SysUser> {
  return {
    id: frontendData.id ? Number(frontendData.id) : undefined,
    userName: frontendData.username,
    nickName: frontendData.name,
    phonenumber: frontendData.phone,
    status: frontendData.status === "enabled" ? "0" : "1",
  };
}

/**
 * 角色后端转前端字段映射
 */
function mapRoleToFrontend(backendData: SysRole): RoleItem {
  return {
    id: String(backendData.id || ""),
    name: backendData.roleName || "",
    description: backendData.roleKey || "",
    createdAt: backendData.createTime || "",
    permissions: (backendData.menuIds || []).map(String),
  };
}

/**
 * 角色前端转后端字段映射
 */
function mapRoleToBackend(frontendData: Partial<RoleItem>): Partial<SysRole> {
  return {
    id: frontendData.id ? Number(frontendData.id) : undefined,
    roleName: frontendData.name,
    roleKey: frontendData.description,
    menuIds: (frontendData.permissions || []).map(Number),
  };
}
```

### 5.3 API 函数修改

```typescript
// ===== 用户管理 API =====

/** 获取用户列表 */
export async function fetchUserList(
  params: UserListParams,
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<UserListResponse>> {
  const res = await handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<SysUser[]>>("/user/list", { params })
        .then((r) => r.data),
    mockData: [],
    apiName: "fetchUserList",
    setLoading,
  });
  
  const list = (res.data || []).map(mapUserToFrontend);
  return { code: 200, msg: "ok", data: { list, total: list.length } };
}

/** 创建用户 */
export async function createUser(
  data: CreateUserRequest,
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  const backendData = mapUserToBackend(data);
  return handleRequest({
    requestFn: () =>
      request.instance
        .post<ApiResponse<boolean>>("/user", backendData)
        .then((r) => r.data),
    mockData: true,
    apiName: "createUser",
    setLoading,
  });
}

/** 更新用户 */
export async function updateUser(
  data: UpdateUserRequest,
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  const backendData = mapUserToBackend(data);
  return handleRequest({
    requestFn: () =>
      request.instance
        .put<ApiResponse<boolean>>("/user", backendData)
        .then((r) => r.data),
    mockData: true,
    apiName: "updateUser",
    setLoading,
  });
}

/** 删除用户 */
export async function deleteUser(
  id: string,
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .delete<ApiResponse<boolean>>(`/user/${id}`)
        .then((r) => r.data),
    mockData: true,
    apiName: "deleteUser",
    setLoading,
  });
}

/** 批量删除用户 */
export async function batchDeleteUsers(
  ids: string[],
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  const idsStr = ids.join(",");
  return handleRequest({
    requestFn: () =>
      request.instance
        .delete<ApiResponse<boolean>>(`/user/${idsStr}`)
        .then((r) => r.data),
    mockData: true,
    apiName: "batchDeleteUsers",
    setLoading,
  });
}

/** 切换用户状态 */
export async function toggleUserStatus(
  id: string,
  status: UserStatus,
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .put<ApiResponse<boolean>>(`/user/${id}/status`, { 
          status: status === "enabled" ? "0" : "1" 
        })
        .then((r) => r.data),
    mockData: true,
    apiName: "toggleUserStatus",
    setLoading,
  });
}

/** 重置密码 */
export async function resetPassword(
  id: string,
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .put<ApiResponse<boolean>>(`/user/${id}/reset-password`)
        .then((r) => r.data),
    mockData: true,
    apiName: "resetPassword",
    setLoading,
  });
}

/** 批量重置密码 */
export async function batchResetPassword(
  ids: string[],
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  const idsStr = ids.join(",");
  return handleRequest({
    requestFn: () =>
      request.instance
        .put<ApiResponse<boolean>>(`/user/${idsStr}/reset-password`)
        .then((r) => r.data),
    mockData: true,
    apiName: "batchResetPassword",
    setLoading,
  });
}

// ===== 角色管理 API =====

/** 获取角色列表 */
export async function fetchRoleList(
  params: { page: number; pageSize: number },
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<RoleListResponse>> {
  const res = await handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<SysRole[]>>("/role/list", { params })
        .then((r) => r.data),
    mockData: [],
    apiName: "fetchRoleList",
    setLoading,
  });
  
  const list = (res.data || []).map(mapRoleToFrontend);
  return { code: 200, msg: "ok", data: { list, total: list.length } };
}

/** 创建角色 */
export async function createRole(
  data: CreateRoleRequest,
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  const backendData = mapRoleToBackend(data);
  return handleRequest({
    requestFn: () =>
      request.instance
        .post<ApiResponse<boolean>>("/role", backendData)
        .then((r) => r.data),
    mockData: true,
    apiName: "createRole",
    setLoading,
  });
}

/** 更新角色 */
export async function updateRole(
  data: UpdateRoleRequest,
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  const backendData = mapRoleToBackend(data);
  return handleRequest({
    requestFn: () =>
      request.instance
        .put<ApiResponse<boolean>>("/role", backendData)
        .then((r) => r.data),
    mockData: true,
    apiName: "updateRole",
    setLoading,
  });
}

/** 删除角色 */
export async function deleteRole(
  id: string,
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .delete<ApiResponse<boolean>>(`/role/${id}`)
        .then((r) => r.data),
    mockData: true,
    apiName: "deleteRole",
    setLoading,
  });
}

/** 批量删除角色 */
export async function batchDeleteRoles(
  ids: string[],
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  const idsStr = ids.join(",");
  return handleRequest({
    requestFn: () =>
      request.instance
        .delete<ApiResponse<boolean>>(`/role/${idsStr}`)
        .then((r) => r.data),
    mockData: true,
    apiName: "batchDeleteRoles",
    setLoading,
  });
}

/** 批量复制角色 */
export async function batchCopyRoles(
  ids: string[],
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .post<ApiResponse<boolean>>("/role/copy", { ids })
        .then((r) => r.data),
    mockData: true,
    apiName: "batchCopyRoles",
    setLoading,
  });
}
```

---

## 六、后端新增接口清单

### 6.1 用户管理新增接口

```java
// ===== 文件：SysUserController.java =====

/**
 * 切换用户状态
 *
 * @param id 用户ID
 * @param status 状态（0正常 1停用）
 * @return 是否成功
 */
@Operation(summary = "切换用户状态")
@PutMapping("/{id}/status")
public R<Void> toggleStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
    String status = body.get("status");
    SysUser user = new SysUser();
    user.setId(id);
    user.setStatus(status);
    return userService.updateUser(user) ? R.ok() : R.fail();
}

/**
 * 重置密码
 *
 * @param id 用户ID
 * @return 是否成功
 */
@Operation(summary = "重置密码")
@PutMapping("/{id}/reset-password")
public R<Void> resetPassword(@PathVariable Long id) {
    return userService.resetPassword(id) ? R.ok() : R.fail();
}

/**
 * 批量重置密码
 *
 * @param ids 用户ID列表
 * @return 是否成功
 */
@Operation(summary = "批量重置密码")
@PutMapping("/{ids}/reset-password")
public R<Void> batchResetPassword(@PathVariable List<Long> ids) {
    return userService.batchResetPassword(ids) ? R.ok() : R.fail();
}
```

### 6.2 角色管理新增接口

```java
// ===== 文件：SysRoleController.java =====

/**
 * 批量复制角色
 *
 * @param ids 角色ID列表
 * @return 是否成功
 */
@Operation(summary = "批量复制角色")
@PostMapping("/copy")
public R<Void> batchCopy(@RequestBody Map<String, List<Long>> body) {
    List<Long> ids = body.get("ids");
    return roleService.copyRoles(ids) ? R.ok() : R.fail();
}
```

---

## 七、对接检查清单

### 7.1 前端修改清单

- [ ] 新增 `SysUser` 后端类型定义
- [ ] 新增 `SysRole` 后端类型定义
- [ ] 新增 `mapUserToFrontend` 字段映射函数
- [ ] 新增 `mapUserToBackend` 字段映射函数
- [ ] 新增 `mapRoleToFrontend` 字段映射函数
- [ ] 新增 `mapRoleToBackend` 字段映射函数
- [ ] 修改 `fetchUserList` 接口路径为 `/user/list`
- [ ] 修改 `createUser` 接口路径为 `/user`
- [ ] 修改 `updateUser` 接口路径为 `/user`，改用PUT方法
- [ ] 修改 `deleteUser` 接口路径为 `/user/{id}`，改用DELETE方法
- [ ] 修改 `batchDeleteUsers` 接口路径为 `/user/{ids}`，改用DELETE方法
- [ ] 修改 `toggleUserStatus` 接口路径为 `/user/{id}/status`，改用PUT方法
- [ ] 修改 `resetPassword` 接口路径为 `/user/{id}/reset-password`，改用PUT方法
- [ ] 修改 `batchResetPassword` 接口路径为 `/user/{ids}/reset-password`，改用PUT方法
- [ ] 修改 `fetchRoleList` 接口路径为 `/role/list`
- [ ] 修改 `createRole` 接口路径为 `/role`
- [ ] 修改 `updateRole` 接口路径为 `/role`，改用PUT方法
- [ ] 修改 `deleteRole` 接口路径为 `/role/{id}`，改用DELETE方法
- [ ] 修改 `batchDeleteRoles` 接口路径为 `/role/{ids}`，改用DELETE方法
- [ ] 修改 `batchCopyRoles` 接口路径为 `/role/copy`

### 7.2 后端修改清单

- [ ] 新增切换用户状态接口 `PUT /user/{id}/status`
- [ ] 新增重置密码接口 `PUT /user/{id}/reset-password`
- [ ] 新增批量重置密码接口 `PUT /user/{ids}/reset-password`
- [ ] 新增批量复制角色接口 `POST /role/copy`
- [ ] 在 `ISysUserService` 中添加 `resetPassword` 和 `batchResetPassword` 方法
- [ ] 在 `ISysRoleService` 中添加 `copyRoles` 方法

---

## 八、注意事项

1. **接口路径**：前端接口移除 `/admin/personnel` 前缀，用户管理使用 `/user`，角色管理使用 `/role`
2. **HTTP方法**：新增用POST，修改用PUT，删除用DELETE
3. **字段映射**：前端使用驼峰命名，后端也是驼峰命名，但部分字段名不同
4. **状态值**：后端status用 "0"/"1"，前端用 "enabled"/"disabled"
5. **主键生成**：数据库id使用雪花算法生成，不使用自增
6. **分页参数**：后端暂不支持分页，前端需要适配
7. **角色关联**：用户的角色列表需要通过 `sys_user_role` 关联表查询
