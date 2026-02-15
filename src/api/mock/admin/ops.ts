import {
  BehaviorEvent,
  BehaviorUser,
  BehaviorPoint,
  SystemLogItem,
  CacheInstanceItem as CacheInstance,
  CacheKeyItem,
  MonitorPoint,
  MonitorOverview
} from "../../admin/ops";
import type { ColumnConfig, LineConfig } from "@ant-design/plots";

export const mockCacheKeys: CacheKeyItem[] = [
  {
    id: "6111",
    key: "session:user:10001",
    type: "hash",
    size: 8.2,
    ttl: 420,
    instanceId: "6102",
    instanceName: "会话缓存",
    updatedAt: "10:41:03"
  },
  {
    id: "6112",
    key: "session:user:10002",
    type: "hash",
    size: 7.6,
    ttl: 300,
    instanceId: "6102",
    instanceName: "会话缓存",
    updatedAt: "10:40:12"
  },
  {
    id: "6113",
    key: "feed:home:hot",
    type: "zset",
    size: 24.3,
    ttl: null,
    instanceId: "6103",
    instanceName: "Feed 流缓存",
    updatedAt: "10:39:27"
  },
  {
    id: "6114",
    key: "feed:user:10001",
    type: "zset",
    size: 16.7,
    ttl: 900,
    instanceId: "6103",
    instanceName: "Feed 流缓存",
    updatedAt: "10:37:52"
  },
  {
    id: "6115",
    key: "config:site:settings",
    type: "hash",
    size: 3.1,
    ttl: null,
    instanceId: "6101",
    instanceName: "Redis 主实例",
    updatedAt: "10:36:18"
  },
  {
    id: "6116",
    key: "config:feature:beta",
    type: "string",
    size: 1.2,
    ttl: 1200,
    instanceId: "6101",
    instanceName: "Redis 主实例",
    updatedAt: "10:34:09"
  },
  {
    id: "6117",
    key: "doc:view:counter:123",
    type: "string",
    size: 0.8,
    ttl: 1800,
    instanceId: "6101",
    instanceName: "Redis 主实例",
    updatedAt: "10:30:42"
  },
  {
    id: "6118",
    key: "login:fail:ip:127.0.0.1",
    type: "string",
    size: 0.5,
    ttl: 240,
    instanceId: "6102",
    instanceName: "会话缓存",
    updatedAt: "10:29:15"
  },
  {
    id: "6119",
    key: "doc:recommend:homepage",
    type: "list",
    size: 12.4,
    ttl: 600,
    instanceId: "6103",
    instanceName: "Feed 流缓存",
    updatedAt: "10:26:51"
  },
  {
    id: "6120",
    key: "user:profile:10001",
    type: "hash",
    size: 5.4,
    ttl: null,
    instanceId: "6101",
    instanceName: "Redis 主实例",
    updatedAt: "10:22:37"
  }
];

export const mockMonitorData: MonitorPoint[] = [
  { metric: "cpu", time: "10:00", value: 32 },
  { metric: "cpu", time: "10:10", value: 45 },
  { metric: "cpu", time: "10:20", value: 67 },
  { metric: "cpu", time: "10:30", value: 81 },
  { metric: "cpu", time: "10:40", value: 76 },
  { metric: "memory", time: "10:00", value: 58 },
  { metric: "memory", time: "10:10", value: 61 },
  { metric: "memory", time: "10:20", value: 63 },
  { metric: "memory", time: "10:30", value: 69 },
  { metric: "memory", time: "10:40", value: 72 },
  { metric: "disk", time: "10:00", value: 71 },
  { metric: "disk", time: "10:10", value: 74 },
  { metric: "disk", time: "10:20", value: 78 },
  { metric: "disk", time: "10:30", value: 83 },
  { metric: "disk", time: "10:40", value: 88 },
  { metric: "network", time: "10:00", value: 23 },
  { metric: "network", time: "10:10", value: 31 },
  { metric: "network", time: "10:20", value: 29 },
  { metric: "network", time: "10:30", value: 35 },
  { metric: "network", time: "10:40", value: 41 },
  { metric: "jvmHeap", time: "10:00", value: 45 },
  { metric: "jvmHeap", time: "10:10", value: 48 },
  { metric: "jvmHeap", time: "10:20", value: 52 },
  { metric: "jvmHeap", time: "10:30", value: 55 },
  { metric: "jvmHeap", time: "10:40", value: 51 }
];

export const mockMonitorOverview: MonitorOverview = {
  cpu: 76,
  memory: 72,
  disk: 88,
  network: 41,
  jvmHeap: 51,
  jvmThread: 128,
  hostName: "zsk-server-01",
  hostIp: "192.168.1.100",
  osName: "Linux 5.15.0"
};

export const mockSystemLogs: SystemLogItem[] = [
  {
    id: "6001",
    time: "2026-01-18 10:40:21",
    level: "ERROR",
    module: "缓存服务",
    message: "/api/cache/batch-delete",
    detail: '{"prefix": "session:*", "instance": "redis-main"}'
  },
  {
    id: "6002",
    time: "2026-01-18 10:38:03",
    level: "ERROR",
    module: "系统监控",
    message: "/api/monitor/disk/alert",
    detail: '{"partition": "/data", "usage": "82%"}'
  },
  {
    id: "6003",
    time: "2026-01-18 10:32:10",
    level: "INFO",
    module: "认证中心",
    message: "/api/auth/login",
    detail: '{"username": "admin", "ip": "192.168.0.10"}'
  },
  {
    id: "6004",
    time: "2026-01-18 10:28:44",
    level: "INFO",
    module: "接口网关",
    message: "/api/admin/dashboard/overview",
    detail: '{"p95_latency": "280ms"}'
  },
  {
    id: "6005",
    time: "2026-01-18 10:21:07",
    level: "ERROR",
    module: "审核中心",
    message: "/api/audit/batch",
    detail: '{"user": "auditor", "count": 20}'
  },
  {
    id: "6006",
    time: "2026-01-18 10:12:33",
    level: "ERROR",
    module: "内容管理",
    message: "/api/video/transcode",
    detail: '{"job_id": "job_20260118_1001", "error": "network_timeout"}'
  },
  {
    id: "6007",
    time: "2026-01-18 10:05:59",
    level: "INFO",
    module: "系统配置",
    message: "/api/config/update",
    detail: '{"fields": ["site_title", "logo"], "operator": "admin"}'
  },
  {
    id: "6008",
    time: "2026-01-18 09:55:12",
    level: "INFO",
    module: "系统运维",
    message: "/api/task/archive",
    detail: '{"task": "archive_daily_stats", "duration": "45s"}'
  },
  {
    id: "6009",
    time: "2026-01-18 09:40:30",
    level: "ERROR",
    module: "缓存服务",
    message: "/api/cache/hitrate/check",
    detail: '{"instance": "redis-feed", "hit_rate": "85%"}'
  },
  {
    id: "6010",
    time: "2026-01-18 09:30:00",
    level: "INFO",
    module: "系统监控",
    message: "/api/system/startup",
    detail: '{"version": "v1.2.0", "env": "Production"}'
  }
];

export const mockCacheInstances: CacheInstance[] = [
  { id: "6101", name: "Redis 主实例", usage: 0.91, nodes: 3, hitRate: 0.93 },
  { id: "6102", name: "会话缓存", usage: 0.76, nodes: 2, hitRate: 0.97 },
  { id: "6103", name: "Feed 流缓存", usage: 0.84, nodes: 4, hitRate: 0.89 }
];

export const mockHitRateTrendData: LineConfig["data"] = [
  { time: "10:00", value: 96, type: "命中率" },
  { time: "10:10", value: 95, type: "命中率" },
  { time: "10:20", value: 93, type: "命中率" },
  { time: "10:30", value: 94, type: "命中率" },
  { time: "10:40", value: 95, type: "命中率" }
];

export const mockQpsTrendData: ColumnConfig["data"] = [
  { time: "10:00", value: 430, type: "请求 QPS" },
  { time: "10:10", value: 520, type: "请求 QPS" },
  { time: "10:20", value: 610, type: "请求 QPS" },
  { time: "10:30", value: 580, type: "请求 QPS" },
  { time: "10:40", value: 640, type: "请求 QPS" }
];

export const mockBehaviorUsers: BehaviorUser[] = [
  {
    id: "6201",
    name: "系统管理员",
    role: "超级管理员",
    department: "技术部",
    lastLoginAt: "2026-01-18 10:32:10",
    lastLoginIp: "192.168.0.10",
    riskLevel: "medium"
  },
  {
    id: "6202",
    name: "内容运营",
    role: "编辑",
    department: "内容运营部",
    lastLoginAt: "2026-01-18 09:58:42",
    lastLoginIp: "192.168.0.21",
    riskLevel: "low"
  },
  {
    id: "6203",
    name: "审核专员",
    role: "审核员",
    department: "审核中心",
    lastLoginAt: "2026-01-18 10:05:17",
    lastLoginIp: "192.168.0.33",
    riskLevel: "low"
  }
];

export const mockBehaviorTimeline: BehaviorPoint[] = [
  { userId: "6201", range: "today", time: "09:00", count: 2 },
  { userId: "6201", range: "today", time: "10:00", count: 5 },
  { userId: "6201", range: "today", time: "11:00", count: 3 },
  { userId: "6201", range: "today", time: "12:00", count: 1 },
  { userId: "6201", range: "7d", time: "2026-01-12", count: 18 },
  { userId: "6201", range: "7d", time: "2026-01-13", count: 14 },
  { userId: "6201", range: "7d", time: "2026-01-14", count: 20 },
  { userId: "6201", range: "7d", time: "2026-01-15", count: 16 },
  { userId: "6201", range: "7d", time: "2026-01-16", count: 22 },
  { userId: "6201", range: "7d", time: "2026-01-17", count: 19 },
  { userId: "6201", range: "7d", time: "2026-01-18", count: 11 },
  { userId: "6202", range: "today", time: "09:00", count: 3 },
  { userId: "6202", range: "today", time: "10:00", count: 4 },
  { userId: "6202", range: "today", time: "11:00", count: 2 },
  { userId: "6202", range: "today", time: "12:00", count: 1 },
  { userId: "6202", range: "7d", time: "2026-01-12", count: 10 },
  { userId: "6202", range: "7d", time: "2026-01-13", count: 8 },
  { userId: "6202", range: "7d", time: "2026-01-14", count: 11 },
  { userId: "6202", range: "7d", time: "2026-01-15", count: 9 },
  { userId: "6202", range: "7d", time: "2026-01-16", count: 12 },
  { userId: "6202", range: "7d", time: "2026-01-17", count: 7 },
  { userId: "6202", range: "7d", time: "2026-01-18", count: 6 },
  { userId: "6203", range: "today", time: "09:00", count: 1 },
  { userId: "6203", range: "today", time: "10:00", count: 2 },
  { userId: "6203", range: "today", time: "11:00", count: 2 },
  { userId: "6203", range: "today", time: "12:00", count: 1 },
  { userId: "6203", range: "7d", time: "2026-01-12", count: 6 },
  { userId: "6203", range: "7d", time: "2026-01-13", count: 7 },
  { userId: "6203", range: "7d", time: "2026-01-14", count: 5 },
  { userId: "6203", range: "7d", time: "2026-01-15", count: 9 },
  { userId: "6203", range: "7d", time: "2026-01-16", count: 8 },
  { userId: "6203", range: "7d", time: "2026-01-17", count: 7 },
  { userId: "6203", range: "7d", time: "2026-01-18", count: 4 }
];

export const mockBehaviorEvents: BehaviorEvent[] = [
  {
    id: "6301",
    userId: "6201",
    time: "10:32:10",
    action: "登录后台",
    module: "登录",
    detail: "账号密码登录成功，设备为 Chrome 浏览器",
    riskLevel: "low"
  },
  {
    id: "6302",
    userId: "6201",
    time: "10:35:22",
    action: "修改系统配置",
    module: "系统设置",
    detail: "更新站点名称与 Logo 配置",
    riskLevel: "medium"
  },
  {
    id: "6303",
    userId: "6201",
    time: "10:40:03",
    action: "批量删除缓存键",
    module: "系统运维",
    detail: "删除前缀为 session:* 的会话缓存 120 条",
    riskLevel: "high"
  },
  {
    id: "6304",
    userId: "6201",
    time: "10:46:17",
    action: "查看系统监控",
    module: "系统运维",
    detail: "查看最近 1 小时资源使用情况",
    riskLevel: "low"
  },
  {
    id: "6305",
    userId: "6202",
    time: "10:02:41",
    action: "登录后台",
    module: "登录",
    detail: "邮箱验证码登录成功",
    riskLevel: "low"
  },
  {
    id: "6306",
    userId: "6202",
    time: "10:08:03",
    action: "编辑文档",
    module: "内容管理",
    detail: "更新文档《知识库小破站 · 使用指南》的正文内容",
    riskLevel: "low"
  },
  {
    id: "6307",
    userId: "6202",
    time: "10:15:29",
    action: "发布视频",
    module: "内容管理",
    detail: "发布新视频《从 0 搭建个人知识库前端》",
    riskLevel: "medium"
  },
  {
    id: "6308",
    userId: "6203",
    time: "10:06:54",
    action: "审核内容",
    module: "审核中心",
    detail: "审核通过 3 篇新提交的文档内容",
    riskLevel: "low"
  },
  {
    id: "6309",
    userId: "6203",
    time: "10:18:37",
    action: "驳回内容",
    module: "审核中心",
    detail: "驳回 1 条涉嫌广告的评论内容",
    riskLevel: "medium"
  }
];
