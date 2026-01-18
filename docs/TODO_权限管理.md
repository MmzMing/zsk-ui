# 权限与人员管理模块接口 TODO 清单

> 本文档用于记录「后台人员与权限管理」相关页面预计对接的接口信息，便于后续与后端对齐实现方案。所有接口返回格式统一为 `{ code, msg, data }`。

## 一、用户管理

- 接口名称：获取用户列表  
- 接口地址：`GET /api/admin/personnel/user/list`  
- 请求参数：
  - `page`: number，页码，从 1 开始  
  - `pageSize`: number，分页大小，默认 20  
  - `keyword`: string，可选，按账号 / 姓名模糊搜索  
  - `phone`: string，可选，按手机号精确或模糊匹配  
  - `role`: string，可选，按角色过滤  
  - `status`: string，可选，`enabled` | `disabled`  
- 返回数据示例：
  ```json
  {
    "code": 0,
    "msg": "ok",
    "data": {
      "list": [
        {
          "id": "u_001",
          "username": "admin",
          "name": "系统管理员",
          "phone": "13800000000",
          "roles": ["admin", "editor"],
          "status": "enabled",
          "createdAt": "2026-01-01 10:00:00"
        }
      ],
      "total": 12
    }
  }
  ```  
- 测试用例要点：
  - 分页返回 `total`，总数应大于等于当前页记录数  
  - 当无记录时返回空数组而非错误  
  - `status` 与页面开关展示状态保持一致  
- 精简待办：
  - 与统一用户中心（如有）对齐用户字段定义  
  - 确认手机号是否需要唯一约束  

- 接口名称：创建用户  
- 接口地址：`POST /api/admin/personnel/user/create`  
- 请求参数：
  - `username`: string，登录账号  
  - `name`: string，姓名  
  - `phone`: string，手机号  
  - `roles`: string[]，角色标识列表  
  - `status`: string，`enabled` | `disabled`  
- 返回数据示例：
  ```json
  { "code": 0, "msg": "ok", "data": true }
  ```  
- 测试用例要点：
  - `username` 重复时应返回明确错误码与错误信息  
  - `phone` 格式非法时拒绝创建  
- 精简待办：
  - 确认密码初始化策略（默认密码 / 邀请链接等）  

- 接口名称：更新用户  
- 接口地址：`POST /api/admin/personnel/user/update`  
- 请求参数：
  - `id`: string，用户 ID  
  - 其余字段同创建用户接口  
- 测试用例要点：
  - 更新不存在用户 ID 时返回错误  
  - 不允许将自己从所有角色中移除导致无权限（如有相关约束）  
- 精简待办：
  - 与审计模块确认是否需要记录用户信息变更历史  

- 接口名称：删除用户  
- 接口地址：`POST /api/admin/personnel/user/delete`  
- 请求参数：
  - `id`: string，用户 ID  
- 测试用例要点：
  - 禁止删除当前登录用户本身（如有约定）  
  - 关联数据（如操作日志）保留策略需与后端确认  

- 接口名称：批量删除用户  
- 接口地址：`POST /api/admin/personnel/user/batch-delete`  
- 请求参数：
  - `ids`: string[]，用户 ID 列表  
- 测试用例要点：
  - `ids` 为空数组时返回参数错误  
  - 当部分 ID 不存在时应有明确处理策略（忽略 / 报错）  

- 接口名称：切换用户状态  
- 接口地址：`POST /api/admin/personnel/user/toggle-status`  
- 请求参数：
  - `id`: string，用户 ID  
  - `status`: string，`enabled` | `disabled`  
- 测试用例要点：
  - 禁止将唯一管理员账号禁用（如有约束）  

- 接口名称：重置密码（单个 / 批量）  
- 接口地址：  
  - `POST /api/admin/personnel/user/reset-password`  
  - `POST /api/admin/personnel/user/batch-reset-password`  
- 请求参数：
  - 单个：`{ id: string }`  
  - 批量：`{ ids: string[] }`  
- 测试用例要点：
  - 重置成功后密码生成策略、通知方式需明确（例如邮件 / 站内信）  
  - 批量重置时对高风险操作是否需要二次确认或权限校验  

## 二、角色管理

- 接口名称：获取角色列表  
- 接口地址：`GET /api/admin/personnel/role/list`  
- 请求参数：
  - `page`: number，页码，从 1 开始  
  - `pageSize`: number，分页大小，默认 20  
- 返回数据示例：
  ```json
  {
    "code": 0,
    "msg": "ok",
    "data": {
      "list": [
        {
          "id": "r_admin",
          "name": "管理员",
          "description": "拥有系统全部权限",
          "permissions": ["*"],
          "createdAt": "2026-01-01 09:00:00"
        }
      ],
      "total": 3
    }
  }
  ```  
- 测试用例要点：
  - 分页字段与用户列表接口保持一致  
  - `permissions` 字段与菜单、接口权限标识保持统一  

- 接口名称：创建 / 更新 / 删除角色  
- 接口地址：
  - `POST /api/admin/personnel/role/create`  
  - `POST /api/admin/personnel/role/update`  
  - `POST /api/admin/personnel/role/delete`  
- 请求参数：
  - 创建：`{ name, description, permissions[] }`  
  - 更新：`{ id, name, description, permissions[] }`  
  - 删除：`{ id }`  
- 测试用例要点：
  - 删除角色前需确认是否允许存在绑定该角色的用户  
  - 更新角色权限后，已登录用户的权限缓存刷新策略需确认  
- 精简待办：
  - 与权限系统设计约定 `permissions` 字段命名规范（如 `module:action`）  

## 三、菜单管理（权限菜单）

- 接口名称：获取后台菜单树（管理端）  
- 接口地址：`GET /api/admin/personnel/menu/tree`  
- 请求参数：无  
- 返回数据示例：
  ```json
  {
    "code": 0,
    "msg": "ok",
    "data": [
      {
        "id": "menu_dashboard",
        "name": "仪表盘总览",
        "path": "/admin",
        "iconName": "FiPieChart",
        "order": 1,
        "visible": true,
        "permissionKey": "dashboard:view",
        "parentId": null,
        "children": []
      }
    ]
  }
  ```  
- 测试用例要点：
  - 至少包含仪表盘入口菜单  
  - `visible=false` 的菜单是否需要返回，由前后端约定  
  - `permissionKey` 与角色权限中 `permissions` 字段匹配  

- 接口名称：更新菜单节点  
- 接口地址：`POST /api/admin/personnel/menu/update`  
- 请求参数：
  - `id`: string，菜单 ID  
  - `name`: string，名称  
  - `path`: string，路由路径  
  - `iconName`: string，图标名称（对应前端 react-icons）  
  - `visible`: boolean，是否在侧边栏展示  
  - `permissionKey`: string，对应权限标识  
  - `order`: number，排序字段  
- 测试用例要点：
  - 修改 path 或 permissionKey 后，需确认是否影响既有路由与权限控制  

- 接口名称：删除菜单节点  
- 接口地址：`POST /api/admin/personnel/menu/delete`  
- 请求参数：
  - `id`: string，菜单 ID  
- 测试用例要点：
  - 删除存在子菜单的节点时是否允许，或需前置校验  
  - 删除后是否需要同步更新角色的权限绑定  

## 附录：接口测试用例模板与对接说明

- 本模块可复用 `docs/TODO_Admin.md` 与 README 中「接口测试用例模板与后端对接 Checklist」的通用约定。  
- 在补充具体接口时，建议：
  - 对用户、角色、菜单分别创建一组测试用例，覆盖创建、更新、删除、权限不足、参数非法等场景  
  - 在上线前通过 Checklist 核对：权限边界、审计日志、缓存刷新策略是否清晰。  

