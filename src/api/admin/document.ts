// ===== 1. 依赖导入区域 =====
import { request, handleRequest } from "../axios";
import type { ApiResponse } from "../types";

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

// ===== 后端类型定义 =====

/**
 * 后端笔记类型
 * @description 对应后端 note 表的实体结构，用于文档管理模块的数据交互
 */
export type DocNote = {
  /** 主键ID */
  id?: number;
  /** 用户ID */
  userId?: number;
  /** 笔记名称 */
  noteName?: string;
  /** 笔记标签 */
  noteTags?: string;
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

// ===== 前端类型定义 =====

/**
 * 文档上传初始化请求参数
 * @description 用于文档上传前的初始化校验，支持秒传检测
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
 * @description 后端返回的上传初始化结果，包含上传ID和是否需要上传的标识
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
 * @description 用于通知后端上传任务完成状态
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
 * @description 用于展示上传任务列表中的单个任务信息
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
 * @description 分页查询上传任务列表的返回结构
 */
export type DocumentUploadTaskListResponse = {
  /** 任务列表 */
  list: DocumentUploadTaskItem[];
  /** 总条数 */
  total: number;
};

/**
 * 文档状态类型
 * @description 文档在系统中的生命周期状态
 * - draft: 草稿状态，未发布
 * - pending: 待审核状态，已提交等待审核
 * - approved: 审核通过状态
 * - rejected: 审核拒绝状态
 * - offline: 已下线状态
 * - scheduled: 定时发布状态
 * - published: 已发布状态
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
 * @description 用于文档列表展示的单条数据结构
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
  /** 内容（详情时存在） */
  content?: string;
};

/**
 * 文档分类项
 * @description 用于文档分类树形结构展示，支持多级嵌套
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
 * @description 用于标签选择器的选项数据
 */
export type DocTag = {
  /** 标签显示文本 */
  label: string;
  /** 标签值 */
  value: string;
};

/**
 * 文档列表响应数据
 * @description 分页查询文档列表的返回结构
 */
export type DocumentListResponse = {
  /** 文档列表 */
  list: DocumentItem[];
  /** 总条数 */
  total: number;
};

/**
 * 审核状态类型
 * @description 文档审核流程中的状态枚举
 * - pending: 待审核
 * - approved: 审核通过
 * - rejected: 审核拒绝
 */
export type ReviewStatus = "pending" | "approved" | "rejected";

/**
 * 风险等级类型
 * @description 文档内容风险评估等级
 * - low: 低风险
 * - medium: 中风险
 * - high: 高风险
 */
export type RiskLevel = "low" | "medium" | "high";

/**
 * 文档审核项
 * @description 用于审核队列列表展示的单条数据
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
 * @description 用于记录审核历史操作日志
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
 * @description 分页查询审核队列的返回结构
 */
export type DocumentReviewQueueResponse = {
  /** 审核列表 */
  list: DocumentReviewItem[];
  /** 总条数 */
  total: number;
};

/**
 * 文档详情数据
 * @description 用于文档编辑和详情展示的完整数据结构
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
  /** 是否置顶 */
  pinned?: boolean;
  /** 是否推荐 */
  recommended?: boolean;
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

/**
 * 文档评论项类型
 * @description 用于文档评论列表展示的单条数据
 */
export type DocCommentItem = {
  /** 评论ID */
  id: string;
  /** 文档ID */
  docId: string;
  /** 用户名 */
  username: string;
  /** 用户头像 */
  avatar?: string;
  /** 评论内容 */
  content: string;
  /** 创建时间 */
  createdAt: string;
};

// ===== 字段映射函数 =====

/**
 * 状态映射：后端转前端
 * @description 将后端的数字状态码转换为前端的状态字符串
 * @param status 笔记状态（1-正常 2-下线 3-草稿）
 * @param auditStatus 审核状态（0-待审核 1-通过 2-拒绝）
 * @returns 前端状态字符串
 */
function mapStatusToFrontend(
  status: number,
  auditStatus: number
): DocumentStatus {
  if (status === 3) return "draft";
  if (status === 2) return "offline";
  if (auditStatus === 0) return "pending";
  if (auditStatus === 1) return "approved";
  if (auditStatus === 2) return "rejected";
  return "draft";
}

/**
 * 状态映射：前端转后端
 * @description 将前端的状态字符串转换为后端的数字状态码
 * @param status 前端状态字符串
 * @returns 后端状态对象，包含 status 和 auditStatus 字段
 */
function mapStatusToBackend(
  status: DocumentStatus
): { status: number; auditStatus: number } {
  switch (status) {
    case "draft":
      return { status: 3, auditStatus: 0 };
    case "pending":
      return { status: 1, auditStatus: 0 };
    case "approved":
      return { status: 1, auditStatus: 1 };
    case "rejected":
      return { status: 1, auditStatus: 2 };
    case "offline":
      return { status: 2, auditStatus: 0 };
    case "published":
      return { status: 1, auditStatus: 1 };
    default:
      return { status: 3, auditStatus: 0 };
  }
}

/**
 * 笔记后端转前端字段映射
 * @description 将后端 DocNote 类型转换为前端 DocumentItem 类型
 * @param note 后端笔记数据
 * @returns 前端文档数据
 */
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
    tags: note.noteTags ? note.noteTags.split(",") : [],
    pinned: note.isPinned === 1,
    recommended: note.isRecommended === 1,
  };
}

/**
 * 笔记前端转后端字段映射
 * @description 将前端 DocumentItem 或 DocumentDetail 类型转换为后端 DocNote 类型
 * @param doc 前端文档数据
 * @returns 后端笔记数据
 */
function mapNoteToBackend(
  doc: Partial<DocumentItem | DocumentDetail>
): Partial<DocNote> {
  const statusMap = mapStatusToBackend(doc.status || "draft");
  const docItem = doc as Partial<DocumentItem>;
  return {
    id: doc.id ? Number(doc.id) : undefined,
    noteName: doc.title,
    broadCode: doc.category,
    description: docItem.description,
    status: statusMap.status,
    noteTags: Array.isArray(doc.tags) ? doc.tags.join(",") : undefined,
    cover: doc.cover,
    isPinned: docItem.pinned ? 1 : 0,
    isRecommended: docItem.recommended ? 1 : 0,
    content: (doc as DocumentDetail).content,
  };
}

// ===== 文档管理 API =====

/**
 * 获取文档列表
 * @description 分页查询文档列表，支持按状态、分类和关键字筛选
 * @param params 查询参数
 * @param params.page 当前页码，从1开始
 * @param params.pageSize 每页条数
 * @param params.status 文档状态筛选（可选）
 * @param params.category 分类筛选（可选）
 * @param params.keyword 关键字搜索（可选）
 * @returns 文档列表及总数
 */
export async function fetchDocumentList(params: {
  page: number;
  pageSize: number;
  status?: string;
  category?: string;
  keyword?: string;
}): Promise<ApiResponse<DocumentListResponse>> {
  const res = await handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<{ rows: DocNote[]; total: number }>>("/note/page", {
          params,
        })
        .then((r) => r.data),
    apiName: "fetchDocumentList",
  });

  const list = (res.data?.rows || []).map(mapNoteToFrontend);
  return {
    code: 200,
    msg: "ok",
    data: { list, total: res.data?.total || 0 },
  };
}

/**
 * 获取文档详情
 * @description 根据文档ID获取完整的文档信息，包含内容和SEO设置
 * @param id 文档 ID
 * @returns 文档详情数据
 */
export async function getDocumentDetail(
  id: string
): Promise<ApiResponse<DocumentDetail>> {
  const res = await handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<DocNote>>(`/note/${id}`)
        .then((r) => r.data),
    apiName: "getDocumentDetail",
  });

  if (!res.data) {
    return { code: 404, msg: "文档不存在", data: null as unknown as DocumentDetail };
  }

  const note = res.data;
  const detail: DocumentDetail = {
    id: String(note.id || ""),
    title: note.noteName || "",
    content: note.content || "",
    category: note.broadCode || "",
    status: mapStatusToFrontend(note.status || 3, note.auditStatus || 0),
    tags: note.noteTags ? note.noteTags.split(",") : [],
    cover: note.cover,
    seo: note.seoTitle
      ? {
          title: note.seoTitle,
          description: note.seoDescription || "",
          keywords: note.seoKeywords ? note.seoKeywords.split(",") : [],
        }
      : undefined,
  };
  return { code: 200, msg: "ok", data: detail };
}

/**
 * 创建文档
 * @description 新建文档记录，保存到数据库
 * @param data 文档详情数据，包含标题、内容、分类等信息
 * @returns 新建文档的 ID
 */
export async function createDocument(
  data: Partial<DocumentDetail>
): Promise<ApiResponse<string>> {
  const backendData = mapNoteToBackend(data);
  return handleRequest({
    requestFn: () =>
      request.instance
        .post<ApiResponse<string>>("/note", backendData)
        .then((r) => r.data),
    apiName: "createDocument",
  });
}

/**
 * 更新文档
 * @description 更新已有文档的信息
 * @param id 文档 ID
 * @param data 要更新的文档数据
 * @returns 是否更新成功
 */
export async function updateDocument(
  id: string,
  data: Partial<DocumentDetail>
): Promise<ApiResponse<boolean>> {
  const backendData = mapNoteToBackend({ ...data, id });
  return handleRequest({
    requestFn: () =>
      request.instance
        .put<ApiResponse<boolean>>("/note", backendData)
        .then((r) => r.data),
    apiName: "updateDocument",
  });
}

/**
 * 批量删除文档
 * @description 根据ID列表批量删除文档，支持物理删除或逻辑删除
 * @param ids 要删除的文档 ID 列表
 * @returns 是否删除成功
 */
export async function deleteDocument(
  ids: string[]
): Promise<ApiResponse<boolean>> {
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
 * @description 分页查询当前用户的草稿文档列表
 * @param params 查询参数
 * @param params.page 当前页码，从1开始
 * @param params.pageSize 每页条数
 * @param params.search 搜索关键字（可选）
 * @returns 草稿列表及总数
 */
export async function fetchDraftList(params: {
  page: number;
  pageSize: number;
  search?: string;
}): Promise<ApiResponse<DocumentListResponse>> {
  const res = await handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<{ rows: DocNote[]; total: number }>>("/note/draft/list", {
          params,
        })
        .then((r) => r.data),
    apiName: "fetchDraftList",
  });

  const list = (res.data?.rows || []).map(mapNoteToFrontend);
  return {
    code: 200,
    msg: "ok",
    data: { list, total: res.data?.total || 0 },
  };
}

/**
 * 批量更新文档状态
 * @description 批量发布或下线文档
 * @param data 状态更新参数
 * @param data.ids 要更新的文档 ID 列表
 * @param data.status 目标状态（published-发布，offline-下线）
 * @returns 是否更新成功
 */
export async function batchUpdateDocumentStatus(data: {
  ids: string[];
  status: "published" | "offline";
}): Promise<ApiResponse<boolean>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .put<ApiResponse<boolean>>("/note/status/batch", {
          ids: data.ids.map(Number),
          status: data.status,
        })
        .then((r) => r.data),
    apiName: "batchUpdateDocumentStatus",
  });
}

/**
 * 批量迁移文档分类
 * @description 将多个文档迁移到指定分类
 * @param ids 要迁移的文档 ID 列表
 * @param category 目标分类代码
 * @returns 是否迁移成功
 */
export async function moveDocumentCategory(
  ids: string[],
  category: string
): Promise<ApiResponse<boolean>> {
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

// ===== 文档分类标签 API =====

/**
 * 获取文档分类列表
 * @description 获取所有文档分类，支持树形结构
 * @returns 分类列表，包含父子层级关系
 */
export async function fetchDocumentCategories(): Promise<
  ApiResponse<DocCategory[]>
> {
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
 * @description 获取所有可用标签，用于标签选择器
 * @returns 标签列表，包含 label 和 value 字段
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

// ===== 文档评论 API =====

/**
 * 获取文档评论列表
 * @description 根据文档ID获取该文档下的所有评论
 * @param docId 文档ID
 * @returns 评论列表
 */
export async function fetchDocumentComments(
  docId: string
): Promise<ApiResponse<DocCommentItem[]>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<DocCommentItem[]>>(
          `/note/comment/list?docId=${docId}`
        )
        .then((r) => r.data),
    apiName: "fetchDocumentComments",
  });
}

/**
 * 删除文档评论
 * @description 删除指定评论，管理员权限可删除任意评论
 * @param commentId 评论ID
 * @returns 是否删除成功
 */
export async function deleteDocumentComment(
  commentId: string
): Promise<ApiResponse<boolean>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .delete<ApiResponse<boolean>>(`/note/comment/${commentId}`)
        .then((r) => r.data),
    apiName: "deleteDocumentComment",
  });
}

// ===== 文档审核 API =====

/**
 * 获取文档审核队列
 * @description 分页查询待审核文档列表，支持按状态和关键字筛选
 * @param params 查询参数
 * @param params.page 当前页码，从1开始
 * @param params.pageSize 每页条数
 * @param params.status 审核状态筛选（可选）
 * @param params.keyword 关键字搜索（可选）
 * @returns 审核队列及总数
 */
export async function fetchDocumentReviewQueue(params: {
  page: number;
  pageSize: number;
  status?: string;
  keyword?: string;
}): Promise<ApiResponse<DocumentReviewQueueResponse>> {
  const res = await handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<{ rows: DocumentReviewItem[]; total: number }>>(
          "/note/review/queue",
          { params }
        )
        .then((r) => r.data),
    apiName: "fetchDocumentReviewQueue",
  });

  return {
    code: 200,
    msg: "ok",
    data: { list: res.data?.rows || [], total: res.data?.total || 0 },
  };
}

/**
 * 获取文档审核日志
 * @description 查询指定文档的审核历史记录
 * @param params 查询参数
 * @param params.docIds 文档ID列表（可选，不传则查询所有）
 * @returns 审核日志列表
 */
export async function fetchDocumentReviewLogs(params: {
  docIds?: string[];
}): Promise<ApiResponse<DocumentReviewLogItem[]>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<DocumentReviewLogItem[]>>("/note/review/logs", {
          params,
        })
        .then((r) => r.data),
    apiName: "fetchDocumentReviewLogs",
  });
}

/**
 * 提交文档审核结果
 * @description 审核员提交审核结论，通过或拒绝文档
 * @param data 审核提交参数
 * @param data.reviewId 审核记录 ID
 * @param data.status 审核结果（approved-通过，rejected-拒绝）
 * @param data.reason 拒绝原因（拒绝时必填）
 * @returns 是否提交成功
 */
export async function submitDocumentReview(data: {
  reviewId: string;
  status: "approved" | "rejected";
  reason?: string;
}): Promise<ApiResponse<boolean>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .post<ApiResponse<boolean>>("/note/review/submit", {
          id: data.reviewId,
          result: data.status,
          reason: data.reason,
        })
        .then((r) => r.data),
    apiName: "submitDocumentReview",
  });
}

// ===== 文档上传 API =====

/**
 * 初始化文档上传
 * @description 上传前的初始化操作，检测是否支持秒传
 * @param data 上传初始化请求数据
 * @param data.title 文档标题
 * @param data.fileName 文件名（含扩展名）
 * @param data.fileSize 文件大小（字节）
 * @param data.fileMd5 文件 MD5 哈希值，用于秒传检测
 * @param data.category 分类代码
 * @param data.tags 标签列表
 * @param data.description 文档描述（可选）
 * @param data.isPublic 是否公开
 * @param data.price 价格（可选，付费文档时使用）
 * @returns 上传初始化结果，包含上传ID和是否需要上传的标识
 */
export async function initDocumentUpload(
  data: DocumentUploadInitRequest
): Promise<ApiResponse<DocumentUploadInitResponse>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .post<ApiResponse<DocumentUploadInitResponse>>(
          "/files/multipart/init",
          {
            fileName: data.fileName,
            fileSize: data.fileSize,
            fileMd5: data.fileMd5,
          }
        )
        .then((r) => r.data),
    apiName: "initDocumentUpload",
  });
}

/**
 * 完成文档上传
 * @description 通知后端上传任务已完成，触发后续处理流程
 * @param data 上传完成请求数据
 * @param data.uploadId 上传任务 ID
 * @param data.status 上传状态（success-成功，error-失败）
 * @param data.errorMsg 错误信息（失败时填写）
 * @returns 是否完成
 */
export async function finishDocumentUpload(
  data: DocumentUploadFinishRequest
): Promise<ApiResponse<boolean>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .post<ApiResponse<boolean>>("/files/multipart/complete", {
          uploadId: data.uploadId,
        })
        .then((r) => r.data),
    apiName: "finishDocumentUpload",
  });
}

/**
 * 获取文档上传任务列表
 * @description 分页查询当前用户的上传任务列表
 * @param params 查询参数
 * @param params.page 当前页码，从1开始
 * @param params.pageSize 每页条数
 * @param params.status 任务状态筛选（可选）
 * @returns 任务列表及总数
 */
export async function fetchDocumentUploadTaskList(params: {
  page: number;
  pageSize: number;
  status?: string;
}): Promise<ApiResponse<DocumentUploadTaskListResponse>> {
  const res = await handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<DocumentUploadTaskItem[]>>("/note/upload/task/list", {
          params,
        })
        .then((r) => r.data),
    apiName: "fetchDocumentUploadTaskList",
  });

  const list = res.data || [];
  return { code: 200, msg: "ok", data: { list, total: list.length } };
}

/**
 * 移除文档上传任务
 * @description 从任务列表中移除指定任务
 * @param id 任务 ID
 * @returns 是否移除成功
 */
export async function removeDocumentUploadTask(
  id: string
): Promise<ApiResponse<boolean>> {
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
 * @description 批量从任务列表中移除任务
 * @param ids 任务 ID 列表
 * @returns 是否移除成功
 */
export async function batchRemoveDocumentUploadTasks(
  ids: string[]
): Promise<ApiResponse<boolean>> {
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
 * @description 重新尝试失败的上传任务
 * @param id 任务 ID
 * @returns 是否重试成功
 */
export async function retryDocumentUploadTask(
  id: string
): Promise<ApiResponse<boolean>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .post<ApiResponse<boolean>>(`/note/upload/task/${id}/retry`)
        .then((r) => r.data),
    apiName: "retryDocumentUploadTask",
  });
}
