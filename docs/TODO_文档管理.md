# 文档管理模块接口 TODO 清单

> 本文档用于记录「文档管理」相关后台页面预计对接的接口信息，便于后续与后端对齐实现方案。所有接口返回格式统一为 `{ code, msg, data }`。

## 一、上传初始化与上传任务

- 接口名称：初始化文档上传任务  
- 接口地址：`POST /api/admin/content/doc/upload/init`  
- 请求参数：
  - `title`: string，文档标题  
  - `fileName`: string，原始文件名  
  - `fileSize`: number，文件大小，单位字节  
  - `fileMd5`: string，文件 MD5 签名，用于秒传与断点续传  
  - `category`: string，文档分类，如 `工程实践`、`系统设计` 等  
  - `tags`: string[]，标签列表  
  - `description`: string，可选，文档简介  
  - `isPublic`: boolean，是否公开可见  
  - `price`: number，可选，收费文档价格（如有）  
- 返回数据示例：
  ```json
  {
    "code": 0,
    "msg": "ok",
    "data": {
      "uploadId": "doc_up_20260118_0001",
      "needUpload": true,
      "presignedUrl": "https://example.com/upload"
    }
  }
  ```  
- 测试用例要点：
  - 文件已在服务端存在（命中秒传）时返回 `needUpload=false`，前端应直接标记为上传完成  
  - 参数缺失或签名不合法时返回明确错误信息  
  - 当 `price` 存在时需验证金额合法性（非负数，精度约定）  
- 精简待办：
  - 与后端确认 `uploadId` 命名规范与有效期  
  - 是否需要支持分片上传与断点续传扩展字段（如已上传分片列表）  

- 接口名称：查询文档上传任务列表  
- 接口地址：`GET /api/admin/content/doc/upload/list`  
- 请求参数：
  - `page`: number，页码，从 1 开始  
  - `pageSize`: number，分页大小，默认 20  
  - `status`: string，可选，`waiting` | `uploading` | `processing` | `success` | `error`  
- 返回数据示例：
  ```json
  {
    "code": 0,
    "msg": "ok",
    "data": {
      "list": [
        {
          "id": "doc_task_001",
          "title": "如何把视频课程拆解成学习笔记",
          "fileName": "course-to-notes.pdf",
          "size": 12582912,
          "status": "success",
          "progress": 100,
          "createdAt": "2026-01-18 10:20:00"
        }
      ],
      "total": 10
    }
  }
  ```  
- 测试用例要点：
  - `status` 缺省时返回所有状态  
  - 当无记录时返回空数组而非错误  
  - `progress` 取值范围为 `[0, 100]`  
- 精简待办：
  - 与权限模型对齐不同角色可见的上传记录范围  
  - 确认是否需要按上传人、来源渠道等维度筛选  

## 二、文档列表与状态管理

- 接口名称：查询文档列表  
- 接口地址：`GET /api/admin/content/doc/list`  
- 请求参数：
  - `page`: number，页码，从 1 开始  
  - `pageSize`: number，分页大小，默认 20  
  - `status`: string，可选，`draft` | `published` | `offline`  
  - `category`: string，可选，文档分类  
  - `keyword`: string，可选，按标题 / ID 模糊搜索  
- 返回数据示例：
  ```json
  {
    "code": 0,
    "msg": "ok",
    "data": {
      "list": [
        {
          "id": "doc_001",
          "title": "从 0 搭建个人知识库前端",
          "category": "工程实践",
          "status": "published",
          "readCount": 1280,
          "likeCount": 210,
          "commentCount": 32,
          "createdAt": "2026-01-10 09:20:11",
          "updatedAt": "2026-01-12 14:32:45"
        }
      ],
      "total": 18
    }
  }
  ```  
- 测试用例要点：
  - 分页返回 `total`，总数应大于等于当前页记录数  
  - 阅读数、点赞数、评论数均应为非负整数  
- 精简待办：
  - 与前台文档详情页的数据结构保持一致  
  - 是否需要按可见范围（公开 / 私有）维度筛选  

- 接口名称：批量更新文档上架状态  
- 接口地址：`POST /api/admin/content/doc/status/batch`  
- 请求参数：
  - `ids`: string[]，文档 ID 列表  
  - `status`: string，`published` | `offline`  
- 返回数据示例：
  ```json
  {
    "code": 0,
    "msg": "ok",
    "data": true
  }
  ```  
- 测试用例要点：
  - 当部分 ID 不存在时应返回错误或明确提示  
  - 操作应记录至后台操作日志，便于追踪  
- 精简待办：
  - 与审核模块对齐「未通过审核的文档不可上架」约束  
  - 确认是否需要支持定时上架 / 下架  

## 三、文档审核队列

- 接口名称：获取文档审核队列  
- 接口地址：`GET /api/admin/content/doc/review/list`  
- 请求参数：
  - `page`: number，页码，从 1 开始  
  - `pageSize`: number，分页大小，默认 20  
  - `status`: string，可选，`pending` | `approved` | `rejected`  
  - `keyword`: string，可选，按标题 / 上传人 / 分类模糊搜索  
- 返回数据示例：
  ```json
  {
    "code": 0,
    "msg": "ok",
    "data": {
      "list": [
        {
          "id": "doc_rv_001",
          "title": "敏感词检测示例文档 01",
          "uploader": "editor",
          "category": "内容管理",
          "status": "pending",
          "riskLevel": "high",
          "isAiChecked": true,
          "createdAt": "2026-01-18 10:20:01"
        }
      ],
      "total": 6
    }
  }
  ```  
- 测试用例要点：
  - `status` 为空时默认返回待审核队列或全量队列（需与后端约定）  
  - `riskLevel` 枚举值需与前端展示保持一致（`low` | `medium` | `high`）  
  - `isAiChecked` 与 AI 审核流程字段保持一致  
- 精简待办：
  - 与违规内容库、敏感词库的风险等级字段保持一致  
  - 是否需要更多队列维度（如优先级队列、来源渠道）  

- 接口名称：提交文档审核结果  
- 接口地址：`POST /api/admin/content/doc/review/submit`  
- 请求参数：
  - `reviewId`: string，审核任务 ID  
  - `status`: string，`approved` | `rejected`  
  - `reason`: string，可选，驳回说明  
- 返回数据示例：
  ```json
  {
    "code": 0,
    "msg": "ok",
    "data": true
  }
  ```  
- 测试用例要点：
  - 审核任务不存在或已终态时返回错误  
  - 提交结果后应同步更新文档状态与审核轨迹  
- 精简待办：
  - 与消息中心对接审核结果通知（站内信 / 邮件）  
  - 审核轨迹时间轴字段设计待与后端进一步确认  

## 附录：接口测试用例模板与对接说明

- 文档管理模块可复用 `docs/TODO_视频管理.md` 附录中提供的  
  「接口测试用例模板」与「后端对接 Checklist」，字段说明与流程颗粒度保持一致。  
- 建议在新增 / 修改接口时：
  - 复制视频管理模块的测试模板，替换为文档字段即可  
  - 在本文件中补充对应的测试用例和待办事项。  

