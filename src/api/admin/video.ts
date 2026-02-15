// ===== 1. 依赖导入区域 =====
import { request, handleRequest } from "../axios";
import type { ApiResponse } from "../types";
import {
  mockVideos,
  mockReviewQueueItems,
  mockVideoUploadTasks,
  mockVideoCategories,
  mockTagOptions,
  mockVideoDrafts,
  mockReviewLogs,
  mockViolationReasons,
  mockComments,
} from "../mock/admin/video";

// ===== 2. TODO待处理导入区域 =====

// ===== 3. 状态控制逻辑区域 =====

// ===== 4. 通用工具函数区域 =====

/** 分片大小（5MB） */
const CHUNK_SIZE = 5 * 1024 * 1024;

// ===== 5. 注释代码函数区 =====

// ===== 6. 错误处理函数区域 =====

// ===== 7. 数据处理函数区域 =====

// ===== 8. UI渲染逻辑区域 =====

// ===== 9. 页面初始化与事件绑定 =====

// ===== 10. TODO任务管理区域 =====

// ===== 11. 导出区域 =====

// ===== 后端类型定义 =====

/** 后端视频详情类型 */
export type BackendVideoDetail = {
  /** 主键ID */
  id?: number;
  /** 文件ID */
  fileId?: string;
  /** 所属用户ID */
  userId?: number;
  /** 视频标题 */
  videoTitle?: string;
  /** 大类 */
  broadCode?: string;
  /** 小类 */
  narrowCode?: string;
  /** 标签 */
  tags?: string;
  /** 视频描述 */
  fileContent?: string;
  /** 浏览量 */
  viewCount?: number;
  /** 点赞量 */
  likeCount?: number;
  /** 评论量 */
  commentCount?: number;
  /** 收藏量 */
  collectCount?: number;
  /** 审核状态 */
  auditStatus?: number;
  /** 审核意见 */
  auditMind?: string;
  /** 状态 */
  status?: number;
  /** 是否置顶 */
  isPinned?: number;
  /** 是否推荐 */
  isRecommended?: number;
  /** 创建时间 */
  createTime?: string;
  /** 更新时间 */
  updateTime?: string;
  /** 封面图URL（关联查询） */
  coverUrl?: string;
  /** 视频播放地址（关联查询） */
  videoUrl?: string;
};

/** 后端评论类型 */
export type BackendVideoComment = {
  /** 主键ID */
  id?: number;
  /** 视频ID */
  videoId?: string;
  /** 评论人ID */
  commentUserId?: string;
  /** 评论内容 */
  commentContent?: string;
  /** 父评论ID */
  parentCommentId?: number;
  /** 审核状态 */
  auditStatus?: number;
  /** 评论状态 */
  status?: number;
  /** 点赞数 */
  likeCount?: number;
  /** 创建时间 */
  createTime?: string;
};

/** 后端分页结果类型 */
export type PageResult<T> = {
  /** 数据列表 */
  rows: T[];
  /** 总条数 */
  total: number;
};

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

// ===== 前端类型定义 =====

/** 视频分类类型 */
export type VideoCategory = {
  /** 分类ID */
  id: string;
  /** 分类名称 */
  name: string;
  /** 子分类列表 */
  children: { id: string; name: string }[];
};

/** 视频标签类型 */
export type VideoTag = {
  /** 标签ID */
  id: string;
  /** 标签名称 */
  name: string;
};

/** 上传任务状态 */
export type UploadTaskStatus = "waiting" | "uploading" | "success" | "error";

/** 上传任务项 */
export type UploadTaskItem = {
  /** 任务ID */
  id: string;
  /** 视频标题 */
  title: string;
  /** 文件名 */
  fileName: string;
  /** 分类 */
  category: string;
  /** 标签列表 */
  tags?: string[];
  /** 文件大小 */
  size: number;
  /** 任务状态 */
  status: UploadTaskStatus;
  /** 上传进度 */
  progress: number;
  /** 是否已AI审核 */
  isAiChecked: boolean;
  /** AI风险等级 */
  aiRiskLevel?: "low" | "medium" | "high";
  /** 封面图 */
  coverImage?: string;
  /** 创建时间 */
  createdAt: string;
  /** 是否开启水印 */
  watermarkEnabled?: boolean;
  /** 水印配置 */
  watermarkConfig?: {
    type: "text" | "image";
    text?: string;
    fontSize?: number;
    opacity: number;
    position: string;
    imageName?: string;
    scale?: number;
    autoFit?: boolean;
  };
};

/** 上传任务列表查询参数 */
export type UploadTaskListParams = {
  /** 当前页码 */
  page: number;
  /** 每页条数 */
  pageSize: number;
  /** 状态过滤 */
  status?: UploadTaskStatus | "all";
  /** 关键词 */
  keyword?: string;
};

/** 上传任务列表响应 */
export type UploadTaskListResponse = {
  /** 任务列表 */
  list: UploadTaskItem[];
  /** 总条数 */
  total: number;
};

/** 视频状态 */
export type VideoStatus =
  | "draft"
  | "published"
  | "offline"
  | "pending"
  | "approved"
  | "rejected"
  | "scheduled";

/** 视频项类型 */
export type VideoItem = {
  /** 视频ID */
  id: string;
  /** 视频标题 */
  title: string;
  /** 分类 */
  category: string;
  /** 状态 */
  status: VideoStatus;
  /** 时长 */
  duration: string;
  /** 播放量 */
  plays: number;
  /** 点赞量 */
  likes: number;
  /** 评论量 */
  comments: number;
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
  /** 封面图 */
  cover?: string;
  /** 标签列表 */
  tags?: string[];
  /** 视频地址 */
  videoUrl?: string;
  /** 视频地址(兼容) */
  url?: string;
  /** 视频描述 */
  description?: string;
  /** 访问密码 */
  password?: string;
  /** 是否置顶 */
  pinned?: boolean;
  /** 是否推荐 */
  recommended?: boolean;
};

/** 视频列表查询参数 */
export type VideoListParams = {
  /** 当前页码 */
  page: number;
  /** 每页条数 */
  pageSize: number;
  /** 状态过滤 */
  status?: VideoStatus | "all";
  /** 分类过滤 */
  category?: string;
  /** 关键词 */
  keyword?: string;
};

/** 视频列表响应 */
export type VideoListResponse = {
  /** 视频列表 */
  list: VideoItem[];
  /** 总条数 */
  total: number;
};

/** 批量更新视频状态请求参数 */
export type BatchUpdateVideoStatusRequest = {
  /** 视频ID列表 */
  ids: string[];
  /** 目标状态 */
  status: Exclude<VideoStatus, "draft">;
};

/** 审核队列类型 */
export type ReviewQueueType = "ai" | "manual";

/** 审核状态 */
export type ReviewStatus = "pending" | "approved" | "rejected";

/** 风险等级 */
export type RiskLevel = "low" | "medium" | "high";

/** 审核队列项 */
export type ReviewQueueItem = {
  /** 队列ID */
  id: string;
  /** 视频标题 */
  title: string;
  /** 上传者 */
  uploader: string;
  /** 分类 */
  category: string;
  /** 审核状态 */
  status: ReviewStatus;
  /** 风险等级 */
  riskLevel: RiskLevel;
  /** 是否已AI审核 */
  isAiChecked: boolean;
  /** 创建时间 */
  createdAt: string;
};

/** 审核日志项 */
export type ReviewLogItem = {
  /** 日志ID */
  id: string;
  /** 视频ID */
  videoId: string;
  /** 视频标题 */
  title: string;
  /** 审核人 */
  reviewer: string;
  /** 审核时间 */
  reviewedAt: string;
  /** 审核结果 */
  result: "approved" | "rejected";
  /** 备注 */
  remark: string;
};

/** 草稿项 */
export type DraftItem = {
  /** 草稿ID */
  id: string;
  /** 视频标题 */
  title: string;
  /** 分类 */
  category: string;
  /** 视频描述 */
  description: string;
  /** 封面图 */
  coverImage?: string;
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
};

/** 审核队列查询参数 */
export type ReviewQueueParams = {
  /** 队列类型 */
  queueType: ReviewQueueType;
  /** 状态过滤 */
  status?: ReviewStatus | "all";
  /** 关键词 */
  keyword?: string;
  /** 当前页码 */
  page: number;
  /** 每页条数 */
  pageSize: number;
};

/** 审核队列响应 */
export type ReviewQueueResponse = {
  /** 审核项列表 */
  list: ReviewQueueItem[];
  /** 总条数 */
  total: number;
};

/** 提交审核结果请求参数 */
export type SubmitReviewRequest = {
  /** 审核ID */
  reviewId: string;
  /** 审核结果 */
  status: Exclude<ReviewStatus, "pending">;
  /** 拒绝原因 */
  reason?: string;
  /** 违规项ID列表 */
  violationIds?: string[];
};

/** 批量提交审核结果请求参数 */
export type SubmitBatchReviewRequest = {
  /** 审核ID列表 */
  reviewIds: string[];
  /** 审核结果 */
  status: Exclude<ReviewStatus, "pending">;
  /** 拒绝原因 */
  reason?: string;
};

/** 视频评论项 */
export type CommentItem = {
  id: string;
  videoId: string;
  username: string;
  avatar: string;
  content: string;
  createdAt: string;
};

/** 章节项类型 */
export type ChapterItem = {
  /** 章节ID */
  id: string;
  /** 章节标题 */
  title: string;
  /** 章节时间点 */
  time: string;
  /** 时间点（秒） */
  timeInSeconds: number;
};

/** 权限类型 */
export type PermissionType = "public" | "private" | "password";

// ===== 字段映射函数 =====

/**
 * 状态数字转前端字符串
 * @param status 后端状态值
 * @param auditStatus 审核状态值
 * @returns 前端状态字符串
 */
function mapStatusToFrontend(status: number, auditStatus: number): VideoStatus {
  if (status === 3) return "draft";
  if (status === 2) return "offline";
  if (auditStatus === 0) return "pending";
  if (auditStatus === 2) return "rejected";
  return "published";
}

/**
 * 视频详情后端转前端字段映射
 * @param backendData 后端视频数据
 * @returns 前端视频数据
 */
function mapVideoToFrontend(backendData: BackendVideoDetail): VideoItem {
  return {
    id: String(backendData.id || ""),
    title: backendData.videoTitle || "",
    category: backendData.broadCode || "",
    status: mapStatusToFrontend(backendData.status || 1, backendData.auditStatus || 1),
    duration: "",
    plays: backendData.viewCount || 0,
    likes: backendData.likeCount || 0,
    comments: backendData.commentCount || 0,
    createdAt: backendData.createTime || "",
    updatedAt: backendData.updateTime || "",
    cover: backendData.coverUrl || "",
    tags: backendData.tags ? backendData.tags.split(",") : [],
    videoUrl: backendData.videoUrl || "",
    description: backendData.fileContent || "",
    pinned: backendData.isPinned === 1,
    recommended: backendData.isRecommended === 1,
  };
}

/**
 * 评论后端转前端字段映射
 * @param backendData 后端评论数据
 * @returns 前端评论数据
 */
function mapCommentToFrontend(backendData: BackendVideoComment): CommentItem {
  return {
    id: String(backendData.id || ""),
    videoId: backendData.videoId || "",
    username: "用户" + backendData.commentUserId,
    avatar: "",
    content: backendData.commentContent || "",
    createdAt: backendData.createTime || "",
  };
}

/**
 * 草稿后端转前端字段映射
 * @param backendData 后端视频数据
 * @returns 前端草稿数据
 */
function mapDraftToFrontend(backendData: BackendVideoDetail): DraftItem {
  return {
    id: String(backendData.id || ""),
    title: backendData.videoTitle || "",
    category: backendData.broadCode || "",
    description: backendData.fileContent || "",
    coverImage: backendData.coverUrl || "",
    createdAt: backendData.createTime || "",
    updatedAt: backendData.updateTime || "",
  };
}

// ===== 分片上传相关函数 =====

/**
 * 计算文件MD5
 * @param file 文件对象
 * @returns MD5字符串
 */
async function calculateMD5(file: File): Promise<string> {
  /** 使用Web Crypto API计算SHA-256作为文件标识 */
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// ===== API 函数 =====

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

/**
 * 获取视频列表
 * @param params 查询参数
 */
export async function fetchVideoList(
  params: VideoListParams
): Promise<ApiResponse<VideoListResponse>> {
  const res = await handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<PageResult<BackendVideoDetail>>>("/video/detail/page", {
          params: {
            pageNum: params.page,
            pageSize: params.pageSize,
            broadCode: params.category,
            videoTitle: params.keyword,
          },
        })
        .then((r) => r.data),
    mockData: {
      rows: mockVideos.map((v) => ({
        id: Number(v.id),
        videoTitle: v.title,
        broadCode: v.category,
        viewCount: v.plays,
        likeCount: v.likes,
        commentCount: v.comments,
        status: 1,
        createTime: v.createdAt,
      })),
      total: mockVideos.length,
    },
    apiName: "fetchVideoList",
  });

  const list = (res.data?.rows || []).map(mapVideoToFrontend);
  return { code: 200, msg: "ok", data: { list, total: res.data?.total || 0 } };
}

/**
 * 获取视频详情
 * @param id 视频ID
 */
export async function fetchVideoDetail(id: string): Promise<ApiResponse<VideoItem>> {
  const res = await handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<BackendVideoDetail>>(`/video/detail/${id}`)
        .then((r) => r.data),
    mockData: {
      id: Number(id),
      videoTitle: mockVideos.find((v) => v.id === id)?.title || "",
      broadCode: mockVideos.find((v) => v.id === id)?.category || "",
      viewCount: mockVideos.find((v) => v.id === id)?.plays || 0,
      status: 1,
    },
    apiName: "fetchVideoDetail",
  });

  return { code: 200, msg: "ok", data: mapVideoToFrontend(res.data as BackendVideoDetail) };
}

/**
 * 更新视频信息
 * @param data 视频信息
 */
export async function updateVideo(
  data: Partial<VideoItem> & { id: string }
): Promise<ApiResponse<boolean>> {
  const backendData = {
    id: Number(data.id),
    videoTitle: data.title,
    broadCode: data.category,
    tags: data.tags?.join(","),
    fileContent: data.description,
    isPinned: data.pinned ? 1 : 0,
    isRecommended: data.recommended ? 1 : 0,
  };

  return handleRequest({
    requestFn: () =>
      request.instance
        .put<ApiResponse<boolean>>("/video/detail", backendData)
        .then((r) => r.data),
    mockData: true,
    apiName: "updateVideo",
  });
}

/**
 * 删除视频
 * @param id 视频ID
 */
export async function deleteVideo(id: string): Promise<ApiResponse<boolean>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .delete<ApiResponse<boolean>>(`/video/detail/${id}`)
        .then((r) => r.data),
    mockData: true,
    apiName: "deleteVideo",
  });
}

/**
 * 批量删除视频
 * @param ids 视频ID列表
 */
export async function batchDeleteVideos(ids: string[]): Promise<ApiResponse<boolean>> {
  const idsStr = ids.join(",");
  return handleRequest({
    requestFn: () =>
      request.instance
        .delete<ApiResponse<boolean>>(`/video/detail/${idsStr}`)
        .then((r) => r.data),
    mockData: true,
    apiName: "batchDeleteVideos",
  });
}

/**
 * 批量更新视频状态
 * @param data 更新参数
 */
export async function batchUpdateVideoStatus(
  data: BatchUpdateVideoStatusRequest
): Promise<ApiResponse<boolean>> {
  const statusMap: Record<string, number> = {
    published: 1,
    offline: 2,
    pending: 0,
    approved: 1,
    rejected: 2,
  };

  return handleRequest({
    requestFn: () =>
      request.instance
        .put<ApiResponse<boolean>>("/video/detail/status/batch", {
          ids: data.ids.map(Number),
          status: statusMap[data.status] || 1,
        })
        .then((r) => r.data),
    mockData: true,
    apiName: "batchUpdateVideoStatus",
  });
}

/**
 * 切换视频置顶状态
 * @param id 视频ID
 * @param pinned 是否置顶
 */
export async function toggleVideoPinned(
  id: string,
  pinned: boolean
): Promise<ApiResponse<boolean>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .put<ApiResponse<boolean>>(`/video/detail/${id}/pinned`, null, {
          params: { pinned: pinned ? 1 : 0 },
        })
        .then((r) => r.data),
    mockData: true,
    apiName: "toggleVideoPinned",
  });
}

/**
 * 切换视频推荐状态
 * @param id 视频ID
 * @param recommended 是否推荐
 */
export async function toggleVideoRecommended(
  id: string,
  recommended: boolean
): Promise<ApiResponse<boolean>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .put<ApiResponse<boolean>>(`/video/detail/${id}/recommended`, null, {
          params: { recommended: recommended ? 1 : 0 },
        })
        .then((r) => r.data),
    mockData: true,
    apiName: "toggleVideoRecommended",
  });
}

/**
 * 获取视频评论列表
 * @param videoId 视频ID
 */
export async function fetchVideoComments(videoId: string): Promise<ApiResponse<CommentItem[]>> {
  const res = await handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<BackendVideoComment[]>>("/video/comment/list", {
          params: { videoId },
        })
        .then((r) => r.data),
    mockData: mockComments
      .filter((c) => c.videoId === videoId)
      .map((c) => ({
        id: Number(c.id),
        videoId: c.videoId,
        commentUserId: c.username,
        commentContent: c.content,
        createTime: c.createdAt,
      })),
    apiName: "fetchVideoComments",
  });

  return { code: 200, msg: "ok", data: (res.data || []).map(mapCommentToFrontend) };
}

/**
 * 删除视频评论
 * @param commentId 评论ID
 */
export async function deleteVideoComment(commentId: string): Promise<ApiResponse<boolean>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .delete<ApiResponse<boolean>>(`/video/comment/${commentId}`)
        .then((r) => r.data),
    mockData: true,
    apiName: "deleteVideoComment",
  });
}

/**
 * 获取草稿列表
 * @param params 分页参数
 */
export async function fetchDraftList(params: {
  page: number;
  pageSize: number;
}): Promise<ApiResponse<{ list: DraftItem[]; total: number }>> {
  const res = await handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<PageResult<BackendVideoDetail>>>("/video/detail/draft/list", {
          params: { pageNum: params.page, pageSize: params.pageSize },
        })
        .then((r) => r.data),
    mockData: {
      rows: mockVideoDrafts.map((d) => ({
        id: Number(d.id),
        videoTitle: d.title,
        broadCode: d.category,
        fileContent: d.description,
        coverUrl: d.coverImage,
        status: 3,
        createTime: d.createdAt,
        updateTime: d.updatedAt,
      })),
      total: mockVideoDrafts.length,
    },
    apiName: "fetchDraftList",
  });

  const list = (res.data?.rows || []).map(mapDraftToFrontend);
  return { code: 200, msg: "ok", data: { list, total: res.data?.total || 0 } };
}

/**
 * 保存草稿
 * @param data 草稿数据
 */
export async function saveDraft(
  data: Omit<DraftItem, "id" | "createdAt" | "updatedAt">
): Promise<ApiResponse<DraftItem>> {
  const backendData = {
    videoTitle: data.title,
    broadCode: data.category,
    fileContent: data.description,
    coverUrl: data.coverImage,
    status: 3,
  };

  const res = await handleRequest({
    requestFn: () =>
      request.instance
        .post<ApiResponse<number>>("/video/detail/draft", backendData)
        .then((r) => r.data),
    mockData: Date.now(),
    apiName: "saveDraft",
  });

  return {
    code: 200,
    msg: "ok",
    data: {
      id: String(res.data),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  };
}

/**
 * 删除草稿
 * @param id 草稿ID
 */
export async function deleteDraft(id: string): Promise<ApiResponse<boolean>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .delete<ApiResponse<boolean>>(`/video/detail/${id}`)
        .then((r) => r.data),
    mockData: true,
    apiName: "deleteDraft",
  });
}

/**
 * 获取审核队列
 * @param params 查询参数
 */
export async function fetchReviewQueue(
  params: ReviewQueueParams
): Promise<ApiResponse<ReviewQueueResponse>> {
  const res = await handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<PageResult<BackendVideoDetail>>>("/video/audit/queue", {
          params: {
            auditStatus: params.status === "all" ? undefined : params.status,
            pageNum: params.page,
            pageSize: params.pageSize,
          },
        })
        .then((r) => r.data),
    mockData: {
      rows: mockReviewQueueItems.map((item) => ({
        id: Number(item.id),
        videoTitle: item.title,
        broadCode: item.category,
        auditStatus: item.status === "pending" ? 0 : item.status === "approved" ? 1 : 2,
        createTime: item.createdAt,
      })),
      total: mockReviewQueueItems.length,
    },
    apiName: "fetchReviewQueue",
  });

  const list = (res.data?.rows || []).map((row) => ({
    id: String(row.id),
    title: row.videoTitle || "",
    uploader: "",
    category: row.broadCode || "",
    status: (row.auditStatus === 0 ? "pending" : row.auditStatus === 1 ? "approved" : "rejected") as ReviewStatus,
    riskLevel: "low" as RiskLevel,
    isAiChecked: false,
    createdAt: row.createTime || "",
  }));

  return { code: 200, msg: "ok", data: { list, total: res.data?.total || 0 } };
}

/**
 * 提交审核结果
 * @param data 审核结果参数
 */
export async function submitReviewResult(data: SubmitReviewRequest): Promise<ApiResponse<boolean>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .post<ApiResponse<boolean>>("/video/audit/submit", {
          videoId: data.reviewId,
          auditStatus: data.status === "approved" ? 1 : 2,
          auditMind: data.reason,
          violationIds: data.violationIds,
        })
        .then((r) => r.data),
    mockData: true,
    apiName: "submitReviewResult",
  });
}

/**
 * 批量提交审核结果
 * @param data 批量审核结果参数
 */
export async function submitBatchReviewResult(
  data: SubmitBatchReviewRequest
): Promise<ApiResponse<boolean>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .post<ApiResponse<boolean>>("/video/audit/submitBatch", {
          videoIds: data.reviewIds,
          auditStatus: data.status === "approved" ? 1 : 2,
          auditMind: data.reason,
        })
        .then((r) => r.data),
    mockData: true,
    apiName: "submitBatchReviewResult",
  });
}

/**
 * 获取审核日志
 * @param params 查询参数
 */
export async function fetchReviewLogs(params: {
  page: number;
  pageSize: number;
}): Promise<ApiResponse<PageResult<ReviewLogItem>>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<PageResult<ReviewLogItem>>>("/video/audit/logs", {
          params: { pageNum: params.page, pageSize: params.pageSize },
        })
        .then((r) => r.data),
    mockData: { rows: mockReviewLogs, total: mockReviewLogs.length },
    apiName: "fetchReviewLogs",
  });
}

/**
 * 获取违规原因列表
 */
export async function fetchViolationReasons(): Promise<ApiResponse<{ id: string; label: string }[]>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<{ id: string; label: string }[]>>("/video/audit/violation-reasons")
        .then((r) => r.data),
    mockData: mockViolationReasons,
    apiName: "fetchViolationReasons",
  });
}

// ===== 文件上传相关 =====

/**
 * 初始化分片上传
 * @param fileName 文件名
 * @param contentType 文件类型
 * @param md5 文件MD5
 */
export async function initMultipartUpload(
  fileName: string,
  contentType: string,
  md5: string
): Promise<string> {
  const res = await handleRequest({
    requestFn: () =>
      request.instance
        .post<ApiResponse<string>>("/file/multipart/init", {
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
          `/file/multipart/upload?uploadId=${uploadId}&partNumber=${partNumber}`,
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
        .post<ApiResponse<void>>("/file/multipart/complete", {
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

  return uploadId;
}

/**
 * 上传封面图（普通上传）
 * @param file 封面图文件
 */
export async function uploadCoverImage(file: File): Promise<FileInfo> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await handleRequest({
    requestFn: () =>
      request.instance
        .post<ApiResponse<FileInfo>>("/file/upload", formData, {
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

/**
 * 上传视频封面（兼容旧接口）
 * @param file 封面文件
 */
export async function uploadCover(file: Blob): Promise<ApiResponse<string>> {
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
      fileName: "cover.jpg",
      fileSize: file.size,
      fileType: "image/jpeg",
      filePath: "public/DefaultImage/MyDefaultHomeVodie.png",
    },
    apiName: "uploadCover",
  });

  return { code: 200, msg: "ok", data: (res.data as FileInfo).filePath };
}

/**
 * 获取上传任务列表
 * @param params 查询参数
 */
export async function fetchUploadTaskList(
  params: UploadTaskListParams
): Promise<ApiResponse<UploadTaskListResponse>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<UploadTaskListResponse>>("/video/detail/upload/list", {
          params,
        })
        .then((r) => r.data),
    mockData: {
      list: mockVideoUploadTasks,
      total: mockVideoUploadTasks.length,
    },
    apiName: "fetchUploadTaskList",
  });
}
