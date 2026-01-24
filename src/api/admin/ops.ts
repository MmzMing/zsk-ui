import { userRequest as request } from "../axios";
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
  mockBehaviorEvents
} from "../mock/admin/ops";
import type { ColumnConfig, LineConfig } from "@ant-design/plots";

export type ApiDocTreeItem = {
  id: string;
  name: string;
  children?: ApiDocTreeItem[];
};

export async function fetchApiDocTree(params: { keyword?: string }) {
  const isDev = import.meta.env.DEV;
  try {
    const res = await request.get<ApiDocTreeItem[]>("/admin/ops/api-doc/tree", {
      params
    });
    if (res) return res;
    throw new Error("Empty response");
  } catch (error) {
    console.error("fetchApiDocTree error:", error);
    if (isDev) {
      return []; // No mock data for this one yet in the mock file, returning empty array or simple mock if needed.
      // Actually the mock file doesn't have api doc tree. I'll just return empty array or basic node.
      return [{ id: "root", name: "Root", children: [] }];
    }
    throw error;
  }
}

export type ApiDocParam = {
  name: string;
  type: string;
  required: boolean;
  description?: string;
};

export type ApiDocDetail = {
  id: string;
  name: string;
  path: string;
  method: string;
  status: string;
  owner: string;
  description?: string;
  requestParams: ApiDocParam[];
  responseExample: string;
};

export async function fetchApiDocDetail(params: { id: string }) {
  const isDev = import.meta.env.DEV;
  try {
    const res = await request.get<ApiDocDetail>("/admin/ops/api-doc/detail", {
      params
    });
    if (res) return res;
    throw new Error("Empty response");
  } catch (error) {
    console.error("fetchApiDocDetail error:", error);
    if (isDev) {
      return {
        id: params.id,
        name: "Mock API",
        path: "/mock/api",
        method: "GET",
        status: "enabled",
        owner: "Admin",
        requestParams: [],
        responseExample: "{}"
      };
    }
    throw error;
  }
}

export type ApiDocDebugRequest = {
  id: string;
  body: Record<string, unknown>;
};

export type ApiDocDebugResult = {
  status: number;
  headers: Record<string, string>;
  body: unknown;
};

export async function debugApiDoc(body: ApiDocDebugRequest) {
  try {
    return await request.post<ApiDocDebugResult>("/admin/ops/api-doc/debug", body);
  } catch (error) {
    console.error("debugApiDoc error:", error);
    throw error;
  }
}

export type LogLevel = "INFO" | "WARN" | "ERROR";

export type SystemLogItem = {
  id: string;
  time: string;
  level: LogLevel;
  module: string;
  message: string;
  detail: string;
  traceId: string;
};

export async function fetchSystemLogs(params?: {
  page: number;
  pageSize: number;
  keyword?: string;
  module?: string;
  level?: string;
}) {
  const isDev = import.meta.env.DEV;
  try {
    const res = await request.get<{ list: SystemLogItem[]; total: number }>(
      "/admin/ops/logs",
      { params }
    );
    if (res && res.list && res.list.length > 0) return res;
    throw new Error("Empty response");
  } catch (error) {
    console.error("fetchSystemLogs error:", error);
    if (isDev) {
      return {
        list: mockSystemLogs,
        total: mockSystemLogs.length
      };
    }
    throw error;
  }
}

export async function fetchSystemMonitorData() {
  const isDev = import.meta.env.DEV;
  try {
    const res = await request.get<MonitorPoint[]>("/admin/ops/monitor/data");
    if (res && res.length > 0) return res;
    throw new Error("Empty response");
  } catch (error) {
    console.error("fetchSystemMonitorData error:", error);
    if (isDev) {
      return mockMonitorData;
    }
    throw error;
  }
}

export async function fetchSystemMonitorOverview() {
  const isDev = import.meta.env.DEV;
  try {
    const res = await request.get<MonitorOverview>("/admin/ops/monitor/overview");
    if (res && Object.keys(res).length > 0) return res;
    throw new Error("Empty response");
  } catch (error) {
    console.error("fetchSystemMonitorOverview error:", error);
    if (isDev) {
      return mockMonitorOverview;
    }
    throw error;
  }
}

export type MonitorMetric = "cpu" | "memory" | "disk" | "network";

export type MonitorPoint = {
  time: string;
  value: number;
  metric: MonitorMetric;
};

export type MonitorOverview = {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
};

export type MonitorTrendItem = {
  time: string;
  value: number;
  metric: string;
};

export type MonitorTrendParams = {
  metric: "cpu" | "memory" | "disk" | "network";
  range: "1h" | "24h" | "7d" | string;
};

export async function fetchMonitorTrend(params: MonitorTrendParams) {
  const isDev = import.meta.env.DEV;
  try {
    const res = await request.get<MonitorTrendItem[]>("/admin/ops/monitor/trend", {
      params
    });
    if (res) return res;
    throw new Error("Empty response");
  } catch (error) {
    console.error("fetchMonitorTrend error:", error);
    if (isDev) {
      // Return simple mock for trend if needed, or use mockMonitorData mapped
      return mockMonitorData.map(d => ({ ...d, metric: d.metric }));
    }
    throw error;
  }
}

export type CacheInstanceItem = {
  id: string;
  name: string;
  usage: number;
  nodes: number;
  hitRate: number;
};

export async function fetchCacheInstances() {
  const isDev = import.meta.env.DEV;
  try {
    const res = await request.get<CacheInstanceItem[]>("/admin/ops/cache/instances");
    if (res && res.length > 0) return res;
    throw new Error("Empty response");
  } catch (error) {
    console.error("fetchCacheInstances error:", error);
    if (isDev) {
      return mockCacheInstances;
    }
    throw error;
  }
}

export type CacheLogItem = {
  id: string;
  time: string;
  instanceId: string;
  message: string;
};

export async function fetchCacheLogs(params?: { instanceId?: string }) {
  const isDev = import.meta.env.DEV;
  try {
    const res = await request.get<CacheLogItem[]>("/admin/ops/cache/logs", { params });
    if (res && res.length > 0) return res;
    throw new Error("Empty response");
  } catch (error) {
    console.error("fetchCacheLogs error:", error);
    if (isDev) {
      return [
        {
          id: "1",
          time: "10:40",
          instanceId: "redis-main",
          message: "批量删除键前缀为 session:* 的 120 个键"
        },
        {
          id: "2",
          time: "10:30",
          instanceId: "redis-feed",
          message: "刷新热点列表缓存，耗时 120ms"
        }
      ];
    }
    throw error;
  }
}

export async function fetchCacheHitRateTrend(params?: { instanceId?: string }) {
  const isDev = import.meta.env.DEV;
  try {
    const res = await request.get<LineConfig["data"]>("/admin/ops/cache/trend/hit-rate", { params });
    if (res && res.length > 0) return res;
    throw new Error("Empty response");
  } catch (error) {
    console.error("fetchCacheHitRateTrend error:", error);
    if (isDev) {
      return mockHitRateTrendData;
    }
    throw error;
  }
}

export async function fetchCacheQpsTrend(params?: { instanceId?: string }) {
  const isDev = import.meta.env.DEV;
  try {
    const res = await request.get<ColumnConfig["data"]>("/admin/ops/cache/trend/qps", { params });
    if (res && res.length > 0) return res;
    throw new Error("Empty response");
  } catch (error) {
    console.error("fetchCacheQpsTrend error:", error);
    if (isDev) {
      return mockQpsTrendData;
    }
    throw error;
  }
}

export async function refreshCacheKey(params: { id: string }) {
  try {
    return await request.post("/admin/ops/cache/keys/refresh", params);
  } catch (error) {
    console.error("refreshCacheKey error:", error);
    throw error;
  }
}

export async function deleteCacheKey(params: { id: string }) {
  try {
    return await request.delete("/admin/ops/cache/keys", { params });
  } catch (error) {
    console.error("deleteCacheKey error:", error);
    throw error;
  }
}

export async function batchRefreshCacheKeys(params: { ids: string[] }) {
  try {
    return await request.post("/admin/ops/cache/keys/batch-refresh", params);
  } catch (error) {
    console.error("batchRefreshCacheKeys error:", error);
    throw error;
  }
}

export async function batchDeleteCacheKeys(params: { ids: string[] }) {
  try {
    return await request.post("/admin/ops/cache/keys/batch-delete", params);
  } catch (error) {
    console.error("batchDeleteCacheKeys error:", error);
    throw error;
  }
}

export async function clearCacheInstance(params: { instanceId: string }) {
  try {
    return await request.post("/admin/ops/cache/instances/clear", params);
  } catch (error) {
    console.error("clearCacheInstance error:", error);
    throw error;
  }
}

export type CacheInstanceDetail = {
  id: string;
  name: string;
  usage: number;
  hitRate: number;
  qpsTrend: MonitorTrendItem[];
  hitRateTrend: MonitorTrendItem[];
};

export type BehaviorEvent = {
  id: string;
  userId: string;
  time: string;
  action: string;
  module: string;
  detail: string;
  riskLevel: "low" | "medium" | "high";
};

export type BehaviorUser = {
  id: string;
  name: string;
  role?: string;
  department?: string;
  lastLoginAt?: string;
  lastLoginIp?: string;
  riskLevel: "low" | "medium" | "high";
};

export type BehaviorRange = "today" | "7d" | "30d";

export type BehaviorPoint = {
  userId: string;
  range: BehaviorRange;
  time: string;
  count: number;
};

export async function fetchBehaviorUsers() {
  const isDev = import.meta.env.DEV;
  try {
    const res = await request.get<BehaviorUser[]>("/admin/ops/behavior/users");
    if (res && res.length > 0) return res;
    throw new Error("Empty response");
  } catch (error) {
    console.error("fetchBehaviorUsers error:", error);
    if (isDev) {
      return mockBehaviorUsers;
    }
    throw error;
  }
}

export async function fetchBehaviorTimeline(params: { userId: string; range: BehaviorRange }) {
  const isDev = import.meta.env.DEV;
  try {
    const res = await request.get<BehaviorPoint[]>("/admin/ops/behavior/timeline", { params });
    if (res && res.length > 0) return res;
    throw new Error("Empty response");
  } catch (error) {
    console.error("fetchBehaviorTimeline error:", error);
    if (isDev) {
      return mockBehaviorTimeline.filter(
        item => item.userId === params.userId && item.range === params.range
      );
    }
    throw error;
  }
}

export async function fetchBehaviorEvents(params: { userId: string; keyword?: string }) {
  const isDev = import.meta.env.DEV;
  try {
    const res = await request.get<BehaviorEvent[]>("/admin/ops/behavior/events", { params });
    if (res && res.length > 0) return res;
    throw new Error("Empty response");
  } catch (error) {
    console.error("fetchBehaviorEvents error:", error);
    if (isDev) {
      return mockBehaviorEvents.filter(item => {
        if (item.userId !== params.userId) return false;
        if (params.keyword) {
          const content = `${item.action} ${item.module} ${item.detail}`.toLowerCase();
          return content.includes(params.keyword.toLowerCase());
        }
        return true;
      });
    }
    throw error;
  }
}

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

export async function fetchCacheKeys(params: {
  keyword?: string;
  instanceId?: string;
  ttlFilter?: string;
  page: number;
  pageSize: number;
}) {
  const isDev = import.meta.env.DEV;
  try {
    const res = await request.get<{ list: CacheKeyItem[]; total: number }>(
      "/admin/ops/cache/keys",
      { params }
    );
    if (res && res.list && res.list.length > 0) return res;
    throw new Error("Empty response");
  } catch (error) {
    console.error("fetchCacheKeys error:", error);
    if (isDev) {
      // Simple client-side filter for mock data
      let list = mockCacheKeys;
      if (params.keyword) {
        list = list.filter(item => item.key.includes(params.keyword!));
      }
      if (params.instanceId && params.instanceId !== "all") {
        list = list.filter(item => item.instanceId === params.instanceId);
      }
      return {
        list: list,
        total: list.length
      };
    }
    throw error;
  }
}
