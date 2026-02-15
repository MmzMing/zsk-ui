# ops.ts（运维管理）前后端接口对接文档

> 文档创建时间：2026-02-15  
> 最后更新时间：2026-02-15
> 对接策略：后端新建接口，前端修改路径适配后端规范

---

## 一、模块总览

| 子模块 | 前端接口数 | 后端状态 | 对接方案 |
|-------|----------|---------|---------|
| 系统日志 | 1个 | ✅ 已完成 | 前端修改路径和字段映射 |
| 系统监控 | 3个 | ❌ 缺失 | 后端新建接口 |
| 缓存管理 | 10个 | ❌ 缺失 | 后端新建接口 |
| 行为审计 | 3个 | ❌ 缺失 | 后端新建接口 |

---

## 二、系统日志 ✅ 已完成

### 2.1 接口映射表

| 前端接口 | HTTP | 后端接口 | 对接方案 |
|---------|------|---------|---------|
| `/admin/ops/logs` | GET | `/system/operLog/list` | ✅ 已修改 |

### 2.2 字段映射表

#### 系统日志（sys_oper_log - MongoDB集合）

| 前端字段 | 后端字段 | 类型 | 说明 |
|---------|---------|------|------|
| id | id | String | MongoDB主键 |
| time | operTime | LocalDateTime | 操作时间 |
| level | status | Integer | **映射规则**：0→INFO, 1→ERROR |
| module | title | String | 模块标题 |
| message | operUrl | String | 请求URL |
| detail | operParam | String | 请求参数 |

### 2.3 前端修改清单 ✅ 已完成

```typescript
// ===== 文件：zsk-ui/src/api/admin/ops.ts =====

/** 后端操作日志类型 */
export type SysOperLog = {
  id?: string;
  title?: string;
  businessType?: number;
  method?: string;
  requestMethod?: string;
  operName?: string;
  operUrl?: string;
  operIp?: string;
  operLocation?: string;
  operParam?: string;
  jsonResult?: string;
  status?: number;
  errorMsg?: string;
  operTime?: string;
  costTime?: number;
};

/** 系统日志项（前端） */
export type SystemLogItem = {
  id: string;
  time: string;
  level: "INFO" | "ERROR";
  module: string;
  message: string;
  detail: string;
};

/**
 * 获取系统日志
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
```

### 2.4 后端新增文件清单 ✅ 已完成

| 文件路径 | 说明 |
|---------|------|
| `com.zsk.system.controller.SysOperLogController` | 操作日志控制器 |
| `com.zsk.system.service.IOperLogService` | 操作日志服务接口 |
| `com.zsk.system.service.impl.OperLogServiceImpl` | 操作日志服务实现 |

### 2.5 后端控制器代码

```java
// ===== 文件：SysOperLogController.java =====
package com.zsk.system.controller;

/**
 * 操作日志 控制器
 *
 * @author wuhuaming
 * @date 2026-02-15
 * @version 1.0
 */
@Tag(name = "操作日志")
@RestController
@RequestMapping("/operLog")
@RequiredArgsConstructor
public class SysOperLogController {

    private final IOperLogService operLogService;

    /**
     * 查询操作日志列表
     */
    @Operation(summary = "查询操作日志列表")
    @GetMapping("/list")
    public R<Map<String, Object>> list(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String operName,
            @RequestParam(required = false) Integer status,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        // ...
    }
}
```
 */
function mapLogLevel(status: string): LogLevel {
  return status === "0" ? "INFO" : "ERROR";
}
```

### 2.4 后端接口说明

后端已有 `sys_oper_log` 表和对应接口，路径为 `/system/monitor/log/list`，前端需适配。

---

## 三、系统监控 ✅ 已完成

### 3.1 接口映射表

| 前端接口 | HTTP | 后端接口 | 对接方案 |
|---------|------|---------|---------|
| `/admin/ops/monitor/data` | GET | `/system/monitor/data` | ✅ 已修改 |
| `/admin/ops/monitor/overview` | GET | `/system/monitor/overview` | ✅ 已修改 |
| `/admin/ops/monitor/trend` | GET | `/system/monitor/trend` | ✅ 已修改 |

### 3.2 字段映射表

#### 监控数据点

| 前端字段 | 后端字段 | 类型 | 说明 |
|---------|---------|------|------|
| time | time | String | 时间点 |
| value | value | Number | 指标值（百分比） |
| metric | metric | String | 指标类型 |

#### 监控概览

| 前端字段 | 后端字段 | 类型 | 说明 |
|---------|---------|------|------|
| cpu | cpu | Number | CPU使用率（百分比） |
| memory | memory | Number | 内存使用率（百分比） |
| disk | disk | Number | 磁盘使用率（百分比） |
| network | network | Number | 网络使用率（百分比） |
| jvmHeap | jvmHeap | Number | JVM堆内存使用率（百分比） |
| jvmThread | jvmThread | Number | JVM线程数 |
| hostName | hostName | String | 主机名 |
| hostIp | hostIp | String | 主机IP |
| osName | osName | String | 操作系统名称 |

### 3.3 前端修改清单 ✅ 已完成

```typescript
// ===== 文件：zsk-ui/src/api/admin/ops.ts =====

/** 监控指标类型 */
export type MonitorMetric = "cpu" | "memory" | "disk" | "network" | "jvmHeap";

/** 监控概览数据 */
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
 * 获取系统监控实时数据
 */
export async function fetchSystemMonitorData(): Promise<ApiResponse<MonitorPoint[]>> {
  return handleRequest({
    requestFn: () => request.instance.get<ApiResponse<MonitorPoint[]>>("/system/monitor/data").then((r) => r.data),
    mockData: mockMonitorData,
    apiName: "fetchSystemMonitorData",
  });
}

/**
 * 获取系统监控概览
 */
export async function fetchSystemMonitorOverview(): Promise<ApiResponse<MonitorOverview>> {
  return handleRequest({
    requestFn: () => request.instance.get<ApiResponse<MonitorOverview>>("/system/monitor/overview").then((r) => r.data),
    mockData: mockMonitorOverview,
    apiName: "fetchSystemMonitorOverview",
  });
}

/**
 * 获取系统监控趋势
 */
export async function fetchMonitorTrend(params: MonitorTrendParams): Promise<ApiResponse<MonitorTrendItem[]>> {
  return handleRequest({
    requestFn: () => request.instance.get<ApiResponse<MonitorTrendItem[]>>("/system/monitor/trend", { params }).then((r) => r.data),
    mockData: [],
    apiName: "fetchMonitorTrend",
  });
}
```

### 3.4 后端新增文件清单 ✅ 已完成

| 文件路径 | 说明 |
|---------|------|
| `com.zsk.system.domain.SysMonitorData` | 系统监控数据实体类（MongoDB） |
| `com.zsk.system.service.ISysMonitorService` | 系统监控服务接口 |
| `com.zsk.system.service.impl.SysMonitorServiceImpl` | 系统监控服务实现（OSHI库） |
| `com.zsk.system.controller.SysMonitorController` | 系统监控控制器 |

### 3.5 后端技术方案

- **数据采集**：使用 OSHI 库实时采集服务器信息
- **数据存储**：存储到 MongoDB（sys_monitor_data 集合）
- **定时任务**：每分钟自动采集一次监控数据
- **数据清理**：支持清理过期监控数据

### 3.6 后端控制器代码

```java
// ===== 文件：SysMonitorController.java =====
package com.zsk.system.controller;

/**
 * 系统监控 控制器
 *
 * @author wuhuaming
 * @date 2026-02-15
 * @version 1.0
 */
@Tag(name = "系统监控")
@RestController
@RequestMapping("/monitor")
@RequiredArgsConstructor
public class SysMonitorController {

    private final ISysMonitorService monitorService;

    /**
     * 获取服务器实时监控数据
     */
    @Operation(summary = "获取服务器实时监控数据")
    @GetMapping("/data")
    public R<List<Map<String, Object>>> getMonitorData() {
        SysMonitorData data = monitorService.getRealTimeData();
        List<Map<String, Object>> points = buildMonitorPoints(data);
        return R.ok(points);
    }

    /**
     * 获取服务器监控概览
     */
    @Operation(summary = "获取服务器监控概览")
    @GetMapping("/overview")
    public R<Map<String, Object>> getOverview() {
        SysMonitorData data = monitorService.getOverview();
        Map<String, Object> overview = new HashMap<>();
        overview.put("cpu", data.getCpuUsage());
        overview.put("memory", data.getMemUsage());
        overview.put("disk", data.getDiskUsage());
        overview.put("network", data.getNetUsage());
        overview.put("jvmHeap", data.getJvmHeapUsage());
        overview.put("jvmThread", data.getJvmThreadCount());
        overview.put("hostName", data.getHostName());
        overview.put("hostIp", data.getHostIp());
        overview.put("osName", data.getOsName());
        return R.ok(overview);
    }

    /**
     * 获取服务器监控趋势
     */
    @Operation(summary = "获取服务器监控趋势")
    @GetMapping("/trend")
    public R<List<Map<String, Object>>> getTrend(
            @RequestParam(defaultValue = "cpu") String metric,
            @RequestParam(defaultValue = "1h") String range) {
        List<SysMonitorData> dataList = monitorService.getTrendData(metric, range);
        // ...
    }
}
```
 * 服务器信息转监控概览映射
 * @param backendData 后端服务器信息
 * @returns 前端监控概览
 */
function mapServerInfoToOverview(backendData?: SysServerInfo): MonitorOverview {
  return {
    cpu: backendData?.cpuUsage || 0,
    memory: backendData?.memUsage || 0,
    disk: backendData?.diskUsage || 0,
    network: backendData?.netUsage || 0,
  };
}
```

### 3.4 后端新增接口清单

#### 3.4.1 服务器监控控制器

```java
// ===== 文件：SysServerController.java =====
package com.zsk.system.controller;

/**
 * 服务器监控 控制器
 *
 * @author wuhuaming
 * @date 2026-02-15
 * @version 1.0
 */
@Tag(name = "服务器监控")
@RestController
@RequestMapping("/monitor/server")
@RequiredArgsConstructor
public class SysServerController {

    private final ISysServerService serverService;

    /**
     * 获取服务器实时监控数据
     *
     * @return 监控数据点列表
     */
    @Operation(summary = "获取服务器实时监控数据")
    @GetMapping
    public R<List<MonitorPoint>> getMonitorData() {
        return R.ok(serverService.getMonitorData());
    }

    /**
     * 获取服务器监控概览
     *
     * @return 服务器信息
     */
    @Operation(summary = "获取服务器监控概览")
    @GetMapping("/overview")
    public R<SysServerInfo> getOverview() {
        return R.ok(serverService.getServerInfo());
    }

    /**
     * 获取服务器监控趋势
     *
     * @param metric 指标类型
     * @param range 时间范围
     * @return 监控趋势数据
     */
    @Operation(summary = "获取服务器监控趋势")
    @GetMapping("/trend")
    public R<List<MonitorTrendItem>> getTrend(
            @RequestParam String metric,
            @RequestParam String range) {
        return R.ok(serverService.getMonitorTrend(metric, range));
    }
}
```

---

## 四、缓存管理 ✅ 已完成

### 4.1 接口映射表

| 前端接口 | HTTP | 后端接口 | 对接方案 |
|---------|------|---------|---------|
| `/admin/ops/cache/instances` | GET | `/system/monitor/cache/instances` | ✅ 已修改 |
| `/admin/ops/cache/logs` | GET | `/system/monitor/cache/logs` | ✅ 已修改 |
| `/admin/ops/cache/trend/hit-rate` | GET | `/system/monitor/cache/trend/hitRate` | ✅ 已修改 |
| `/admin/ops/cache/trend/qps` | GET | `/system/monitor/cache/trend/qps` | ✅ 已修改 |
| `/admin/ops/cache/keys` | GET | `/system/monitor/cache/keys` | ✅ 已修改 |
| `/admin/ops/cache/keys/refresh` | POST | `/system/monitor/cache/keys/refresh` | ✅ 已修改 |
| `/admin/ops/cache/keys` | DELETE | `/system/monitor/cache/keys/{key}` | ✅ 已修改 |
| `/admin/ops/cache/keys/batch-refresh` | POST | `/system/monitor/cache/keys/batchRefresh` | ✅ 已修改 |
| `/admin/ops/cache/keys/batch-delete` | POST | `/system/monitor/cache/keys/batchDelete` | ✅ 已修改 |
| `/admin/ops/cache/instances/clear` | POST | `/system/monitor/cache/instances/clear` | ✅ 已修改 |

### 4.2 字段映射表

#### 缓存实例

| 前端字段 | 后端字段 | 类型 | 说明 |
|---------|---------|------|------|
| id | id | String | 实例ID |
| name | name | String | 实例名称 |
| usage | usage | Number | 内存使用量 |
| nodes | nodes | Number | 节点数量 |
| hitRate | hitRate | Number | 命中率 |

#### 缓存键

| 前端字段 | 后端字段 | 类型 | 说明 |
|---------|---------|------|------|
| id | id | String | 键ID |
| key | key | String | 键名 |
| type | type | String | 键类型 |
| size | size | Number | 占用大小 |
| ttl | ttl | Number | 过期时间 |
| instanceId | instanceId | String | 实例ID |
| instanceName | instanceName | String | 实例名称 |
| updatedAt | updateTime | String | 更新时间 |

### 4.3 前端修改清单 ✅ 已完成

```typescript
// ===== 文件：zsk-ui/src/api/admin/ops.ts =====

/**
 * 获取缓存实例列表
 */
export async function fetchCacheInstances(): Promise<ApiResponse<CacheInstanceItem[]>> {
  return handleRequest({
    requestFn: () => request.instance.get<ApiResponse<CacheInstanceItem[]>>("/system/monitor/cache/instances").then((r) => r.data),
    mockData: mockCacheInstances,
    apiName: "fetchCacheInstances",
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
}): Promise<ApiResponse<{ list: CacheKeyItem[]; total: number }>> {
  const { data } = await handleRequest({
    requestFn: () => request.instance.get<ApiResponse<{ rows: CacheKeyItem[]; total: number }>>("/system/monitor/cache/keys", { params }).then((r) => r.data),
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

/**
 * 刷新缓存键
 */
export async function refreshCacheKey(params: { key: string }): Promise<ApiResponse<boolean>> {
  return handleRequest({
    requestFn: () => request.instance.post<ApiResponse<boolean>>("/system/monitor/cache/keys/refresh", null, { params }).then((r) => r.data),
    mockData: true,
    apiName: "refreshCacheKey",
  });
}

/**
 * 删除缓存键
 */
export async function deleteCacheKey(key: string): Promise<ApiResponse<boolean>> {
  return handleRequest({
    requestFn: () => request.instance.delete<ApiResponse<boolean>>(`/system/monitor/cache/keys/${encodeURIComponent(key)}`).then((r) => r.data),
    mockData: true,
    apiName: "deleteCacheKey",
  });
}

/**
 * 批量刷新缓存键
 */
export async function batchRefreshCacheKeys(keys: string[]): Promise<ApiResponse<boolean>> {
  return handleRequest({
    requestFn: () => request.instance.post<ApiResponse<boolean>>("/system/monitor/cache/keys/batchRefresh", keys).then((r) => r.data),
    mockData: true,
    apiName: "batchRefreshCacheKeys",
  });
}

/**
 * 批量删除缓存键
 */
export async function batchDeleteCacheKeys(keys: string[]): Promise<ApiResponse<boolean>> {
  return handleRequest({
    requestFn: () => request.instance.post<ApiResponse<boolean>>("/system/monitor/cache/keys/batchDelete", keys).then((r) => r.data),
    mockData: true,
    apiName: "batchDeleteCacheKeys",
  });
}

/**
 * 清空缓存实例
 */
export async function clearCacheInstance(): Promise<ApiResponse<boolean>> {
  return handleRequest({
    requestFn: () => request.instance.post<ApiResponse<boolean>>("/system/monitor/cache/instances/clear").then((r) => r.data),
    mockData: true,
    apiName: "clearCacheInstance",
  });
}
```

### 4.4 后端新增文件清单 ✅ 已完成

| 文件路径 | 说明 |
|---------|------|
| `com.zsk.system.domain.SysCacheLog` | 缓存日志实体类（MongoDB） |
| `com.zsk.system.service.ISysCacheService` | 缓存管理服务接口 |
| `com.zsk.system.service.impl.SysCacheServiceImpl` | 缓存管理服务实现 |
| `com.zsk.system.controller.SysCacheController` | 缓存管理控制器 |

### 4.5 后端技术方案

- **数据来源**：从 Redis INFO 命令实时获取
- **日志存储**：存储到 MongoDB（sys_cache_log 集合）
- **缓存操作**：使用已有的 RedisService

### 4.6 后端控制器代码

```java
// ===== 文件：SysCacheController.java =====
package com.zsk.system.controller;

/**
 * 缓存管理 控制器
 *
 * @author wuhuaming
 * @date 2026-02-15
 * @version 1.0
 */
@Tag(name = "缓存管理")
@RestController
@RequestMapping("/monitor/cache")
@RequiredArgsConstructor
public class SysCacheController {

    private final ISysCacheService cacheService;

    /**
     * 获取缓存实例列表
     */
    @Operation(summary = "获取缓存实例列表")
    @GetMapping("/instances")
    public R<List<Map<String, Object>>> getInstances() {
        return R.ok(cacheService.getInstances());
    }

    /**
     * 获取缓存键列表
     */
    @Operation(summary = "获取缓存键列表")
    @GetMapping("/keys")
    public R<Map<String, Object>> getKeys(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        return R.ok(cacheService.getKeys(keyword, page, pageSize));
    }

    /**
     * 删除缓存键
     */
    @Operation(summary = "删除缓存键")
    @DeleteMapping("/keys/{key}")
    public R<Void> deleteKey(@PathVariable String key) {
        return cacheService.deleteKey(key) ? R.ok() : R.fail();
    }

    /**
     * 清空缓存实例
     */
    @Operation(summary = "清空缓存实例")
    @PostMapping("/instances/clear")
    public R<Void> clearInstance() {
        return cacheService.clearInstance() ? R.ok() : R.fail();
    }
}
```

/**
 * 批量删除缓存键
 * @param params ID 列表参数
 * @returns 是否删除成功
 */
export async function batchDeleteCacheKeys(params: {
  ids: string[];
}): Promise<ApiResponse<boolean>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .post<ApiResponse<boolean>>(
          "/system/monitor/cache/keys/batchDelete",
          { keyIds: params.ids }
        )
        .then((r) => r.data),
    mockData: true,
    apiName: "batchDeleteCacheKeys",
  });
}

/**
 * 清空缓存实例
 * @param params 实例 ID 参数
 * @returns 是否清空成功
 */
export async function clearCacheInstance(params: {
  instanceId: string;
}): Promise<ApiResponse<boolean>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .post<ApiResponse<boolean>>("/system/monitor/cache/instances/clear", {
          instanceId: params.instanceId,
        })
        .then((r) => r.data),
    mockData: true,
    apiName: "clearCacheInstance",
  });
}
```

### 4.4 后端新增接口清单

#### 4.4.1 缓存监控控制器

```java
// ===== 文件：SysCacheController.java =====
package com.zsk.system.controller;

/**
 * 缓存监控 控制器
 *
 * @author wuhuaming
 * @date 2026-02-15
 * @version 1.0
 */
@Tag(name = "缓存监控")
@RestController
@RequestMapping("/monitor/cache")
@RequiredArgsConstructor
public class SysCacheController {

    private final ISysCacheService cacheService;

    /**
     * 获取缓存实例列表
     *
     * @return 缓存实例列表
     */
    @Operation(summary = "获取缓存实例列表")
    @GetMapping("/instances")
    public R<List<SysCacheInstance>> getInstances() {
        return R.ok(cacheService.getInstances());
    }

    /**
     * 获取缓存日志
     *
     * @param instanceId 实例ID
     * @return 缓存日志列表
     */
    @Operation(summary = "获取缓存日志")
    @GetMapping("/logs")
    public R<List<SysCacheLog>> getLogs(@RequestParam(required = false) String instanceId) {
        return R.ok(cacheService.getLogs(instanceId));
    }

    /**
     * 获取缓存命中率趋势
     *
     * @param instanceId 实例ID
     * @return 命中率趋势数据
     */
    @Operation(summary = "获取缓存命中率趋势")
    @GetMapping("/trend/hitRate")
    public R<List<TrendDataPoint>> getHitRateTrend(
            @RequestParam(required = false) String instanceId) {
        return R.ok(cacheService.getHitRateTrend(instanceId));
    }

    /**
     * 获取缓存QPS趋势
     *
     * @param instanceId 实例ID
     * @return QPS趋势数据
     */
    @Operation(summary = "获取缓存QPS趋势")
    @GetMapping("/trend/qps")
    public R<List<TrendDataPoint>> getQpsTrend(
            @RequestParam(required = false) String instanceId) {
        return R.ok(cacheService.getQpsTrend(instanceId));
    }

    /**
     * 获取缓存键列表
     *
     * @param params 查询参数
     * @return 缓存键列表
     */
    @Operation(summary = "获取缓存键列表")
    @GetMapping("/keys")
    public TableDataInfo<SysCacheKey> getKeys(SysCacheKeyQuery params) {
        return cacheService.getKeys(params);
    }

    /**
     * 刷新缓存键
     *
     * @param keyId 键ID
     * @return 是否成功
     */
    @Operation(summary = "刷新缓存键")
    @PostMapping("/keys/refresh")
    public R<Void> refreshKey(@RequestParam String keyId) {
        return cacheService.refreshKey(keyId) ? R.ok() : R.fail();
    }

    /**
     * 删除缓存键
     *
     * @param id 键ID
     * @return 是否成功
     */
    @Operation(summary = "删除缓存键")
    @DeleteMapping("/keys/{id}")
    public R<Void> deleteKey(@PathVariable String id) {
        return cacheService.deleteKey(id) ? R.ok() : R.fail();
    }

    /**
     * 批量刷新缓存键
     *
     * @param keyIds 键ID列表
     * @return 是否成功
     */
    @Operation(summary = "批量刷新缓存键")
    @PostMapping("/keys/batchRefresh")
    public R<Void> batchRefreshKeys(@RequestBody List<String> keyIds) {
        return cacheService.batchRefreshKeys(keyIds) ? R.ok() : R.fail();
    }

    /**
     * 批量删除缓存键
     *
     * @param keyIds 键ID列表
     * @return 是否成功
     */
    @Operation(summary = "批量删除缓存键")
    @PostMapping("/keys/batchDelete")
    public R<Void> batchDeleteKeys(@RequestBody List<String> keyIds) {
        return cacheService.batchDeleteKeys(keyIds) ? R.ok() : R.fail();
    }

    /**
     * 清空缓存实例
     *
     * @param instanceId 实例ID
     * @return 是否成功
     */
    @Operation(summary = "清空缓存实例")
    @PostMapping("/instances/clear")
    public R<Void> clearInstance(@RequestParam String instanceId) {
        return cacheService.clearInstance(instanceId) ? R.ok() : R.fail();
    }
}
```

---

## 五、行为审计 ✅ 已完成

### 5.1 接口映射表

| 前端接口 | HTTP | 后端接口 | 对接方案 |
|---------|------|---------|---------|
| `/admin/ops/behavior/users` | GET | `/system/monitor/behavior/users` | ✅ 已修改 |
| `/admin/ops/behavior/timeline` | GET | `/system/monitor/behavior/timeline` | ✅ 已修改 |
| `/admin/ops/behavior/events` | GET | `/system/monitor/behavior/events` | ✅ 已修改 |

### 5.2 字段映射表

#### 行为用户

| 前端字段 | 后端字段 | 类型 | 说明 |
|---------|---------|------|------|
| id | id | String | 用户名（从操作日志聚合） |
| name | name | String | 用户名 |
| role | role | String | 角色 |
| department | department | String | 部门 |
| lastLoginAt | lastLoginAt | String | 最后操作时间 |
| lastLoginIp | lastLoginIp | String | 最后操作IP |
| riskLevel | riskLevel | String | 风险等级（根据操作频率计算） |

#### 行为事件

| 前端字段 | 后端字段 | 类型 | 说明 |
|---------|---------|------|------|
| id | id | String | 日志ID |
| userId | userId | String | 用户名 |
| time | time | String | 操作时间 |
| action | action | String | 动作类型 |
| module | module | String | 模块名称 |
| detail | detail | String | 详细描述 |
| riskLevel | riskLevel | String | 风险等级 |

### 5.3 前端修改清单 ✅ 已完成

```typescript
// ===== 文件：zsk-ui/src/api/admin/ops.ts =====

/**
 * 获取行为审计用户列表
 */
export async function fetchBehaviorUsers(): Promise<ApiResponse<BehaviorUser[]>> {
  return handleRequest({
    requestFn: () => request.instance.get<ApiResponse<BehaviorUser[]>>("/system/monitor/behavior/users").then((r) => r.data),
    mockData: mockBehaviorUsers,
    apiName: "fetchBehaviorUsers",
  });
}

/**
 * 获取用户行为时间轴
 */
export async function fetchBehaviorTimeline(params: {
  userId: string;
  range: BehaviorRange;
}): Promise<ApiResponse<BehaviorPoint[]>> {
  return handleRequest({
    requestFn: () => request.instance.get<ApiResponse<BehaviorPoint[]>>("/system/monitor/behavior/timeline", { params }).then((r) => r.data),
    mockData: mockBehaviorTimeline.filter((item) => item.userId === params.userId && item.range === params.range),
    apiName: "fetchBehaviorTimeline",
  });
}

/**
 * 获取行为审计事件列表
 */
export async function fetchBehaviorEvents(params: {
  userId: string;
  keyword?: string;
}): Promise<ApiResponse<BehaviorEvent[]>> {
  return handleRequest({
    requestFn: () => request.instance.get<ApiResponse<BehaviorEvent[]>>("/system/monitor/behavior/events", { params }).then((r) => r.data),
    mockData: mockBehaviorEvents.filter((item) => {
      if (item.userId !== params.userId) return false;
      if (params.keyword) {
        const content = `${item.action} ${item.module} ${item.detail}`.toLowerCase();
        return content.includes(params.keyword.toLowerCase());
      }
      return true;
    }),
    apiName: "fetchBehaviorEvents",
  });
}
```

### 5.4 后端新增文件清单 ✅ 已完成

| 文件路径 | 说明 |
|---------|------|
| `com.zsk.system.domain.SysBehaviorEvent` | 行为审计事件实体类（MongoDB） |
| `com.zsk.system.service.ISysBehaviorService` | 行为审计服务接口 |
| `com.zsk.system.service.impl.SysBehaviorServiceImpl` | 行为审计服务实现 |
| `com.zsk.system.controller.SysBehaviorController` | 行为审计控制器 |

### 5.5 后端技术方案

- **数据来源**：从 `sys_oper_log` 操作日志提取用户行为
- **风险等级**：根据操作频率自动计算（>100次=high, >50次=medium, 其他=low）
- **时间轴**：按时间分组统计操作次数

### 5.6 后端控制器代码

```java
// ===== 文件：SysBehaviorController.java =====
package com.zsk.system.controller;

/**
 * 行为审计 控制器
 *
 * @author wuhuaming
 * @date 2026-02-15
 * @version 1.0
 */
@Tag(name = "行为审计")
@RestController
@RequestMapping("/monitor/behavior")
@RequiredArgsConstructor
public class SysBehaviorController {

    private final ISysBehaviorService behaviorService;

    /**
     * 获取行为审计用户列表
     */
    @Operation(summary = "获取行为审计用户列表")
    @GetMapping("/users")
    public R<List<Map<String, Object>>> getUsers() {
        return R.ok(behaviorService.getUsers());
    }

    /**
     * 获取用户行为时间轴
     */
    @Operation(summary = "获取用户行为时间轴")
    @GetMapping("/timeline")
    public R<List<Map<String, Object>>> getTimeline(
            @RequestParam String userId,
            @RequestParam(defaultValue = "today") String range) {
        return R.ok(behaviorService.getTimeline(userId, range));
    }

    /**
     * 获取行为审计事件列表
     */
    @Operation(summary = "获取行为审计事件列表")
    @GetMapping("/events")
    public R<List<Map<String, Object>>> getEvents(
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String keyword) {
        return R.ok(behaviorService.getEvents(userId, keyword));
    }
}
```

---

## 六、对接检查清单

### 6.1 前端修改清单 ✅ 已完成

- [x] 修改 `fetchSystemLogs` 接口路径为 `/system/operLog/list`
- [x] 修改 `fetchSystemMonitorData` 接口路径为 `/system/monitor/data`
- [x] 修改 `fetchSystemMonitorOverview` 接口路径为 `/system/monitor/overview`
- [x] 修改 `fetchMonitorTrend` 接口路径为 `/system/monitor/trend`
- [x] 修改 `fetchCacheInstances` 接口路径为 `/system/monitor/cache/instances`
- [x] 修改 `fetchCacheLogs` 接口路径为 `/system/monitor/cache/logs`
- [x] 修改 `fetchCacheHitRateTrend` 接口路径为 `/system/monitor/cache/trend/hitRate`
- [x] 修改 `fetchCacheQpsTrend` 接口路径为 `/system/monitor/cache/trend/qps`
- [x] 修改 `fetchCacheKeys` 接口路径为 `/system/monitor/cache/keys`
- [x] 修改 `refreshCacheKey` 接口路径为 `/system/monitor/cache/keys/refresh`
- [x] 修改 `deleteCacheKey` 接口路径为 `/system/monitor/cache/keys/{key}`
- [x] 修改 `batchRefreshCacheKeys` 接口路径为 `/system/monitor/cache/keys/batchRefresh`
- [x] 修改 `batchDeleteCacheKeys` 接口路径为 `/system/monitor/cache/keys/batchDelete`
- [x] 修改 `clearCacheInstance` 接口路径为 `/system/monitor/cache/instances/clear`
- [x] 修改 `fetchBehaviorUsers` 接口路径为 `/system/monitor/behavior/users`
- [x] 修改 `fetchBehaviorTimeline` 接口路径为 `/system/monitor/behavior/timeline`
- [x] 修改 `fetchBehaviorEvents` 接口路径为 `/system/monitor/behavior/events`

### 6.2 后端新增清单 ✅ 已完成

**系统日志模块：**
- [x] 新建 SysOperLogController 控制器
- [x] 新建 IOperLogService 服务接口
- [x] 新建 OperLogServiceImpl 服务实现

**系统监控模块：**
- [x] 新建 SysMonitorData 实体类
- [x] 新建 ISysMonitorService 服务接口
- [x] 新建 SysMonitorServiceImpl 服务实现
- [x] 新建 SysMonitorController 控制器

**缓存管理模块：**
- [x] 新建 SysCacheLog 实体类
- [x] 新建 ISysCacheService 服务接口
- [x] 新建 SysCacheServiceImpl 服务实现
- [x] 新建 SysCacheController 控制器

**行为审计模块：**
- [x] 新建 SysBehaviorEvent 实体类
- [x] 新建 ISysBehaviorService 服务接口
- [x] 新建 SysBehaviorServiceImpl 服务实现
- [x] 新建 SysBehaviorController 控制器

---

## 七、注意事项

1. **接口路径规范**：后端接口统一使用 `/system/monitor/` 前缀
2. **分页格式**：后端返回 `{ rows: [], total: number }`，前端转换为 `{ list: [], total: number }`
3. **ID类型**：后端ID使用 Long 类型，前端统一转为 String
4. **时间格式**：后端使用 LocalDateTime，前端使用 ISO 字符串
5. **注释规范**：前后端代码都需要添加中文注释
6. **MongoDB集合**：`sys_oper_log`、`sys_monitor_data`、`sys_cache_log`、`sys_behavior_event`
    detail: backendData.eventDetail || "",
    riskLevel: (backendData.riskLevel || "low") as BehaviorEvent["riskLevel"],
  };
}
```

### 5.4 后端新增接口清单

#### 5.4.1 行为审计控制器

```java
// ===== 文件：SysBehaviorController.java =====
package com.zsk.system.controller;

/**
 * 行为审计 控制器
 *
 * @author wuhuaming
 * @date 2026-02-15
 * @version 1.0
 */
@Tag(name = "行为审计")
@RestController
@RequestMapping("/monitor/behavior")
@RequiredArgsConstructor
public class SysBehaviorController {

    private final ISysBehaviorService behaviorService;

    /**
     * 获取行为审计用户列表
     *
     * @return 用户列表
     */
    @Operation(summary = "获取行为审计用户列表")
    @GetMapping("/users")
    public R<List<SysBehaviorUser>> getUsers() {
        return R.ok(behaviorService.getUsers());
    }

    /**
     * 获取用户行为时间轴
     *
     * @param userId 用户ID
     * @param range 时间范围
     * @return 行为数据点列表
     */
    @Operation(summary = "获取用户行为时间轴")
    @GetMapping("/timeline")
    public R<List<SysBehaviorPoint>> getTimeline(
            @RequestParam String userId,
            @RequestParam String range) {
        return R.ok(behaviorService.getTimeline(userId, range));
    }

    /**
     * 获取行为审计事件列表
     *
     * @param userId 用户ID
     * @param keyword 关键字
     * @return 行为事件列表
     */
    @Operation(summary = "获取行为审计事件列表")
    @GetMapping("/events")
    public R<List<SysBehaviorEvent>> getEvents(
            @RequestParam String userId,
            @RequestParam(required = false) String keyword) {
        return R.ok(behaviorService.getEvents(userId, keyword));
    }
}
```

---

## 六、类型定义

### 6.1 后端类型定义（前端需要新增）

```typescript
// ===== 文件：zsk-ui/src/api/admin/ops.ts =====

/** 后端操作日志类型 */
export type SysOperLog = {
  /** 操作ID */
  operId?: number;
  /** 模块标题 */
  title?: string;
  /** 业务类型（0其它 1新增 2修改 3删除） */
  businessType?: number;
  /** 方法名称 */
  method?: string;
  /** 请求方式 */
  requestMethod?: string;
  /** 操作类别（0其它 1后台用户 2手机端用户） */
  operatorType?: number;
  /** 操作人员 */
  operName?: string;
  /** 部门名称 */
  deptName?: string;
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
  status?: string;
  /** 错误消息 */
  errorMsg?: string;
  /** 操作时间 */
  operTime?: string;
  /** 追踪ID */
  traceId?: string;
};

/** 后端服务器信息类型 */
export type SysServerInfo = {
  /** CPU使用率 */
  cpuUsage?: number;
  /** 内存使用率 */
  memUsage?: number;
  /** 磁盘使用率 */
  diskUsage?: number;
  /** 网络使用率 */
  netUsage?: number;
  /** 服务器名称 */
  serverName?: string;
  /** 服务器IP */
  serverIp?: string;
  /** 操作系统 */
  osName?: string;
  /** 系统架构 */
  osArch?: string;
};

/** 后端缓存实例类型 */
export type SysCacheInstance = {
  /** 实例ID */
  instanceId?: string;
  /** 实例名称 */
  instanceName?: string;
  /** 内存使用量 */
  memoryUsage?: number;
  /** 节点数量 */
  nodeCount?: number;
  /** 命中率 */
  hitRate?: number;
  /** 状态 */
  status?: string;
};

/** 后端缓存键类型 */
export type SysCacheKey = {
  /** 键ID */
  keyId?: string;
  /** 键名 */
  cacheKey?: string;
  /** 键类型 */
  keyType?: string;
  /** 占用大小 */
  keySize?: number;
  /** 过期时间 */
  ttl?: number;
  /** 实例ID */
  instanceId?: string;
  /** 实例名称 */
  instanceName?: string;
  /** 更新时间 */
  updateTime?: string;
};

/** 后端行为用户类型 */
export type SysBehaviorUser = {
  /** 用户ID */
  userId?: number;
  /** 用户名 */
  userName?: string;
  /** 角色名称 */
  roleName?: string;
  /** 部门名称 */
  deptName?: string;
  /** 最后登录时间 */
  loginTime?: string;
  /** 最后登录IP */
  loginIp?: string;
  /** 风险等级 */
  riskLevel?: string;
};

/** 后端行为事件类型 */
export type SysBehaviorEvent = {
  /** 事件ID */
  eventId?: number;
  /** 用户ID */
  userId?: number;
  /** 事件时间 */
  eventTime?: string;
  /** 动作类型 */
  actionType?: string;
  /** 模块名称 */
  moduleName?: string;
  /** 详细描述 */
  eventDetail?: string;
  /** 风险等级 */
  riskLevel?: string;
};

/** 后端行为数据点类型 */
export type SysBehaviorPoint = {
  /** 用户ID */
  userId?: number;
  /** 时间范围 */
  range?: string;
  /** 时间点 */
  time?: string;
  /** 事件数量 */
  count?: number;
};
```

---

## 七、对接检查清单

### 7.1 前端修改清单

- [ ] 修改 `fetchSystemLogs` 接口路径为 `/system/monitor/log/list`
- [ ] 修改 `fetchSystemMonitorData` 接口路径为 `/system/monitor/server`
- [ ] 修改 `fetchSystemMonitorOverview` 接口路径为 `/system/monitor/server/overview`
- [ ] 修改 `fetchMonitorTrend` 接口路径为 `/system/monitor/server/trend`
- [ ] 修改 `fetchCacheInstances` 接口路径为 `/system/monitor/cache/instances`
- [ ] 修改 `fetchCacheLogs` 接口路径为 `/system/monitor/cache/logs`
- [ ] 修改 `fetchCacheHitRateTrend` 接口路径为 `/system/monitor/cache/trend/hitRate`
- [ ] 修改 `fetchCacheQpsTrend` 接口路径为 `/system/monitor/cache/trend/qps`
- [ ] 修改 `fetchCacheKeys` 接口路径为 `/system/monitor/cache/keys`
- [ ] 修改 `refreshCacheKey` 接口路径为 `/system/monitor/cache/keys/refresh`
- [ ] 修改 `deleteCacheKey` 接口路径为 `/system/monitor/cache/keys/{id}`
- [ ] 修改 `batchRefreshCacheKeys` 接口路径为 `/system/monitor/cache/keys/batchRefresh`
- [ ] 修改 `batchDeleteCacheKeys` 接口路径为 `/system/monitor/cache/keys/batchDelete`
- [ ] 修改 `clearCacheInstance` 接口路径为 `/system/monitor/cache/instances/clear`
- [ ] 修改 `fetchBehaviorUsers` 接口路径为 `/system/monitor/behavior/users`
- [ ] 修改 `fetchBehaviorTimeline` 接口路径为 `/system/monitor/behavior/timeline`
- [ ] 修改 `fetchBehaviorEvents` 接口路径为 `/system/monitor/behavior/events`
- [ ] 新增字段映射函数

### 7.2 后端新增清单

- [ ] 新建 SysServerController 控制器
- [ ] 新建 ISysServerService 服务接口
- [ ] 新建 SysServerServiceImpl 服务实现
- [ ] 新建 SysCacheController 控制器
- [ ] 新建 ISysCacheService 服务接口
- [ ] 新建 SysCacheServiceImpl 服务实现
- [ ] 新建 SysBehaviorController 控制器
- [ ] 新建 ISysBehaviorService 服务接口
- [ ] 新建 SysBehaviorServiceImpl 服务实现

---

## 八、注意事项

1. **接口路径规范**：后端接口统一使用 `/system/monitor/` 前缀
2. **字段映射**：前端字段名和后端字段名不同，需要在请求前和响应后进行映射转换
3. **分页格式**：后端返回 `{ rows: [], total: number }`，前端需要转换为 `{ list: [], total: number }`
4. **ID类型**：后端ID使用 Long 类型，前端统一转为 String
5. **时间格式**：后端使用 LocalDateTime，前端使用 ISO 字符串
6. **注释规范**：前后端代码都需要添加中文注释
