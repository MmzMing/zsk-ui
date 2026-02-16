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

// ===== 前端类型定义 =====

/** 菜单节点类型 */
export type MenuNode = {
  /** 菜单ID */
  id: string;
  /** 菜单名称 */
  name: string;
  /** 路由路径 */
  path: string;
  /** 图标名称 */
  iconName: string;
  /** 排序 */
  order: number;
  /** 是否可见 */
  visible: boolean;
  /** 权限键名 */
  permissionKey: string;
  /** 父级ID */
  parentId: string | null;
  /** 子菜单列表 */
  children?: MenuNode[];
};

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
  const menuMap = new Map<number, SysMenu[]>();

  menuList.forEach((menu) => {
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
      .map((menu) => ({
        ...mapMenuToFrontend(menu),
        children: buildChildren(menu.id || 0),
      }));
  }

  return buildChildren(0);
}

/**
 * 扁平化菜单树
 * @param tree 菜单树
 * @param parentId 父级ID
 * @returns 扁平化菜单列表
 */
function flattenMenuTree(tree: MenuNode[], parentId: number = 0): SysMenu[] {
  const result: SysMenu[] = [];

  function flatten(nodes: MenuNode[], pId: number) {
    nodes.forEach((node, index) => {
      result.push({
        id: Number(node.id),
        menuName: node.name,
        path: node.path,
        icon: node.iconName,
        orderNum: node.order || index,
        visible: node.visible ? "0" : "1",
        perms: node.permissionKey,
        parentId: pId,
      });

      if (node.children && node.children.length > 0) {
        flatten(node.children, Number(node.id));
      }
    });
  }

  flatten(tree, parentId);
  return result;
}

// ===== API 函数 =====

/**
 * 获取管理员菜单树
 * @param setLoading 加载状态回调
 * @returns 菜单树结构
 */
export async function fetchAdminMenuTree(
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<MenuNode[]>> {
  const res = await handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<SysMenu[]>>("/system/menu/list")
        .then((r) => r.data),
    apiName: "fetchAdminMenuTree",
    setLoading,
  });

  /** 构建树形结构 */
  const tree = buildMenuTree(res.data || []);
  return { code: 200, msg: "ok", data: tree };
}

/**
 * 更新菜单树结构（批量更新）
 * @param tree 完整的菜单树结构
 * @param setLoading 加载状态回调
 * @returns 是否成功
 */
export async function updateMenuTree(
  tree: MenuNode[],
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  /** 扁平化树结构 */
  const menuList = flattenMenuTree(tree);

  return handleRequest({
    requestFn: () =>
      request.instance
        .put<ApiResponse<boolean>>("/system/menu/batch", menuList)
        .then((r) => r.data),
    apiName: "updateMenuTree",
    setLoading,
  });
}

/**
 * 创建新菜单项
 * @param data 菜单项详情数据
 * @param setLoading 加载状态回调
 * @returns 是否成功
 */
export async function createMenu(
  data: MenuNode,
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  /** 后端菜单数据 */
  const backendData = mapMenuToBackend(data);

  return handleRequest({
    requestFn: () =>
      request.instance
        .post<ApiResponse<boolean>>("/system/menu", backendData)
        .then((r) => r.data),
    apiName: "createMenu",
    setLoading,
  });
}

/**
 * 更新现有菜单项
 * @param data 菜单项详情数据
 * @param setLoading 加载状态回调
 * @returns 是否成功
 */
export async function updateMenu(
  data: MenuNode,
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  /** 后端菜单数据 */
  const backendData = mapMenuToBackend(data);

  return handleRequest({
    requestFn: () =>
      request.instance
        .put<ApiResponse<boolean>>("/system/menu", backendData)
        .then((r) => r.data),
    apiName: "updateMenu",
    setLoading,
  });
}

/**
 * 删除菜单项
 * @param id 菜单项 ID
 * @param setLoading 加载状态回调
 * @returns 是否成功
 */
export async function deleteMenu(
  id: string,
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .delete<ApiResponse<boolean>>(`/system/menu/${id}`)
        .then((r) => r.data),
    apiName: "deleteMenu",
    setLoading,
  });
}

/**
 * 批量删除菜单项
 * @param ids 菜单项 ID 列表
 * @param setLoading 加载状态回调
 * @returns 是否成功
 */
export async function batchDeleteMenu(
  ids: string[],
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  /** ID列表转逗号分隔字符串 */
  const idsStr = ids.join(",");

  return handleRequest({
    requestFn: () =>
      request.instance
        .delete<ApiResponse<boolean>>(`/system/menu/${idsStr}`)
        .then((r) => r.data),
    apiName: "batchDeleteMenu",
    setLoading,
  });
}
