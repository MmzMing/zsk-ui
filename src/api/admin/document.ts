import { request, handleRequest } from "../axios";
import type { ApiResponse } from "../types";

// ===== 类型定义 =====

/**
 * 笔记类型
 * @description 对应后端 note 表的实体结构
 */
export type DocNote = {
  /** 主键ID */
  id?: number;
  /** 用户ID */
  userId?: number;
  /** 笔记名称 */
  noteName?: string;
  /** 笔记标题（别名） */
  title?: string;
  /** 笔记标签 */
  noteTags?: string;
  /** 标签列表（数组形式） */
  tags?: string[];
  /** 文档内容 */
  content?: string;
  /** 笔记简介/描述 */
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
  /** 审核状态（0-待审核 1-通过 2-拒绝） */
  auditStatus?: number;
  /** 笔记状态（1-正常 2-下线 3-草稿） */
  status?: number;
  /** 发布时间 */
  publishTime?: string;
  /** 浏览量 */
  viewCount?: number;
  /** 阅读量（别名） */
  readCount?: number;
  /** 点赞量 */
  likeCount?: number;
  /** 评论量 */
  commentCount?: number;
  /** 封面图 */
  cover?: string;
  /** 是否置顶（0-否 1-是） */
  isPinned?: number;
  /** 是否置顶（布尔别名） */
  pinned?: boolean;
  /** 是否推荐（0-否 1-是） */
  isRecommended?: number;
  /** 是否推荐（布尔别名） */
  recommended?: boolean;
  /** SEO标题 */
  seoTitle?: string;
  /** SEO描述 */
  seoDescription?: string;
  /** SEO关键词 */
  seoKeywords?: string;
  /** SEO信息对象 */
  seo?: { title: string; description: string; keywords: string[] };
  /** 分类名称（前端展示用） */
  category?: string;
  /** 创建时间 */
  createTime?: string;
  /** 更新时间 */
  updateTime?: string;
  /** 更新时间（别名） */
  updatedAt?: string;
};

/**
 * 分页结果类型
 */
export type PageResult<T> = {
  rows: T[];
  total: number;
};

/**
 * 文档分类项
 */
export type DocCategory = {
  id: string;
  name: string;
  children?: DocCategory[];
};

/**
 * 文档标签项
 */
export type DocTag = {
  label: string;
  value: string;
};

/**
 * 文档评论项
 */
export type DocCommentItem = {
  id: string;
  docId: string;
  username: string;
  avatar?: string;
  content: string;
  createdAt: string;
};

/**
 * 文档审核项
 */
export type DocumentReviewItem = {
  id: string;
  title: string;
  uploader: string;
  category: string;
  status: "pending" | "approved" | "rejected";
  riskLevel: "low" | "medium" | "high";
  isAiChecked: boolean;
  createdAt: string;
};

/**
 * 文档审核日志项
 */
export type DocumentReviewLogItem = {
  id: string;
  docId: string;
  title: string;
  reviewer: string;
  reviewedAt: string;
  result: "approved" | "rejected";
  remark: string;
};

/**
 * 文档上传初始化请求
 */
export type DocumentUploadInitRequest = {
  title: string;
  fileName: string;
  fileSize: number;
  fileMd5: string;
  category: string;
  tags: string[];
  description?: string;
  isPublic: boolean;
  price?: number;
};

/**
 * 文档上传初始化响应
 */
export type DocumentUploadInitResponse = {
  uploadId: string;
  needUpload: boolean;
  presignedUrl?: string;
};

/**
 * 文档上传完成请求
 */
export type DocumentUploadFinishRequest = {
  uploadId: string;
  status: "success" | "error";
  errorMsg?: string;
};

/**
 * 文档上传任务项
 */
export type DocumentUploadTaskItem = {
  id: string;
  title: string;
  fileName: string;
  size: number;
  status: "waiting" | "uploading" | "processing" | "success" | "error";
  progress: number;
  createdAt: string;
};

// ===== API 函数 =====

/**
 * 获取文档列表
 */
export async function fetchDocumentList(params: {
  page: number;
  pageSize: number;
  status?: string;
  category?: string;
  keyword?: string;
}): Promise<ApiResponse<PageResult<DocNote>>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<PageResult<DocNote>>>("/note/page", { params })
        .then((r) => r.data),
    apiName: "fetchDocumentList",
  });
}

/**
 * 获取文档详情
 */
export async function getDocumentDetail(id: string): Promise<ApiResponse<DocNote>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<DocNote>>(`/note/${id}`)
        .then((r) => r.data),
    apiName: "getDocumentDetail",
  });
}

/**
 * 创建文档
 */
export async function createDocument(data: Partial<DocNote>): Promise<ApiResponse<string>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .post<ApiResponse<string>>("/note", data)
        .then((r) => r.data),
    apiName: "createDocument",
  });
}

/**
 * 更新文档
 */
export async function updateDocument(id: string, data: Partial<DocNote>): Promise<ApiResponse<boolean>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .put<ApiResponse<boolean>>("/note", { ...data, id: Number(id) })
        .then((r) => r.data),
    apiName: "updateDocument",
  });
}

/**
 * 删除文档
 */
export async function deleteDocument(ids: string[]): Promise<ApiResponse<boolean>> {
  const idsStr = ids.join(",");
  return handleRequest({
    requestFn: () =>
      request.instance
        .delete<ApiResponse<boolean>>(`/note/${idsStr}`)
        .then((r) => r.data),
    apiName: "deleteDocument",
  });
}

/**
 * 获取草稿列表
 */
export async function fetchDraftList(params: {
  page: number;
  pageSize: number;
  search?: string;
}): Promise<ApiResponse<PageResult<DocNote>>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<PageResult<DocNote>>>("/note/draft/list", { params })
        .then((r) => r.data),
    apiName: "fetchDraftList",
  });
}

/**
 * 批量更新文档状态
 */
export async function batchUpdateDocumentStatus(data: {
  ids: string[];
  status: number;
  auditStatus?: number;
}): Promise<ApiResponse<boolean>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .put<ApiResponse<boolean>>("/note/status/batch", {
          ids: data.ids.map(Number),
          status: data.status,
          auditStatus: data.auditStatus,
        })
        .then((r) => r.data),
    apiName: "batchUpdateDocumentStatus",
  });
}

/**
 * 批量迁移文档分类
 */
export async function moveDocumentCategory(ids: string[], category: string): Promise<ApiResponse<boolean>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .put<ApiResponse<boolean>>("/note/category/batch", {
          ids: ids.map(Number),
          category,
        })
        .then((r) => r.data),
    apiName: "moveDocumentCategory",
  });
}

/**
 * 获取文档分类列表
 */
export async function fetchDocumentCategories(): Promise<ApiResponse<DocCategory[]>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<DocCategory[]>>("/note/category/list")
        .then((r) => r.data),
    apiName: "fetchDocumentCategories",
  });
}

/**
 * 获取文档标签选项
 */
export async function fetchTagOptions(): Promise<ApiResponse<DocTag[]>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<DocTag[]>>("/note/tag/list")
        .then((r) => r.data),
    apiName: "fetchTagOptions",
  });
}

/**
 * 获取文档评论列表
 */
export async function fetchDocumentComments(docId: string): Promise<ApiResponse<DocCommentItem[]>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<DocCommentItem[]>>(`/note/comment/list?docId=${docId}`)
        .then((r) => r.data),
    apiName: "fetchDocumentComments",
  });
}

/**
 * 删除文档评论
 */
export async function deleteDocumentComment(commentId: string): Promise<ApiResponse<boolean>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .delete<ApiResponse<boolean>>(`/note/comment/${commentId}`)
        .then((r) => r.data),
    apiName: "deleteDocumentComment",
  });
}

/**
 * 获取文档审核队列
 */
export async function fetchDocumentReviewQueue(params: {
  page: number;
  pageSize: number;
  status?: string;
  keyword?: string;
}): Promise<ApiResponse<PageResult<DocumentReviewItem>>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<PageResult<DocumentReviewItem>>>("/note/review/queue", { params })
        .then((r) => r.data),
    apiName: "fetchDocumentReviewQueue",
  });
}

/**
 * 获取文档审核日志
 */
export async function fetchDocumentReviewLogs(params: { docIds?: string[] }): Promise<ApiResponse<DocumentReviewLogItem[]>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<DocumentReviewLogItem[]>>("/note/review/logs", { params })
        .then((r) => r.data),
    apiName: "fetchDocumentReviewLogs",
  });
}

/**
 * 提交文档审核结果
 */
export async function submitDocumentReview(data: {
  reviewId: string;
  auditStatus: number;
  auditMind?: string;
}): Promise<ApiResponse<boolean>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .post<ApiResponse<boolean>>("/note/review/submit", {
          id: data.reviewId,
          auditStatus: data.auditStatus,
          auditMind: data.auditMind,
        })
        .then((r) => r.data),
    apiName: "submitDocumentReview",
  });
}

/**
 * 初始化文档上传
 */
export async function initDocumentUpload(data: DocumentUploadInitRequest): Promise<ApiResponse<DocumentUploadInitResponse>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .post<ApiResponse<DocumentUploadInitResponse>>("/files/multipart/init", {
          fileName: data.fileName,
          fileSize: data.fileSize,
          fileMd5: data.fileMd5,
        })
        .then((r) => r.data),
    apiName: "initDocumentUpload",
  });
}

/**
 * 完成文档上传
 */
export async function finishDocumentUpload(data: DocumentUploadFinishRequest): Promise<ApiResponse<boolean>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .post<ApiResponse<boolean>>("/files/multipart/complete", { uploadId: data.uploadId })
        .then((r) => r.data),
    apiName: "finishDocumentUpload",
  });
}

/**
 * 获取文档上传任务列表
 */
export async function fetchDocumentUploadTaskList(params: {
  page: number;
  pageSize: number;
  status?: string;
}): Promise<ApiResponse<DocumentUploadTaskItem[]>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<DocumentUploadTaskItem[]>>("/note/upload/task/list", { params })
        .then((r) => r.data),
    apiName: "fetchDocumentUploadTaskList",
  });
}

/**
 * 移除文档上传任务
 */
export async function removeDocumentUploadTask(id: string): Promise<ApiResponse<boolean>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .delete<ApiResponse<boolean>>(`/note/upload/task/${id}`)
        .then((r) => r.data),
    apiName: "removeDocumentUploadTask",
  });
}

/**
 * 批量移除文档上传任务
 */
export async function batchRemoveDocumentUploadTasks(ids: string[]): Promise<ApiResponse<boolean>> {
  const idsStr = ids.join(",");
  return handleRequest({
    requestFn: () =>
      request.instance
        .delete<ApiResponse<boolean>>(`/note/upload/task/${idsStr}`)
        .then((r) => r.data),
    apiName: "batchRemoveDocumentUploadTasks",
  });
}

/**
 * 重试文档上传任务
 */
export async function retryDocumentUploadTask(id: string): Promise<ApiResponse<boolean>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .post<ApiResponse<boolean>>(`/note/upload/task/${id}/retry`)
        .then((r) => r.data),
    apiName: "retryDocumentUploadTask",
  });
}
