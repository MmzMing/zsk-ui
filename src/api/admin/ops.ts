import { request, handleRequest } from "../request";
import type { ApiResponse } from "../types";
import type { ColumnConfig, LineConfig } from "@ant-design/plots";

// ===== 类型定义 =====

/**
 * 系统操作日志
 * @description 对应后端 SysOperLog 实体
 */
export type SysOperLog = {
  /** 日志主键 */
  id?: string;
  /** 模块标题 */
  title?: string;
  /** 业务类型（0其它 1新增 2修改 3删除） */
  businessType?: number;
  /** 方法名称 */
  method?: string;
  /** 请求方式 */
  requestMethod?: string;
  /** 操作人员 */
  operName?: string;
  /** 请求 URL */
  operUrl?: string;
  /** 操作 IP 地址 */
  operIp?: string;
  /** 操作地点 */
  operLocation?: string;
  /** 请求参数 */
  operParam?: string;
  /** 返回结果 */
  jsonResult?: string;
  /** 操作状态（0正常 1异常） */
  status?: number;
  /** 错误消息 */
  errorMsg?: string;
  /** 操作时间 */
  operTime?: string;
  /** 操作时间（别名） */
  time?: string;
  /** 消耗时间（毫秒） */
  costTime?: number;
  /** 日志级别 */
  level?: "info" | "warning" | "error" | "debug";
  /** 模块名称 */
  module?: string;
  /** 消息内容 */
  message?: string;
  /** 详细信息 */
  detail?: string;
};

/**
 * 分页结果类型
 */
export type PageResult<T> = {
  rows: T[];
  total: number;
};

/**
 * 监控指标类型
 */
export type MonitorMetric = "cpu" | "memory" | "disk" | "network" | "jvmHeap";

/**
 * 监控数据点
 */
export type MonitorPoint = {
  time: string;
  value: number;
  metric: MonitorMetric;
};

/**
 * 监控概览数据
 */
export type MonitorOverview = {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  jvmHeap: number;
  jvmThread: number;
  hostName: string;
  hostIp: string;
  osName: string;
};

/**
 * 监控趋势数据项
 */
export type MonitorTrendItem = {
  time: string;
  value: number;
  metric: string;
};

/**
 * 监控趋势请求参数
 */
export type MonitorTrendParams = {
  metric: "cpu" | "memory" | "disk" | "network" | "jvmHeap" | "jvmThread";
  range: "1h" | "24h" | "7d" | string;
};

/**
 * 缓存实例项
 */
export type CacheInstanceItem = {
  id: string;
  name: string;
  usage: number;
  nodes: number;
  hitRate: number;
};

/**
 * 缓存日志项
 */
export type CacheLogItem = {
  id: string;
  time: string;
  instanceId: string;
  message: string;
};

/**
 * 缓存键项
 */
export type CacheKeyItem = {
  id: string;
  key: string;
  type: "string" | "hash" | "list" | "set" | "zset";
  size: number;
  ttl: number | null;
  instanceId: string;
  instanceName: string;
  updatedAt: string;
};

/**
 * 行为事件项
 */
export type BehaviorEvent = {
  id: string;
  userId: string;
  time: string;
  action: string;
  module: string;
  detail: string;
  riskLevel: "low" | "medium" | "high";
};

/**
 * 行为用户项
 */
export type BehaviorUser = {
  id: string;
  name: string;
  role?: string;
  department?: string;
  lastLoginAt?: string;
  lastLoginIp?: string;
  riskLevel: "low" | "medium" | "high";
};

/**
 * 行为时间范围类型
 */
export type BehaviorRange = "today" | "7d" | "30d";

/**
 * 行为数据点
 */
export type BehaviorPoint = {
  userId: string;
  range: BehaviorRange;
  time: string;
  count: number;
};

// ===== API 函数 =====

/**
 * 获取系统日志列表
 */
export async function fetchSystemLogs(params?: {
  page: number;
  pageSize: number;
  keyword?: string;
  module?: string;
  level?: string;
}): Promise<ApiResponse<PageResult<SysOperLog>>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<PageResult<SysOperLog>>>("/system/operLog/list", { params })
        .then((r) => r.data),
    apiName: "fetchSystemLogs",
  });
}

/**
 * 获取系统监控数据
 */
export async function fetchSystemMonitorData(
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<MonitorPoint[]>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<MonitorPoint[]>>("/system/monitor/data")
        .then((r) => r.data),
    apiName: "fetchSystemMonitorData",
    setLoading,
  });
}

/**
 * 获取系统监控概览数据
 */
export async function fetchSystemMonitorOverview(
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<MonitorOverview>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<MonitorOverview>>("/system/monitor/overview")
        .then((r) => r.data),
    apiName: "fetchSystemMonitorOverview",
    setLoading,
  });
}

/**
 * 获取监控趋势数据
 */
export async function fetchMonitorTrend(
  params: MonitorTrendParams,
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<MonitorTrendItem[]>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<MonitorTrendItem[]>>("/system/monitor/trend", { params })
        .then((r) => r.data),
    apiName: "fetchMonitorTrend",
    setLoading,
  });
}

/**
 * 获取缓存实例列表
 */
export async function fetchCacheInstances(
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<CacheInstanceItem[]>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<CacheInstanceItem[]>>("/system/monitor/cache/instances")
        .then((r) => r.data),
    apiName: "fetchCacheInstances",
    setLoading,
  });
}

/**
 * 获取缓存日志列表
 */
export async function fetchCacheLogs(params?: {
  instanceId?: string;
  setLoading?: (loading: boolean) => void;
}): Promise<ApiResponse<CacheLogItem[]>> {
  const { instanceId, setLoading } = params || {};
  return handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<CacheLogItem[]>>("/system/monitor/cache/logs", {
          params: instanceId ? { instanceId } : undefined,
        })
        .then((r) => r.data),
    apiName: "fetchCacheLogs",
    setLoading,
  });
}

/**
 * 获取缓存命中率趋势数据
 */
export async function fetchCacheHitRateTrend(params?: {
  instanceId?: string;
  setLoading?: (loading: boolean) => void;
}): Promise<ApiResponse<LineConfig["data"]>> {
  const { instanceId, setLoading } = params || {};
  return handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<LineConfig["data"]>>("/system/monitor/cache/trend/hitRate", {
          params: instanceId ? { instanceId } : undefined,
        })
        .then((r) => r.data),
    apiName: "fetchCacheHitRateTrend",
    setLoading,
  });
}

/**
 * 获取缓存 QPS 趋势数据
 */
export async function fetchCacheQpsTrend(params?: {
  instanceId?: string;
  setLoading?: (loading: boolean) => void;
}): Promise<ApiResponse<ColumnConfig["data"]>> {
  const { instanceId, setLoading } = params || {};
  return handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<ColumnConfig["data"]>>("/system/monitor/cache/trend/qps", {
          params: instanceId ? { instanceId } : undefined,
        })
        .then((r) => r.data),
    apiName: "fetchCacheQpsTrend",
    setLoading,
  });
}

/**
 * 刷新缓存键
 */
export async function refreshCacheKey(params: {
  key: string;
  setLoading?: (loading: boolean) => void;
}): Promise<ApiResponse<boolean>> {
  const { key, setLoading } = params;
  return handleRequest({
    requestFn: () =>
      request.instance
        .post<ApiResponse<boolean>>("/system/monitor/cache/keys/refresh", null, {
          params: { key },
        })
        .then((r) => r.data),
    apiName: "refreshCacheKey",
    setLoading,
  });
}

/**
 * 删除缓存键
 */
export async function deleteCacheKey(
  key: string,
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .delete<ApiResponse<boolean>>(`/system/monitor/cache/keys/${encodeURIComponent(key)}`)
        .then((r) => r.data),
    apiName: "deleteCacheKey",
    setLoading,
  });
}

/**
 * 批量刷新缓存键
 */
export async function batchRefreshCacheKeys(
  keys: string[],
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .post<ApiResponse<boolean>>("/system/monitor/cache/keys/batchRefresh", keys)
        .then((r) => r.data),
    apiName: "batchRefreshCacheKeys",
    setLoading,
  });
}

/**
 * 批量删除缓存键
 */
export async function batchDeleteCacheKeys(
  keys: string[],
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .post<ApiResponse<boolean>>("/system/monitor/cache/keys/batchDelete", keys)
        .then((r) => r.data),
    apiName: "batchDeleteCacheKeys",
    setLoading,
  });
}

/**
 * 清空缓存实例
 */
export async function clearCacheInstance(
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .post<ApiResponse<boolean>>("/system/monitor/cache/instances/clear")
        .then((r) => r.data),
    apiName: "clearCacheInstance",
    setLoading,
  });
}

/**
 * 获取行为审计用户列表
 */
export async function fetchBehaviorUsers(
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<BehaviorUser[]>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<BehaviorUser[]>>("/system/ops/behavior/users")
        .then((r) => r.data),
    apiName: "fetchBehaviorUsers",
    setLoading,
  });
}

/**
 * 获取行为时间线数据
 */
export async function fetchBehaviorTimeline(params: {
  userId: string;
  range: BehaviorRange;
  setLoading?: (loading: boolean) => void;
}): Promise<ApiResponse<BehaviorPoint[]>> {
  const { userId, range, setLoading } = params;
  return handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<BehaviorPoint[]>>("/system/ops/behavior/timeline", {
          params: { userId, range },
        })
        .then((r) => r.data),
    apiName: "fetchBehaviorTimeline",
    setLoading,
  });
}

/**
 * 获取行为事件列表
 */
export async function fetchBehaviorEvents(params: {
  userId: string;
  keyword?: string;
  setLoading?: (loading: boolean) => void;
}): Promise<ApiResponse<BehaviorEvent[]>> {
  const { userId, keyword, setLoading } = params;
  return handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<BehaviorEvent[]>>("/system/ops/behavior/events", {
          params: { userId, keyword },
        })
        .then((r) => r.data),
    apiName: "fetchBehaviorEvents",
    setLoading,
  });
}

/**
 * 获取缓存键列表
 */
export async function fetchCacheKeys(params: {
  keyword?: string;
  instanceId?: string;
  ttlFilter?: string;
  page: number;
  pageSize: number;
  setLoading?: (loading: boolean) => void;
}): Promise<ApiResponse<PageResult<CacheKeyItem>>> {
  const { keyword, instanceId, ttlFilter, page, pageSize, setLoading } = params;
  return handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<PageResult<CacheKeyItem>>>("/system/monitor/cache/keys", {
          params: { keyword, instanceId, ttlFilter, page, pageSize },
        })
        .then((r) => r.data),
    apiName: "fetchCacheKeys",
    setLoading,
  });
}

/**
 * 获取行为审计完整数据
 */
export async function getBehaviorFullData(params: {
  userId: string;
  range: BehaviorRange;
  keyword?: string;
  setLoading?: (loading: boolean) => void;
  onError?: (error: unknown) => void;
}) {
  const { userId, range, keyword, setLoading, onError } = params;
  const { data } = await handleRequest({
    requestFn: () =>
      Promise.all([
        fetchBehaviorUsers(),
        fetchBehaviorTimeline({ userId, range }),
        fetchBehaviorEvents({ userId, keyword }),
      ]).then(([uRes, tRes, eRes]) => ({
        code: 200,
        msg: "ok",
        data: {
          users: uRes.data || [],
          timeline: tRes.data || [],
          events: eRes.data || [],
        },
      })),
    apiName: "getBehaviorFullData",
    setLoading,
    onError,
  });
  return data;
}

/**
 * 获取系统监控完整数据
 */
export async function getSystemMonitorFullData(params?: {
  setLoading?: (loading: boolean) => void;
  onError?: (error: unknown) => void;
}) {
  const { setLoading, onError } = params || {};
  const { data } = await handleRequest({
    requestFn: () =>
      Promise.all([fetchSystemMonitorData(), fetchSystemMonitorOverview()]).then(
        ([dataRes, ovRes]) => ({
          code: 200,
          msg: "ok",
          data: {
            monitorData: dataRes.data || [],
            overview: ovRes.data,
          },
        })
      ),
    apiName: "getSystemMonitorFullData",
    setLoading,
    onError,
  });
  return data;
}

/**
 * 获取系统日志列表数据
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
  const { data } = await handleRequest({
    requestFn: () =>
      fetchSystemLogs({ page, pageSize, keyword, module, level }),
    apiName: "getSystemLogListData",
    setLoading,
    onError,
  });
  return data;
}

/**
 * 获取缓存监控初始数据
 */
export async function getCacheMonitorInitialData(params?: {
  setLoading?: (loading: boolean) => void;
  setLoadingTrend?: (loading: boolean) => void;
  onError?: (error: unknown) => void;
}) {
  const { setLoading, setLoadingTrend, onError } = params || {};
  const { data: instances } = await handleRequest({
    requestFn: () => fetchCacheInstances(),
    apiName: "getCacheMonitorInitialData",
    setLoading,
    onError,
  });

  if (instances && instances.length > 0) {
    const defaultInstance = instances.find((i) => i.id === "redis-main") || instances[0];
    const detail = await getCacheInstanceDetailData({
      instanceId: defaultInstance.id,
      setLoading: setLoadingTrend,
      onError,
    });
    return { instances, defaultInstance, detail };
  }
  return { instances: [], defaultInstance: null, detail: null };
}

/**
 * 获取缓存实例详情数据
 */
export async function getCacheInstanceDetailData(params: {
  instanceId: string;
  setLoading?: (loading: boolean) => void;
  onError?: (error: unknown) => void;
}) {
  const { instanceId, setLoading, onError } = params;
  const { data } = await handleRequest({
    requestFn: () =>
      Promise.all([
        fetchCacheHitRateTrend({ instanceId }),
        fetchCacheQpsTrend({ instanceId }),
        fetchCacheLogs({ instanceId }),
      ]).then(([hitRes, qpsRes, logRes]) => ({
        code: 200,
        msg: "ok",
        data: {
          hitRateTrendData: hitRes.data,
          qpsTrendData: qpsRes.data,
          cacheLogs: logRes.data,
        },
      })),
    apiName: "getCacheInstanceDetailData",
    setLoading,
    onError,
  });
  return data;
}

/**
 * 清空缓存实例数据
 */
export async function clearCacheInstanceData(params?: {
  setLoading?: (loading: boolean) => void;
  onError?: (error: unknown) => void;
}) {
  const { setLoading, onError } = params || {};
  const { data } = await handleRequest({
    requestFn: () => clearCacheInstance(),
    apiName: "clearCacheInstanceData",
    setLoading,
    onError,
  });
  return data;
}

/**
 * 获取缓存实例列表数据
 */
export async function getCacheInstancesData(params?: {
  setLoading?: (loading: boolean) => void;
  onError?: (error: unknown) => void;
}) {
  const { setLoading, onError } = params || {};
  const { data } = await handleRequest({
    requestFn: () => fetchCacheInstances(),
    apiName: "getCacheInstancesData",
    setLoading,
    onError,
  });
  return data;
}

/**
 * 获取缓存键列表数据
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
  const { data } = await handleRequest({
    requestFn: () => fetchCacheKeys({ page, pageSize, keyword, instanceId }),
    apiName: "getCacheKeysListData",
    setLoading,
    onError,
  });
  return data;
}

/**
 * 批量刷新缓存
 */
export async function batchRefreshCache(params: {
  ids: string[];
  setLoading?: (loading: boolean) => void;
  onError?: (error: unknown) => void;
}) {
  const { ids, setLoading, onError } = params;
  const { data } = await handleRequest({
    requestFn: () => batchRefreshCacheKeys(ids),
    apiName: "batchRefreshCache",
    setLoading,
    onError,
  });
  return data;
}

/**
 * 批量删除缓存
 */
export async function batchDeleteCache(params: {
  ids: string[];
  setLoading?: (loading: boolean) => void;
  onError?: (error: unknown) => void;
}) {
  const { ids, setLoading, onError } = params;
  const { data } = await handleRequest({
    requestFn: () => batchDeleteCacheKeys(ids),
    apiName: "batchDeleteCache",
    setLoading,
    onError,
  });
  return data;
}

/**
 * 刷新单个缓存
 */
export async function refreshSingleCache(params: {
  id: string;
  setLoading?: (loading: boolean) => void;
  onError?: (error: unknown) => void;
}) {
  const { id, setLoading, onError } = params;
  const { data } = await handleRequest({
    requestFn: () => refreshCacheKey({ key: id }),
    apiName: "refreshSingleCache",
    setLoading,
    onError,
  });
  return data;
}

/**
 * 删除单个缓存
 */
export async function deleteSingleCache(params: {
  id: string;
  setLoading?: (loading: boolean) => void;
  onError?: (error: unknown) => void;
}) {
  const { id, setLoading, onError } = params;
  const { data } = await handleRequest({
    requestFn: () => deleteCacheKey(id),
    apiName: "deleteSingleCache",
    setLoading,
    onError,
  });
  return data;
}
