import { request } from "../axios";

export type ApiDocTreeItem = {
  id: string;
  name: string;
  children?: ApiDocTreeItem[];
};

export async function fetchApiDocTree(params: { keyword?: string }) {
  return request.get<ApiDocTreeItem[]>("/admin/ops/api-doc/tree", {
    params
  });
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
  return request.get<ApiDocDetail>("/admin/ops/api-doc/detail", {
    params
  });
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
  return request.post<ApiDocDebugResult>("/admin/ops/api-doc/debug", body);
}

export type MonitorOverview = {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkUsage: number;
};

export async function fetchMonitorOverview() {
  return request.get<MonitorOverview>("/admin/ops/monitor/overview");
}

export type MonitorTrendItem = {
  time: string;
  value: number;
};

export type MonitorTrendParams = {
  metric: "cpu" | "memory" | "disk" | "network";
  range: "1h" | "24h" | "7d" | string;
};

export async function fetchMonitorTrend(params: MonitorTrendParams) {
  return request.get<MonitorTrendItem[]>("/admin/ops/monitor/trend", {
    params
  });
}

export type CacheInstanceItem = {
  id: string;
  name: string;
  usage: number;
  nodes: number;
  hitRate: number;
};

export async function fetchCacheInstances() {
  return request.get<CacheInstanceItem[]>("/admin/ops/cache/instances");
}

export type CacheInstanceDetail = {
  id: string;
  name: string;
  usage: number;
  hitRate: number;
  qpsTrend: MonitorTrendItem[];
  hitRateTrend: MonitorTrendItem[];
};

export type CacheInstanceDetailParams = {
  id: string;
  range?: string;
};

export async function fetchCacheInstanceDetail(
  params: CacheInstanceDetailParams
) {
  return request.get<CacheInstanceDetail>("/admin/ops/cache/instance-detail", {
    params
  });
}

export type CacheKeyItem = {
  id: string;
  key: string;
  type: string;
  size: number;
  ttl: number | null;
  instanceId: string;
  instanceName: string;
  updatedAt: string;
};

export type CacheKeyListResponse = {
  list: CacheKeyItem[];
  total: number;
};

export type CacheKeyListParams = {
  instanceId: string;
  keyword?: string;
  ttlType?: "all" | "expiring" | "no-expire";
  page: number;
  pageSize: number;
};

export async function fetchCacheKeys(params: CacheKeyListParams) {
  return request.get<CacheKeyListResponse>("/admin/ops/cache/keys", {
    params
  });
}

export type DeleteCacheKeysRequest = {
  instanceId: string;
  keys: string[];
};

export type DeleteCacheKeysResult = {
  success: number;
  failed: number;
  failedKeys: string[];
};

export async function deleteCacheKeys(body: DeleteCacheKeysRequest) {
  return request.post<DeleteCacheKeysResult>(
    "/admin/ops/cache/keys/delete",
    body
  );
}

export type SystemLogItem = {
  id: string;
  time: string;
  level: "INFO" | "WARN" | "ERROR" | string;
  module: string;
  message: string;
  detail: string;
  traceId: string;
};

export type SystemLogListResponse = {
  list: SystemLogItem[];
  total: number;
};

export type SystemLogListParams = {
  level?: "INFO" | "WARN" | "ERROR" | "all";
  module?: string;
  keyword?: string;
  startTime?: string;
  endTime?: string;
  page: number;
  pageSize: number;
};

export async function fetchSystemLogs(params: SystemLogListParams) {
  return request.get<SystemLogListResponse>("/admin/ops/logs", {
    params
  });
}

export type ExportSystemLogsParams = SystemLogListParams & {
  format?: "csv" | "json";
};

export async function exportSystemLogs(params: ExportSystemLogsParams) {
  return request.get<unknown>("/admin/ops/logs/export", {
    params,
    responseType: "blob"
  });
}

export type UserBehaviorTimelineItem = {
  time: string;
  count: number;
};

export type UserBehaviorTimelineParams = {
  userId: string;
  range: string;
};

export async function fetchUserBehaviorTimeline(
  params: UserBehaviorTimelineParams
) {
  return request.get<UserBehaviorTimelineItem[]>(
    "/admin/ops/behavior/timeline",
    {
      params
    }
  );
}

export type UserBehaviorItem = {
  id: string;
  time: string;
  action: string;
  module: string;
  detail: string;
  riskLevel: "low" | "medium" | "high" | string;
};

export type UserBehaviorListResponse = {
  list: UserBehaviorItem[];
  total: number;
};

export type UserBehaviorListParams = {
  userId: string;
  level?: "low" | "medium" | "high";
  keyword?: string;
  startTime?: string;
  endTime?: string;
  page: number;
  pageSize: number;
};

export async function fetchUserBehaviorList(
  params: UserBehaviorListParams
) {
  return request.get<UserBehaviorListResponse>("/admin/ops/behavior/list", {
    params
  });
}
