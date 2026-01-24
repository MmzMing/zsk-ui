import { ParamItem, DictItem, TokenItem } from "../../admin/system";

export const mockSystemParams: ParamItem[] = [
  {
    id: "9001",
    key: "site.title",
    name: "站点标题",
    value: "知识库小破站",
    scope: "frontend",
    description: "展示在前台站点标题与浏览器标签上的文案。",
    sensitive: false,
    updatedAt: "2026-01-15 09:20:11"
  },
  {
    id: "9002",
    key: "auth.login.maxRetry",
    name: "登录最大重试次数",
    value: "5",
    scope: "backend",
    description: "同一账号在指定时间窗口内允许的最大登录失败次数。",
    sensitive: false,
    updatedAt: "2026-01-16 10:02:33"
  },
  {
    id: "9003",
    key: "task.statistic.cron",
    name: "统计任务 CRON 表达式",
    value: "0 0 2 * * ?",
    scope: "task",
    description: "每日离线统计任务的调度时间。",
    sensitive: false,
    updatedAt: "2026-01-16 02:00:00"
  },
  {
    id: "9004",
    key: "security.audit.webhook",
    name: "安全审计 Webhook 地址",
    value: "https://api.example.com/audit/webhook",
    scope: "backend",
    description: "高风险操作审计记录推送到外部系统的回调地址。",
    sensitive: true,
    updatedAt: "2026-01-17 14:21:09"
  }
];

export const mockInitialDicts: DictItem[] = [
  {
    id: "10001",
    code: "user_status",
    name: "用户状态",
    category: "用户与权限",
    description: "控制用户在前台与后台的可见性与登录能力。",
    itemCount: 4,
    status: "enabled",
    updatedAt: "2026-01-10 10:12:00"
  },
  {
    id: "10002",
    code: "video_category",
    name: "视频分类",
    category: "内容管理",
    description: "用于对教学视频进行多维度分类与筛选。",
    itemCount: 8,
    status: "enabled",
    updatedAt: "2026-01-11 09:32:18"
  },
  {
    id: "10003",
    code: "doc_tag",
    name: "文档标签",
    category: "内容管理",
    description: "常用文档标签集合，便于前台按标签聚合展示。",
    itemCount: 12,
    status: "enabled",
    updatedAt: "2026-01-12 14:03:45"
  },
  {
    id: "10004",
    code: "notify_channel",
    name: "通知渠道",
    category: "系统配置",
    description: "系统告警与运营通知的推送渠道集合。",
    itemCount: 5,
    status: "enabled",
    updatedAt: "2026-01-13 16:20:30"
  },
  {
    id: "10005",
    code: "feature_flag",
    name: "功能开关",
    category: "系统配置",
    description: "用于灰度发布与 A/B 实验的功能开关配置。",
    itemCount: 6,
    status: "disabled",
    updatedAt: "2026-01-14 11:08:12"
  }
];

export const mockInitialTokens: TokenItem[] = [
  {
    id: "11001",
    name: "前台 Web 访问令牌",
    token: "pk_live_web_0a9f2c8e14b942f3",
    type: "api",
    boundUser: "system",
    createdAt: "2026-01-10 09:01:22",
    expiredAt: "2026-07-10 09:01:22",
    lastUsedAt: "2026-01-18 10:40:01",
    status: "active",
    remark: "供前台 Web 站点调用后台开放接口使用。"
  },
  {
    id: "11002",
    name: "内容运营 API 密钥",
    token: "pk_ops_content_8b21d030a6fb4d51",
    type: "personal",
    boundUser: "operator",
    createdAt: "2026-01-11 11:15:03",
    expiredAt: "2026-04-11 11:15:03",
    lastUsedAt: "2026-01-18 10:20:18",
    status: "active",
    remark: "用于内容运营工具与后台进行数据同步。"
  },
  {
    id: "11003",
    name: "内部监控任务令牌",
    token: "pk_internal_monitor_52fa0c9e7b984c3d",
    type: "internal",
    boundUser: "cron_monitor",
    createdAt: "2026-01-09 08:30:00",
    expiredAt: "2026-01-16 08:30:00",
    lastUsedAt: "2026-01-16 08:29:59",
    status: "expired",
    remark: "已过期，将在监控任务迁移后删除。"
  },
  {
    id: "11004",
    name: "第三方集成测试令牌",
    token: "pk_thirdparty_test_a9b8c7d6e5f4",
    type: "api",
    boundUser: "tester",
    createdAt: "2026-01-08 15:12:47",
    expiredAt: "2026-03-08 15:12:47",
    lastUsedAt: null,
    status: "revoked",
    remark: "测试完成后已主动吊销。"
  }
];
