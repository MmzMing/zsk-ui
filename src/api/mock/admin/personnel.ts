import { PermissionGroup, UserItem, RoleItem } from "../../admin/personnel";

export const mockAdminUsers: UserItem[] = [
  {
    id: "8101",
    username: "admin",
    name: "系统管理员",
    phone: "13800000001",
    roles: ["管理员"],
    status: "enabled",
    createdAt: "2026-01-10 09:20:11"
  },
  {
    id: "8102",
    username: "editor",
    name: "内容编辑",
    phone: "13800000002",
    roles: ["内容运营"],
    status: "enabled",
    createdAt: "2026-01-11 14:32:45"
  },
  {
    id: "8103",
    username: "auditor",
    name: "审核员",
    phone: "13800000003",
    roles: ["审核员"],
    status: "disabled",
    createdAt: "2026-01-12 16:05:30"
  },
  {
    id: "8104",
    username: "guest001",
    name: "访客用户",
    phone: "13800000004",
    roles: ["访客"],
    status: "enabled",
    createdAt: "2026-01-15 10:12:09"
  }
];

export const mockAdminRoles: RoleItem[] = [
  {
    id: "8201",
    name: "系统管理员",
    description: "拥有后台所有模块的访问与配置权限，用于项目初始配置阶段。",
    createdAt: "2026-01-10 09:00:00",
    permissions: [
      "dashboard:view",
      "dashboard:analysis",
      "ops:monitor",
      "ops:cache",
      "ops:log",
      "personnel:user",
      "personnel:menu",
      "personnel:role"
    ]
  },
  {
    id: "8202",
    name: "内容运营",
    description: "负责日常内容上架与调整，可查看核心监控数据，但无法修改系统配置。",
    createdAt: "2026-01-11 13:20:15",
    permissions: ["dashboard:view", "dashboard:analysis", "ops:log"]
  },
  {
    id: "8203",
    name: "审核员",
    description: "专注于内容的合规性审查，具有审核队列的读写权限。",
    createdAt: "2026-01-12 10:45:00",
    permissions: ["dashboard:view", "ops:log"]
  }
];

export const mockPermissionGroups: PermissionGroup[] = [
  {
    id: "1",
    label: "仪表盘",
    items: [
      {
        id: "8001",
        key: "dashboard:view",
        name: "查看仪表盘总览",
        module: "仪表盘",
        description: "访问后台仪表盘首页，查看整体运行情况。",
        type: "menu",
        createdAt: "2026-01-10 09:00:00"
      },
      {
        id: "8002",
        key: "dashboard:analysis",
        name: "查看分析页",
        module: "仪表盘",
        description: "访问分析页，查看详细流量趋势与指标。",
        type: "menu",
        createdAt: "2026-01-10 09:05:00"
      }
    ]
  },
  {
    id: "2",
    label: "系统运维",
    items: [
      {
        id: "8003",
        key: "ops:monitor",
        name: "查看系统监控",
        module: "系统运维",
        description: "访问系统监控页面，查看各类资源监控数据。",
        type: "menu",
        createdAt: "2026-01-11 10:00:00"
      },
      {
        id: "8004",
        key: "ops:cache",
        name: "查看缓存监控与列表",
        module: "系统运维",
        description: "查看缓存监控面板与缓存键列表。",
        type: "menu",
        createdAt: "2026-01-11 10:10:00"
      },
      {
        id: "8005",
        key: "ops:log",
        name: "查看系统日志",
        module: "系统运维",
        description: "查看系统运行日志与导出日志文件。",
        type: "menu",
        createdAt: "2026-01-11 10:20:00"
      }
    ]
  },
  {
    id: "3",
    label: "人员管理",
    items: [
      {
        id: "8006",
        key: "personnel:user",
        name: "管理用户",
        module: "人员管理",
        description: "管理后台用户账号、基础信息与状态。",
        type: "menu",
        createdAt: "2026-01-12 09:00:00"
      },
      {
        id: "8007",
        key: "personnel:menu",
        name: "管理菜单",
        module: "人员管理",
        description: "配置后台菜单结构与路由映射关系。",
        type: "menu",
        createdAt: "2026-01-12 09:10:00"
      },
      {
        id: "8008",
        key: "personnel:role",
        name: "管理角色与权限",
        module: "人员管理",
        description: "管理角色信息并分配角色权限。",
        type: "menu",
        createdAt: "2026-01-12 09:20:00"
      }
    ]
  },
  {
    id: "4",
    label: "系统管理",
    items: [
      {
        id: "8009",
        key: "system:dict",
        name: "管理字典配置",
        module: "系统管理",
        description: "增删改查系统字典配置与字典项。",
        type: "menu",
        createdAt: "2026-01-13 09:00:00"
      },
      {
        id: "8010",
        key: "system:token",
        name: "管理访问令牌",
        module: "系统管理",
        description: "管理后台访问令牌与密钥，支持吊销与续期。",
        type: "menu",
        createdAt: "2026-01-13 09:10:00"
      },
      {
        id: "8011",
        key: "system:param",
        name: "管理系统参数",
        module: "系统管理",
        description: "配置系统全局参数与运行变量。",
        type: "menu",
        createdAt: "2026-01-13 09:20:00"
      }
    ]
  },
  {
    id: "5",
    label: "内容管理",
    items: [
      {
        id: "8012",
        key: "content:doc",
        name: "管理文档",
        module: "内容管理",
        description: "发布、编辑、下架文档内容。",
        type: "menu",
        createdAt: "2026-01-14 09:00:00"
      },
      {
        id: "8013",
        key: "content:video",
        name: "管理视频",
        module: "内容管理",
        description: "上传、编辑、审核视频内容。",
        type: "menu",
        createdAt: "2026-01-14 09:10:00"
      },
      {
        id: "8014",
        key: "content:review",
        name: "审核内容",
        module: "内容管理",
        description: "处理内容审核队列中的待办任务。",
        type: "menu",
        createdAt: "2026-01-14 09:20:00"
      }
    ]
  }
];
