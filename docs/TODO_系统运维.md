# 系统运维模块接口 TODO 清单

> 本文档用于记录「系统运维」下各子页面预计对接的接口信息，便于后续与后端对齐实现方案。所有接口返回格式统一为 `{ code, msg, data }`。

## 一、接口文档中心

- 接口名称：获取接口分类树  
- 接口地址：`GET /api/admin/ops/api-doc/tree`  
- 请求参数：
  - `keyword`: string，可选，按名称或路径模糊搜索  
- 返回数据示例：
  ```json
  {
    "code": 0,
    "msg": "ok",
    "data": [
      {
        "id": "dashboard",
        "name": "仪表盘相关",
        "children": [
          {
            "id": "dashboard-overview",
            "name": "获取仪表盘核心指标",
            "method": "GET",
            "path": "/api/admin/dashboard/overview",
            "status": "enabled",
            "owner": "admin"
          }
        ]
      }
    ]
  }
  ```  
- 测试用例要点：
  - keyword 为空时返回全量树结构  
  - method 仅允许 `GET`、`POST`、`PUT`、`DELETE` 等约定值  
- 精简待办：
  - 与网关或后端服务端实际接口注册表对齐字段命名  
  - 确认是否需要支持多服务维度（如按服务分组）  

- 接口名称：获取单个接口详情  
- 接口地址：`GET /api/admin/ops/api-doc/detail`  
- 请求参数：
  - `id`: string，接口唯一标识  
- 返回数据示例：
  ```json
  {
    "code": 0,
    "msg": "ok",
    "data": {
      "id": "dashboard-overview",
      "name": "获取仪表盘核心指标",
      "path": "/api/admin/dashboard/overview",
      "method": "GET",
      "status": "enabled",
      "owner": "admin",
      "description": "返回仪表盘核心统计指标数据",
      "requestParams": [
        {
          "name": "range",
          "type": "string",
          "required": false,
          "description": "时间范围，例如 7d、30d"
        }
      ],
      "responseExample": "{ \"code\": 0, \"msg\": \"ok\", \"data\": { } }"
    }
  }
  ```  
- 测试用例要点：
  - 未找到对应 id 时返回明确错误信息  
  - requestParams、responseExample 字段可为空，但字段必须存在  
- 精简待办：
  - 确认是否需要补充错误码示例与业务说明  
  - 与仪表盘与内容模块的接口文档字段保持统一风格  

- 接口名称：在线调试请求  
- 接口地址：`POST /api/admin/ops/api-doc/debug`  
- 请求参数：
  - `id`: string，接口唯一标识  
  - `body`: object，请求体 JSON  
- 返回数据示例：
  ```json
  {
    "code": 0,
    "msg": "ok",
    "data": {
      "status": 200,
      "headers": {
        "content-type": "application/json"
      },
      "body": {
        "code": 0,
        "msg": "ok",
        "data": {}
      }
    }
  }
  ```  
- 测试用例要点：
  - 超时时返回清晰的错误提示  
  - 禁止调用未在接口文档中登记的地址  
- 精简待办：
  - 明确在线调试的鉴权策略与访问限制（如仅测试环境可用）  

## 二、系统监控

- 接口名称：获取系统概览状态  
- 接口地址：`GET /api/admin/ops/monitor/overview`  
- 请求参数：无  
- 返回数据示例：
  ```json
  {
    "code": 0,
    "msg": "ok",
    "data": {
      "cpuUsage": 0.32,
      "memoryUsage": 0.58,
      "diskUsage": 0.71,
      "networkUsage": 0.23
    }
  }
  ```  
- 测试用例要点：
  - 各指标取值范围为 `[0, 1]`  
  - 当任何指标超过预警阈值时，应在其他接口中能看到对应告警  
- 精简待办：
  - 与告警系统约定阈值与等级划分规则  

- 接口名称：获取资源使用趋势  
- 接口地址：`GET /api/admin/ops/monitor/trend`  
- 请求参数：
  - `metric`: string，`cpu` | `memory` | `disk` | `network`  
  - `range`: string，`1h` | `24h` | `7d`  

## 三、缓存监控与缓存列表

- 接口名称：获取缓存实例列表  
- 接口地址：`GET /api/admin/ops/cache/instances`  
- 请求参数：无（后续视多集群场景可扩展 `clusterId` 等字段）  
- 返回数据示例：
  ```json
  {
    "code": 0,
    "msg": "ok",
    "data": [
      {
        "id": "redis-main",
        "name": "Redis 主实例",
        "usage": 0.91,
        "nodes": 3,
        "hitRate": 0.93
      }
    ]
  }
  ```  
- 测试用例要点：
  - usage、hitRate 取值范围为 `[0, 1]`  
  - nodes 为正整数  
  - 当实例状态异常时是否需要额外状态字段（如 `status`）  

- 接口名称：获取单个实例监控详情  
- 接口地址：`GET /api/admin/ops/cache/instance-detail`  
- 请求参数：
  - `id`: string，实例唯一标识（如 redis-main）  
  - `range`: string，可选，时间范围，如 `1h`、`24h`、`7d`  
- 返回数据示例（示意）：
  ```json
  {
    "code": 0,
    "msg": "ok",
    "data": {
      "id": "redis-main",
      "name": "Redis 主实例",
      "usage": 0.91,
      "hitRate": 0.93,
      "qpsTrend": [
        { "time": "10:00", "value": 430 },
        { "time": "10:10", "value": 520 }
      ],
      "hitRateTrend": [
        { "time": "10:00", "value": 96 },
        { "time": "10:10", "value": 95 }
      ]
    }
  }
  ```  
- 测试用例要点：
  - 当实例不存在时返回明确错误码与错误信息  
  - qpsTrend、hitRateTrend 按时间升序返回  

- 接口名称：获取缓存键列表  
- 接口地址：`GET /api/admin/ops/cache/keys`  
- 请求参数：
  - `instanceId`: string，必填，所属缓存实例 ID  
  - `keyword`: string，可选，按键名模糊搜索（如前缀 `session:user:`）  
  - `ttlType`: string，可选，`all` | `expiring` | `no-expire`（对应前端过期时间筛选）  
  - `page`: number，页码，从 1 开始  
  - `pageSize`: number，分页大小，建议默认 20，最大不超过 100  
- 返回数据示例：
  ```json
  {
    "code": 0,
    "msg": "ok",
    "data": {
      "list": [
        {
          "id": "k1",
          "key": "session:user:10001",
          "type": "hash",
          "size": 8.2,
          "ttl": 420,
          "instanceId": "redis-session",
          "instanceName": "会话缓存",
          "updatedAt": "2026-01-18 10:41:03"
        }
      ],
      "total": 120
    }
  }
  ```  
- 测试用例要点：
  - type 取值范围与后端实际支持的 Redis 类型保持一致（如 string/hash/list/set/zset）  
  - ttl 为秒数，`null` 表示永不过期，`0` 或负数表示已过期或将被删除  
  - 分页返回 total，总数应大于等于当前页记录数  

- 接口名称：批量删除缓存键  
- 接口地址：`POST /api/admin/ops/cache/keys/delete`  
- 请求参数：
  - `instanceId`: string，必填，缓存实例 ID  
  - `keys`: string[]，必填，待删除键名列表  
- 返回数据示例：
  ```json
  {
    "code": 0,
    "msg": "ok",
    "data": {
      "success": 118,
      "failed": 2,
      "failedKeys": ["session:user:99999", "session:user:99998"]
    }
  }
  ```  
- 测试用例要点：
  - keys 为空数组时返回参数错误  
  - 删除过程中部分键不存在时，需在 failedKeys 中返回，不能直接静默忽略  
- 精简待办：
  - 与缓存运维规范对齐：是否允许通配符删除、是否需要限流保护  
  - 确认是否需要支持键前缀批量删除接口（如 `keysPrefix` 字段）  

## 四、系统日志

- 接口名称：获取系统日志列表  
- 接口地址：`GET /api/admin/ops/logs`  
- 请求参数：
  - `level`: string，可选，`INFO` | `WARN` | `ERROR`，为空时表示全部级别  
  - `module`: string，可选，日志所属模块，如 `gateway`、`auth`、`monitor`、`cache` 等  
  - `keyword`: string，可选，按 message、detail、traceId 等字段模糊搜索  
  - `startTime`: string，可选，起始时间，格式 `YYYY-MM-DD HH:mm:ss`  
  - `endTime`: string，可选，结束时间，格式 `YYYY-MM-DD HH:mm:ss`  
  - `page`: number，页码，从 1 开始  
  - `pageSize`: number，分页大小，建议默认 20，最大不超过 200  
- 返回数据示例：
  ```json
  {
    "code": 0,
    "msg": "ok",
    "data": {
      "list": [
        {
          "id": "log_001",
          "time": "2026-01-18 10:40:21",
          "level": "ERROR",
          "module": "cache",
          "message": "批量删除缓存键失败",
          "detail": "实例 redis-main，前缀 session:* 删除过程中部分键不存在。",
          "traceId": "trace-ops-1001"
        }
      ],
      "total": 256
    }
  }
  ```  
- 测试用例要点：
  - level 非法取值时应返回参数错误，而非静默忽略  
  - 当查询时间范围过大时应返回提示或限制最大跨度  
  - traceId 字段应与网关 / 业务日志中的 traceId 保持统一，便于链路追踪  
- 精简待办：
  - 确认模块枚举与后端日志系统中的 app/module 字段映射关系  
  - 是否需要支持按 traceId 精确查询单条或一组日志  

- 接口名称：导出系统日志  
- 接口地址：`GET /api/admin/ops/logs/export`  
- 请求参数：
  - 与 `GET /api/admin/ops/logs` 保持一致（level/module/keyword/startTime/endTime 等），用于限定导出范围  
  - `format`: string，可选，导出格式，`csv` | `json`，默认 `csv`  
- 返回数据示例：
  - 成功时通常直接返回文件流，示例略  
  - 出错时仍返回统一格式：
    ```json
    {
      "code": 1001,
      "msg": "导出时间范围过大，请缩小查询区间后重试",
      "data": null
    }
    ```  
- 测试用例要点：
  - 必须限制最大可导出时间范围与条数（例如最多导出最近 7 天、10 万条），避免对日志存储与网络造成压力  
  - 当导出任务为异步处理时，需要约定前端轮询或回调机制（如返回任务 ID）  
- 精简待办：
  - 确认导出文件命名规范（包含时间范围、模块、环境等信息）  
  - 与安全策略对齐，控制导出权限（仅限具备运维权限的账号）  

## 五、用户行为

- 接口名称：获取用户行为轨迹  
- 接口地址：`GET /api/admin/ops/behavior/timeline`  
- 请求参数：
  - `userId`: string，必填，后台用户 ID（如 admin/editor 等）  
  - `range`: string，必填，时间范围，`today` | `7d` | `30d` 等  
- 返回数据示例：
  ```json
  {
    "code": 0,
    "msg": "ok",
    "data": [
      { "time": "09:00", "count": 2 },
      { "time": "10:00", "count": 5 }
    ]
  }
  ```  
- 测试用例要点：
  - time 字段格式需与 range 一致：`HH:mm`（today）或 `YYYY-MM-DD`（7d/30d）  
  - count 为非负整数  
  - 当用户不存在或无行为记录时，返回空数组而非错误  

- 接口名称：获取用户行为明细列表  
- 接口地址：`GET /api/admin/ops/behavior/list`  
- 请求参数：
  - `userId`: string，必填，后台用户 ID  
  - `level`: string，可选，行为风险级别，`low` | `medium` | `high`  
  - `keyword`: string，可选，按行为模块、操作名称、详情模糊搜索  
  - `startTime`: string，可选，起始时间  
  - `endTime`: string，可选，结束时间  
  - `page`: number，页码，从 1 开始  
  - `pageSize`: number，分页大小，默认 20  
- 返回数据示例：
  ```json
  {
    "code": 0,
    "msg": "ok",
    "data": {
      "list": [
        {
          "id": "e1",
          "time": "2026-01-18 10:40:03",
          "action": "批量删除缓存键",
          "module": "系统运维",
          "detail": "删除前缀为 session:* 的会话缓存 120 条",
          "riskLevel": "high"
        }
      ],
      "total": 32
    }
  }
  ```  
- 测试用例要点：
  - riskLevel 枚举值需与前端展示保持一致，便于统一风格  
  - 当查询条件过宽导致结果过大时，需返回提示信息或限制分页大小  
- 精简待办：
  - 与安全审计规范对齐，确认哪些行为被标记为高风险  
  - 是否需要额外提供「高风险行为统计」接口，以便在运维大屏中聚合展示  

> 上述接口字段设计会在实际后端方案确定后进一步细化。当前版本已根据前端页面交互（系统监控 / 缓存监控与列表 / 系统日志 / 用户行为）补充了示例字段与测试要点，用于指导前后端联调与测试用例设计。

## 附录：接口测试用例模板与后端对接 Checklist（系统运维模块）

> 本附录适用于接口文档中心、系统监控、缓存监控、系统日志、用户行为等运维相关接口，用于统一记录和测试标准。

### A. 单接口记录与测试要点模板

1. 基础信息
   - 接口名称：  
   - 接口地址：`[METHOD] /api/admin/ops/...`  
   - HTTP 方法：GET / POST / PUT / DELETE  
   - 所属模块：接口文档 / 系统监控 / 缓存 / 日志 / 用户行为 等  
   - 前端入口：对应运维页面和组件名称  
   - 是否需要登录：是  
   - 所需权限点：如 `ops:monitor:view`、`ops:cache:manage` 等  

2. 请求参数设计
   - 核心参数：实例 ID、时间范围、关键字、风险等级等  
   - 参数表（建议使用表格）：

     | 字段名     | 类型   | 必填 | 示例值            | 说明                 |
     | ---------- | ------ | ---- | ----------------- | -------------------- |
     | instanceId | string | 否   | redis-main        | 缓存实例 ID          |
     | range      | string | 否   | 1h                | 时间范围             |
     | metric     | string | 否   | cpu               | 监控指标类型         |
     | level      | string | 否   | ERROR / high      | 日志/行为风险等级    |
     | ...        | ...    | ...  | ...               | ...                  |

3. 响应数据结构
   - 统一响应：`{ code, msg, data }`  
   - data 常见形态：
     - 概览对象（overview）
     - 列表 + total
     - 趋势数组（time + value）  

4. 错误码与异常场景
   - 实例 ID 不存在  
   - 时间范围过大  
   - 权限不足（非运维账号访问敏感接口）  
   - 调用后端底层服务失败（如 Redis/监控系统不可用）。  

5. 业务规则与边界条件
   - 指标取值范围（如 usage、hitRate 为 [0,1]）  
   - 日志 / 行为结果为空时的处理方式  
   - 是否允许大范围导出日志 / 行为数据。  

6. 安全与权限要求
   - 仅特定角色可访问或导出敏感信息  
   - 导出操作是否需要额外审计。  

7. 性能与限流要求
   - 对高频监控接口（trend、timeline 等）设置合理的缓存与限流  
   - 导出接口限制最大导出数据量。  

8. 日志与监控
   - 运维接口自身的错误应写入系统日志  
   - 对高风险行为相关接口增加独立监控与告警。  

### B. 接口测试用例条目模板

- 用例编号：OPS-API-001  
- 用例名称：获取缓存实例列表成功  
- 前置条件：已登录后台，具备运维查看权限  
- 步骤：
  1. 调用 `GET /api/admin/ops/cache/instances`  
- 预期结果：
  - 返回 `code=0`，`data.list` 为数组  
  - 每条记录的 usage、hitRate 在 [0,1] 区间内。  

在此基础上补充「instanceId 不存在」「range 过大」「无权限访问」等异常用例。  

### C. 后端对接 Checklist（模块级）

1. 设计阶段
   - [ ] 为所有运维相关接口在本文件中登记入口与字段  
   - [ ] 与后端确认监控指标、风险等级、阈值等含义  

2. 开发阶段
   - [ ] 后端完成接口开发，并在测试环境接入实际监控 / 缓存 / 日志系统  
   - [ ] 前端页面根据字段渲染图表和列表  

3. 联调阶段
   - [ ] 验证接口在不同过滤条件下的返回正确性  
   - [ ] 验证无权限账号无法访问敏感接口  

4. 上线前
   - [ ] 为关键运维接口配置监控和告警规则  

5. 上线后
   - [ ] 根据实际运维反馈调整指标、页面展示和接口字段，并同步更新本文件。  
