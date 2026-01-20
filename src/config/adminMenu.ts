import {
  FiPieChart,
  FiLayout,
  FiFileText,
  FiUsers,
  FiSettings,
  FiVideo,
  FiBell
} from "react-icons/fi";
import { routes } from "../router/routes";

export type AdminMenuChild = {
  key: string;
  label: string;
  path: string;
};

export type AdminMenuItem = {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  children: AdminMenuChild[];
};

export const adminMenuItems: AdminMenuItem[] = [
  {
    key: "dashboard",
    label: "仪表盘",
    icon: FiPieChart,
    children: [
      { key: "dashboard-workbench", label: "工作台", path: routes.admin },
      { key: "dashboard-analysis", label: "分析页", path: `${routes.admin}/analysis` }
    ]
  },
  {
    key: "ops",
    label: "系统运维",
    icon: FiLayout,
    children: [
      { key: "ops-api-doc", label: "接口文档", path: `${routes.admin}/ops/api-doc` },
      { key: "ops-system-monitor", label: "系统监控", path: `${routes.admin}/ops/system-monitor` },
      { key: "ops-cache-monitor", label: "缓存监控", path: `${routes.admin}/ops/cache-monitor` },
      { key: "ops-cache-list", label: "缓存列表", path: `${routes.admin}/ops/cache-list` },
      { key: "ops-system-log", label: "系统日志", path: `${routes.admin}/ops/system-log` },
      { key: "ops-user-behavior", label: "用户行为", path: `${routes.admin}/ops/user-behavior` }
    ]
  },
  {
    key: "personnel",
    label: "人员管理",
    icon: FiUsers,
    children: [
      { key: "personnel-user", label: "用户管理", path: `${routes.admin}/personnel/user` },
      { key: "personnel-menu", label: "菜单管理", path: `${routes.admin}/personnel/menu` },
      { key: "personnel-role", label: "角色管理", path: `${routes.admin}/personnel/role` }
    ]
  },
  {
    key: "system",
    label: "系统管理",
    icon: FiSettings,
    children: [
      { key: "system-dict", label: "字典管理", path: `${routes.admin}/system/dict` },
      { key: "system-token", label: "令牌管理", path: `${routes.admin}/system/token` },
      { key: "system-param", label: "参数管理", path: `${routes.admin}/system/param` },
      { key: "system-permission", label: "权限管理", path: `${routes.admin}/system/permission` }
    ]
  },
  {
    key: "video",
    label: "视频管理",
    icon: FiVideo,
    children: [
      { key: "video-upload", label: "视频上传", path: `${routes.admin}/video/upload` },
      { key: "video-list", label: "视频列表", path: `${routes.admin}/video/list` },
      { key: "video-review", label: "审核管理", path: `${routes.admin}/video/review` }
    ]
  },
  {
    key: "document",
    label: "文档管理",
    icon: FiFileText,
    children: [
      { key: "document-upload", label: "文档上传", path: `${routes.admin}/document/upload` },
      { key: "document-list", label: "文档列表", path: `${routes.admin}/document/list` },
      { key: "document-review", label: "审核管理", path: `${routes.admin}/document/review` }
    ]
  },
  {
    key: "bot",
    label: "BOT控制台",
    icon: FiBell,
    children: [
      { key: "bot-napcat", label: "NapCat", path: `${routes.admin}/bot/napcat` },
      { key: "bot-qq", label: "QQBot", path: `${routes.admin}/bot/qq` },
      { key: "bot-wechat", label: "WeChatBot", path: `${routes.admin}/bot/wechat` },
      { key: "bot-dingtalk", label: "DingTalkBot", path: `${routes.admin}/bot/dingtalk` }
    ]
  }
];
