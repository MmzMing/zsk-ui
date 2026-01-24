import { userRequest as request } from "../axios";
import { mockAdminMenuTree } from "../mock/admin/menu";
import type { ApiResponse } from "../types";

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

export async function fetchAdminMenuTree(): Promise<ApiResponse<MenuNode[]>> {
  const isDev = import.meta.env.DEV;
  try {
    const res = await request.instance.get<ApiResponse<MenuNode[]>>("/admin/menu/tree");
    if (res.data) return res.data;
    throw new Error("Empty response");
  } catch (error) {
    if (isDev) {
      console.error("Backend error in fetchAdminMenuTree (mock fallback):", error);
      return { code: 200, msg: "", data: mockAdminMenuTree };
    }
    throw error;
  }
}

export async function updateMenuTree(tree: MenuNode[]): Promise<ApiResponse<boolean>> {
  try {
    const res = await request.instance.post<ApiResponse<boolean>>("/admin/menu/tree", { tree });
    return res.data;
  } catch (error) {
    console.error("Backend error in updateMenuTree:", error);
    throw error;
  }
}

export async function createMenu(data: MenuNode): Promise<ApiResponse<boolean>> {
  try {
    const res = await request.instance.post<ApiResponse<boolean>>("/admin/menu/create", data);
    return res.data;
  } catch (error) {
    console.error("Backend error in createMenu:", error);
    throw error;
  }
}

export async function updateMenu(data: MenuNode): Promise<ApiResponse<boolean>> {
  try {
    const res = await request.instance.post<ApiResponse<boolean>>("/admin/menu/update", data);
    return res.data;
  } catch (error) {
    console.error("Backend error in updateMenu:", error);
    throw error;
  }
}

export async function deleteMenu(id: string): Promise<ApiResponse<boolean>> {
  try {
    const res = await request.instance.post<ApiResponse<boolean>>("/admin/menu/delete", { id });
    return res.data;
  } catch (error) {
    console.error("Backend error in deleteMenu:", error);
    throw error;
  }
}
