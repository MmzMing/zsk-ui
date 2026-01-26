// ===== 1. 依赖导入区域 =====
import { request, handleRequestWithMock } from "../axios";
import type { ApiResponse } from "../types";
import {
  mockDocumentUploadTasks,
  mockDocumentCategories,
  mockTagOptions,
  mockDraftList,
  mockDocumentList,
  mockReviewQueueItems,
  mockAdminDocument,
  mockDocumentReviewLogs,
} from "../mock/admin/document";

// ===== 2. TODO待处理导入区域 =====

// ===== 3. 状态控制逻辑区域 =====

// ===== 4. 通用工具函数区域 =====

// ===== 5. 注释代码函数区 =====

// ===== 6. 错误处理函数区域 =====

// ===== 7. 数据处理函数区域 =====

// ===== 8. UI渲染逻辑区域 =====

// ===== 9. 页面初始化与事件绑定 =====

// ===== 10. TODO任务管理区域 =====

// ===== 11. 导出区域 =====

// --- 类型定义 ---

/** 
 * 文档上传初始化请求参数 
 */
export type DocumentUploadInitRequest = {
  /** 文档标题 */
  title: string;
  /** 文件名 */
  fileName: string;
  /** 文件大小 */
  fileSize: number;
  /** 文件 MD5 */
  fileMd5: string;
  /** 分类 ID */
  category: string;
  /** 标签列表 */
  tags: string[];
  /** 文档描述 */
  description?: string;
  /** 是否公开 */
  isPublic: boolean;
  /** 价格 */
  price?: number;
};

/** 
 * 文档上传初始化响应数据 
 */
export type DocumentUploadInitResponse = {
  /** 上传 ID */
  uploadId: string;
  /** 是否需要上传（秒传） */
  needUpload: boolean;
  /** 预签名上传地址 */
  presignedUrl?: string;
};

/** 
 * 文档上传完成请求参数 
 */
export type DocumentUploadFinishRequest = {
  /** 上传 ID */
  uploadId: string;
  /** 状态 */
  status: "success" | "error";
  /** 错误信息 */
  errorMsg?: string;
};

/** 
 * 文档上传任务项 
 */
export type DocumentUploadTaskItem = {
  /** 任务 ID */
  id: string;
  /** 文档标题 */
  title: string;
  /** 文件名 */
  fileName: string;
  /** 文件大小 */
  size: number;
  /** 状态 */
  status: "waiting" | "uploading" | "processing" | "success" | "error";
  /** 进度 (0-100) */
  progress: number;
  /** 创建时间 */
  createdAt: string;
};

/** 
 * 文档上传任务列表响应数据 
 */
export type DocumentUploadTaskListResponse = {
  /** 任务列表 */
  list: DocumentUploadTaskItem[];
  /** 总条数 */
  total: number;
};

/** 
 * 文档状态类型 
 */
export type DocumentStatus =
  | "draft"
  | "pending"
  | "approved"
  | "rejected"
  | "offline"
  | "scheduled"
  | "published";

/** 
 * 文档列表项 
 */
export type DocumentItem = {
  /** 文档 ID */
  id: string;
  /** 标题 */
  title: string;
  /** 分类 */
  category: string;
  /** 描述 */
  description?: string;
  /** 状态 */
  status: DocumentStatus;
  /** 阅读量 */
  readCount: number;
  /** 点赞量 */
  likeCount: number;
  /** 评论量 */
  commentCount: number;
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
  /** 封面图 */
  cover?: string;
  /** 标签列表 */
  tags?: string[];
  /** 是否置顶 */
  pinned?: boolean;
  /** 是否推荐 */
  recommended?: boolean;
};

/** 
 * 文档分类项 
 */
export type DocCategory = {
  /** 分类 ID */
  id: string;
  /** 分类名称 */
  name: string;
  /** 子分类 */
  children?: DocCategory[];
};

/** 
 * 文档标签项 
 */
export type DocTag = {
  /** 标签显示文本 */
  label: string;
  /** 标签值 */
  value: string;
};

/** 
 * 文档列表响应数据 
 */
export type DocumentListResponse = {
  /** 文档列表 */
  list: DocumentItem[];
  /** 总条数 */
  total: number;
};

/** 
 * 审核状态类型 
 */
export type ReviewStatus = "pending" | "approved" | "rejected";

/** 
 * 风险等级类型 
 */
export type RiskLevel = "low" | "medium" | "high";

/** 
 * 文档审核项 
 */
export type DocumentReviewItem = {
  /** 审核 ID */
  id: string;
  /** 文档标题 */
  title: string;
  /** 上传者 */
  uploader: string;
  /** 分类 */
  category: string;
  /** 状态 */
  status: ReviewStatus;
  /** 风险等级 */
  riskLevel: RiskLevel;
  /** 是否通过 AI 检查 */
  isAiChecked: boolean;
  /** 创建时间 */
  createdAt: string;
};

/** 
 * 文档审核日志项 
 */
export type DocumentReviewLogItem = {
  /** 日志 ID */
  id: string;
  /** 文档 ID */
  docId: string;
  /** 文档标题 */
  title: string;
  /** 审核人 */
  reviewer: string;
  /** 审核时间 */
  reviewedAt: string;
  /** 审核结果 */
  result: "approved" | "rejected";
  /** 审核备注 */
  remark: string;
};

/** 
 * 文档审核队列响应数据 
 */
export type DocumentReviewQueueResponse = {
  /** 审核列表 */
  list: DocumentReviewItem[];
  /** 总条数 */
  total: number;
};

/** 
 * 文档详情数据 
 */
export type DocumentDetail = {
  /** 文档 ID */
  id: string;
  /** 标题 */
  title: string;
  /** 内容 */
  content: string;
  /** 分类 */
  category: string;
  /** 状态 */
  status: DocumentStatus;
  /** 标签列表 */
  tags: string[];
  /** 封面图 */
  cover?: string;
  /** SEO 设置 */
  seo?: {
    /** SEO 标题 */
    title: string;
    /** SEO 描述 */
    description: string;
    /** SEO 关键词 */
    keywords: string[];
  };
};

// --- API 函数 ---

/**
 * 初始化文档上传
 * @param data 上传初始化请求数据
 * @returns 上传初始化结果
 */
export async function initDocumentUpload(
  data: DocumentUploadInitRequest
): Promise<ApiResponse<DocumentUploadInitResponse>> {
  return handleRequestWithMock(
    () =>
      request.instance
        .post<ApiResponse<DocumentUploadInitResponse>>(
          "/admin/content/doc/upload/init",
          data
        )
        .then((r) => r.data),
    {
      uploadId: "mock_upload_id_" + Date.now(),
      needUpload: true,
      presignedUrl: "https://mock-s3-url.com/upload",
    },
    "initDocumentUpload"
  );
}

/**
 * 完成文档上传
 * @param data 上传完成请求数据
 * @returns 是否完成
 */
export async function finishDocumentUpload(
  data: DocumentUploadFinishRequest
): Promise<ApiResponse<boolean>> {
  return handleRequestWithMock(
    () =>
      request.instance
        .post<ApiResponse<boolean>>("/admin/content/doc/upload/finish", data)
        .then((r) => r.data),
    true,
    "finishDocumentUpload"
  );
}

/**
 * 移除文档上传任务
 * @param id 任务 ID
 * @returns 是否移除成功
 */
export async function removeDocumentUploadTask(
  id: string
): Promise<ApiResponse<boolean>> {
  return handleRequestWithMock(
    () =>
      request.instance
        .post<ApiResponse<boolean>>("/admin/content/doc/upload/remove", { id })
        .then((r) => r.data),
    true,
    "removeDocumentUploadTask"
  );
}

/**
 * 批量移除文档上传任务
 * @param ids 任务 ID 列表
 * @returns 是否移除成功
 */
export async function batchRemoveDocumentUploadTasks(
  ids: string[]
): Promise<ApiResponse<boolean>> {
  return handleRequestWithMock(
    () =>
      request.instance
        .post<ApiResponse<boolean>>("/admin/content/doc/upload/batch-remove", { ids })
        .then((r) => r.data),
    true,
    "batchRemoveDocumentUploadTasks"
  );
}

/**
 * 重试文档上传任务
 * @param id 任务 ID
 * @returns 是否重试成功
 */
export async function retryDocumentUploadTask(
  id: string
): Promise<ApiResponse<boolean>> {
  return handleRequestWithMock(
    () =>
      request.instance
        .post<ApiResponse<boolean>>("/admin/content/doc/upload/retry", { id })
        .then((r) => r.data),
    true,
    "retryDocumentUploadTask"
  );
}

/**
 * 获取文档上传任务列表
 * @param params 分页及过滤参数
 * @returns 任务列表
 */
export async function fetchDocumentUploadTaskList(params: {
  page: number;
  pageSize: number;
  status?: string;
}): Promise<ApiResponse<DocumentUploadTaskListResponse>> {
  return handleRequestWithMock(
    () =>
      request.instance
        .get<ApiResponse<DocumentUploadTaskListResponse>>(
          "/admin/content/doc/upload/list",
          { params }
        )
        .then((r) => r.data),
    {
      list: mockDocumentUploadTasks,
      total: mockDocumentUploadTasks.length,
    },
    "fetchDocumentUploadTaskList"
  );
}

/**
 * 获取文档分类列表
 * @returns 分类列表
 */
export async function fetchDocumentCategories(): Promise<
  ApiResponse<DocCategory[]>
> {
  return handleRequestWithMock(
    () =>
      request.instance
        .get<ApiResponse<DocCategory[]>>("/admin/content/doc/categories")
        .then((r) => r.data),
    mockDocumentCategories,
    "fetchDocumentCategories"
  );
}

/**
 * 获取文档标签选项
 * @returns 标签列表
 */
export async function fetchTagOptions(): Promise<ApiResponse<DocTag[]>> {
  return handleRequestWithMock(
    () =>
      request.instance
        .get<ApiResponse<DocTag[]>>("/admin/content/doc/tags")
        .then((r) => r.data),
    mockTagOptions,
    "fetchTagOptions"
  );
}

/**
 * 获取草稿列表
 * @param params 分页及搜索参数
 * @returns 草稿列表
 */
export async function fetchDraftList(params: {
  page: number;
  pageSize: number;
  search?: string;
}): Promise<ApiResponse<DocumentListResponse>> {
  return handleRequestWithMock(
    () =>
      request.instance
        .get<ApiResponse<DocumentListResponse>>("/admin/content/doc/drafts", {
          params,
        })
        .then((r) => r.data),
    {
      list: mockDraftList,
      total: mockDraftList.length,
    },
    "fetchDraftList"
  );
}

/**
 * 获取文档列表
 * @param params 分页、状态、分类及关键字参数
 * @returns 文档列表
 */
export async function fetchDocumentList(params: {
  page: number;
  pageSize: number;
  status?: string;
  category?: string;
  keyword?: string;
}): Promise<ApiResponse<DocumentListResponse>> {
  return handleRequestWithMock(
    () =>
      request.instance
        .get<ApiResponse<DocumentListResponse>>("/admin/content/doc/list", {
          params,
        })
        .then((r) => r.data),
    {
      list: mockDocumentList,
      total: mockDocumentList.length,
    },
    "fetchDocumentList"
  );
}

/**
 * 批量更新文档状态
 * @param data ID 列表及目标状态
 * @returns 是否更新成功
 */
export async function batchUpdateDocumentStatus(data: {
  ids: string[];
  status: "published" | "offline";
}): Promise<ApiResponse<boolean>> {
  return handleRequestWithMock(
    () =>
      request.instance
        .post<ApiResponse<boolean>>("/admin/content/doc/status/batch", data)
        .then((r) => r.data),
    true,
    "batchUpdateDocumentStatus"
  );
}

/**
 * 获取文档审核队列
 * @param params 分页、状态及关键字参数
 * @returns 审核队列
 */
export async function fetchDocumentReviewQueue(params: {
  page: number;
  pageSize: number;
  status?: string;
  keyword?: string;
}): Promise<ApiResponse<DocumentReviewQueueResponse>> {
  return handleRequestWithMock(
    () =>
      request.instance
        .get<ApiResponse<DocumentReviewQueueResponse>>(
          "/admin/content/doc/review/queue",
          { params }
        )
        .then((r) => r.data),
    {
      list: mockReviewQueueItems,
      total: mockReviewQueueItems.length,
    },
    "fetchDocumentReviewQueue"
  );
}

/**
 * 获取文档审核日志
 * @param params 文档ID列表
 * @returns 审核日志
 */
export async function fetchDocumentReviewLogs(params: {
  docIds?: string[];
}): Promise<ApiResponse<DocumentReviewLogItem[]>> {
  return handleRequestWithMock(
    () =>
      request.instance
        .get<ApiResponse<DocumentReviewLogItem[]>>(
          "/admin/content/doc/review/logs",
          { params }
        )
        .then((r) => r.data),
    mockDocumentReviewLogs.filter((log) =>
      params.docIds && params.docIds.length > 0
        ? params.docIds.includes(log.docId)
        : true
    ),
    "fetchDocumentReviewLogs"
  );
}

/**
 * 提交文档审核结果
 * @param data 审核 ID、结果及原因
 * @returns 是否提交成功
 */
export async function submitDocumentReview(data: {
  reviewId: string;
  status: "approved" | "rejected";
  reason?: string;
}): Promise<ApiResponse<boolean>> {
  return handleRequestWithMock(
    () =>
      request.instance
        .post<ApiResponse<boolean>>("/admin/content/doc/review/submit", data)
        .then((r) => r.data),
    true,
    "submitDocumentReview"
  );
}

/**
 * 获取文档详情
 * @param id 文档 ID
 * @returns 文档详情
 */
export async function getDocumentDetail(
  id: string
): Promise<ApiResponse<DocumentDetail>> {
  return handleRequestWithMock(
    () =>
      request.instance
        .get<ApiResponse<DocumentDetail>>(`/admin/content/doc/${id}`)
        .then((r) => r.data),
    mockAdminDocument,
    "getDocumentDetail"
  );
}

/**
 * 创建文档
 * @param data 文档详情数据
 * @returns 新建文档的 ID
 */
export async function createDocument(
  data: Partial<DocumentDetail>
): Promise<ApiResponse<string>> {
  return handleRequestWithMock(
    () =>
      request.instance
        .post<ApiResponse<string>>("/admin/content/doc/create", data)
        .then((r) => r.data),
    "mock_doc_id_" + Date.now(),
    "createDocument"
  );
}

/**
 * 更新文档
 * @param id 文档 ID
 * @param data 文档详情数据
 * @returns 是否更新成功
 */
export async function updateDocument(
  id: string,
  data: Partial<DocumentDetail>
): Promise<ApiResponse<boolean>> {
  return handleRequestWithMock(
    () =>
      request.instance
        .put<ApiResponse<boolean>>(`/admin/content/doc/${id}`, data)
        .then((r) => r.data),
    true,
    "updateDocument"
  );
}

/**
 * 批量删除文档
 * @param ids ID 列表
 * @returns 是否删除成功
 */
export async function deleteDocument(
  ids: string[]
): Promise<ApiResponse<boolean>> {
  return handleRequestWithMock(
    () =>
      request.instance
        .delete<ApiResponse<boolean>>("/admin/content/doc/batch", {
          data: { ids },
        })
        .then((r) => r.data),
    true,
    "deleteDocument"
  );
}

/**
 * 批量迁移文档分类
 * @param ids ID 列表
 * @param category 目标分类
 * @returns 是否迁移成功
 */
export async function moveDocumentCategory(
  ids: string[],
  category: string
): Promise<ApiResponse<boolean>> {
  return handleRequestWithMock(
    () =>
      request.instance
        .post<ApiResponse<boolean>>("/admin/content/doc/category/batch", {
          ids,
          category,
        })
        .then((r) => r.data),
    true,
    "moveDocumentCategory"
  );
}
