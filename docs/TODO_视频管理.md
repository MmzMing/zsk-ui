# 视频管理模块接口 TODO 清单

> 本文档用于记录「视频管理」相关后台页面预计对接的接口信息，便于后续与后端对齐实现方案。所有接口返回格式统一为 `{ code, msg, data }`。

## 一、上传初始化与分片上传

- 接口名称：初始化视频上传任务  
- 接口地址：`POST /api/admin/content/video/upload/init`  
- 请求参数：
  - `title`: string，视频标题  
  - `category`: string，视频分类，如 `工程实践`、`效率方法` 等  
  - `description`: string，可选，视频简介  
  - `fileName`: string，原始文件名  
  - `fileSize`: number，文件大小，单位字节  
  - `fileMd5`: string，文件 MD5 签名，用于秒传与断点续传  
  - `enableAiCheck`: boolean，是否开启 AI 预审核，对应前端 `is_ai_checked` 字段  
- 返回数据示例：
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
- 测试用例要点：
  - 文件已在服务端存在时返回 `needUpload=false`，前端可直接标记为上传完成  
  - 参数缺失或签名不合法时返回明确错误信息  
- 精简待办：
  - 与后端确认 `uploadId` 命名规范与有效期  
  - 是否需要返回分片大小建议值（如 5MB、10MB）

- 接口名称：上传视频分片  
- 接口地址：`POST /api/admin/content/video/upload/chunk`  
- 请求参数：
  - `uploadId`: string，上传任务 ID  
  - `chunkIndex`: number，当前分片序号，从 1 开始  
  - `chunkCount`: number，总分片数量  
  - `chunkSize`: number，本分片大小  
  - `content`: binary，二进制文件流  
- 返回数据示例：
  ```json
  {
    "code": 0,
    "msg": "ok",
    "data": {
      "uploadId": "up_20260118_0001",
      "chunkIndex": 1,
      "received": true
    }
  }
  ```  
- 测试用例要点：
  - 重复上传同一分片时需具备幂等性  
  - 分片序号越界或 uploadId 不存在时返回错误  
- 精简待办：
  - 与对象存储或网关组件对齐上传鉴权策略  
  - 是否需要限制单个分片的最大体积

- 接口名称：合并分片并生成视频资源  
- 接口地址：`POST /api/admin/content/video/upload/merge`  
- 请求参数：
  - `uploadId`: string，上传任务 ID  
  - `fileMd5`: string，文件 MD5 签名  
- 返回数据示例：
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
- 测试用例要点：
  - 所有分片上传完成后才能合并  
  - MD5 校验失败时返回错误并记录日志  
- 精简待办：
  - 确认与转码服务之间的任务触发方式（同步/异步）  
  - 是否需要支持多种清晰度源的生成策略

## 二、上传任务查询

- 接口名称：查询视频上传任务列表  
- 接口地址：`GET /api/admin/content/video/upload/list`  
- 请求参数：
  - `page`: number，页码，从 1 开始  
  - `pageSize`: number，分页大小，默认 20  
  - `status`: string，可选，`waiting` | `uploading` | `success` | `error`  
  - `keyword`: string，可选，按标题 / 文件名模糊搜索  
- 返回数据示例：
  ```json
  {
    "code": 0,
    "msg": "ok",
    "data": {
      "list": [
        {
          "id": "task_001",
          "title": "从 0 搭建个人知识库前端",
          "fileName": "kb-front-bootcamp-01.mp4",
          "category": "工程实践",
          "size": 536870912,
          "status": "success",
          "progress": 100,
          "isAiChecked": true,
          "aiRiskLevel": "low",
          "createdAt": "2026-01-18 10:20:00"
        }
      ],
      "total": 32
    }
  }
  ```  
- 测试用例要点：
  - status 缺省时返回所有状态  
  - 当无记录时返回空数组而非错误  
- 精简待办：
  - 与权限模型对齐不同角色可见的上传记录范围  
  - 是否需要按上传人或来源渠道维度筛选

## 三、视频列表与状态管理

- 接口名称：查询视频列表  
- 接口地址：`GET /api/admin/content/video/list`  
- 请求参数：
  - `page`: number，页码，从 1 开始  
  - `pageSize`: number，分页大小，默认 20  
  - `status`: string，可选，`draft` | `published` | `offline`  
  - `category`: string，可选，视频分类  
  - `keyword`: string，可选，按标题 / ID 模糊搜索  
- 返回数据示例：
  ```json
  {
    "code": 0,
    "msg": "ok",
    "data": {
      "list": [
        {
          "id": "v_001",
          "title": "从 0 搭建个人知识库前端",
          "category": "工程实践",
          "status": "published",
          "duration": 1104,
          "plays": 3289,
          "likes": 421,
          "comments": 63,
          "createdAt": "2026-01-10 09:20:11",
          "updatedAt": "2026-01-12 14:32:45"
        }
      ],
      "total": 18
    }
  }
  ```  
- 测试用例要点：
  - duration 单位为秒，前端负责格式化展示  
  - 分页返回 total，总数应大于等于当前页记录数  
- 精简待办：
  - 与前台视频详情页的数据结构保持一致  
  - 是否需要按可见范围（公开 / 私有）维度筛选

- 接口名称：批量更新视频上架状态  
- 接口地址：`POST /api/admin/content/video/status/batch`  
- 请求参数：
  - `ids`: string[]，视频 ID 列表  
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
  - 与审核模块对齐「未通过审核的视频不可上架」约束  
  - 确认是否需要支持定时上架 / 下架

## 四、视频审核队列

- 接口名称：获取视频审核队列  
- 接口地址：`GET /api/admin/content/video/review/list`  
- 请求参数：
  - `queueType`: string，`ai` | `manual`  
  - `status`: string，可选，`pending` | `approved` | `rejected`  
  - `keyword`: string，可选，按标题 / 上传人 / 分类模糊搜索  
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
          "id": "rv_ai_001",
          "title": "敏感词检测示例视频 01",
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
  - queueType 为空时默认返回人工审核队列  
  - isAiChecked 字段与 queueType=ai 时必须为 true  
- 精简待办：
  - 与违规评论库、敏感词库的风险等级字段保持一致  
  - 是否需要支持更多队列维度（如优先级队列）

- 接口名称：提交视频审核结果  
- 接口地址：`POST /api/admin/content/video/review/submit`  
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
  - 提交结果后应同步更新视频状态与审核轨迹  
- 精简待办：
  - 与消息中心对接审核结果通知（站内信 / 邮件）  
  - 审核轨迹时间轴字段设计待与后端进一步确认

## 附录：接口测试用例模板与后端对接 Checklist（视频管理模块）

> 本附录为「视频管理」模块下所有接口提供统一的记录格式和测试用例模板，前后端在补充 / 新增接口时可以直接复制使用，保证文档、联调与测试的一致性。

### A. 单接口记录与测试要点模板

1. 基础信息
   - 接口名称：  
   - 接口地址：`[METHOD] /api/admin/content/video/...`  
   - HTTP 方法：GET / POST / PUT / DELETE  
   - 所属模块：视频管理  
   - 前端入口：页面名称 + 功能按钮说明（例如「视频列表页 · 批量上架按钮」）  
   - 是否需要登录：是 / 否  
   - 所需权限点：如 `video:publish`、`video:upload` 等  

2. 请求参数设计
   - 参数位置：Query / Body(JSON) / Path / Header  
   - 参数列表（建议使用表格补充）：

     | 字段名       | 类型     | 必填 | 示例值                         | 说明                   |
     | ------------ | -------- | ---- | ------------------------------ | ---------------------- |
     | page         | number   | 否   | 1                              | 页码，从 1 开始        |
     | pageSize     | number   | 否   | 20                             | 每页数量               |
     | status       | string   | 否   | uploading                      | 任务或视频状态         |
     | keyword      | string   | 否   | 从 0 搭建个人知识库前端       | 标题 / 文件名模糊搜索 |
     | ...          | ...      | ...  | ...                            | ...                    |

3. 响应数据结构
   - 成功响应示例（复用全局 `{ code, msg, data }` 结构）  
   - `data` 字段详细说明（建议使用表格）：

     | 字段名          | 类型     | 示例值                         | 说明                         |
     | --------------- | -------- | ------------------------------ | ---------------------------- |
     | list            | object[] |                                | 列表数据                     |
     | total           | number   | 32                             | 总条数                       |
     | list[].id       | string   | v_001                          | 视频 ID                      |
     | list[].status   | string   | published                      | 视频状态                     |
     | list[].playUrl  | string   | https://example.com/video.m3u8 | 播放地址（如有）             |
     | ...             | ...      | ...                            | ...                          |

4. 错误码与异常场景
   - 系统类错误：如 401 未登录、403 无权限、500 服务器异常等  
   - 业务类错误示例：
     - 上传任务不存在
     - 分片索引越界
     - 视频未通过审核但尝试上架
   - 每个错误码至少给出 1 条测试用例（输入参数 + 预期错误信息）。  

5. 业务规则与边界条件
   - 秒传与断点续传规则（依赖 `fileMd5`、`uploadedChunks` 等字段）  
   - 状态流转约束：`waiting -> uploading -> success/error`、`draft -> published -> offline` 等  
   - 审核规则：未审核视频是否允许上架、AI 审核与人工审核优先级等。  

6. 权限与安全要求
   - 仅允许具备指定权限的后台账号访问  
   - 接口调用是否需要在操作日志 / 行为审计中记录，如「批量下架视频」「删除上传任务」等。  

7. 性能与限流要求
   - 列表接口最大分页大小建议值（例如 pageSize <= 100）  
   - 高频接口（如上传分片）是否需要限流与并发控制说明。  

8. 日志与监控
   - 关键操作（例如合并分片、提交审核结果）是否需要记录到系统日志 / 操作日志  
   - 是否有关键指标需要在监控大盘中展示（上传成功率、审核通过率等）。  

9. 兼容性与变更记录
   - 字段新增 / 删除的向前兼容策略  
   - 对旧前端版本的影响评估。  

### B. 接口测试用例条目模板

> 建议每个接口至少覆盖「正常」「必填缺失」「非法输入」「无权限」「边界值」「并发 / 幂等」等场景。

- 用例编号：VID-API-001  
- 用例名称：初始化视频上传任务成功  
- 前置条件：
  - 已登录后台，账号具备 `video:upload` 权限  
- 步骤：
  1. 选择一个合法的视频文件，获取文件大小与 MD5  
  2. 通过前端页面或接口工具发起 `POST /api/admin/content/video/upload/init`  
- 输入数据：
  - title=「从 0 搭建个人知识库前端」  
  - fileName=`kb-front-bootcamp-01.mp4`  
  - fileSize=536870912  
  - fileMd5=`xxxx`  
- 预期结果：
  - 返回 `code=0`，`data.needUpload=true`，`data.uploadId` 非空  
  - 操作成功记录在上传任务列表中。  
- 备注：无  

可以在此模板基础上复制多条用例，编号建议包含模块前缀（如 `VID-`）。  

### C. 后端对接 Checklist（模块级）

1. 设计阶段
   - [ ] 所有计划对接的视频管理接口已在本文件登记  
   - [ ] 与后端确认了请求参数、返回结构、错误码、状态流转等  
   - [ ] 确认上传与转码、审核服务之间的依赖关系  

2. 开发阶段
   - [ ] 后端已在测试环境提供稳定接口（或 Mock 服务）  
   - [ ] 前端已完成 `src/api/admin/video.ts` 封装，并在页面中使用  
   - [ ] 字段命名与 TODO 文档保持一致  

3. 联调阶段
   - [ ] 针对每个接口至少执行 1 轮全量测试用例  
   - [ ] 对上传、合并、审核等关键操作进行异常场景验证（网络中断、参数异常等）  
   - [ ] 日志、监控中可看到对应行为记录  

4. 上线前
   - [ ] 与后端确认生产环境网关路径、超时时间、限流策略  
   - [ ] 已根据测试结果更新本文件中的「测试用例要点」与「精简待办」  

5. 上线后
   - [ ] 监控上传成功率、审核通过率、播放成功率等指标  
   - [ ] 若发现高频异常或性能问题，及时在本文件补充问题与跟进记录。  
