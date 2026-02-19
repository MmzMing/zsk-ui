/**
 * 运维管理相关 API
 * @module api/admin/ops
 * @description 提供系统日志、监控数据、缓存管理、行为审计等运维相关接口
 */

import { request, handleRequest } from "../request";
import type { ApiResponse } from "../types";
import type { ColumnConfig, LineConfig } from "@ant-design/plots";

/**
 * 日志级别类型
 * @description 系统日志的级别分类
 */
export type LogLevel = "INFO" | "ERROR";

/**
 * 系统日志项
 * @description 用于展示系统操作日志列表
 */
export type SystemLogItem = {
  /** 日志唯一标识 */
  id: string;
  /** 日志记录时间，ISO 格式字符串 */
  time: string;
  /** 日志级别：INFO-信息、ERROR-错误 */
  level: LogLevel;
  /** 所属模块名称，如"用户管理"、"文档管理"等 */
  module: string;
  /** 日志消息摘要 */
  message: string;
  /** 日志详细内容 */
  detail: string;
};

/**
 * 监控指标类型
 * @description 系统监控支持的指标类型
 */
export type MonitorMetric = "cpu" | "memory" | "disk" | "network" | "jvmHeap";

/**
 * 监控数据点
 * @description 用于监控图表的数据点
 */
export type MonitorPoint = {
  /** 数据采集时间，ISO 格式字符串 */
  time: string;
  /** 指标数值 */
  value: number;
  /** 指标类型：cpu-CPU使用率、memory-内存使用率、disk-磁盘使用率、network-网络IO、jvmHeap-JVM堆内存 */
  metric: MonitorMetric;
};

/**
 * 监控概览数据
 * @description 系统监控概览面板数据
 */
export type MonitorOverview = {
  /** CPU 使用率百分比 */
  cpu: number;
  /** 内存使用率百分比 */
  memory: number;
  /** 磁盘使用率百分比 */
  disk: number;
  /** 网络 IO 使用率百分比 */
  network: number;
  /** JVM 堆内存使用率百分比 */
  jvmHeap: number;
  /** JVM 线程数量 */
  jvmThread: number;
  /** 主机名称 */
  hostName: string;
  /** 主机 IP 地址 */
  hostIp: string;
  /** 操作系统名称 */
  osName: string;
};

/**
 * 监控趋势数据项
 * @description 用于监控趋势图表的数据点
 */
export type MonitorTrendItem = {
  /** 数据采集时间 */
  time: string;
  /** 指标数值 */
  value: number;
  /** 指标类型名称 */
  metric: string;
};

/**
 * 监控趋势请求参数
 * @description 查询监控趋势数据的参数结构
 */
export type MonitorTrendParams = {
  /** 指标类型：cpu、memory、disk、network、jvmHeap、jvmThread */
  metric: "cpu" | "memory" | "disk" | "network" | "jvmHeap" | "jvmThread";
  /** 时间范围：1h-1小时、24h-24小时、7d-7天 */
  range: "1h" | "24h" | "7d" | string;
};

/**
 * 缓存实例项
 * @description 缓存实例列表数据
 */
export type CacheInstanceItem = {
  /** 实例唯一标识 */
  id: string;
  /** 实例名称，如"主缓存"、"会话缓存"等 */
  name: string;
  /** 内存使用率百分比 */
  usage: number;
  /** 节点数量 */
  nodes: number;
  /** 缓存命中率百分比 */
  hitRate: number;
};

/**
 * 缓存日志项
 * @description 缓存操作日志记录
 */
export type CacheLogItem = {
  /** 日志唯一标识 */
  id: string;
  /** 日志记录时间 */
  time: string;
  /** 关联的缓存实例 ID */
  instanceId: string;
  /** 日志消息内容 */
  message: string;
};

/**
 * 行为事件项
 * @description 用户行为审计事件记录
 */
export type BehaviorEvent = {
  /** 事件唯一标识 */
  id: string;
  /** 关联用户 ID */
  userId: string;
  /** 事件发生时间 */
  time: string;
  /** 用户行为动作，如"登录"、"查看文档"等 */
  action: string;
  /** 所属模块，如"用户模块"、"文档模块"等 */
  module: string;
  /** 行为详细描述 */
  detail: string;
  /** 风险等级：low-低风险、medium-中风险、high-高风险 */
  riskLevel: "low" | "medium" | "high";
};

/**
 * 行为用户项
 * @description 行为审计中的用户信息
 */
export type BehaviorUser = {
  /** 用户唯一标识 */
  id: string;
  /** 用户名称 */
  name: string;
  /** 用户角色 */
  role?: string;
  /** 所属部门 */
  department?: string;
  /** 最后登录时间 */
  lastLoginAt?: string;
  /** 最后登录 IP 地址 */
  lastLoginIp?: string;
  /** 风险等级：low-低风险、medium-中风险、high-高风险 */
  riskLevel: "low" | "medium" | "high";
};

/**
 * 行为时间范围类型
 * @description 行为审计查询的时间范围选项
 */
export type BehaviorRange = "today" | "7d" | "30d";

/**
 * 行为数据点
 * @description 用户行为时间线数据点
 */
export type BehaviorPoint = {
  /** 用户 ID */
  userId: string;
  /** 时间范围 */
  range: BehaviorRange;
  /** 数据点时间 */
  time: string;
  /** 行为次数 */
  count: number;
};

/**
 * 缓存键项
 * @description 缓存键管理列表数据
 */
export type CacheKeyItem = {
  /** 键唯一标识 */
  id: string;
  /** 缮存键名 */
  key: string;
  /** 数据类型：string-字符串、hash-哈希、list-列表、set-集合、zset-有序集合 */
  type: "string" | "hash" | "list" | "set" | "zset";
  /** 数据大小（字节） */
  size: number;
  /** 过期时间（秒），null 表示永不过期 */
  ttl: number | null;
  /** 所属缓存实例 ID */
  instanceId: string;
  /** 所属缓存实例名称 */
  instanceName: string;
  /** 最后更新时间 */
  updatedAt: string;
};

/**
 * 系统操作日志（后端格式）
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
  /** 消耗时间（毫秒） */
  costTime?: number;
};

/**
 * 后端操作日志转前端格式
 * @param backendData 后端日志数据
 * @returns 前端日志格式
 */
const mapOperLogToFrontend = (backendData: SysOperLog): SystemLogItem => ({
  id: backendData.id || "",
  time: backendData.operTime || "",
  level: backendData.status === 0 ? "INFO" : "ERROR",
  module: backendData.title || "",
  message: backendData.operUrl || "",
  detail: backendData.operParam || "",
});

/**
 * 获取系统日志列表
 * @param params 查询参数，包含分页、关键字、模块和级别过滤
 * @returns 日志列表及总数
 */
export async function fetchSystemLogs(params?: {
  page: number;
  pageSize: number;
  keyword?: string;
  module?: string;
  level?: string;
}): Promise<ApiResponse<{ list: SystemLogItem[]; total: number }>> {
  const res = await handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<{ rows: SysOperLog[]; total: number }>>(
          "/system/operLog/list",
          { params }
        )
        .then((r) => r.data),
    apiName: "fetchSystemLogs",
  });

  return {
    code: 200,
    msg: "ok",
    data: {
      list: (res.data?.rows || []).map(mapOperLogToFrontend),
      total: res.data?.total || 0,
    },
  };
}

/**
 * 获取系统监控数据
 * @param setLoading 加载状态回调函数
 * @returns 监控数据点列表
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
 * @param setLoading 加载状态回调函数
 * @returns 监控概览数据
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
 * @param params 查询参数，包含指标类型和时间范围
 * @param setLoading 加载状态回调函数
 * @returns 监控趋势数据列表
 */
export async function fetchMonitorTrend(
  params: MonitorTrendParams,
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<MonitorTrendItem[]>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<MonitorTrendItem[]>>("/system/monitor/trend", {
          params,
        })
        .then((r) => r.data),
    apiName: "fetchMonitorTrend",
    setLoading,
  });
}

/**
 * 获取缓存实例列表
 * @param setLoading 加载状态回调函数
 * @returns 缓存实例列表
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
 * @param params 查询参数，可指定实例 ID
 * @returns 缓存日志列表
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
 * @param params 查询参数，可指定实例 ID
 * @returns 折线图配置数据
 */
export async function fetchCacheHitRateTrend(params?: {
  instanceId?: string;
  setLoading?: (loading: boolean) => void;
}): Promise<ApiResponse<LineConfig["data"]>> {
  const { instanceId, setLoading } = params || {};
  return handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<LineConfig["data"]>>(
          "/system/monitor/cache/trend/hitRate",
          { params: instanceId ? { instanceId } : undefined }
        )
        .then((r) => r.data),
    apiName: "fetchCacheHitRateTrend",
    setLoading,
  });
}

/**
 * 获取缓存 QPS 趋势数据
 * @param params 查询参数，可指定实例 ID
 * @returns 柱状图配置数据
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
 * @param params 包含要刷新的键名
 * @returns 是否刷新成功
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
 * @param key 要删除的键名
 * @param setLoading 加载状态回调函数
 * @returns 是否删除成功
 */
export async function deleteCacheKey(
  key: string,
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .delete<ApiResponse<boolean>>(
          `/system/monitor/cache/keys/${encodeURIComponent(key)}`
        )
        .then((r) => r.data),
    apiName: "deleteCacheKey",
    setLoading,
  });
}

/**
 * 批量刷新缓存键
 * @param keys 要刷新的键名列表
 * @param setLoading 加载状态回调函数
 * @returns 是否刷新成功
 */
export async function batchRefreshCacheKeys(
  keys: string[],
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .post<ApiResponse<boolean>>(
          "/system/monitor/cache/keys/batchRefresh",
          keys
        )
        .then((r) => r.data),
    apiName: "batchRefreshCacheKeys",
    setLoading,
  });
}

/**
 * 批量删除缓存键
 * @param keys 要删除的键名列表
 * @param setLoading 加载状态回调函数
 * @returns 是否删除成功
 */
export async function batchDeleteCacheKeys(
  keys: string[],
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .post<ApiResponse<boolean>>(
          "/system/monitor/cache/keys/batchDelete",
          keys
        )
        .then((r) => r.data),
    apiName: "batchDeleteCacheKeys",
    setLoading,
  });
}

/**
 * 清空缓存实例
 * @param setLoading 加载状态回调函数
 * @returns 是否清空成功
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
 * @param setLoading 加载状态回调函数
 * @returns 用户列表
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
 * @param params 查询参数，包含用户 ID 和时间范围
 * @returns 时间线数据点列表
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
 * @param params 查询参数，包含用户 ID 和关键字
 * @returns 行为事件列表
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
 * @param params 查询参数，包含关键字、实例 ID、TTL 过滤和分页信息
 * @returns 缓存键列表及总数
 */
export async function fetchCacheKeys(params: {
  keyword?: string;
  instanceId?: string;
  ttlFilter?: string;
  page: number;
  pageSize: number;
  setLoading?: (loading: boolean) => void;
}): Promise<ApiResponse<{ list: CacheKeyItem[]; total: number }>> {
  const { keyword, instanceId, ttlFilter, page, pageSize, setLoading } = params;
  const res = await handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<{ rows: CacheKeyItem[]; total: number }>>(
          "/system/monitor/cache/keys",
          { params: { keyword, instanceId, ttlFilter, page, pageSize } }
        )
        .then((r) => r.data),
    apiName: "fetchCacheKeys",
    setLoading,
  });

  return {
    code: 200,
    msg: "ok",
    data: {
      list: res.data?.rows || [],
      total: res.data?.total || 0,
    },
  };
}

/**
 * 获取行为审计完整数据
 * @param params 查询参数，包含用户 ID、时间范围、关键字等
 * @returns 包含用户列表、时间线、事件的完整数据
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
 * @param params 可选参数，包含加载状态回调和错误处理
 * @returns 包含监控数据和概览的完整数据
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
 * @param params 查询参数，包含分页、关键字、模块和级别过滤
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
    apiName: "getSystemLogListData",
    setLoading,
    onError,
  });
  return data;
}

/**
 * 获取缓存监控初始数据
 * @param params 可选参数，包含加载状态回调和错误处理
 * @returns 包含实例列表、默认实例和详情数据
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
 * 获取缓存实例详情数据
 * @param params 查询参数，包含实例 ID
 * @returns 包含命中率趋势、QPS 趋势和日志的详情数据
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
 * @param params 可选参数，包含加载状态回调和错误处理
 * @returns 是否清空成功
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
 * @param params 可选参数，包含加载状态回调和错误处理
 * @returns 缓存实例列表
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
 * @param params 查询参数，包含分页、关键字和实例 ID
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
    apiName: "getCacheKeysListData",
    setLoading,
    onError,
  });
  return data;
}

/**
 * 批量刷新缓存
 * @param params 包含要刷新的键 ID 列表
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
    apiName: "batchRefreshCache",
    setLoading,
    onError,
  });
  return data;
}

/**
 * 批量删除缓存
 * @param params 包含要删除的键 ID 列表
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
    apiName: "batchDeleteCache",
    setLoading,
    onError,
  });
  return data;
}

/**
 * 刷新单个缓存
 * @param params 包含要刷新的键 ID
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
    apiName: "refreshSingleCache",
    setLoading,
    onError,
  });
  return data;
}

/**
 * 删除单个缓存
 * @param params 包含要删除的键 ID
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
    apiName: "deleteSingleCache",
    setLoading,
    onError,
  });
  return data;
}
