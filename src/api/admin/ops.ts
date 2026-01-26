// ===== 1. 依赖导入区域 =====
import { userRequest as request, handleRequestWithMock, handleApiCall } from "../axios";
import {
  mockCacheKeys,
  mockCacheInstances,
  mockSystemLogs,
  mockMonitorData,
  mockMonitorOverview,
  mockHitRateTrendData,
  mockQpsTrendData,
  mockBehaviorUsers,
  mockBehaviorTimeline,
  mockBehaviorEvents,
} from "../mock/admin/ops";
import type { ApiResponse } from "../types";
import type { ColumnConfig, LineConfig } from "@ant-design/plots";

// ===== 2. TODO待处理导入区域 =====

// ===== 3. 状态控制逻辑区域 =====

// ===== 4. 通用工具函数区域 =====

// ===== 5. 注释代码函数区 =====

// ===== 6. 错误处理函数区域 =====

// ===== 7. 数据处理函数区域 =====

// ===== 8. UI渲染逻辑区域 =====

// ===== 9. 页面初始化与事件绑定 =====

// ===== 10. TODO任务管理区域 =====

/**
 * 获取用户行为全量数据
 * @param params 用户 ID, 范围, 关键字及状态控制
 * @returns 组合后的行为数据
 */
export async function getBehaviorFullData(params: {
  userId: string;
  range: BehaviorRange;
  keyword?: string;
  setLoading?: (loading: boolean) => void;
  onError?: (error: unknown) => void;
}) {
  const { userId, range, keyword, setLoading, onError } = params;
  return handleApiCall({
    requestFn: () =>
      Promise.all([
        fetchBehaviorUsers(),
        fetchBehaviorTimeline({ userId, range }),
        fetchBehaviorEvents({ userId, keyword }),
      ]).then(([uRes, tRes, eRes]) => ({
        users: uRes.data || [],
        timeline: tRes.data || [],
        events: eRes.data || [],
      })),
    setLoading,
    onError,
  });
}

/**
 * 获取系统监控全量数据
 * @param params 状态控制
 * @returns 组合后的监控数据
 */
export async function getSystemMonitorFullData(params: {
  setLoading?: (loading: boolean) => void;
  onError?: (error: unknown) => void;
}) {
  const { setLoading, onError } = params;
  return handleApiCall({
    requestFn: () =>
      Promise.all([fetchSystemMonitorData(), fetchSystemMonitorOverview()]).then(
        ([dataRes, ovRes]) => ({
          monitorData: dataRes.data || [],
          overview: ovRes.data,
        })
      ),
    setLoading,
    onError,
  });
}

/**
 * 获取系统日志列表数据
 * @param params 分页及过滤参数
 * @returns 日志列表及总数
 */
export async function getSystemLogListData(params: {
  page: number;
  pageSize: number;
  keyword?: string;
  module?: string;
  level?: string;
  setLoading?: (loading: boolean) => void;
  onError?: (error: unknown) => void;
}) {
  const { page, pageSize, keyword, module, level, setLoading, onError } = params;
  return handleApiCall({
    requestFn: () =>
      fetchSystemLogs({
        page,
        pageSize,
        keyword,
        module,
        level,
      }).then((res) => res.data),
    setLoading,
    onError,
  });
}

/**
 * 获取缓存监控初始化数据
 * @param params 状态控制
 * @returns 组合后的缓存实例及首个实例详情
 */
export async function getCacheMonitorInitialData(params: {
  setLoading?: (loading: boolean) => void;
  setLoadingTrend?: (loading: boolean) => void;
  onError?: (error: unknown) => void;
}) {
  const { setLoading, setLoadingTrend, onError } = params;
  return handleApiCall({
    requestFn: () => fetchCacheInstances().then((res) => res.data),
    setLoading,
    onError,
  }).then(async (instances) => {
    if (instances && instances.length > 0) {
      const defaultInstance =
        instances.find((i) => i.id === "redis-main") || instances[0];
      const detail = await getCacheInstanceDetailData({
        instanceId: defaultInstance.id,
        setLoading: setLoadingTrend,
        onError,
      });
      return { instances, defaultInstance, detail };
    }
    return { instances: [], defaultInstance: null, detail: null };
  });
}

/**
 * 获取缓存实例详情趋势数据
 * @param params 实例 ID 及状态控制
 * @returns 组合后的趋势及日志数据
 */
export async function getCacheInstanceDetailData(params: {
  instanceId: string;
  setLoading?: (loading: boolean) => void;
  onError?: (error: unknown) => void;
}) {
  const { instanceId, setLoading, onError } = params;
  return handleApiCall({
    requestFn: () =>
      Promise.all([
        fetchCacheHitRateTrend({ instanceId }),
        fetchCacheQpsTrend({ instanceId }),
        fetchCacheLogs({ instanceId }),
      ]).then(([hitRes, qpsRes, logRes]) => ({
        hitRateTrendData: hitRes.data,
        qpsTrendData: qpsRes.data,
        cacheLogs: logRes.data,
      })),
    setLoading,
    onError,
  });
}

/**
 * 清理缓存实例数据
 * @param params 实例 ID 及状态控制
 * @returns 是否清空成功
 */
export async function clearCacheInstanceData(params: {
  instanceId: string;
  setLoading?: (loading: boolean) => void;
  onError?: (error: unknown) => void;
}) {
  const { instanceId, setLoading, onError } = params;
  return handleApiCall({
    requestFn: () => clearCacheInstance({ instanceId }).then((res) => res.data),
    setLoading,
    onError,
  });
}

/**
 * 获取缓存实例列表数据
 * @param params 状态控制
 * @returns 缓存实例列表
 */
export async function getCacheInstancesData(params: {
  setLoading?: (loading: boolean) => void;
  onError?: (error: unknown) => void;
}) {
  const { setLoading, onError } = params;
  return handleApiCall({
    requestFn: () => fetchCacheInstances().then((res) => res.data),
    setLoading,
    onError,
  });
}

/**
 * 获取缓存键列表数据
 * @param params 分页及过滤参数
 * @returns 缓存键列表及总数
 */
export async function getCacheKeysListData(params: {
  page: number;
  pageSize: number;
  keyword?: string;
  instanceId?: string;
  setLoading?: (loading: boolean) => void;
  onError?: (error: unknown) => void;
}) {
  const { page, pageSize, keyword, instanceId, setLoading, onError } = params;
  return handleApiCall({
    requestFn: () =>
      fetchCacheKeys({
        page,
        pageSize,
        keyword,
        instanceId,
      }).then((res) => res.data),
    setLoading,
    onError,
  });
}

/**
 * 批量刷新缓存键
 * @param params ID 列表及状态控制
 * @returns 是否刷新成功
 */
export async function batchRefreshCache(params: {
  ids: string[];
  setLoading?: (loading: boolean) => void;
  onError?: (error: unknown) => void;
}) {
  const { ids, setLoading, onError } = params;
  return handleApiCall({
    requestFn: () => batchRefreshCacheKeys({ ids }),
    setLoading,
    onError,
  });
}

/**
 * 批量删除缓存键
 * @param params ID 列表及状态控制
 * @returns 是否删除成功
 */
export async function batchDeleteCache(params: {
  ids: string[];
  setLoading?: (loading: boolean) => void;
  onError?: (error: unknown) => void;
}) {
  const { ids, setLoading, onError } = params;
  return handleApiCall({
    requestFn: () => batchDeleteCacheKeys({ ids }),
    setLoading,
    onError,
  });
}

/**
 * 刷新单个缓存键
 * @param params 键 ID 及状态控制
 * @returns 是否刷新成功
 */
export async function refreshSingleCache(params: {
  id: string;
  setLoading?: (loading: boolean) => void;
  onError?: (error: unknown) => void;
}) {
  const { id, setLoading, onError } = params;
  return handleApiCall({
    requestFn: () => refreshCacheKey({ id }),
    setLoading,
    onError,
  });
}

/**
 * 删除单个缓存键
 * @param params 键 ID 及状态控制
 * @returns 是否删除成功
 */
export async function deleteSingleCache(params: {
  id: string;
  setLoading?: (loading: boolean) => void;
  onError?: (error: unknown) => void;
}) {
  const { id, setLoading, onError } = params;
  return handleApiCall({
    requestFn: () => deleteCacheKey({ id }),
    setLoading,
    onError,
  });
}

// ===== 11. 导出区域 =====

/** API 文档树项 */
export type ApiDocTreeItem = {
  /** 节点 ID */
  id: string;
  /** 节点名称 */
  name: string;
  /** 子节点列表 */
  children?: ApiDocTreeItem[];
};

/** API 文档参数项 */
export type ApiDocParam = {
  /** 参数名 */
  name: string;
  /** 参数类型 */
  type: string;
  /** 是否必填 */
  required: boolean;
  /** 参数描述 */
  description?: string;
};

/** API 文档详情 */
export type ApiDocDetail = {
  /** 文档 ID */
  id: string;
  /** API 名称 */
  name: string;
  /** API 路径 */
  path: string;
  /** 请求方法 */
  method: string;
  /** 状态 */
  status: string;
  /** 负责人 */
  owner: string;
  /** API 描述 */
  description?: string;
  /** 请求参数列表 */
  requestParams: ApiDocParam[];
  /** 响应示例 */
  responseExample: string;
};

/** API 调试请求参数 */
export type ApiDocDebugRequest = {
  /** API ID */
  id: string;
  /** 请求体 */
  body: Record<string, unknown>;
};

/** API 调试结果 */
export type ApiDocDebugResult = {
  /** 响应状态码 */
  status: number;
  /** 响应头 */
  headers: Record<string, string>;
  /** 响应体 */
  body: unknown;
};

/** 日志级别类型 */
export type LogLevel = "INFO" | "WARN" | "ERROR";

/** 系统日志项 */
export type SystemLogItem = {
  /** 日志 ID */
  id: string;
  /** 日志时间 */
  time: string;
  /** 日志级别 */
  level: LogLevel;
  /** 模块名称 */
  module: string;
  /** 日志消息 */
  message: string;
  /** 详细信息 */
  detail: string;
  /** 追踪 ID */
  traceId: string;
};

/** 监控指标类型 */
export type MonitorMetric = "cpu" | "memory" | "disk" | "network";

/** 监控数据点 */
export type MonitorPoint = {
  /** 时间点 */
  time: string;
  /** 指标值 */
  value: number;
  /** 指标类型 */
  metric: MonitorMetric;
};

/** 监控概览数据 */
export type MonitorOverview = {
  /** CPU 使用率 */
  cpu: number;
  /** 内存使用率 */
  memory: number;
  /** 磁盘使用率 */
  disk: number;
  /** 网络使用率 */
  network: number;
};

/** 监控趋势项 */
export type MonitorTrendItem = {
  /** 时间点 */
  time: string;
  /** 指标值 */
  value: number;
  /** 指标名称 */
  metric: string;
};

/** 监控趋势请求参数 */
export type MonitorTrendParams = {
  /** 指标类型 */
  metric: "cpu" | "memory" | "disk" | "network";
  /** 时间范围 */
  range: "1h" | "24h" | "7d" | string;
};

/** 缓存实例项 */
export type CacheInstanceItem = {
  /** 实例 ID */
  id: string;
  /** 实例名称 */
  name: string;
  /** 内存使用量 */
  usage: number;
  /** 节点数量 */
  nodes: number;
  /** 命中率 */
  hitRate: number;
};

/** 缓存日志项 */
export type CacheLogItem = {
  /** 日志 ID */
  id: string;
  /** 日志时间 */
  time: string;
  /** 实例 ID */
  instanceId: string;
  /** 日志消息 */
  message: string;
};

/** 行为审计事件项 */
export type BehaviorEvent = {
  /** 事件 ID */
  id: string;
  /** 用户 ID */
  userId: string;
  /** 事件时间 */
  time: string;
  /** 动作名称 */
  action: string;
  /** 模块名称 */
  module: string;
  /** 详细描述 */
  detail: string;
  /** 风险等级 */
  riskLevel: "low" | "medium" | "high";
};

/** 行为审计用户项 */
export type BehaviorUser = {
  /** 用户 ID */
  id: string;
  /** 用户名 */
  name: string;
  /** 角色 */
  role?: string;
  /** 部门 */
  department?: string;
  /** 最后登录时间 */
  lastLoginAt?: string;
  /** 最后登录 IP */
  lastLoginIp?: string;
  /** 风险等级 */
  riskLevel: "low" | "medium" | "high";
};

/** 行为审计范围类型 */
export type BehaviorRange = "today" | "7d" | "30d";

/** 行为审计数据点 */
export type BehaviorPoint = {
  /** 用户 ID */
  userId: string;
  /** 范围 */
  range: BehaviorRange;
  /** 时间点 */
  time: string;
  /** 事件数量 */
  count: number;
};

/** 缓存键项 */
export type CacheKeyItem = {
  /** 键 ID */
  id: string;
  /** 键名 */
  key: string;
  /** 键类型 */
  type: "string" | "hash" | "list" | "set" | "zset";
  /** 占用大小 */
  size: number;
  /** 过期时间 (s) */
  ttl: number | null;
  /** 实例 ID */
  instanceId: string;
  /** 实例名称 */
  instanceName: string;
  /** 更新时间 */
  updatedAt: string;
};

/**
 * 获取 API 文档树
 * @param params 关键字参数
 * @returns {Promise<ApiResponse<ApiDocTreeItem[]>>} 文档树列表
 */
export async function fetchApiDocTree(params: {
  keyword?: string;
}): Promise<ApiResponse<ApiDocTreeItem[]>> {
  return handleRequestWithMock(
    () =>
      request.instance
        .get<ApiResponse<ApiDocTreeItem[]>>("/admin/ops/api-doc/tree", {
          params,
        })
        .then((r) => r.data),
    [{ id: "root", name: "Root", children: [] }],
    "fetchApiDocTree"
  );
}

/**
 * 获取 API 文档详情
 * @param params API ID 参数
 * @returns {Promise<ApiResponse<ApiDocDetail>>} 文档详情
 */
export async function fetchApiDocDetail(params: {
  id: string;
}): Promise<ApiResponse<ApiDocDetail>> {
  return handleRequestWithMock(
    () =>
      request.instance
        .get<ApiResponse<ApiDocDetail>>("/admin/ops/api-doc/detail", {
          params,
        })
        .then((r) => r.data),
    {
      id: params.id,
      name: "Mock API",
      path: "/mock/api",
      method: "GET",
      status: "enabled",
      owner: "Admin",
      requestParams: [],
      responseExample: "{}",
    },
    "fetchApiDocDetail"
  );
}

/**
 * 调试 API
 * @param body 调试请求数据
 * @returns {Promise<ApiResponse<ApiDocDebugResult>>} 调试结果
 */
export async function debugApiDoc(
  body: ApiDocDebugRequest
): Promise<ApiResponse<ApiDocDebugResult>> {
  return handleRequestWithMock(
    () =>
      request.instance
        .post<ApiResponse<ApiDocDebugResult>>("/admin/ops/api-doc/debug", body)
        .then((r) => r.data),
    {
      status: 200,
      headers: { "content-type": "application/json" },
      body: { message: "Mock response" },
    },
    "debugApiDoc"
  );
}

/**
 * 获取系统日志
 * @param params 分页及过滤参数
 * @returns {Promise<ApiResponse<{ list: SystemLogItem[]; total: number }>>} 日志列表
 */
export async function fetchSystemLogs(params?: {
  page: number;
  pageSize: number;
  keyword?: string;
  module?: string;
  level?: string;
}): Promise<ApiResponse<{ list: SystemLogItem[]; total: number }>> {
  return handleRequestWithMock(
    () =>
      request.instance
        .get<ApiResponse<{ list: SystemLogItem[]; total: number }>>(
          "/admin/ops/logs",
          { params }
        )
        .then((r) => r.data),
    {
      list: mockSystemLogs,
      total: mockSystemLogs.length,
    },
    "fetchSystemLogs"
  );
}

/**
 * 获取系统监控实时数据
 * @returns {Promise<ApiResponse<MonitorPoint[]>>} 实时数据点列表
 */
export async function fetchSystemMonitorData(): Promise<
  ApiResponse<MonitorPoint[]>
> {
  return handleRequestWithMock(
    () =>
      request.instance
        .get<ApiResponse<MonitorPoint[]>>("/admin/ops/monitor/data")
        .then((r) => r.data),
    mockMonitorData,
    "fetchSystemMonitorData"
  );
}

/**
 * 获取系统监控概览
 * @returns {Promise<ApiResponse<MonitorOverview>>} 监控概览数据
 */
export async function fetchSystemMonitorOverview(): Promise<
  ApiResponse<MonitorOverview>
> {
  return handleRequestWithMock(
    () =>
      request.instance
        .get<ApiResponse<MonitorOverview>>("/admin/ops/monitor/overview")
        .then((r) => r.data),
    mockMonitorOverview,
    "fetchSystemMonitorOverview"
  );
}

/**
 * 获取系统监控趋势
 * @param params 监控指标及范围参数
 * @returns {Promise<ApiResponse<MonitorTrendItem[]>>} 监控趋势数据列表
 */
export async function fetchMonitorTrend(
  params: MonitorTrendParams
): Promise<ApiResponse<MonitorTrendItem[]>> {
  return handleRequestWithMock(
    () =>
      request.instance
        .get<ApiResponse<MonitorTrendItem[]>>("/admin/ops/monitor/trend", {
          params,
        })
        .then((r) => r.data),
    mockMonitorData.map((d) => ({ ...d, metric: d.metric })),
    "fetchMonitorTrend"
  );
}

/**
 * 获取缓存实例列表
 * @returns {Promise<ApiResponse<CacheInstanceItem[]>>} 缓存实例列表
 */
export async function fetchCacheInstances(): Promise<
  ApiResponse<CacheInstanceItem[]>
> {
  return handleRequestWithMock(
    () =>
      request.instance
        .get<ApiResponse<CacheInstanceItem[]>>("/admin/ops/cache/instances")
        .then((r) => r.data),
    mockCacheInstances,
    "fetchCacheInstances"
  );
}

/**
 * 获取缓存日志
 * @param params 实例 ID 过滤参数
 * @returns {Promise<ApiResponse<CacheLogItem[]>>} 缓存日志列表
 */
export async function fetchCacheLogs(params?: {
  instanceId?: string;
}): Promise<ApiResponse<CacheLogItem[]>> {
  return handleRequestWithMock(
    () =>
      request.instance
        .get<ApiResponse<CacheLogItem[]>>("/admin/ops/cache/logs", { params })
        .then((r) => r.data),
    [
      {
        id: "1",
        time: "10:40",
        instanceId: "redis-main",
        message: "批量删除键前缀为 session:* 的 120 个键",
      },
      {
        id: "2",
        time: "10:30",
        instanceId: "redis-feed",
        message: "刷新热点列表缓存，耗时 120ms",
      },
    ],
    "fetchCacheLogs"
  );
}

/**
 * 获取缓存命中率趋势
 * @param params 实例 ID 参数
 * @returns {Promise<ApiResponse<LineConfig["data"]>>} 命中率趋势数据
 */
export async function fetchCacheHitRateTrend(params?: {
  instanceId?: string;
}): Promise<ApiResponse<LineConfig["data"]>> {
  return handleRequestWithMock(
    () =>
      request.instance
        .get<ApiResponse<LineConfig["data"]>>(
          "/admin/ops/cache/trend/hit-rate",
          {
            params,
          }
        )
        .then((r) => r.data),
    mockHitRateTrendData,
    "fetchCacheHitRateTrend"
  );
}

/**
 * 获取缓存 QPS 趋势
 * @param params 实例 ID 参数
 * @returns {Promise<ApiResponse<ColumnConfig["data"]>>} QPS 趋势数据
 */
export async function fetchCacheQpsTrend(params?: {
  instanceId?: string;
}): Promise<ApiResponse<ColumnConfig["data"]>> {
  return handleRequestWithMock(
    () =>
      request.instance
        .get<ApiResponse<ColumnConfig["data"]>>("/admin/ops/cache/trend/qps", {
          params,
        })
        .then((r) => r.data),
    mockQpsTrendData,
    "fetchCacheQpsTrend"
  );
}

/**
 * 刷新缓存键
 * @param params 键 ID 参数
 * @returns {Promise<ApiResponse<boolean>>} 是否刷新成功
 */
export async function refreshCacheKey(params: {
  id: string;
}): Promise<ApiResponse<boolean>> {
  return handleRequestWithMock(
    () =>
      request.instance
        .post<ApiResponse<boolean>>("/admin/ops/cache/keys/refresh", params)
        .then((r) => r.data),
    true,
    "refreshCacheKey"
  );
}

/**
 * 删除缓存键
 * @param params 键 ID 参数
 * @returns {Promise<ApiResponse<boolean>>} 是否删除成功
 */
export async function deleteCacheKey(params: {
  id: string;
}): Promise<ApiResponse<boolean>> {
  return handleRequestWithMock(
    () =>
      request.instance
        .delete<ApiResponse<boolean>>("/admin/ops/cache/keys", { params })
        .then((r) => r.data),
    true,
    "deleteCacheKey"
  );
}

/**
 * 批量刷新缓存键
 * @param params ID 列表参数
 * @returns {Promise<ApiResponse<boolean>>} 是否刷新成功
 */
export async function batchRefreshCacheKeys(params: {
  ids: string[];
}): Promise<ApiResponse<boolean>> {
  return handleRequestWithMock(
    () =>
      request.instance
        .post<ApiResponse<boolean>>(
          "/admin/ops/cache/keys/batch-refresh",
          params
        )
        .then((r) => r.data),
    true,
    "batchRefreshCacheKeys"
  );
}

/**
 * 批量删除缓存键
 * @param params ID 列表参数
 * @returns {Promise<ApiResponse<boolean>>} 是否删除成功
 */
export async function batchDeleteCacheKeys(params: {
  ids: string[];
}): Promise<ApiResponse<boolean>> {
  return handleRequestWithMock(
    () =>
      request.instance
        .post<ApiResponse<boolean>>(
          "/admin/ops/cache/keys/batch-delete",
          params
        )
        .then((r) => r.data),
    true,
    "batchDeleteCacheKeys"
  );
}

/**
 * 清空缓存实例
 * @param params 实例 ID 参数
 * @returns {Promise<ApiResponse<boolean>>} 是否清空成功
 */
export async function clearCacheInstance(params: {
  instanceId: string;
}): Promise<ApiResponse<boolean>> {
  return handleRequestWithMock(
    () =>
      request.instance
        .post<ApiResponse<boolean>>("/admin/ops/cache/instances/clear", params)
        .then((r) => r.data),
    true,
    "clearCacheInstance"
  );
}

/**
 * 获取行为审计用户列表
 * @returns {Promise<ApiResponse<BehaviorUser[]>>} 用户列表
 */
export async function fetchBehaviorUsers(): Promise<
  ApiResponse<BehaviorUser[]>
> {
  return handleRequestWithMock(
    () =>
      request.instance
        .get<ApiResponse<BehaviorUser[]>>("/admin/ops/behavior/users")
        .then((r) => r.data),
    mockBehaviorUsers,
    "fetchBehaviorUsers"
  );
}

/**
 * 获取用户行为时间轴
 * @param params 用户 ID 及范围参数
 * @returns {Promise<ApiResponse<BehaviorPoint[]>>} 行为数据点列表
 */
export async function fetchBehaviorTimeline(params: {
  userId: string;
  range: BehaviorRange;
}): Promise<ApiResponse<BehaviorPoint[]>> {
  return handleRequestWithMock(
    () =>
      request.instance
        .get<ApiResponse<BehaviorPoint[]>>("/admin/ops/behavior/timeline", {
          params,
        })
        .then((r) => r.data),
    mockBehaviorTimeline.filter(
      (item) => item.userId === params.userId && item.range === params.range
    ),
    "fetchBehaviorTimeline"
  );
}

/**
 * 获取行为审计事件列表
 * @param params 用户 ID 及关键字参数
 * @returns {Promise<ApiResponse<BehaviorEvent[]>>} 行为事件列表
 */
export async function fetchBehaviorEvents(params: {
  userId: string;
  keyword?: string;
}): Promise<ApiResponse<BehaviorEvent[]>> {
  return handleRequestWithMock(
    () =>
      request.instance
        .get<ApiResponse<BehaviorEvent[]>>("/admin/ops/behavior/events", {
          params,
        })
        .then((r) => r.data),
    mockBehaviorEvents.filter((item) => {
      if (item.userId !== params.userId) return false;
      if (params.keyword) {
        const content =
          `${item.action} ${item.module} ${item.detail}`.toLowerCase();
        return content.includes(params.keyword.toLowerCase());
      }
      return true;
    }),
    "fetchBehaviorEvents"
  );
}

/**
 * 获取缓存键列表
 * @param params 分页及过滤参数
 * @returns {Promise<ApiResponse<{ list: CacheKeyItem[]; total: number }>>} 缓存键列表
 */
export async function fetchCacheKeys(params: {
  keyword?: string;
  instanceId?: string;
  ttlFilter?: string;
  page: number;
  pageSize: number;
}): Promise<ApiResponse<{ list: CacheKeyItem[]; total: number }>> {
  return handleRequestWithMock(
    () =>
      request.instance
        .get<ApiResponse<{ list: CacheKeyItem[]; total: number }>>(
          "/admin/ops/cache/keys",
          { params }
        )
        .then((r) => r.data),
    (() => {
      let list = mockCacheKeys;
      if (params.keyword) {
        list = list.filter((item) => item.key.includes(params.keyword!));
      }
      if (params.instanceId && params.instanceId !== "all") {
        list = list.filter((item) => item.instanceId === params.instanceId);
      }
      return {
        list: list,
        total: list.length,
      };
    })(),
    "fetchCacheKeys"
  );
}
