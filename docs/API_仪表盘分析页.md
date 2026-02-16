# 仪表盘分析页 API 接口文档

## 1. 概述

本文档定义了仪表盘分析页（数字大屏）的接口规范，用于展示大屏核心指标、时间分布及可视化配置。

- **基础路径**: `/api/admin/dashboard/analysis`
- **数据格式**: `JSON`
- **通用响应**: 所有接口统一返回 `{ code, msg, data }` 结构。

## 2. 接口列表

### 2.1 核心指标 (`/metrics`)

#### 获取大屏核心指标
- **接口地址**: `GET /metrics`
- **描述**: 获取数字大屏顶部的实时统计指标。
- **请求参数**:
  | 字段名 | 类型 | 必填 | 说明 |
  |---|---|---|---|
  | range | string | 否 | 时间范围: `today` (默认), `7d`, `30d` |
- **响应示例**:
  ```json
  {
    "code": 0,
    "msg": "ok",
    "data": {
      "pvToday": 3200,
      "pvTodayChange": 0.12,
      "pv7d": 21400,
      "systemHealthScore": 96,
      "systemHealthText": "稳定"
    }
  }
  ```

### 2.2 访问分布 (`/time-distribution`)

#### 获取时间维度分布
- **接口地址**: `GET /time-distribution`
- **描述**: 获取指定日期内的访问量时间分布数据，用于渲染趋势图或热力图。
- **请求参数**:
  | 字段名 | 类型 | 必填 | 说明 |
  |---|---|---|---|
  | date | string | 否 | 日期 (如 `2026-01-18`), 默认今日 |
  | step | string | 否 | 粒度: `hour`, `half-hour` |
- **响应示例**:
  ```json
  {
    "code": 0,
    "msg": "ok",
    "data": [
      { "type": "document", "time": "10:00", "value": 520 },
      { "type": "video", "time": "10:00", "value": 320 }
    ]
  }
  ```

### 2.3 展示配置 (`/display-config`)

#### 获取大屏展示配置
- **接口地址**: `GET /display-config`
- **描述**: 获取数字大屏的主题、布局等动态配置。
- **请求参数**: 无
- **响应示例**:
  ```json
  {
    "code": 0,
    "msg": "ok",
    "data": {
      "defaultTheme": "auto",
      "allowedThemes": ["light", "dark", "auto"],
      "fullScreenHideElements": ["header", "sidebar"]
    }
  }
  ```

## 3. 错误码说明

| 错误码 | 说明 |
|---|---|
| 80001 | 时间范围无效 |
| 80002 | 粒度不支持 |
