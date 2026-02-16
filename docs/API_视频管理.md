# 视频管理 API 接口文档

## 1. 概述

本文档定义了后台视频管理模块的接口规范，涵盖视频上传（分片/合并）、列表查询、状态管理及审核队列。

- **基础路径**: `/api/admin/content/video`
- **数据格式**: `JSON`
- **通用响应**: 所有接口统一返回 `{ code, msg, data }` 结构。

## 2. 接口列表

### 2.1 视频上传 (`/upload`)

#### 初始化上传任务
- **接口地址**: `POST /upload/init`
- **描述**: 初始化视频上传任务，支持秒传检测。
- **请求参数**:
  | 字段名 | 类型 | 必填 | 说明 |
  |---|---|---|---|
  | title | string | 是 | 视频标题 |
  | category | string | 是 | 分类 |
  | fileName | string | 是 | 原始文件名 |
  | fileSize | number | 是 | 文件大小 (字节) |
  | fileMd5 | string | 是 | 文件 MD5 |
  | enableAiCheck | boolean | 是 | 是否开启 AI 预审 |
- **响应示例**:
  ```json
  {
    "code": 0,
    "msg": "ok",
    "data": {
      "uploadId": "up_20260118_0001",
      "needUpload": true,
      "uploadedChunks": []
    }
  }
  ```

#### 上传分片
- **接口地址**: `POST /upload/chunk`
- **描述**: 上传视频文件的二进制分片。
- **请求参数**: `uploadId`, `chunkIndex`, `chunkCount`, `chunkSize`, `content` (Binary)
- **响应示例**:
  ```json
  {
    "code": 0,
    "msg": "ok",
    "data": { "uploadId": "...", "chunkIndex": 1, "received": true }
  }
  ```

#### 合并分片
- **接口地址**: `POST /upload/merge`
- **描述**: 完成所有分片上传后，请求合并文件并生成视频资源。
- **请求参数**: `uploadId`, `fileMd5`
- **响应示例**:
  ```json
  {
    "code": 0,
    "msg": "ok",
    "data": {
      "videoId": "v_001",
      "playUrl": "https://example.com/video/v_001.m3u8"
    }
  }
  ```

#### 查询上传任务列表
- **接口地址**: `GET /upload/list`
- **描述**: 查询视频上传任务的状态与进度。
- **请求参数**: `page`, `pageSize`, `status`, `keyword`
- **响应示例**:
  ```json
  {
    "code": 0,
    "msg": "ok",
    "data": {
      "list": [
        {
          "id": "task_001",
          "title": "示例视频",
          "status": "success",
          "progress": 100
        }
      ],
      "total": 10
    }
  }
  ```

### 2.2 视频管理 (`/list`, `/status`)

#### 查询视频列表
- **接口地址**: `GET /list`
- **描述**: 分页查询已上传的视频列表。
- **请求参数**:
  | 字段名 | 类型 | 必填 | 说明 |
  |---|---|---|---|
  | page | number | 否 | 页码 |
  | pageSize | number | 否 | 每页数量 |
  | status | string | 否 | 状态: `draft`, `published`, `offline` |
  | category | string | 否 | 分类 |
  | keyword | string | 否 | 关键词 |
- **响应示例**:
  ```json
  {
    "code": 0,
    "msg": "ok",
    "data": {
      "list": [
        {
          "id": "v_001",
          "title": "视频标题",
          "status": "published",
          "plays": 100
        }
      ],
      "total": 1
    }
  }
  ```

#### 批量更新状态
- **接口地址**: `POST /status/batch`
- **描述**: 批量上架或下架视频。
- **请求参数**: `ids` (数组), `status` (`published`/`offline`)

### 2.3 视频审核 (`/review`)

#### 获取审核队列
- **接口地址**: `GET /review/list`
- **描述**: 获取待审核或已审核的视频队列。
- **请求参数**: `queueType` (`ai`/`manual`), `status`, `keyword`, `page`, `pageSize`
- **响应示例**:
  ```json
  {
    "code": 0,
    "msg": "ok",
    "data": {
      "list": [
        {
          "id": "rv_001",
          "title": "待审视频",
          "status": "pending",
          "riskLevel": "high"
        }
      ],
      "total": 5
    }
  }
  ```

#### 提交审核结果
- **接口地址**: `POST /review/submit`
- **描述**: 提交人工审核结果。
- **请求参数**: `reviewId`, `status` (`approved`/`rejected`), `reason`

## 3. 错误码说明

| 错误码 | 说明 |
|---|---|
| 30001 | 上传任务不存在 |
| 30002 | 分片索引越界 |
| 30003 | MD5 校验失败 |
| 30004 | 视频未审核通过，禁止上架 |
