// ===== 1. 依赖导入区域 =====
import { request, handleRequest } from "../axios";
import {
  mockCacheKeys,
  mockCacheInstances,
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
  const { data } = await handleRequest({
    requestFn: () =>
      Promise.all([
        fetchBehaviorUsers(),
        fetchBehaviorTimeline({ userId, range }),
        fetchBehaviorEvents({ userId, keyword }),
      ]).then(([uRes, tRes, eRes]) => {
        return {
          code: 200,
          msg: "ok",
          data: {
            users: uRes.data || [],
            timeline: tRes.data || [],
            events: eRes.data || [],
          },
        };
      }),
    mockData: {
      users: [],
      timeline: [],
      events: [],
    },
    apiName: "getBehaviorFullData",
    setLoading,
    onError,
  });
  return data;
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
    mockData: {
      monitorData: [],
      overview: { cpu: 0, memory: 0, disk: 0, network: 0, jvmHeap: 0, jvmThread: 0, hostName: "", hostIp: "", osName: "" },
    },
    apiName: "getSystemMonitorFullData",
    setLoading,
    onError,
  });
  return data;
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
  const { data } = await handleRequest({
    requestFn: () =>
      fetchSystemLogs({
        page,
        pageSize,
        keyword,
        module,
        level,
      }),
    mockData: { list: [], total: 0 },
    apiName: "getSystemLogListData",
    setLoading,
    onError,
  });
  return data;
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
  const { data: instances } = await handleRequest({
    requestFn: () => fetchCacheInstances(),
    mockData: [],
    apiName: "getCacheMonitorInitialData",
    setLoading,
    onError,
  });

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
    mockData: {
      hitRateTrendData: [],
      qpsTrendData: [],
      cacheLogs: [],
    },
    apiName: "getCacheInstanceDetailData",
    setLoading,
    onError,
  });
  return data;
}

/**
 * 清理缓存实例数据
 * @param params 状态控制
 * @returns 是否清空成功
 */
export async function clearCacheInstanceData(params: {
  setLoading?: (loading: boolean) => void;
  onError?: (error: unknown) => void;
}) {
  const { setLoading, onError } = params;
  const { data } = await handleRequest({
    requestFn: () => clearCacheInstance(),
    mockData: true,
    apiName: "clearCacheInstanceData",
    setLoading,
    onError,
  });
  return data;
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
  const { data } = await handleRequest({
    requestFn: () => fetchCacheInstances(),
    mockData: [],
    apiName: "getCacheInstancesData",
    setLoading,
    onError,
  });
  return data;
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
  const { data } = await handleRequest({
    requestFn: () =>
      fetchCacheKeys({
        page,
        pageSize,
        keyword,
        instanceId,
      }),
    mockData: { list: [], total: 0 },
    apiName: "getCacheKeysListData",
    setLoading,
    onError,
  });
  return data;
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
  const { data } = await handleRequest({
    requestFn: () => batchRefreshCacheKeys(ids),
    mockData: true,
    apiName: "batchRefreshCache",
    setLoading,
    onError,
  });
  return data;
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
  const { data } = await handleRequest({
    requestFn: () => batchDeleteCacheKeys(ids),
    mockData: true,
    apiName: "batchDeleteCache",
    setLoading,
    onError,
  });
  return data;
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
  const { data } = await handleRequest({
    requestFn: () => refreshCacheKey({ key: id }),
    mockData: true,
    apiName: "refreshSingleCache",
    setLoading,
    onError,
  });
  return data;
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
  const { data } = await handleRequest({
    requestFn: () => deleteCacheKey(id),
    mockData: true,
    apiName: "deleteSingleCache",
    setLoading,
    onError,
  });
  return data;
}

// ===== 11. 导出区域 =====

/** 日志级别类型 */
export type LogLevel = "INFO" | "ERROR";

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
  /** 请求URL */
  message: string;
  /** 请求参数 */
  detail: string;
};

/** 监控指标类型 */
export type MonitorMetric = "cpu" | "memory" | "disk" | "network" | "jvmHeap";

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
  /** JVM堆内存使用率 */
  jvmHeap: number;
  /** JVM线程数 */
  jvmThread: number;
  /** 主机名 */
  hostName: string;
  /** 主机IP */
  hostIp: string;
  /** 操作系统名称 */
  osName: string;
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
  metric: "cpu" | "memory" | "disk" | "network" | "jvmHeap" | "jvmThread";
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

/** 后端操作日志类型 */
export type SysOperLog = {
  /** 主键ID */
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
  /** 请求URL */
  operUrl?: string;
  /** 主机地址 */
  operIp?: string;
  /** 操作地点 */
  operLocation?: string;
  /** 请求参数 */
  operParam?: string;
  /** 返回参数 */
  jsonResult?: string;
  /** 操作状态（0正常 1异常） */
  status?: number;
  /** 错误消息 */
  errorMsg?: string;
  /** 操作时间 */
  operTime?: string;
  /** 消耗时间 */
  costTime?: number;
};

/**
 * 获取系统日志
 * @param params 分页及过滤参数
 * @returns 日志列表响应
 */
export async function fetchSystemLogs(params?: {
  page: number;
  pageSize: number;
  keyword?: string;
  module?: string;
  level?: string;
}): Promise<ApiResponse<{ list: SystemLogItem[]; total: number }>> {
  const { data } = await handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<{ rows: SysOperLog[]; total: number }>>(
          "/system/operLog/list",
          { params }
        )
        .then((r) => r.data),
    mockData: { rows: [], total: 0 },
    apiName: "fetchSystemLogs",
  });

  return {
    code: 200,
    msg: "ok",
    data: {
      list: (data?.rows || []).map(mapOperLogToFrontend),
      total: data?.total || 0,
    },
  };
}

/**
 * 操作日志后端转前端字段映射
 * @param backendData 后端日志数据
 * @returns 前端日志数据
 */
function mapOperLogToFrontend(backendData: SysOperLog): SystemLogItem {
  return {
    id: backendData.id || "",
    time: backendData.operTime || "",
    level: backendData.status === 0 ? "INFO" : "ERROR",
    module: backendData.title || "",
    message: backendData.operUrl || "",
    detail: backendData.operParam || "",
  };
}

/**
 * 获取系统监控实时数据
 * @returns 实时数据点列表
 */
export async function fetchSystemMonitorData(): Promise<
  ApiResponse<MonitorPoint[]>
> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<MonitorPoint[]>>("/system/monitor/data")
        .then((r) => r.data),
    mockData: mockMonitorData,
    apiName: "fetchSystemMonitorData",
  });
}

/**
 * 获取系统监控概览
 * @returns 监控概览数据
 */
export async function fetchSystemMonitorOverview(): Promise<
  ApiResponse<MonitorOverview>
> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<MonitorOverview>>("/system/monitor/overview")
        .then((r) => r.data),
    mockData: mockMonitorOverview,
    apiName: "fetchSystemMonitorOverview",
  });
}

/**
 * 获取系统监控趋势
 * @param params 监控指标及范围参数
 * @returns 监控趋势数据列表
 */
export async function fetchMonitorTrend(
  params: MonitorTrendParams
): Promise<ApiResponse<MonitorTrendItem[]>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<MonitorTrendItem[]>>("/system/monitor/trend", {
          params,
        })
        .then((r) => r.data),
    mockData: mockMonitorData.map((d) => ({ ...d, metric: d.metric })),
    apiName: "fetchMonitorTrend",
  });
}

/**
 * 获取缓存实例列表
 * @returns 缓存实例列表
 */
export async function fetchCacheInstances(): Promise<
  ApiResponse<CacheInstanceItem[]>
> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<CacheInstanceItem[]>>("/system/monitor/cache/instances")
        .then((r) => r.data),
    mockData: mockCacheInstances,
    apiName: "fetchCacheInstances",
  });
}

/**
 * 获取缓存日志
 * @param params 实例 ID 过滤参数
 * @returns 缓存日志列表
 */
export async function fetchCacheLogs(params?: {
  instanceId?: string;
}): Promise<ApiResponse<CacheLogItem[]>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<CacheLogItem[]>>("/system/monitor/cache/logs", { params })
        .then((r) => r.data),
    mockData: [
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
    apiName: "fetchCacheLogs",
  });
}

/**
 * 获取缓存命中率趋势
 * @param params 实例 ID 参数
 * @returns 命中率趋势数据
 */
export async function fetchCacheHitRateTrend(params?: {
  instanceId?: string;
}): Promise<ApiResponse<LineConfig["data"]>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<LineConfig["data"]>>(
          "/system/monitor/cache/trend/hitRate",
          {
            params,
          }
        )
        .then((r) => r.data),
    mockData: mockHitRateTrendData,
    apiName: "fetchCacheHitRateTrend",
  });
}

/**
 * 获取缓存 QPS 趋势
 * @param params 实例 ID 参数
 * @returns QPS 趋势数据
 */
export async function fetchCacheQpsTrend(params?: {
  instanceId?: string;
}): Promise<ApiResponse<ColumnConfig["data"]>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<ColumnConfig["data"]>>("/system/monitor/cache/trend/qps", {
          params,
        })
        .then((r) => r.data),
    mockData: mockQpsTrendData,
    apiName: "fetchCacheQpsTrend",
  });
}

/**
 * 刷新缓存键
 * @param params 键名参数
 * @returns 是否刷新成功
 */
export async function refreshCacheKey(params: {
  key: string;
}): Promise<ApiResponse<boolean>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .post<ApiResponse<boolean>>("/system/monitor/cache/keys/refresh", null, { params })
        .then((r) => r.data),
    mockData: true,
    apiName: "refreshCacheKey",
  });
}

/**
 * 删除缓存键
 * @param key 键名
 * @returns 是否删除成功
 */
export async function deleteCacheKey(key: string): Promise<ApiResponse<boolean>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .delete<ApiResponse<boolean>>(`/system/monitor/cache/keys/${encodeURIComponent(key)}`)
        .then((r) => r.data),
    mockData: true,
    apiName: "deleteCacheKey",
  });
}

/**
 * 批量刷新缓存键
 * @param keys 键名列表
 * @returns 是否刷新成功
 */
export async function batchRefreshCacheKeys(keys: string[]): Promise<ApiResponse<boolean>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .post<ApiResponse<boolean>>(
          "/system/monitor/cache/keys/batchRefresh",
          keys
        )
        .then((r) => r.data),
    mockData: true,
    apiName: "batchRefreshCacheKeys",
  });
}

/**
 * 批量删除缓存键
 * @param keys 键名列表
 * @returns 是否删除成功
 */
export async function batchDeleteCacheKeys(keys: string[]): Promise<ApiResponse<boolean>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .post<ApiResponse<boolean>>(
          "/system/monitor/cache/keys/batchDelete",
          keys
        )
        .then((r) => r.data),
    mockData: true,
    apiName: "batchDeleteCacheKeys",
  });
}

/**
 * 清空缓存实例
 * @returns 是否清空成功
 */
export async function clearCacheInstance(): Promise<ApiResponse<boolean>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .post<ApiResponse<boolean>>("/system/monitor/cache/instances/clear")
        .then((r) => r.data),
    mockData: true,
    apiName: "clearCacheInstance",
  });
}

/**
 * 获取行为审计用户列表
 * @returns {Promise<ApiResponse<BehaviorUser[]>>} 用户列表
 */
export async function fetchBehaviorUsers(): Promise<
  ApiResponse<BehaviorUser[]>
> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<BehaviorUser[]>>("/system/ops/behavior/users")
        .then((r) => r.data),
    mockData: mockBehaviorUsers,
    apiName: "fetchBehaviorUsers",
  });
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
  return handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<BehaviorPoint[]>>("/system/ops/behavior/timeline", {
          params,
        })
        .then((r) => r.data),
    mockData: mockBehaviorTimeline.filter(
      (item) => item.userId === params.userId && item.range === params.range
    ),
    apiName: "fetchBehaviorTimeline",
  });
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
  return handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<BehaviorEvent[]>>("/system/ops/behavior/events", {
          params,
        })
        .then((r) => r.data),
    mockData: mockBehaviorEvents.filter((item) => {
      if (item.userId !== params.userId) return false;
      if (params.keyword) {
        const content =
          `${item.action} ${item.module} ${item.detail}`.toLowerCase();
        return content.includes(params.keyword.toLowerCase());
      }
      return true;
    }),
    apiName: "fetchBehaviorEvents",
  });
}

/**
 * 获取缓存键列表
 * @param params 分页及过滤参数
 * @returns 缓存键列表
 */
export async function fetchCacheKeys(params: {
  keyword?: string;
  instanceId?: string;
  ttlFilter?: string;
  page: number;
  pageSize: number;
}): Promise<ApiResponse<{ list: CacheKeyItem[]; total: number }>> {
  const { data } = await handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<{ rows: CacheKeyItem[]; total: number }>>(
          "/system/monitor/cache/keys",
          { params }
        )
        .then((r) => r.data),
    mockData: { rows: mockCacheKeys, total: mockCacheKeys.length },
    apiName: "fetchCacheKeys",
  });

  return {
    code: 200,
    msg: "ok",
    data: {
      list: data?.rows || [],
      total: data?.total || 0,
    },
  };
}
