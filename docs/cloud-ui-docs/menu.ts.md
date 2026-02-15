# menu.ts（菜单管理）前后端接口对接文档

> 文档创建时间：2026-02-15  
> 对接策略：前端修改路径适配后端，后端补充缺失接口

---

## 一、模块总览

| 子模块 | 前端接口数 | 后端状态 | 对接方案 |
|-------|----------|---------|---------|
| 菜单管理 | 6个 | ⚠️ 部分缺失 | 前端修改路径+后端新增接口 |

---

## 二、接口映射表

| 前端接口 | HTTP | 后端接口 | 对接方案 |
|---------|------|---------|---------|
| `GET /admin/menu/tree` | GET | `GET /menu/list` | 前端修改路径，后端返回树形结构 |
| `POST /admin/menu/tree` | POST | ❌ 缺失 | **后端新增**：批量更新菜单树 |
| `POST /admin/menu/create` | POST | `POST /menu` | 前端修改路径 |
| `POST /admin/menu/update` | POST | `PUT /menu` | 前端修改路径+改用PUT |
| `POST /admin/menu/delete` | POST | `DELETE /menu/{id}` | 前端修改路径+改用DELETE |
| `POST /admin/menu/batch-delete` | POST | `DELETE /menu/{ids}` | 前端修改路径+改用DELETE |

---

## 三、字段映射表

### 3.1 菜单实体字段映射

| 前端字段 | 后端字段 | 类型 | 说明 |
|---------|---------|------|------|
| id | id | String/Long | 主键（雪花算法） |
| name | menuName | String | **需映射**：菜单名称 |
| path | path | String | 路由地址 |
| iconName | icon | String | **需映射**：图标名称 |
| order | orderNum | Integer | **需映射**：显示顺序 |
| visible | visible | Boolean/String | 是否可见（后端：0显示 1隐藏） |
| permissionKey | perms | String | **需映射**：权限标识 |
| parentId | parentId | String/Long | 父级ID |
| children | - | Array | 子菜单列表（前端构建树形结构） |

### 3.2 状态值映射

| 前端visible | 后端visible | 说明 |
|------------|-------------|------|
| true | "0" | 显示 |
| false | "1" | 隐藏 |

---

## 四、前端修改清单

### 4.1 类型定义修改

```typescript
// ===== 后端菜单类型定义 =====

/** 后端菜单类型 */
export type SysMenu = {
  /** 主键ID（雪花算法） */
  id?: number;
  /** 菜单名称 */
  menuName?: string;
  /** 父菜单ID */
  parentId?: number;
  /** 显示顺序 */
  orderNum?: number;
  /** 路由地址 */
  path?: string;
  /** 组件路径 */
  component?: string;
  /** 路由参数 */
  query?: string;
  /** 是否为外链（0是 1否） */
  isFrame?: number;
  /** 是否缓存（0缓存 1不缓存） */
  isCache?: number;
  /** 菜单类型（M目录 C菜单 F按钮） */
  menuType?: string;
  /** 菜单状态（0显示 1隐藏） */
  visible?: string;
  /** 菜单状态（0正常 1停用） */
  status?: string;
  /** 权限标识 */
  perms?: string;
  /** 菜单图标 */
  icon?: string;
  /** 创建时间 */
  createTime?: string;
  /** 更新时间 */
  updateTime?: string;
};
```

### 4.2 字段映射函数

```typescript
// ===== 字段映射函数 =====

/**
 * 菜单后端转前端字段映射
 * @param backendData 后端菜单数据
 * @returns 前端菜单数据
 */
function mapMenuToFrontend(backendData: SysMenu): MenuNode {
  return {
    id: String(backendData.id || ""),
    name: backendData.menuName || "",
    path: backendData.path || "",
    iconName: backendData.icon || "",
    order: backendData.orderNum || 0,
    visible: backendData.visible === "0",
    permissionKey: backendData.perms || "",
    parentId: backendData.parentId ? String(backendData.parentId) : null,
    children: [],
  };
}

/**
 * 菜单前端转后端字段映射
 * @param frontendData 前端菜单数据
 * @returns 后端菜单数据
 */
function mapMenuToBackend(frontendData: Partial<MenuNode>): Partial<SysMenu> {
  return {
    id: frontendData.id ? Number(frontendData.id) : undefined,
    menuName: frontendData.name,
    path: frontendData.path,
    icon: frontendData.iconName,
    orderNum: frontendData.order,
    visible: frontendData.visible ? "0" : "1",
    perms: frontendData.permissionKey,
    parentId: frontendData.parentId ? Number(frontendData.parentId) : 0,
  };
}

/**
 * 构建菜单树形结构
 * @param menuList 菜单列表
 * @returns 树形结构菜单
 */
function buildMenuTree(menuList: SysMenu[]): MenuNode[] {
  /** 按父级ID分组 */
  const menuMap = new Map<number | undefined, SysMenu[]>();
  
  menuList.forEach(menu => {
    const parentId = menu.parentId || 0;
    if (!menuMap.has(parentId)) {
      menuMap.set(parentId, []);
    }
    menuMap.get(parentId)!.push(menu);
  });

  /** 递归构建树 */
  function buildChildren(parentId: number): MenuNode[] {
    const children = menuMap.get(parentId) || [];
    return children
      .sort((a, b) => (a.orderNum || 0) - (b.orderNum || 0))
      .map(menu => ({
        ...mapMenuToFrontend(menu),
        children: buildChildren(menu.id || 0),
      }));
  }

  return buildChildren(0);
}
```

### 4.3 API 函数修改

```typescript
// ===== API 函数 =====

/**
 * 获取管理员菜单树
 * @returns 菜单树结构
 */
export async function fetchAdminMenuTree(): Promise<ApiResponse<MenuNode[]>> {
  const res = await handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<SysMenu[]>>("/menu/list")
        .then((r) => r.data),
    mockData: [],
    apiName: "fetchAdminMenuTree",
  });

  /** 构建树形结构 */
  const tree = buildMenuTree(res.data || []);
  return { code: 200, msg: "ok", data: tree };
}

/**
 * 更新菜单树结构（批量更新）
 * @param tree 完整的菜单树结构
 * @returns 是否成功
 */
export async function updateMenuTree(
  tree: MenuNode[]
): Promise<ApiResponse<boolean>> {
  /** 扁平化树结构 */
  const menuList = flattenMenuTree(tree);
  
  return handleRequest({
    requestFn: () =>
      request.instance
        .put<ApiResponse<boolean>>("/menu/batch", menuList)
        .then((r) => r.data),
    mockData: true,
    apiName: "updateMenuTree",
  });
}

/**
 * 创建新菜单项
 * @param data 菜单项详情数据
 * @returns 是否成功
 */
export async function createMenu(
  data: MenuNode
): Promise<ApiResponse<boolean>> {
  /** 后端菜单数据 */
  const backendData = mapMenuToBackend(data);
  
  return handleRequest({
    requestFn: () =>
      request.instance
        .post<ApiResponse<boolean>>("/menu", backendData)
        .then((r) => r.data),
    mockData: true,
    apiName: "createMenu",
  });
}

/**
 * 更新现有菜单项
 * @param data 菜单项详情数据
 * @returns 是否成功
 */
export async function updateMenu(
  data: MenuNode
): Promise<ApiResponse<boolean>> {
  /** 后端菜单数据 */
  const backendData = mapMenuToBackend(data);
  
  return handleRequest({
    requestFn: () =>
      request.instance
        .put<ApiResponse<boolean>>("/menu", backendData)
        .then((r) => r.data),
    mockData: true,
    apiName: "updateMenu",
  });
}

/**
 * 删除菜单项
 * @param id 菜单项 ID
 * @returns 是否成功
 */
export async function deleteMenu(id: string): Promise<ApiResponse<boolean>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .delete<ApiResponse<boolean>>(`/menu/${id}`)
        .then((r) => r.data),
    mockData: true,
    apiName: "deleteMenu",
  });
}

/**
 * 批量删除菜单项
 * @param ids 菜单项 ID 列表
 * @returns 是否成功
 */
export async function batchDeleteMenu(
  ids: string[]
): Promise<ApiResponse<boolean>> {
  /** ID列表转逗号分隔字符串 */
  const idsStr = ids.join(",");
  
  return handleRequest({
    requestFn: () =>
      request.instance
        .delete<ApiResponse<boolean>>(`/menu/${idsStr}`)
        .then((r) => r.data),
    mockData: true,
    apiName: "batchDeleteMenu",
  });
}

/**
 * 扁平化菜单树
 * @param tree 菜单树
 * @returns 扁平化菜单列表
 */
function flattenMenuTree(tree: MenuNode[]): SysMenu[] {
  const result: SysMenu[] = [];
  
  function flatten(nodes: MenuNode[], parentId: number = 0) {
    nodes.forEach((node, index) => {
      result.push({
        id: Number(node.id),
        menuName: node.name,
        path: node.path,
        icon: node.iconName,
        orderNum: node.order || index,
        visible: node.visible ? "0" : "1",
        perms: node.permissionKey,
        parentId: parentId,
      });
      
      if (node.children && node.children.length > 0) {
        flatten(node.children, Number(node.id));
      }
    });
  }
  
  flatten(tree);
  return result;
}
```

---

## 五、后端新增接口清单

### 5.1 批量更新菜单接口

```java
// ===== 文件：SysMenuController.java =====

/**
 * 批量更新菜单（用于拖拽排序等场景）
 *
 * @param menuList 菜单列表
 * @return 是否成功
 */
@Operation(summary = "批量更新菜单")
@PutMapping("/batch")
public R<Void> batchUpdate(@RequestBody List<SysMenu> menuList) {
    return menuService.updateBatchById(menuList) ? R.ok() : R.fail();
}
```

### 5.2 批量删除菜单接口（已有，需支持多ID）

```java
// ===== 文件：SysMenuController.java =====

/**
 * 批量删除菜单
 *
 * @param ids 菜单ID列表
 * @return 是否成功
 */
@Operation(summary = "批量删除菜单")
@DeleteMapping("/{ids}")
public R<Void> removeBatch(@PathVariable List<Long> ids) {
    return menuService.removeByIds(ids) ? R.ok() : R.fail();
}
```

---

## 六、对接检查清单

### 6.1 前端修改清单

- [ ] 新增 `SysMenu` 后端类型定义
- [ ] 新增 `mapMenuToFrontend` 字段映射函数
- [ ] 新增 `mapMenuToBackend` 字段映射函数
- [ ] 新增 `buildMenuTree` 树形结构构建函数
- [ ] 新增 `flattenMenuTree` 树形结构扁平化函数
- [ ] 修改 `fetchAdminMenuTree` 接口路径为 `/menu/list`
- [ ] 修改 `updateMenuTree` 接口路径为 `/menu/batch`，改用PUT方法
- [ ] 修改 `createMenu` 接口路径为 `/menu`
- [ ] 修改 `updateMenu` 接口路径为 `/menu`，改用PUT方法
- [ ] 修改 `deleteMenu` 接口路径为 `/menu/{id}`，改用DELETE方法
- [ ] 修改 `batchDeleteMenu` 接口路径为 `/menu/{ids}`，改用DELETE方法

### 6.2 后端修改清单

- [ ] 新增批量更新菜单接口 `PUT /menu/batch`
- [ ] 修改删除接口支持批量删除 `DELETE /menu/{ids}`

---

## 七、注意事项

1. **接口路径**：前端接口移除 `/admin` 前缀，直接使用 `/menu`
2. **HTTP方法**：新增用POST，修改用PUT，删除用DELETE
3. **字段映射**：前端使用驼峰命名（如 `menuName`），后端也是驼峰命名，但部分字段名不同
4. **树形结构**：后端返回扁平列表，前端需要构建树形结构
5. **状态值**：后端visible用 "0"/"1"，前端用 true/false
6. **主键生成**：数据库id使用雪花算法生成，不使用自增
7. **排序字段**：后端使用 `orderNum`，前端使用 `order`
8. **权限标识**：后端使用 `perms`，前端使用 `permissionKey`
