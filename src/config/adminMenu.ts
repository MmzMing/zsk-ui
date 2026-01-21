import { routes } from "../router/routes";

export interface AdminMenuNode {
  id: string;
  name: string;
  path: string;
  iconName: string;
  order: number;
  visible: boolean;
  permissionKey: string;
  parentId: string | null;
  children?: AdminMenuNode[];
}

export const adminMenuTree: AdminMenuNode[] = [
  {
    id: "001",
    name: "仪表盘",
    path: routes.admin,
    iconName: "FiPieChart",
    order: 1,
    visible: true,
    permissionKey: "dashboard:root",
    parentId: null,
    children: [
      {
        id: "001001",
        name: "工作台",
        path: routes.admin,
        iconName: "FiHome",
        order: 1,
        visible: true,
        permissionKey: "dashboard:workbench",
        parentId: "001"
      },
      {
        id: "001002",
        name: "分析页",
        path: `${routes.admin}/analysis`,
        iconName: "FiLayers",
        order: 2,
        visible: true,
        permissionKey: "dashboard:analysis",
        parentId: "001"
      }
    ]
  },
  {
    id: "002",
    name: "系统运维",
    path: `${routes.admin}/ops`,
    iconName: "FiLayout",
    order: 2,
    visible: true,
    permissionKey: "ops:root",
    parentId: null,
    children: [
      { id: "002001", name: "接口文档", path: `${routes.admin}/ops/apiDoc`, iconName: "FiList", order: 1, visible: true, permissionKey: "ops:apiDoc", parentId: "002" },
      { id: "002002", name: "系统监控", path: `${routes.admin}/ops/systemMonitor`, iconName: "FiList", order: 2, visible: true, permissionKey: "ops:systemMonitor", parentId: "002" },
      { id: "002003", name: "缓存监控", path: `${routes.admin}/ops/cacheMonitor`, iconName: "FiList", order: 3, visible: true, permissionKey: "ops:cacheMonitor", parentId: "002" },
      { id: "002004", name: "缓存列表", path: `${routes.admin}/ops/cacheList`, iconName: "FiList", order: 4, visible: true, permissionKey: "ops:cacheList", parentId: "002" },
      { id: "002005", name: "系统日志", path: `${routes.admin}/ops/systemLog`, iconName: "FiList", order: 5, visible: true, permissionKey: "ops:systemLog", parentId: "002" },
      { id: "002006", name: "用户行为", path: `${routes.admin}/ops/userBehavior`, iconName: "FiList", order: 6, visible: true, permissionKey: "ops:userBehavior", parentId: "002" }
    ]
  },
  {
    id: "003",
    name: "人员管理",
    path: `${routes.admin}/personnel`,
    iconName: "FiUsers",
    order: 3,
    visible: true,
    permissionKey: "personnel:root",
    parentId: null,
    children: [
      { id: "003001", name: "用户管理", path: `${routes.admin}/personnel/user`, iconName: "FiList", order: 1, visible: true, permissionKey: "personnel:user", parentId: "003" },
      { id: "003002", name: "菜单管理", path: `${routes.admin}/personnel/menu`, iconName: "FiList", order: 2, visible: true, permissionKey: "personnel:menu", parentId: "003" },
      { id: "003003", name: "角色管理", path: `${routes.admin}/personnel/role`, iconName: "FiList", order: 3, visible: true, permissionKey: "personnel:role", parentId: "003" }
    ]
  },
  {
    id: "004",
    name: "系统管理",
    path: `${routes.admin}/system`,
    iconName: "FiSettings",
    order: 4,
    visible: true,
    permissionKey: "system:root",
    parentId: null,
    children: [
      { id: "004001", name: "字典管理", path: `${routes.admin}/system/dict`, iconName: "FiList", order: 1, visible: true, permissionKey: "system:dict", parentId: "004" },
      { id: "004002", name: "令牌管理", path: `${routes.admin}/system/token`, iconName: "FiList", order: 2, visible: true, permissionKey: "system:token", parentId: "004" },
      { id: "004003", name: "参数管理", path: `${routes.admin}/system/param`, iconName: "FiList", order: 3, visible: true, permissionKey: "system:param", parentId: "004" },
      { id: "004004", name: "权限管理", path: `${routes.admin}/system/permission`, iconName: "FiList", order: 4, visible: true, permissionKey: "system:permission", parentId: "004" }
    ]
  },
  {
    id: "005",
    name: "视频管理",
    path: `${routes.admin}/video`,
    iconName: "FiVideo",
    order: 5,
    visible: true,
    permissionKey: "video:root",
    parentId: null,
    children: [
      { id: "005001", name: "视频上传", path: `${routes.admin}/video/upload`, iconName: "FiList", order: 1, visible: true, permissionKey: "video:upload", parentId: "005" },
      { id: "005002", name: "视频列表", path: `${routes.admin}/video/list`, iconName: "FiList", order: 2, visible: true, permissionKey: "video:list", parentId: "005" },
      { id: "005003", name: "审核管理", path: `${routes.admin}/video/review`, iconName: "FiList", order: 3, visible: true, permissionKey: "video:review", parentId: "005" }
    ]
  },
  {
    id: "006",
    name: "文档管理",
    path: `${routes.admin}/document`,
    iconName: "FiFileText",
    order: 6,
    visible: true,
    permissionKey: "document:root",
    parentId: null,
    children: [
      { id: "006001", name: "文档上传", path: `${routes.admin}/document/upload`, iconName: "FiList", order: 1, visible: true, permissionKey: "document:upload", parentId: "006" },
      { id: "006002", name: "文档列表", path: `${routes.admin}/document/list`, iconName: "FiList", order: 2, visible: true, permissionKey: "document:list", parentId: "006" },
      { id: "006003", name: "审核管理", path: `${routes.admin}/document/review`, iconName: "FiList", order: 3, visible: true, permissionKey: "document:review", parentId: "006" }
    ]
  },
  {
    id: "007",
    name: "BOT控制台",
    path: `${routes.admin}/bot`,
    iconName: "FiBell",
    order: 7,
    visible: true,
    permissionKey: "bot:root",
    parentId: null,
    children: [
      { id: "007001", name: "NapCat", path: `${routes.admin}/bot/napcat`, iconName: "FiList", order: 1, visible: true, permissionKey: "bot:napcat", parentId: "007" },
      { id: "007002", name: "QQBot", path: `${routes.admin}/bot/qq`, iconName: "FiList", order: 2, visible: true, permissionKey: "bot:qq", parentId: "007" },
      { id: "007003", name: "WeChatBot", path: `${routes.admin}/bot/wechat`, iconName: "FiList", order: 3, visible: true, permissionKey: "bot:wechat", parentId: "007" },
      { id: "007004", name: "DingTalkBot", path: `${routes.admin}/bot/dingtalk`, iconName: "FiList", order: 4, visible: true, permissionKey: "bot:dingtalk", parentId: "007" }
    ]
  }
];
