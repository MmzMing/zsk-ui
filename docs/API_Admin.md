# 后台管理基础 API 接口文档

## 1. 概述

本文档定义了后台管理系统通用的基础接口，包括菜单路由、仪表盘总览及操作日志。

- **基础路径**: `/api/admin`
- **数据格式**: `JSON`
- **通用响应**: 所有接口统一返回 `{ code, msg, data }` 结构。

## 2. 接口列表

### 2.1 菜单与路由 (`/menu`)

#### 获取后台菜单树
- **接口地址**: `GET /menu/tree`
- **描述**: 获取当前登录用户有权限访问的后台侧边栏菜单结构。
- **请求参数**: 无
- **响应示例**:
  ```json
  {
    "code": 0,
    "msg": "ok",
    "data": [
      {
        "id": "dashboard",
        "name": "仪表盘",
        "path": "/admin",
        "icon": "FiPieChart",
        "children": []
      }
    ]
  }
  ```

### 2.2 仪表盘总览 (`/dashboard`)

#### 获取核心指标
- **接口地址**: `GET /dashboard/overview`
- **描述**: 获取仪表盘顶部的核心统计卡片数据。
- **请求参数**: `range` (如 `7d`, `30d`)
- **响应示例**:
  ```json
  {
    "code": 0,
    "msg": "ok",
    "data": {
      "docTotal": 128,
      "videoTotal": 36,
      "activeUsers": 842,
      "pageViews": 12400
    }
  }
  ```

#### 获取访问结构分布
- **接口地址**: `GET /dashboard/traffic`
- **描述**: 获取文档与视频的访问量柱状图数据。
- **请求参数**: `range`
- **响应示例**:
  ```json
  {
    "code": 0,
    "msg": "ok",
    "data": [
      { "type": "document", "date": "周一", "value": 320 },
      { "type": "video", "date": "周一", "value": 210 }
    ]
  }
  ```

#### 获取访问趋势
- **接口地址**: `GET /dashboard/trend`
- **描述**: 获取整体访问量的折线图数据。
- **请求参数**: `range`
- **响应示例**:
  ```json
  {
    "code": 0,
    "msg": "ok",
    "data": [
      { "date": "2026-01-01", "value": 420 }
    ]
  }
  ```

### 2.3 操作日志 (`/logs`)

#### 获取最近操作记录
- **接口地址**: `GET /logs/recent`
- **描述**: 分页获取后台操作日志，用于仪表盘或日志页展示。
- **请求参数**: `category`, `page`, `pageSize`
- **响应示例**:
  ```json
  {
    "code": 0,
    "msg": "ok",
    "data": {
      "list": [
        {
          "id": "log_1",
          "category": "content",
          "operator": "admin",
          "action": "发布文档",
          "createdAt": "2026-01-01"
        }
      ],
      "total": 100
    }
  }
  ```

## 3. 错误码说明

| 错误码 | 说明 |
|---|---|
| 70001 | 菜单加载失败 |
| 70002 | 统计数据查询超时 |
