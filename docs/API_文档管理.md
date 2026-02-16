# 文档管理 API 接口文档

## 1. 概述

本文档定义了后台文档管理模块的接口规范，涵盖文档上传、列表查询、状态管理及审核队列。

- **基础路径**: `/api/admin/content/doc`
- **数据格式**: `JSON`
- **通用响应**: 所有接口统一返回 `{ code, msg, data }` 结构。

## 2. 接口列表

### 2.1 文档上传 (`/upload`)

#### 初始化上传任务
- **接口地址**: `POST /upload/init`
- **描述**: 初始化文档上传任务。
- **请求参数**:
  | 字段名 | 类型 | 必填 | 说明 |
  |---|---|---|---|
  | title | string | 是 | 文档标题 |
  | fileName | string | 是 | 文件名 |
  | fileSize | number | 是 | 文件大小 |
  | fileMd5 | string | 是 | MD5 |
  | category | string | 是 | 分类 |
  | tags | string[] | 否 | 标签 |
  | isPublic | boolean | 是 | 是否公开 |
  | price | number | 否 | 价格 |
- **响应示例**:
  ```json
  {
    "code": 0,
    "msg": "ok",
    "data": {
      "uploadId": "doc_up_001",
      "needUpload": true,
      "presignedUrl": "https://example.com/upload/..."
    }
  }
  ```

#### 查询上传任务列表
- **接口地址**: `GET /upload/list`
- **描述**: 查询文档上传任务状态。
- **请求参数**: `page`, `pageSize`, `status`
- **响应示例**:
  ```json
  {
    "code": 0,
    "msg": "ok",
    "data": {
      "list": [
        {
          "id": "doc_task_001",
          "title": "文档A",
          "status": "success",
          "progress": 100
        }
      ],
      "total": 5
    }
  }
  ```

### 2.2 文档管理 (`/list`, `/status`)

#### 查询文档列表
- **接口地址**: `GET /list`
- **描述**: 分页查询已上传的文档列表。
- **请求参数**: `page`, `pageSize`, `status`, `category`, `keyword`
- **响应示例**:
  ```json
  {
    "code": 0,
    "msg": "ok",
    "data": {
      "list": [
        {
          "id": "doc_001",
          "title": "文档标题",
          "status": "published",
          "readCount": 100
        }
      ],
      "total": 1
    }
  }
  ```

#### 批量更新状态
- **接口地址**: `POST /status/batch`
- **描述**: 批量上架或下架文档。
- **请求参数**: `ids` (数组), `status` (`published`/`offline`)

### 2.3 文档审核 (`/review`)

#### 获取审核队列
- **接口地址**: `GET /review/list`
- **描述**: 获取待审核或已审核的文档队列。
- **请求参数**: `page`, `pageSize`, `status`, `keyword`
- **响应示例**:
  ```json
  {
    "code": 0,
    "msg": "ok",
    "data": {
      "list": [
        {
          "id": "doc_rv_001",
          "title": "待审文档",
          "status": "pending",
          "riskLevel": "medium"
        }
      ],
      "total": 2
    }
  }
  ```

#### 提交审核结果
- **接口地址**: `POST /review/submit`
- **描述**: 提交人工审核结果。
- **请求参数**: `reviewId`, `status`, `reason`

## 3. 错误码说明

| 错误码 | 说明 |
|---|---|
| 40001 | 上传初始化失败 |
| 40002 | 文件格式不支持 |
| 40003 | 文档未审核通过 |
