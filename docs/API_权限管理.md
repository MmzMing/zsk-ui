# 权限与人员管理 API 接口文档

## 1. 概述

本文档定义了后台权限管理模块的接口规范，包括用户管理、角色管理及权限菜单配置。

- **基础路径**: `/api/admin/personnel`
- **数据格式**: `JSON`
- **通用响应**: 所有接口统一返回 `{ code, msg, data }` 结构。

## 2. 接口列表

### 2.1 用户管理 (`/user`)

#### 获取用户列表
- **接口地址**: `GET /user/list`
- **描述**: 分页查询后台用户列表。
- **请求参数**:
  | 字段名 | 类型 | 必填 | 说明 |
  |---|---|---|---|
  | page | number | 否 | 页码，默认 1 |
  | pageSize | number | 否 | 每页数量，默认 20 |
  | keyword | string | 否 | 搜索关键词（账号/姓名） |
  | status | string | 否 | 状态过滤: `enabled`, `disabled` |
  | role | string | 否 | 角色过滤 |
- **响应示例**:
  ```json
  {
    "code": 0,
    "msg": "ok",
    "data": {
      "list": [
        {
          "id": "u_001",
          "username": "admin",
          "name": "管理员",
          "roles": ["admin"],
          "status": "enabled",
          "createdAt": "2026-01-01"
        }
      ],
      "total": 1
    }
  }
  ```

#### 创建用户
- **接口地址**: `POST /user/create`
- **描述**: 创建新的后台用户。
- **请求参数**:
  | 字段名 | 类型 | 必填 | 说明 |
  |---|---|---|---|
  | username | string | 是 | 账号 |
  | name | string | 是 | 姓名 |
  | phone | string | 是 | 手机号 |
  | roles | string[] | 是 | 角色标识列表 |
  | status | string | 是 | 状态 |
- **响应示例**: `{ "code": 0, "msg": "ok", "data": true }`

#### 更新用户
- **接口地址**: `POST /user/update`
- **描述**: 更新用户信息。
- **请求参数**: `id` (必填) 及其他可更新字段。

#### 删除用户
- **接口地址**: `POST /user/delete`
- **描述**: 删除指定用户。
- **请求参数**: `id` (用户ID)

#### 批量删除用户
- **接口地址**: `POST /user/batch-delete`
- **描述**: 批量删除用户。
- **请求参数**: `ids` (ID数组)

#### 切换用户状态
- **接口地址**: `POST /user/toggle-status`
- **描述**: 启用或禁用用户。
- **请求参数**: `id`, `status`

#### 重置密码
- **接口地址**: `POST /user/reset-password`
- **描述**: 重置指定用户的密码。
- **请求参数**: `id`

### 2.2 角色管理 (`/role`)

#### 获取角色列表
- **接口地址**: `GET /role/list`
- **描述**: 获取角色列表。
- **请求参数**: `page`, `pageSize`
- **响应示例**:
  ```json
  {
    "code": 0,
    "msg": "ok",
    "data": {
      "list": [
        {
          "id": "r_admin",
          "name": "管理员",
          "description": "全权限",
          "permissions": ["*"]
        }
      ],
      "total": 1
    }
  }
  ```

#### 创建/更新/删除角色
- **接口地址**:
  - `POST /role/create`
  - `POST /role/update`
  - `POST /role/delete`
- **请求参数**:
  - 创建/更新: `name`, `description`, `permissions`
  - 删除: `id`

### 2.3 菜单与权限 (`/menu`)

#### 获取后台菜单树 (管理端)
- **接口地址**: `GET /menu/tree`
- **描述**: 获取完整的菜单树结构，用于菜单管理页面展示。
- **请求参数**: 无
- **响应示例**:
  ```json
  {
    "code": 0,
    "msg": "ok",
    "data": [
      {
        "id": "m_dashboard",
        "name": "仪表盘",
        "path": "/admin",
        "permissionKey": "dashboard:view",
        "visible": true,
        "children": []
      }
    ]
  }
  ```

#### 更新菜单节点
- **接口地址**: `POST /menu/update`
- **描述**: 更新菜单节点的配置信息。
- **请求参数**: `id`, `name`, `path`, `iconName`, `visible`, `permissionKey`, `order`

#### 删除菜单节点
- **接口地址**: `POST /menu/delete`
- **描述**: 删除指定菜单节点。
- **请求参数**: `id`

## 3. 错误码说明

| 错误码 | 说明 |
|---|---|
| 20001 | 用户名已存在 |
| 20002 | 手机号格式错误 |
| 20003 | 禁止删除管理员账号 |
| 20004 | 角色下仍有用户绑定 |
