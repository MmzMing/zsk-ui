# video.ts（视频管理）前后端接口对接文档

> 文档创建时间：2026-02-15  
> 对接策略：先对接基础接口，后端补全相关字段

---

## 一、模块总览

| 子模块 | 前端接口数 | 后端状态 | 对接方案 |
|-------|----------|---------|---------|
| 视频管理 | 6个 | ✅ 已有 | 前端修改路径+字段映射 |
| 评论管理 | 2个 | ✅ 已有 | 前端修改路径+字段映射 |
| 分类标签 | 2个 | ⚠️ 需新增 | 后端新增接口（从sys_dict_type获取，Redis缓存） |
| 草稿管理 | 3个 | ⚠️ 需设计 | 新设计方案（见下文） |
| 上传管理 | 5个 | ✅ 已有 | 前端调整分片上传逻辑 |
| 审核管理 | 5个 | ⚠️ 需新增 | 后端新增审核详情接口 |
| 状态切换 | 2个 | ❌ 缺失 | 后端新增接口 |

---

## 二、视频管理接口映射

### 2.1 接口映射表

| 前端接口 | HTTP | 后端接口 | 对接方案 |
|---------|------|---------|---------|
| `GET /admin/content/video/list` | GET | `GET /video/detail/page` | 前端修改路径+字段映射 |
| `GET /admin/content/video/{id}` | GET | `GET /video/detail/{id}` | 前端修改路径+字段映射 |
| `PUT /admin/content/video/{id}` | PUT | `PUT /video/detail` | 前端修改路径+字段映射 |
| `DELETE /admin/content/video/{id}` | DELETE | `DELETE /video/detail/{ids}` | 前端修改路径 |
| `POST /admin/content/video/batch-delete` | POST | `DELETE /video/detail/{ids}` | 前端改用DELETE |
| `POST /admin/content/video/status/batch` | POST | ❌ 缺失 | 后端新增 |

### 2.2 字段映射表

| 前端字段 | 后端字段 | 类型 | 说明 |
|---------|---------|------|------|
| id | id | String | 主键 |
| title | videoTitle | String | **需映射**：视频标题 |
| category | broadCode | String | **需映射**：大类 |
| - | narrowCode | String | 小类 |
| tags | tags | String | 标签（逗号分隔） |
| description | fileContent | String | **需映射**：视频描述 |
| status | status | String/Integer | **需转换**：前端字符串→后端数字 |
| plays | viewCount | Long | **需映射**：播放量 |
| likes | likeCount | Long | **需映射**：点赞量 |
| comments | commentCount | Long | **需映射**：评论量 |
| cover | fileId | String | **通过fileId关联doc_files表获取** |
| videoUrl | fileId | String | **通过fileId关联doc_files表获取** |
| pinned | isPinned | Boolean | **需映射**：是否置顶 |
| recommended | isRecommended | Boolean | **需映射**：是否推荐 |
| createdAt | createTime | DateTime | **需映射** |
| updatedAt | updateTime | DateTime | **需映射** |

**重要说明**：
- `cover`（封面图URL）和 `videoUrl`（视频播放地址）不需要在视频表中新增字段
- 通过 `fileId` 关联 `doc_files` 表获取文件URL
- 后端查询时需要关联查询文件信息

### 2.3 状态值映射

| 前端状态 | 后端状态值 | 说明 |
|---------|----------|------|
| draft | 3 | 草稿 |
| published | 1 | 已发布 |
| offline | 2 | 已下架 |
| pending | - | 待审核（从auditStatus获取） |
| approved | - | 审核通过（从auditStatus获取） |
| rejected | - | 审核驳回（从auditStatus获取） |

| 前端审核状态 | 后端auditStatus | 说明 |
|------------|----------------|------|
| pending | 0 | 待审核 |
| approved | 1 | 审核通过 |
| rejected | 2 | 审核驳回 |

---

## 三、文件上传管理

### 3.1 后端已有接口

| 接口路径 | HTTP | 说明 |
|---------|------|------|
| `POST /files/upload` | POST | 普通文件上传（用于封面图） |
| `POST /files/multipart/init` | POST | 初始化分片上传 |
| `POST /files/multipart/upload` | POST | 上传分片 |
| `POST /files/multipart/complete` | POST | 完成分片上传 |
| `GET /files/page` | GET | 分页查询文件列表 |
| `DELETE /files/{ids}` | DELETE | 删除文件 |

### 3.2 分片上传流程（参考 test-upload.html）

```
1. 计算文件MD5
   ↓
2. 初始化分片上传
   POST /files/multipart/init
   Body: { fileName, contentType, md5 }
   Response: uploadId
   ↓
3. 分片上传（循环）
   POST /files/multipart/upload?uploadId=xxx&partNumber=xxx
   Body: FormData(file: chunk)
   Response: etag
   ↓
4. 完成分片上传
   POST /files/multipart/complete
   Body: { fileName, uploadId, md5, parts: [{partNumber, etag}] }
```

### 3.3 前端分片上传代码调整

```typescript
// ===== 分片上传常量 =====
const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * 计算文件MD5
 * @param file 文件对象
 * @returns MD5字符串
 */
async function calculateMD5(file: File): Promise<string> {
  const spark = new SparkMD5.ArrayBuffer();
  const chunks = Math.ceil(file.size / CHUNK_SIZE);
  let currentChunk = 0;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      spark.append(e.target?.result as ArrayBuffer);
      currentChunk++;

      if (currentChunk < chunks) {
        loadNext();
      } else {
        resolve(spark.end());
      }
    };

    reader.onerror = reject;

    function loadNext() {
      const start = currentChunk * CHUNK_SIZE;
      const end = Math.min(file.size, start + CHUNK_SIZE);
      reader.readAsArrayBuffer(file.slice(start, end));
    }

    loadNext();
  });
}

/**
 * 初始化分片上传
 * @param fileName 文件名
 * @param contentType 文件类型
 * @param md5 文件MD5
 * @returns uploadId
 */
export async function initMultipartUpload(
  fileName: string,
  contentType: string,
  md5: string
): Promise<string> {
  const res = await handleRequest({
    requestFn: () =>
      request.instance
        .post<ApiResponse<string>>("/files/multipart/init", {
          fileName,
          contentType,
          md5,
        })
        .then((r) => r.data),
    mockData: "mock-upload-id-" + Date.now(),
    apiName: "initMultipartUpload",
  });
  return res.data as string;
}

/**
 * 上传分片
 * @param uploadId 上传ID
 * @param partNumber 分片序号
 * @param chunk 分片数据
 * @returns etag
 */
export async function uploadPart(
  uploadId: string,
  partNumber: number,
  chunk: Blob
): Promise<string> {
  const formData = new FormData();
  formData.append("file", chunk);

  const res = await handleRequest({
    requestFn: () =>
      request.instance
        .post<ApiResponse<string>>(
          `/files/multipart/upload?uploadId=${uploadId}&partNumber=${partNumber}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        )
        .then((r) => r.data),
    mockData: "etag-" + partNumber,
    apiName: "uploadPart",
  });
  return res.data as string;
}

/**
 * 完成分片上传
 * @param fileName 文件名
 * @param uploadId 上传ID
 * @param md5 文件MD5
 * @param parts 分片信息列表
 */
export async function completeMultipartUpload(
  fileName: string,
  uploadId: string,
  md5: string,
  parts: { partNumber: number; etag: string }[]
): Promise<void> {
  await handleRequest({
    requestFn: () =>
      request.instance
        .post<ApiResponse<void>>("/files/multipart/complete", {
          fileName,
          uploadId,
          md5,
          parts,
        })
        .then((r) => r.data),
    mockData: undefined,
    apiName: "completeMultipartUpload",
  });
}

/**
 * 分片上传视频（完整流程）
 * @param file 视频文件
 * @param onProgress 进度回调
 * @returns 文件ID
 */
export async function uploadVideo(
  file: File,
  onProgress?: (percent: number) => void
): Promise<string> {
  /** 1. 计算MD5 */
  const md5 = await calculateMD5(file);

  /** 2. 初始化分片上传 */
  const uploadId = await initMultipartUpload(
    file.name,
    file.type || "application/octet-stream",
    md5
  );

  /** 3. 分片上传 */
  const chunks = Math.ceil(file.size / CHUNK_SIZE);
  const parts: { partNumber: number; etag: string }[] = [];

  for (let i = 0; i < chunks; i++) {
    const partNumber = i + 1;
    const start = i * CHUNK_SIZE;
    const end = Math.min(file.size, start + CHUNK_SIZE);
    const chunk = file.slice(start, end);

    const etag = await uploadPart(uploadId, partNumber, chunk);
    parts.push({ partNumber, etag });

    /** 更新进度 */
    if (onProgress) {
      onProgress(Math.round(((i + 1) / chunks) * 100));
    }
  }

  /** 4. 完成分片上传 */
  await completeMultipartUpload(file.name, uploadId, md5, parts);

  /** 返回uploadId作为文件ID（实际由后端返回） */
  return uploadId;
}

/**
 * 上传封面图（普通上传）
 * @param file 封面图文件
 * @returns 文件信息
 */
export async function uploadCoverImage(file: File): Promise<FileInfo> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await handleRequest({
    requestFn: () =>
      request.instance
        .post<ApiResponse<FileInfo>>("/files/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then((r) => r.data),
    mockData: {
      id: Date.now(),
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      filePath: URL.createObjectURL(file),
    },
    apiName: "uploadCoverImage",
  });

  return res.data as FileInfo;
}
```

### 3.4 类型定义

```typescript
/** 文件信息类型 */
export type FileInfo = {
  /** 文件ID */
  id: number;
  /** 文件名 */
  fileName: string;
  /** 文件大小 */
  fileSize: number;
  /** 文件类型 */
  fileType: string;
  /** 文件路径 */
  filePath: string;
  /** 文件URL */
  fileUrl?: string;
};

/** 分片上传初始化请求 */
export type MultipartInitRequest = {
  /** 文件名 */
  fileName: string;
  /** 文件类型 */
  contentType: string;
  /** 文件MD5 */
  md5: string;
};

/** 分片上传完成请求 */
export type MultipartCompleteRequest = {
  /** 文件名 */
  fileName: string;
  /** 上传ID */
  uploadId: string;
  /** 文件MD5 */
  md5: string;
  /** 分片信息列表 */
  parts: { partNumber: number; etag: string }[];
};
```

---

## 四、分类标签管理（新设计方案）

### 4.1 设计方案

**数据来源**：从 `sys_dict_type` 字典表中获取视频分类和标签

**缓存策略**：
1. 每次修改分类标签后，先存入数据库
2. 然后刷新 Redis 缓存
3. 前端查询时直接从 Redis 获取

**字典类型约定**：
- `video_category`：视频大类（如：技术、生活、职场）
- `video_tag`：视频标签（如：Java、美食、职场技巧）

### 4.2 后端新增接口

```java
// ===== 文件：DocVideoCategoryController.java =====
package com.zsk.document.controller;

/**
 * 视频分类标签 控制器
 *
 * @author wuhuaming
 * @date 2026-02-15
 * @version 1.0
 */
@Tag(name = "视频分类标签")
@RestController
@RequestMapping("/video/category")
@RequiredArgsConstructor
public class DocVideoCategoryController {

    private final ISysDictTypeService dictTypeService;
    private final IVideoCategoryCacheService cacheService;

    /** 分类字典类型 */
    private static final String DICT_TYPE_CATEGORY = "video_category";
    /** 标签字典类型 */
    private static final String DICT_TYPE_TAG = "video_tag";

    /**
     * 获取视频分类列表（从Redis缓存获取）
     *
     * @return 分类列表
     */
    @Operation(summary = "获取视频分类列表")
    @GetMapping("/list")
    public R<List<VideoCategoryVO>> getCategoryList() {
        return R.ok(cacheService.getCategoryListFromCache());
    }

    /**
     * 获取视频标签列表（从Redis缓存获取）
     *
     * @return 标签列表
     */
    @Operation(summary = "获取视频标签列表")
    @GetMapping("/tag/list")
    public R<List<VideoTagVO>> getTagList() {
        return R.ok(cacheService.getTagListFromCache());
    }

    /**
     * 新增视频分类
     *
     * @param dictData 字典数据
     * @return 是否成功
     */
    @Operation(summary = "新增视频分类")
    @PostMapping
    public R<Void> addCategory(@RequestBody SysDictData dictData) {
        dictData.setDictType(DICT_TYPE_CATEGORY);
        boolean success = dictTypeService.insertDictData(dictData);
        if (success) {
            cacheService.refreshCategoryCache();
        }
        return success ? R.ok() : R.fail();
    }

    /**
     * 修改视频分类
     *
     * @param dictData 字典数据
     * @return 是否成功
     */
    @Operation(summary = "修改视频分类")
    @PutMapping
    public R<Void> editCategory(@RequestBody SysDictData dictData) {
        dictData.setDictType(DICT_TYPE_CATEGORY);
        boolean success = dictTypeService.updateDictData(dictData);
        if (success) {
            cacheService.refreshCategoryCache();
        }
        return success ? R.ok() : R.fail();
    }

    /**
     * 删除视频分类
     *
     * @param ids 分类ID列表
     * @return 是否成功
     */
    @Operation(summary = "删除视频分类")
    @DeleteMapping("/{ids}")
    public R<Void> removeCategory(@PathVariable List<Long> ids) {
        boolean success = dictTypeService.deleteDictDataByIds(ids);
        if (success) {
            cacheService.refreshCategoryCache();
        }
        return success ? R.ok() : R.fail();
    }

    /**
     * 新增视频标签
     *
     * @param dictData 字典数据
     * @return 是否成功
     */
    @Operation(summary = "新增视频标签")
    @PostMapping("/tag")
    public R<Void> addTag(@RequestBody SysDictData dictData) {
        dictData.setDictType(DICT_TYPE_TAG);
        boolean success = dictTypeService.insertDictData(dictData);
        if (success) {
            cacheService.refreshTagCache();
        }
        return success ? R.ok() : R.fail();
    }

    /**
     * 修改视频标签
     *
     * @param dictData 字典数据
     * @return 是否成功
     */
    @Operation(summary = "修改视频标签")
    @PutMapping("/tag")
    public R<Void> editTag(@RequestBody SysDictData dictData) {
        dictData.setDictType(DICT_TYPE_TAG);
        boolean success = dictTypeService.updateDictData(dictData);
        if (success) {
            cacheService.refreshTagCache();
        }
        return success ? R.ok() : R.fail();
    }

    /**
     * 删除视频标签
     *
     * @param ids 标签ID列表
     * @return 是否成功
     */
    @Operation(summary = "删除视频标签")
    @DeleteMapping("/tag/{ids}")
    public R<Void> removeTag(@PathVariable List<Long> ids) {
        boolean success = dictTypeService.deleteDictDataByIds(ids);
        if (success) {
            cacheService.refreshTagCache();
        }
        return success ? R.ok() : R.fail();
    }
}
```

### 4.3 前端接口修改

```typescript
/**
 * 获取视频分类列表
 */
export async function fetchVideoCategories(): Promise<ApiResponse<VideoCategory[]>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<VideoCategory[]>>("/video/category/list")
        .then((r) => r.data),
    mockData: mockVideoCategories,
    apiName: "fetchVideoCategories",
  });
}

/**
 * 获取标签选项
 */
export async function fetchTagOptions(): Promise<ApiResponse<VideoTag[]>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<VideoTag[]>>("/video/category/tag/list")
        .then((r) => r.data),
    mockData: mockTagOptions,
    apiName: "fetchTagOptions",
  });
}
```

---

## 五、草稿管理（新设计方案）

### 5.1 设计方案

**方案：复用视频表**
- 在 `document_video_detail` 表中，`status = 3` 表示草稿状态
- 草稿和正式视频共用一张表，通过状态区分
- 优点：数据一致性好，查询简单

### 5.2 草稿接口设计

```java
// ===== 在 DocVideoDetailController 中新增草稿接口 =====

/**
 * 获取草稿列表
 *
 * @param pageQuery 分页参数
 * @return 草稿列表
 */
@Operation(summary = "获取草稿列表")
@GetMapping("/draft/list")
public R<PageResult<DocVideoDetail>> draftList(PageQuery pageQuery) {
    Page<DocVideoDetail> page = pageQuery.build();
    LambdaQueryWrapper<DocVideoDetail> lqw = new LambdaQueryWrapper<>();
    lqw.eq(DocVideoDetail::getStatus, 3); // 草稿状态
    lqw.orderByDesc(DocVideoDetail::getUpdateTime);
    return R.ok(PageResult.build(docVideoDetailService.page(page, lqw)));
}

/**
 * 保存草稿
 *
 * @param docVideoDetail 视频详情
 * @return 是否成功
 */
@Operation(summary = "保存草稿")
@PostMapping("/draft")
public R<Long> saveDraft(@RequestBody DocVideoDetail docVideoDetail) {
    docVideoDetail.setStatus(3); // 草稿状态
    docVideoDetail.setAuditStatus(0); // 待审核
    docVideoDetailService.saveOrUpdate(docVideoDetail);
    return R.ok(docVideoDetail.getId());
}

/**
 * 发布草稿
 *
 * @param id 草稿ID
 * @return 是否成功
 */
@Operation(summary = "发布草稿")
@PutMapping("/draft/publish/{id}")
public R<Void> publishDraft(@PathVariable Long id) {
    DocVideoDetail detail = new DocVideoDetail();
    detail.setId(id);
    detail.setStatus(1); // 已发布
    detail.setAuditStatus(0); // 待审核
    return docVideoDetailService.updateById(detail) ? R.ok() : R.fail();
}
```

---

## 六、审核管理（新设计方案）

### 6.1 设计方案

**新增审核详情表**：`document_video_audit`

**关联方式**：在 `document_video_detail` 表中新增 `audit_id` 字段，关联审核记录

### 6.2 数据库表设计

```sql
-- 视频审核详情表
CREATE TABLE `document_video_audit` (
  `id` BIGINT(20) NOT NULL COMMENT '主键ID（雪花算法）',
  `video_id` BIGINT(20) NOT NULL COMMENT '视频ID',
  `audit_type` VARCHAR(20) NOT NULL DEFAULT 'manual' COMMENT '审核类型（ai-AI审核 manual-人工审核）',
  `audit_status` INT(4) NOT NULL DEFAULT 0 COMMENT '审核状态（0-待审核 1-审核通过 2-审核驳回）',
  `audit_result` TEXT DEFAULT NULL COMMENT '审核结果详情（JSON格式）',
  `risk_level` VARCHAR(20) DEFAULT 'low' COMMENT '风险等级（low-低 medium-中 high-高）',
  `audit_mind` VARCHAR(500) DEFAULT NULL COMMENT '审核意见',
  `auditor_id` BIGINT(20) DEFAULT NULL COMMENT '审核人ID',
  `auditor_name` VARCHAR(50) DEFAULT NULL COMMENT '审核人姓名',
  `audit_time` DATETIME DEFAULT NULL COMMENT '审核时间',
  `deleted` TINYINT(1) DEFAULT 0 COMMENT '删除标记（0-未删除 1-已删除）',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `create_name` VARCHAR(50) DEFAULT NULL COMMENT '创建人',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `update_name` VARCHAR(50) DEFAULT NULL COMMENT '更新人',
  PRIMARY KEY (`id`),
  INDEX `idx_video_id` (`video_id`),
  INDEX `idx_audit_status` (`audit_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='视频审核详情表';

-- 为视频详情表新增审核关联字段
ALTER TABLE `document_video_detail`
ADD COLUMN `audit_id` BIGINT(20) DEFAULT NULL COMMENT '审核记录ID' AFTER `audit_mind`;
```

### 6.3 后端新增接口

```java
// ===== 文件：DocVideoAuditController.java =====
package com.zsk.document.controller;

/**
 * 视频审核 控制器
 *
 * @author wuhuaming
 * @date 2026-02-15
 * @version 1.0
 */
@Tag(name = "视频审核")
@RestController
@RequestMapping("/video/audit")
@RequiredArgsConstructor
public class DocVideoAuditController {

    private final IDocVideoAuditService auditService;

    /**
     * 获取审核队列
     */
    @Operation(summary = "获取审核队列")
    @GetMapping("/queue")
    public R<PageResult<VideoAuditVO>> getAuditQueue(
            @RequestParam(required = false) Integer auditStatus,
            PageQuery pageQuery) {
        return R.ok(auditService.getAuditQueue(auditStatus, pageQuery));
    }

    /**
     * 获取审核详情
     */
    @Operation(summary = "获取审核详情")
    @GetMapping("/detail/{videoId}")
    public R<VideoAuditDetailVO> getAuditDetail(@PathVariable Long videoId) {
        return R.ok(auditService.getAuditDetail(videoId));
    }

    /**
     * 提交审核结果
     */
    @Operation(summary = "提交审核结果")
    @PostMapping("/submit")
    public R<Void> submitAudit(@RequestBody @Valid AuditSubmitRequest request) {
        return auditService.submitAudit(request) ? R.ok() : R.fail();
    }

    /**
     * 批量提交审核结果
     */
    @Operation(summary = "批量提交审核结果")
    @PostMapping("/submitBatch")
    public R<Void> submitAuditBatch(@RequestBody @Valid AuditBatchSubmitRequest request) {
        return auditService.submitAuditBatch(request) ? R.ok() : R.fail();
    }

    /**
     * 获取审核日志
     */
    @Operation(summary = "获取审核日志")
    @GetMapping("/logs")
    public R<PageResult<VideoAuditLogVO>> getAuditLogs(PageQuery pageQuery) {
        return R.ok(auditService.getAuditLogs(pageQuery));
    }

    /**
     * 获取违规原因列表
     */
    @Operation(summary = "获取违规原因列表")
    @GetMapping("/violation-reasons")
    public R<List<ViolationReasonVO>> getViolationReasons() {
        return R.ok(auditService.getViolationReasons());
    }
}
```

---

## 七、评论管理接口映射

### 7.1 接口映射表

| 前端接口 | HTTP | 后端接口 | 对接方案 |
|---------|------|---------|---------|
| `GET /admin/content/video/{videoId}/comments` | GET | `GET /video/comment/list?videoId=xxx` | 前端修改路径+参数 |
| `DELETE /admin/content/video/comments/{id}` | DELETE | `DELETE /video/comment/{ids}` | 前端修改路径 |

---

## 八、后端需补全字段

### 8.1 数据库表字段补充

```sql
-- 为 document_video_detail 表新增字段
ALTER TABLE `document_video_detail` 
ADD COLUMN `video_title` VARCHAR(200) DEFAULT NULL COMMENT '视频标题' AFTER `file_id`,
ADD COLUMN `is_pinned` TINYINT(1) DEFAULT 0 COMMENT '是否置顶（0否 1是）' AFTER `status`,
ADD COLUMN `is_recommended` TINYINT(1) DEFAULT 0 COMMENT '是否推荐（0否 1是）' AFTER `is_pinned`,
ADD COLUMN `audit_id` BIGINT(20) DEFAULT NULL COMMENT '审核记录ID' AFTER `audit_mind`;

-- 新建审核详情表
CREATE TABLE `document_video_audit` (
  -- ... 见上文
);
```

**注意**：
- ~~`cover_url`~~ 不需要新增，通过 `fileId` 关联 `doc_files` 表获取
- ~~`video_url`~~ 不需要新增，通过 `fileId` 关联 `doc_files` 表获取

### 8.2 实体类补充

```java
// DocVideoDetail.java 新增字段

/** 视频标题 */
@Schema(description = "视频标题")
private String videoTitle;

/** 是否置顶（0否 1是） */
@Schema(description = "是否置顶（0否 1是）")
private Integer isPinned;

/** 是否推荐（0否 1是） */
@Schema(description = "是否推荐（0否 1是）")
private Integer isRecommended;

/** 审核记录ID */
@Schema(description = "审核记录ID")
private Long auditId;

// ===== 关联查询字段（非数据库字段） =====

/** 封面图URL（关联查询） */
@TableField(exist = false)
@Schema(description = "封面图URL")
private String coverUrl;

/** 视频播放地址（关联查询） */
@TableField(exist = false)
@Schema(description = "视频播放地址")
private String videoUrl;
```

---

## 九、对接检查清单

### 9.1 前端修改清单

**文件上传相关**：
- [ ] 新增 `calculateMD5` 函数
- [ ] 新增 `initMultipartUpload` 接口
- [ ] 新增 `uploadPart` 接口
- [ ] 新增 `completeMultipartUpload` 接口
- [ ] 新增 `uploadVideo` 完整流程函数
- [ ] 新增 `uploadCoverImage` 封面上传接口
- [ ] 调整分片上传逻辑，参考后端 test-upload.html

**视频管理相关**：
- [ ] 新增 `BackendVideoDetail` 类型定义
- [ ] 新增 `mapVideoToFrontend` 字段映射函数
- [ ] 修改 `fetchVideoList` 接口路径和字段映射
- [ ] 修改 `fetchVideoDetail` 接口路径和字段映射
- [ ] 修改 `updateVideo` 接口路径和字段映射
- [ ] 修改 `deleteVideo` 接口路径
- [ ] 修改 `batchDeleteVideos` 接口改用DELETE方法

**分类标签相关**：
- [ ] 修改 `fetchVideoCategories` 接口路径
- [ ] 修改 `fetchTagOptions` 接口路径

**草稿管理相关**：
- [ ] 修改 `fetchDraftList` 接口路径和字段映射
- [ ] 修改 `saveDraft` 接口路径和字段映射
- [ ] 修改 `deleteDraft` 接口路径

**审核管理相关**：
- [ ] 修改 `fetchReviewQueue` 接口路径和字段映射
- [ ] 修改 `submitReviewResult` 接口路径和字段映射
- [ ] 修改 `submitBatchReviewResult` 接口路径和字段映射
- [ ] 修改 `fetchReviewLogs` 接口路径和字段映射
- [ ] 修改 `fetchViolationReasons` 接口路径

**评论管理相关**：
- [ ] 修改 `fetchVideoComments` 接口路径和字段映射
- [ ] 修改 `deleteVideoComment` 接口路径

### 9.2 后端修改清单

**数据库修改**：
- [ ] `document_video_detail` 表新增字段（video_title, is_pinned, is_recommended, audit_id）
- [ ] 新建 `document_video_audit` 审核详情表

**实体类修改**：
- [ ] `DocVideoDetail` 新增字段 + 关联查询字段
- [ ] 新建 `DocVideoAudit` 实体类

**新增控制器**：
- [ ] `DocVideoCategoryController` 分类标签控制器
- [ ] `DocVideoAuditController` 审核管理控制器

**新增服务**：
- [ ] `IVideoCategoryCacheService` 分类标签缓存服务
- [ ] `IDocVideoAuditService` 审核管理服务

**新增接口**：
- [ ] 分类标签增删改查接口（6个）
- [ ] 草稿管理接口（3个）
- [ ] 审核管理接口（5个）
- [ ] 批量更新状态接口
- [ ] 置顶/推荐接口

---

## 十、注意事项

1. **接口路径**：前端所有接口需要移除 `/admin/content` 前缀，改为 `/video/xxx`
2. **分页参数**：后端使用 `pageNum/pageSize`，前端使用 `page/pageSize`
3. **状态值**：前端状态是字符串，后端是数字，需要转换
4. **封面图和视频URL**：通过 `fileId` 关联 `doc_files` 表获取，不在视频表新增字段
5. **分片上传**：参考后端 `test-upload.html`，使用 5MB 分片
6. **封面上传**：使用普通文件上传接口 `POST /files/upload`
7. **分类标签**：从字典表获取，使用Redis缓存提高性能
8. **草稿管理**：复用视频表，通过status=3区分草稿
9. **审核详情**：独立审核表，通过audit_id关联
10. **前端UI**：不能更改前端UI，只修改接口调用逻辑
