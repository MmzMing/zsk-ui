# 系统运维 API 接口文档

## 1. 概述

本文档定义了后台系统运维模块的接口规范，涵盖接口文档中心、系统监控、缓存管理等功能。

- **基础路径**: `/api/admin/ops`
- **数据格式**: `JSON`
- **通用响应**: 所有接口统一返回 `{ code, msg, data }` 结构。

## 2. 接口列表

### 2.1 接口文档中心 (`/api-doc`)

#### 获取接口分类树
- **接口地址**: `GET /api-doc/tree`
- **描述**: 获取系统注册的 API 接口层级结构。
- **请求参数**: `keyword` (可选)
- **响应示例**:
  ```json
  {
    "code": 0,
    "msg": "ok",
    "data": [
      {
        "id": "group_1",
        "name": "仪表盘",
        "children": [
          {
            "id": "api_1",
            "name": "获取概览",
            "path": "/api/admin/dashboard/overview",
            "method": "GET"
          }
        ]
      }
    ]
  }
  ```

#### 获取接口详情
- **接口地址**: `GET /api-doc/detail`
- **描述**: 获取指定接口的详细定义（参数、响应示例）。
- **请求参数**: `id`
- **响应示例**:
  ```json
  {
    "code": 0,
    "msg": "ok",
    "data": {
      "id": "api_1",
      "path": "/api/admin/dashboard/overview",
      "method": "GET",
      "requestParams": [],
      "responseExample": "..."
    }
  }
  ```

#### 在线调试
- **接口地址**: `POST /api-doc/debug`
- **描述**: 发起接口调试请求。
- **请求参数**: `id`, `body` (JSON)
- **响应示例**: 返回实际请求的响应结果 (status, headers, body)。

### 2.2 系统监控 (`/monitor`)

#### 获取系统概览
- **接口地址**: `GET /monitor/overview`
- **描述**: 获取 CPU、内存、磁盘、网络等实时使用率。
- **请求参数**: 无
- **响应示例**:
  ```json
  {
    "code": 0,
    "msg": "ok",
    "data": {
      "cpuUsage": 0.32,
      "memoryUsage": 0.58,
      "diskUsage": 0.71
    }
  }
  ```

#### 获取资源趋势
- **接口地址**: `GET /monitor/trend`
- **描述**: 获取资源使用率的历史趋势图数据。
- **请求参数**: `metric` (`cpu`/`memory`/`disk`), `range` (`1h`/`24h`)

### 2.3 缓存管理 (`/cache`)

#### 获取缓存实例列表
- **接口地址**: `GET /cache/instances`
- **描述**: 获取 Redis 等缓存实例的运行状态。
- **请求参数**: 无
- **响应示例**:
  ```json
  {
    "code": 0,
    "msg": "ok",
    "data": [
      {
        "id": "redis-main",
        "name": "Redis 主库",
        "usage": 0.85,
        "hitRate": 0.99
      }
    ]
  }
  ```

#### 获取缓存键列表
- **接口地址**: `GET /cache/keys`
- **描述**: 分页查询缓存键。
- **请求参数**: `instanceId`, `keyword`, `page`, `pageSize`, `ttlType`

## 3. 错误码说明

| 错误码 | 说明 |
|---|---|
| 60001 | 接口 ID 不存在 |
| 60002 | 调试请求超时 |
| 60003 | 缓存实例连接失败 |
