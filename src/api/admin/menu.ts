import { request } from "../axios";

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

export async function fetchAdminMenuTree() {
  return request.get<MenuNode[]>("/admin/menu/tree");
}

export async function updateMenuTree(tree: MenuNode[]) {
  return request.post<boolean>("/admin/menu/tree", { tree });
}

export async function createMenu(data: MenuNode) {
  return request.post<boolean>("/admin/menu/create", data);
}

export async function updateMenu(data: MenuNode) {
  return request.post<boolean>("/admin/menu/update", data);
}

export async function deleteMenu(id: string) {
  return request.post<boolean>("/admin/menu/delete", { id });
}
