# document.ts（文档管理）前后端接口对接文档

> 文档创建时间：2026-02-15  
> 对接策略：使用现有 `DocNote` 实体，后端补充缺失接口和字段

---

## 一、模块总览

| 子模块 | 前端接口数 | 后端状态 | 对接方案 |
|-------|----------|---------|---------|
| 文档上传 | 6个 | ⚠️ 部分缺失 | 后端补充上传任务管理 |
| 文档分类标签 | 2个 | ⚠️ 部分缺失 | 后端补充分类标签接口 |
| 文档管理 | 10个 | ⚠️ 部分缺失 | 使用 DocNote，补充缺失接口 |
| 文档审核 | 3个 | ⚠️ 部分缺失 | 后端补充审核接口 |

---

## 二、现有后端接口

### DocNoteController（笔记管理）

| 接口 | HTTP | 说明 |
|------|------|------|
| `GET /note/list` | GET | 查询笔记列表 |
| `GET /note/page` | GET | 分页查询笔记列表 |
| `GET /note/{id}` | GET | 获取笔记详情 |
| `POST /note` | POST | 新增笔记 |
| `PUT /note` | PUT | 修改笔记 |
| `DELETE /note/{ids}` | DELETE | 删除笔记 |

### DocFilesController（文件管理）

| 接口 | HTTP | 说明 |
|------|------|------|
| `GET /files/page` | GET | 分页查询文件列表 |
| `POST /files/upload` | POST | 上传文件 |
| `DELETE /files/{ids}` | DELETE | 删除文件 |
| `POST /files/multipart/init` | POST | 初始化分片上传 |
| `POST /files/multipart/upload` | POST | 上传分片 |
| `POST /files/multipart/complete` | POST | 完成分片上传 |

---

## 三、字段映射表

### 3.1 DocNote 实体与前端字段映射

| 前端字段 | 后端字段 | 类型 | 说明 |
|---------|---------|------|------|
| id | id | Long | 主键ID |
| title | noteName | String | **需映射**：文档标题 |
| category | broadCode | String | **需映射**：分类 |
| description | description | String | 描述 |
| status | status | Integer/String | **需映射**：状态值转换 |
| readCount | viewCount | Long | **需映射**：阅读量 |
| likeCount | likeCount | Long | 点赞量 |
| commentCount | - | Long | **需新增字段**：评论量 |
| createdAt | createTime | DateTime | 创建时间 |
| updatedAt | updateTime | DateTime | 更新时间 |
| cover | - | String | **需新增字段**：封面图 |
| tags | noteTags | String | **需映射**：标签 |
| pinned | - | Boolean | **需新增字段**：是否置顶 |
| recommended | - | Boolean | **需新增字段**：是否推荐 |
| content | - | String | **需新增字段**：文档内容 |
| seo.title | - | String | **需新增字段**：SEO标题 |
| seo.description | - | String | **需新增字段**：SEO描述 |
| seo.keywords | - | String | **需新增字段**：SEO关键词 |

### 3.2 状态值映射

| 前端status | 后端status | 后端auditStatus | 说明 |
|------------|-------------|-----------------|------|
| "draft" | 3 | - | 草稿 |
| "pending" | 1 | 0 | 待审核 |
| "approved" | 1 | 1 | 审核通过 |
| "rejected" | 1 | 2 | 审核驳回 |
| "offline" | 2 | - | 下架 |
| "published" | 1 | 1 | 已发布 |

---

## 四、接口映射表

### 4.1 文档管理接口

| 前端接口 | HTTP | 后端接口 | 对接方案 |
|---------|------|---------|---------|
| `GET /admin/content/doc/list` | GET | `GET /note/page` | 前端修改路径 |
| `GET /admin/content/doc/{id}` | GET | `GET /note/{id}` | 前端修改路径 |
| `POST /admin/content/doc/create` | POST | `POST /note` | 前端修改路径 |
| `PUT /admin/content/doc/{id}` | PUT | `PUT /note` | 前端修改路径 |
| `DELETE /admin/content/doc/batch` | DELETE | `DELETE /note/{ids}` | 前端修改路径 |
| `GET /admin/content/doc/drafts` | GET | ❌ 缺失 | **后端新增**：草稿列表 |
| `POST /admin/content/doc/batch-update-status` | POST | ❌ 缺失 | **后端新增**：批量更新状态 |
| `POST /admin/content/doc/category/batch` | POST | ❌ 缺失 | **后端新增**：批量迁移分类 |

### 4.2 文档评论接口

| 前端接口 | HTTP | 后端接口 | 对接方案 |
|---------|------|---------|---------|
| `GET /admin/content/doc/{docId}/comments` | GET | `GET /note/comment/list` | 前端修改路径 |
| `DELETE /admin/content/doc/comments/{commentId}` | DELETE | `DELETE /note/comment/{id}` | 前端修改路径 |

### 4.3 文档分类标签接口

| 前端接口 | HTTP | 后端接口 | 对接方案 |
|---------|------|---------|---------|
| `GET /admin/content/doc/categories` | GET | ❌ 缺失 | **后端新增**：分类列表 |
| `GET /admin/content/doc/tags` | GET | ❌ 缺失 | **后端新增**：标签列表 |

### 4.4 文档审核接口

| 前端接口 | HTTP | 后端接口 | 对接方案 |
|---------|------|---------|---------|
| `GET /admin/content/doc/review/queue` | GET | ❌ 缺失 | **后端新增**：审核队列 |
| `GET /admin/content/doc/review/logs` | GET | ❌ 缺失 | **后端新增**：审核日志 |
| `POST /admin/content/doc/review/submit` | POST | ❌ 缺失 | **后端新增**：提交审核 |

### 4.5 文档上传接口

| 前端接口 | HTTP | 后端接口 | 对接方案 |
|---------|------|---------|---------|
| `POST /admin/content/doc/upload/init` | POST | `POST /files/multipart/init` | 前端修改路径 |
| `POST /admin/content/doc/upload/finish` | POST | `POST /files/multipart/complete` | 前端修改路径 |
| `GET /admin/content/doc/upload/list` | GET | ❌ 缺失 | **后端新增**：上传任务列表 |
| `POST /admin/content/doc/upload/remove` | POST | ❌ 缺失 | **后端新增**：移除上传任务 |
| `POST /admin/content/doc/upload/batch-remove` | POST | ❌ 缺失 | **后端新增**：批量移除 |
| `POST /admin/content/doc/upload/retry` | POST | ❌ 缺失 | **后端新增**：重试上传 |

---

## 五、后端修改清单

### 5.1 DocNote 实体新增字段

```java
/** 文档内容 */
@Schema(description = "文档内容")
@TableField(typeHandler = com.baomidou.mybatisplus.extension.handlers.JacksonTypeHandler.class)
private String content;

/** 封面图 */
@Schema(description = "封面图")
private String cover;

/** 评论量 */
@Schema(description = "评论量")
private Long commentCount;

/** 是否置顶 */
@Schema(description = "是否置顶（0否 1是）")
private Integer isPinned;

/** 是否推荐 */
@Schema(description = "是否推荐（0否 1是）")
private Integer isRecommended;

/** SEO标题 */
@Schema(description = "SEO标题")
private String seoTitle;

/** SEO描述 */
@Schema(description = "SEO描述")
private String seoDescription;

/** SEO关键词 */
@Schema(description = "SEO关键词")
private String seoKeywords;
```

### 5.2 DocNoteController 新增接口

```java
/**
 * 获取草稿列表
 */
@Operation(summary = "获取草稿列表")
@GetMapping("/draft/list")
public R<PageResult<DocNote>> draftList(PageQuery pageQuery) {
    // status = 3 表示草稿
}

/**
 * 批量更新状态
 */
@Operation(summary = "批量更新状态")
@PutMapping("/status/batch")
public R<Void> batchUpdateStatus(@RequestBody Map<String, Object> body) {
    List<Long> ids = (List<Long>) body.get("ids");
    Integer status = (Integer) body.get("status");
}

/**
 * 批量迁移分类
 */
@Operation(summary = "批量迁移分类")
@PutMapping("/category/batch")
public R<Void> batchMoveCategory(@RequestBody Map<String, Object> body) {
    List<Long> ids = (List<Long>) body.get("ids");
    String category = (String) body.get("category");
}

/**
 * 切换置顶状态
 */
@Operation(summary = "切换置顶状态")
@PutMapping("/{id}/pinned")
public R<Void> togglePinned(@PathVariable Long id) {
}

/**
 * 切换推荐状态
 */
@Operation(summary = "切换推荐状态")
@PutMapping("/{id}/recommended")
public R<Void> toggleRecommended(@PathVariable Long id) {
}
```

### 5.3 新建 DocNoteCategoryController

```java
@Tag(name = "文档分类")
@RestController
@RequestMapping("/note")
@RequiredArgsConstructor
public class DocNoteCategoryController {
    /**
     * 获取分类列表
     */
    @Operation(summary = "获取分类列表")
    @GetMapping("/category/list")
    public R<List<DocCategoryVO>> getCategoryList() {
        // 从字典表获取 document_category
    }

    /**
     * 获取标签列表
     */
    @Operation(summary = "获取标签列表")
    @GetMapping("/tag/list")
    public R<List<DocTagVO>> getTagList() {
        // 从字典表获取 document_tag
    }
}
```

### 5.4 新建 DocNoteReviewController

```java
@Tag(name = "文档审核")
@RestController
@RequestMapping("/note/review")
@RequiredArgsConstructor
public class DocNoteReviewController {
    /**
     * 获取审核队列
     */
    @Operation(summary = "获取审核队列")
    @GetMapping("/queue")
    public R<PageResult<DocNoteReviewVO>> getReviewQueue(PageQuery pageQuery) {
    }

    /**
     * 获取审核日志
     */
    @Operation(summary = "获取审核日志")
    @GetMapping("/logs")
    public R<List<DocNoteAuditLogVO>> getReviewLogs(@RequestParam List<Long> docIds) {
    }

    /**
     * 提交审核结果
     */
    @Operation(summary = "提交审核结果")
    @PostMapping("/submit")
    public R<Void> submitReview(@RequestBody DocNoteReviewRequest request) {
    }
}
```

### 5.5 新建 DocNoteUploadController

```java
@Tag(name = "文档上传")
@RestController
@RequestMapping("/note/upload")
@RequiredArgsConstructor
public class DocNoteUploadController {
    /**
     * 获取上传任务列表
     */
    @Operation(summary = "获取上传任务列表")
    @GetMapping("/task/list")
    public R<PageResult<DocUploadTaskVO>> getTaskList(PageQuery pageQuery) {
    }

    /**
     * 删除上传任务
     */
    @Operation(summary = "删除上传任务")
    @DeleteMapping("/task/{ids}")
    public R<Void> removeTask(@PathVariable List<Long> ids) {
    }

    /**
     * 重试上传任务
     */
    @Operation(summary = "重试上传任务")
    @PostMapping("/task/{id}/retry")
    public R<Void> retryTask(@PathVariable Long id) {
    }
}
```

---

## 六、前端修改清单

### 6.1 类型定义

```typescript
/** 后端笔记类型 */
export type DocNote = {
  /** 主键ID */
  id?: number;
  /** 用户ID */
  userId?: number;
  /** 笔记名称 */
  noteName?: string;
  /** 笔记标签 */
  noteTags?: string;
  /** 笔记简介 */
  description?: string;
  /** 大类 */
  broadCode?: string;
  /** 小类 */
  narrowCode?: string;
  /** 笔记等级 */
  noteGrade?: number;
  /** 笔记模式 */
  noteMode?: number;
  /** 适合人群 */
  suitableUsers?: string;
  /** 审核状态 */
  auditStatus?: number;
  /** 笔记状态 */
  status?: number;
  /** 发布时间 */
  publishTime?: string;
  /** 浏览量 */
  viewCount?: number;
  /** 点赞量 */
  likeCount?: number;
  /** 评论量 */
  commentCount?: number;
  /** 封面图 */
  cover?: string;
  /** 是否置顶 */
  isPinned?: number;
  /** 是否推荐 */
  isRecommended?: number;
  /** 文档内容 */
  content?: string;
  /** SEO标题 */
  seoTitle?: string;
  /** SEO描述 */
  seoDescription?: string;
  /** SEO关键词 */
  seoKeywords?: string;
  /** 创建时间 */
  createTime?: string;
  /** 更新时间 */
  updateTime?: string;
};
```

### 6.2 字段映射函数

```typescript
/** 状态映射：后端转前端 */
function mapStatusToFrontend(status: number, auditStatus: number): DocumentStatus {
  if (status === 3) return "draft";
  if (status === 2) return "offline";
  if (auditStatus === 0) return "pending";
  if (auditStatus === 1) return "approved";
  if (auditStatus === 2) return "rejected";
  return "draft";
}

/** 状态映射：前端转后端 */
function mapStatusToBackend(status: DocumentStatus): { status: number; auditStatus: number } {
  switch (status) {
    case "draft": return { status: 3, auditStatus: 0 };
    case "pending": return { status: 1, auditStatus: 0 };
    case "approved": return { status: 1, auditStatus: 1 };
    case "rejected": return { status: 1, auditStatus: 2 };
    case "offline": return { status: 2, auditStatus: 0 };
    case "published": return { status: 1, auditStatus: 1 };
    default: return { status: 3, auditStatus: 0 };
  }
}

/** 笔记后端转前端 */
function mapNoteToFrontend(note: DocNote): DocumentItem {
  return {
    id: String(note.id || ""),
    title: note.noteName || "",
    category: note.broadCode || "",
    description: note.description || "",
    status: mapStatusToFrontend(note.status || 3, note.auditStatus || 0),
    readCount: note.viewCount || 0,
    likeCount: note.likeCount || 0,
    commentCount: note.commentCount || 0,
    createdAt: note.createTime || "",
    updatedAt: note.updateTime || "",
    cover: note.cover,
    tags: note.noteTags?.split(",") || [],
    pinned: note.isPinned === 1,
    recommended: note.isRecommended === 1,
  };
}

/** 笔记前端转后端 */
function mapNoteToBackend(doc: Partial<DocumentItem | DocumentDetail>): Partial<DocNote> {
  const statusMap = mapStatusToBackend(doc.status || "draft");
  return {
    id: doc.id ? Number(doc.id) : undefined,
    noteName: doc.title,
    broadCode: doc.category,
    description: doc.description,
    status: statusMap.status,
    noteTags: Array.isArray(doc.tags) ? doc.tags.join(",") : doc.tags,
    cover: doc.cover,
    isPinned: doc.pinned ? 1 : 0,
    isRecommended: doc.recommended ? 1 : 0,
    content: (doc as DocumentDetail).content,
  };
}
```

### 6.3 接口路径修改

| 前端函数 | 原路径 | 新路径 |
|---------|--------|--------|
| `fetchDocumentList` | `GET /admin/content/doc/list` | `GET /note/page` |
| `getDocumentDetail` | `GET /admin/content/doc/{id}` | `GET /note/{id}` |
| `createDocument` | `POST /admin/content/doc/create` | `POST /note` |
| `updateDocument` | `PUT /admin/content/doc/{id}` | `PUT /note` |
| `deleteDocument` | `DELETE /admin/content/doc/batch` | `DELETE /note/{ids}` |
| `fetchDraftList` | `GET /admin/content/doc/drafts` | `GET /note/draft/list` |
| `batchUpdateDocumentStatus` | `POST /admin/content/doc/batch-update-status` | `PUT /note/status/batch` |
| `moveDocumentCategory` | `POST /admin/content/doc/category/batch` | `PUT /note/category/batch` |
| `fetchDocumentCategories` | `GET /admin/content/doc/categories` | `GET /note/category/list` |
| `fetchTagOptions` | `GET /admin/content/doc/tags` | `GET /note/tag/list` |
| `fetchDocumentComments` | `GET /admin/content/doc/{docId}/comments` | `GET /note/comment/list` |
| `deleteDocumentComment` | `DELETE /admin/content/doc/comments/{commentId}` | `DELETE /note/comment/{id}` |
| `fetchDocumentReviewQueue` | `GET /admin/content/doc/review/queue` | `GET /note/review/queue` |
| `fetchDocumentReviewLogs` | `GET /admin/content/doc/review/logs` | `GET /note/review/logs` |
| `submitDocumentReview` | `POST /admin/content/doc/review/submit` | `POST /note/review/submit` |
| `initDocumentUpload` | `POST /admin/content/doc/upload/init` | `POST /files/multipart/init` |
| `finishDocumentUpload` | `POST /admin/content/doc/upload/finish` | `POST /files/multipart/complete` |
| `fetchDocumentUploadTaskList` | `GET /admin/content/doc/upload/list` | `GET /note/upload/task/list` |
| `removeDocumentUploadTask` | `POST /admin/content/doc/upload/remove` | `DELETE /note/upload/task/{id}` |
| `batchRemoveDocumentUploadTasks` | `POST /admin/content/doc/upload/batch-remove` | `DELETE /note/upload/task/{ids}` |
| `retryDocumentUploadTask` | `POST /admin/content/doc/upload/retry` | `POST /note/upload/task/{id}/retry` |

---

## 七、数据库修改

### 7.1 document_note 表新增字段

```sql
ALTER TABLE `document_note` 
ADD COLUMN `content` LONGTEXT DEFAULT NULL COMMENT '文档内容' AFTER `note_tags`,
ADD COLUMN `cover` VARCHAR(500) DEFAULT NULL COMMENT '封面图' AFTER `publish_time`,
ADD COLUMN `comment_count` BIGINT(20) DEFAULT 0 COMMENT '评论量' AFTER `like_count`,
ADD COLUMN `is_pinned` TINYINT(1) DEFAULT 0 COMMENT '是否置顶（0否 1是）' AFTER `comment_count`,
ADD COLUMN `is_recommended` TINYINT(1) DEFAULT 0 COMMENT '是否推荐（0否 1是）' AFTER `is_pinned`,
ADD COLUMN `seo_title` VARCHAR(200) DEFAULT NULL COMMENT 'SEO标题' AFTER `is_recommended`,
ADD COLUMN `seo_description` VARCHAR(500) DEFAULT NULL COMMENT 'SEO描述' AFTER `seo_title`,
ADD COLUMN `seo_keywords` VARCHAR(200) DEFAULT NULL COMMENT 'SEO关键词' AFTER `seo_description`;
```

### 7.2 新增字典类型

```sql
INSERT INTO `sys_dict_type` (`id`, `dict_name`, `dict_type`, `status`, `create_name`, `create_time`) VALUES
(1010, '文档分类', 'document_category', 0, 'admin', NOW()),
(1011, '文档标签', 'document_tag', 0, 'admin', NOW());
```

---

## 八、对接检查清单

### 8.1 后端修改清单

- [ ] DocNote 实体新增字段（content、cover、commentCount、isPinned、isRecommended、seoTitle、seoDescription、seoKeywords）
- [ ] DocNoteController 新增接口（草稿列表、批量更新状态、批量迁移分类、置顶、推荐）
- [ ] 新建 DocNoteCategoryController（分类列表、标签列表）
- [ ] 新建 DocNoteReviewController（审核队列、审核日志、提交审核）
- [ ] 新建 DocNoteUploadController（上传任务列表、删除任务、重试任务）
- [ ] 数据库表新增字段
- [ ] 新增字典数据

### 8.2 前端修改清单

- [ ] 新增 DocNote 后端类型定义
- [ ] 新增字段映射函数
- [ ] 修改所有接口路径
- [ ] 修改部分 HTTP 方法

---

## 九、注意事项

1. **接口路径**：前端接口改为 `/note` 开头
2. **字段映射**：前端 `title` → 后端 `noteName`，前端 `readCount` → 后端 `viewCount`
3. **状态值**：需要双重判断 `status` 和 `auditStatus`
4. **标签格式**：后端存储为逗号分隔字符串，前端为数组
5. **分类标签**：从字典表获取，字典类型为 `document_category` 和 `document_tag`
