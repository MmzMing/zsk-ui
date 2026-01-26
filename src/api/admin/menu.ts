// ===== 1. 依赖导入区域 =====
import { userRequest as request, handleRequestWithMock, handleApiCall } from "../axios";
import { mockAdminMenuTree } from "../mock/admin/menu";
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
 * 菜单节点类型
 */
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

/**
 * 获取管理员菜单树
 * @param setLoading 加载状态回调
 * @returns 菜单树结构
 */
export async function fetchAdminMenuTree(
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<MenuNode[]>> {
  return handleApiCall({
    requestFn: () =>
      handleRequestWithMock(
        () =>
          request.instance
            .get<ApiResponse<MenuNode[]>>("/admin/menu/tree")
            .then((r) => r.data),
        mockAdminMenuTree,
        "fetchAdminMenuTree"
      ),
    setLoading
  });
}

/**
 * 更新菜单树结构
 * @param tree 完整的菜单树结构
 * @param setLoading 加载状态回调
 * @returns 是否成功
 */
export async function updateMenuTree(
  tree: MenuNode[],
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  return handleApiCall({
    requestFn: () =>
      handleRequestWithMock(
        () =>
          request.instance
            .post<ApiResponse<boolean>>("/admin/menu/tree", { tree })
            .then((r) => r.data),
        true,
        "updateMenuTree"
      ),
    setLoading
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
  return handleApiCall({
    requestFn: () =>
      handleRequestWithMock(
        () =>
          request.instance
            .post<ApiResponse<boolean>>("/admin/menu/create", data)
            .then((r) => r.data),
        true,
        "createMenu"
      ),
    setLoading
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
  return handleApiCall({
    requestFn: () =>
      handleRequestWithMock(
        () =>
          request.instance
            .post<ApiResponse<boolean>>("/admin/menu/update", data)
            .then((r) => r.data),
        true,
        "updateMenu"
      ),
    setLoading
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
  return handleApiCall({
    requestFn: () =>
      handleRequestWithMock(
        () =>
          request.instance
            .post<ApiResponse<boolean>>("/admin/menu/delete", { id })
            .then((r) => r.data),
        true,
        "deleteMenu"
      ),
    setLoading
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
  return handleApiCall({
    requestFn: () =>
      handleRequestWithMock(
        () =>
          request.instance
            .post<ApiResponse<boolean>>("/admin/menu/batch-delete", { ids })
            .then((r) => r.data),
        true,
        "batchDeleteMenu"
      ),
    setLoading
  });
}
