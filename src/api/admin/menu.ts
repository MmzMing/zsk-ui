import { request, handleRequest } from "../axios";
import type { ApiResponse } from "../types";

// ===== 类型定义 =====

/**
 * 菜单类型
 * @description 对应后端 sys_menu 表的实体结构
 */
export type SysMenu = {
  /** 主键ID（雪花算法） */
  id?: number;
  /** 菜单名称 */
  menuName?: string;
  /** 菜单名称（别名） */
  name?: string;
  /** 父菜单ID */
  parentId?: number;
  /** 显示顺序 */
  orderNum?: number;
  /** 显示顺序（别名） */
  order?: number;
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
  /** 权限标识（别名） */
  permissionKey?: string;
  /** 菜单图标 */
  icon?: string;
  /** 菜单图标名称 */
  iconName?: string;
  /** 创建时间 */
  createTime?: string;
  /** 更新时间 */
  updateTime?: string;
  /** 子菜单 */
  children?: SysMenu[];
};

// ===== API 函数 =====

/**
 * 获取管理员菜单列表
 */
export async function fetchAdminMenuList(
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<SysMenu[]>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<SysMenu[]>>("/system/menu/list")
        .then((r) => r.data),
    apiName: "fetchAdminMenuList",
    setLoading,
  });
}

/**
 * 批量更新菜单
 */
export async function batchUpdateMenu(
  menuList: Partial<SysMenu>[],
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .put<ApiResponse<boolean>>("/system/menu/batch", menuList)
        .then((r) => r.data),
    apiName: "batchUpdateMenu",
    setLoading,
  });
}

/**
 * 创建菜单
 */
export async function createMenu(
  data: Partial<SysMenu>,
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .post<ApiResponse<boolean>>("/system/menu", data)
        .then((r) => r.data),
    apiName: "createMenu",
    setLoading,
  });
}

/**
 * 更新菜单
 */
export async function updateMenu(
  data: Partial<SysMenu>,
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .put<ApiResponse<boolean>>("/system/menu", data)
        .then((r) => r.data),
    apiName: "updateMenu",
    setLoading,
  });
}

/**
 * 删除菜单
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
 * 批量删除菜单
 */
export async function batchDeleteMenu(
  ids: string[],
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
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
