/**
 * 视频管理相关 API
 * @module api/admin/video
 * @description 提供视频管理、上传、审核、评论等功能接口
 */

import { request, handleRequest } from "../request";
import type { ApiResponse } from "../types";

/** 分片上传的块大小（5MB） */
const CHUNK_SIZE = 5 * 1024 * 1024;

/**
 * 后端视频详情类型
 * @description 对应后端 video_detail 表的实体结构
 */
export type BackendVideoDetail = {
  /** 视频ID（主键） */
  id?: number;
  /** 文件ID（关联文件表） */
  fileId?: string;
  /** 用户ID（上传者） */
  userId?: number;
  /** 视频标题 */
  videoTitle?: string;
  /** 大类编码 */
  broadCode?: string;
  /** 小类编码 */
  narrowCode?: string;
  /** 标签（逗号分隔） */
  tags?: string;
  /** 文件内容/描述 */
  fileContent?: string;
  /** 浏览量 */
  viewCount?: number;
  /** 点赞量 */
  likeCount?: number;
  /** 评论量 */
  commentCount?: number;
  /** 收藏量 */
  collectCount?: number;
  /** 审核状态（0-待审核 1-通过 2-拒绝） */
  auditStatus?: number;
  /** 审核意见 */
  auditMind?: string;
  /** 视频状态（1-正常 2-下线 3-草稿） */
  status?: number;
  /** 是否置顶（0-否 1-是） */
  isPinned?: number;
  /** 是否推荐（0-否 1-是） */
  isRecommended?: number;
  /** 创建时间 */
  createTime?: string;
  /** 更新时间 */
  updateTime?: string;
  /** 封面图URL */
  coverUrl?: string;
  /** 视频URL */
  videoUrl?: string;
};

/**
 * 后端视频评论类型
 * @description 对应后端 video_comment 表的实体结构
 */
export type BackendVideoComment = {
  /** 评论ID（主键） */
  id?: number;
  /** 视频ID */
  videoId?: string;
  /** 评论用户ID */
  commentUserId?: string;
  /** 评论内容 */
  commentContent?: string;
  /** 父评论ID（用于回复） */
  parentCommentId?: number;
  /** 审核状态（0-待审核 1-通过 2-拒绝） */
  auditStatus?: number;
  /** 评论状态（0-正常 1-删除） */
  status?: number;
  /** 点赞数 */
  likeCount?: number;
  /** 创建时间 */
  createTime?: string;
};

/**
 * 分页结果类型
 * @description 通用分页查询返回结构
 * @template T 数据项类型
 */
export type PageResult<T> = {
  /** 数据列表 */
  rows: T[];
  /** 总条数 */
  total: number;
};

/**
 * 文件信息类型
 * @description 上传文件后返回的文件信息
 */
export type FileInfo = {
  /** 文件ID */
  id: number;
  /** 文件名 */
  fileName: string;
  /** 文件大小（字节） */
  fileSize: number;
  /** 文件类型（MIME类型） */
  fileType: string;
  /** 文件存储路径 */
  filePath: string;
  /** 文件访问URL */
  fileUrl?: string;
};

/**
 * 视频分类类型
 * @description 用于视频分类树形结构展示
 */
export type VideoCategory = {
  /** 分类ID */
  id: string;
  /** 分类名称 */
  name: string;
  /** 子分类列表 */
  children: { id: string; name: string }[];
};

/**
 * 视频标签类型
 * @description 用于标签选择器的选项数据
 */
export type VideoTag = {
  /** 标签ID */
  id: string;
  /** 标签名称 */
  name: string;
};

/**
 * 上传任务状态类型
 * @description 视频上传任务的状态枚举
 * - waiting: 等待上传
 * - uploading: 上传中
 * - success: 上传成功
 * - error: 上传失败
 */
export type UploadTaskStatus = "waiting" | "uploading" | "success" | "error";

/**
 * 上传任务项
 * @description 用于上传任务列表展示的单条数据
 */
export type UploadTaskItem = {
  /** 任务ID */
  id: string;
  /** 视频标题 */
  title: string;
  /** 文件名 */
  fileName: string;
  /** 分类代码 */
  category: string;
  /** 标签列表 */
  tags?: string[];
  /** 文件大小（字节） */
  size: number;
  /** 任务状态 */
  status: UploadTaskStatus;
  /** 上传进度（0-100） */
  progress: number;
  /** 是否通过AI审核 */
  isAiChecked: boolean;
  /** AI风险等级 */
  aiRiskLevel?: "low" | "medium" | "high";
  /** 封面图 */
  coverImage?: string;
  /** 创建时间 */
  createdAt: string;
  /** 是否启用水印 */
  watermarkEnabled?: boolean;
  /** 水印配置 */
  watermarkConfig?: {
    /** 水印类型：text-文字水印，image-图片水印 */
    type: "text" | "image";
    /** 文字内容（文字水印时使用） */
    text?: string;
    /** 字体大小 */
    fontSize?: number;
    /** 透明度（0-1） */
    opacity: number;
    /** 位置 */
    position: string;
    /** 图片名称（图片水印时使用） */
    imageName?: string;
    /** 缩放比例 */
    scale?: number;
    /** 是否自适应 */
    autoFit?: boolean;
  };
};

/**
 * 上传任务列表查询参数
 * @description 分页查询上传任务列表的请求参数
 */
export type UploadTaskListParams = {
  /** 当前页码，从1开始 */
  page: number;
  /** 每页条数 */
  pageSize: number;
  /** 状态筛选 */
  status?: UploadTaskStatus | "all";
  /** 关键字搜索 */
  keyword?: string;
};

/**
 * 上传任务列表响应数据
 * @description 分页查询上传任务列表的返回结构
 */
export type UploadTaskListResponse = {
  /** 任务列表 */
  list: UploadTaskItem[];
  /** 总条数 */
  total: number;
};

/**
 * 视频状态类型
 * @description 视频在系统中的生命周期状态
 * - draft: 草稿状态
 * - published: 已发布状态
 * - offline: 已下线状态
 * - pending: 待审核状态
 * - approved: 审核通过状态
 * - rejected: 审核拒绝状态
 * - scheduled: 定时发布状态
 */
export type VideoStatus =
  | "draft"
  | "published"
  | "offline"
  | "pending"
  | "approved"
  | "rejected"
  | "scheduled";

/**
 * 视频列表项
 * @description 用于视频列表展示的单条数据
 */
export type VideoItem = {
  /** 视频ID */
  id: string;
  /** 视频标题 */
  title: string;
  /** 分类代码 */
  category: string;
  /** 视频状态 */
  status: VideoStatus;
  /** 视频时长 */
  duration: string;
  /** 播放量 */
  plays: number;
  /** 点赞数 */
  likes: number;
  /** 评论数 */
  comments: number;
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
  /** 封面图URL */
  cover?: string;
  /** 标签列表 */
  tags?: string[];
  /** 视频URL */
  videoUrl?: string;
  /** 访问URL */
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

/**
 * 视频列表查询参数
 * @description 分页查询视频列表的请求参数
 */
export type VideoListParams = {
  /** 当前页码，从1开始 */
  page: number;
  /** 每页条数 */
  pageSize: number;
  /** 状态筛选 */
  status?: VideoStatus | "all";
  /** 分类筛选 */
  category?: string;
  /** 关键字搜索 */
  keyword?: string;
};

/**
 * 视频列表响应数据
 * @description 分页查询视频列表的返回结构
 */
export type VideoListResponse = {
  /** 视频列表 */
  list: VideoItem[];
  /** 总条数 */
  total: number;
};

/**
 * 批量更新视频状态请求参数
 * @description 批量更新视频状态时提交的数据结构
 */
export type BatchUpdateVideoStatusRequest = {
  /** 视频ID列表 */
  ids: string[];
  /** 目标状态（不包括草稿状态） */
  status: Exclude<VideoStatus, "draft">;
};

/**
 * 审核队列类型
 * @description 审核队列的分类
 * - ai: AI审核队列
 * - manual: 人工审核队列
 */
export type ReviewQueueType = "ai" | "manual";

/**
 * 审核状态类型
 * @description 视频审核流程中的状态枚举
 */
export type ReviewStatus = "pending" | "approved" | "rejected";

/**
 * 风险等级类型
 * @description 视频内容风险评估等级
 */
export type RiskLevel = "low" | "medium" | "high";

/**
 * 审核队列项
 * @description 用于审核队列列表展示的单条数据
 */
export type ReviewQueueItem = {
  /** 审核ID */
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
  /** 是否通过AI检查 */
  isAiChecked: boolean;
  /** 创建时间 */
  createdAt: string;
};

/**
 * 审核日志项
 * @description 用于记录审核历史操作日志
 */
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
  /** 审核备注 */
  remark: string;
};

/**
 * 草稿项
 * @description 用于草稿列表展示的单条数据
 */
export type DraftItem = {
  /** 草稿ID */
  id: string;
  /** 视频标题 */
  title: string;
  /** 分类 */
  category: string;
  /** 描述 */
  description: string;
  /** 封面图 */
  coverImage?: string;
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
};

/**
 * 审核队列查询参数
 * @description 分页查询审核队列的请求参数
 */
export type ReviewQueueParams = {
  /** 队列类型 */
  queueType: ReviewQueueType;
  /** 审核状态筛选 */
  status?: ReviewStatus | "all";
  /** 关键字搜索 */
  keyword?: string;
  /** 当前页码 */
  page: number;
  /** 每页条数 */
  pageSize: number;
};

/**
 * 审核队列响应数据
 * @description 分页查询审核队列的返回结构
 */
export type ReviewQueueResponse = {
  /** 审核列表 */
  list: ReviewQueueItem[];
  /** 总条数 */
  total: number;
};

/**
 * 提交审核请求参数
 * @description 提交单个视频审核结果的数据结构
 */
export type SubmitReviewRequest = {
  /** 审核ID */
  reviewId: string;
  /** 审核结果（不包括待审核状态） */
  status: Exclude<ReviewStatus, "pending">;
  /** 拒绝原因 */
  reason?: string;
  /** 违规项ID列表 */
  violationIds?: string[];
};

/**
 * 批量提交审核请求参数
 * @description 批量提交视频审核结果的数据结构
 */
export type SubmitBatchReviewRequest = {
  /** 审核ID列表 */
  reviewIds: string[];
  /** 审核结果 */
  status: Exclude<ReviewStatus, "pending">;
  /** 拒绝原因 */
  reason?: string;
};

/**
 * 评论项
 * @description 用于视频评论列表展示的单条数据
 */
export type CommentItem = {
  /** 评论ID */
  id: string;
  /** 视频ID */
  videoId: string;
  /** 用户名 */
  username: string;
  /** 用户头像 */
  avatar: string;
  /** 评论内容 */
  content: string;
  /** 创建时间 */
  createdAt: string;
};

/**
 * 章节项
 * @description 视频章节信息
 */
export type ChapterItem = {
  /** 章节ID */
  id: string;
  /** 章节标题 */
  title: string;
  /** 时间点（格式化字符串） */
  time: string;
  /** 时间点（秒数） */
  timeInSeconds: number;
};

/**
 * 权限类型
 * @description 视频访问权限设置
 * - public: 公开
 * - private: 私有
 * - password: 密码访问
 */
export type PermissionType = "public" | "private" | "password";

/**
 * 状态映射：后端转前端
 * @description 将后端的数字状态码转换为前端的状态字符串
 * @param status 视频状态（1-正常 2-下线 3-草稿）
 * @param auditStatus 审核状态（0-待审核 1-通过 2-拒绝）
 * @returns 前端状态字符串
 */
const mapStatusToFrontend = (status: number, auditStatus: number): VideoStatus => {
  if (status === 3) return "draft";
  if (status === 2) return "offline";
  if (auditStatus === 0) return "pending";
  if (auditStatus === 2) return "rejected";
  return "published";
};

/**
 * 视频数据后端转前端字段映射
 * @description 将后端 BackendVideoDetail 类型转换为前端 VideoItem 类型
 * @param backendData 后端视频数据
 * @returns 前端视频数据
 */
const mapVideoToFrontend = (backendData: BackendVideoDetail): VideoItem => ({
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
});

/**
 * 评论数据后端转前端字段映射
 * @description 将后端 BackendVideoComment 类型转换为前端 CommentItem 类型
 * @param backendData 后端评论数据
 * @returns 前端评论数据
 */
const mapCommentToFrontend = (backendData: BackendVideoComment): CommentItem => ({
  id: String(backendData.id || ""),
  videoId: backendData.videoId || "",
  username: "用户" + backendData.commentUserId,
  avatar: "",
  content: backendData.commentContent || "",
  createdAt: backendData.createTime || "",
});

/**
 * 草稿数据后端转前端字段映射
 * @description 将后端 BackendVideoDetail 类型转换为前端 DraftItem 类型
 * @param backendData 后端视频数据
 * @returns 前端草稿数据
 */
const mapDraftToFrontend = (backendData: BackendVideoDetail): DraftItem => ({
  id: String(backendData.id || ""),
  title: backendData.videoTitle || "",
  category: backendData.broadCode || "",
  description: backendData.fileContent || "",
  coverImage: backendData.coverUrl || "",
  createdAt: backendData.createTime || "",
  updatedAt: backendData.updateTime || "",
});

/**
 * 计算文件MD5哈希值
 * @description 使用SHA-256算法计算文件的哈希值，用于秒传检测
 * @param file 要计算的文件
 * @returns 文件的哈希值字符串
 */
const calculateMD5 = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
};

/**
 * 获取视频分类列表
 * @description 获取所有视频分类，支持树形结构
 * @param setLoading 加载状态回调函数（可选）
 * @returns 视频分类列表
 */
export async function fetchVideoCategories(
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<VideoCategory[]>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<VideoCategory[]>>("/video/category/list")
        .then((r) => r.data),
    apiName: "fetchVideoCategories",
    setLoading,
  });
}

/**
 * 获取视频标签选项
 * @description 获取所有可用标签，用于标签选择器
 * @param setLoading 加载状态回调函数（可选）
 * @returns 标签列表
 */
export async function fetchTagOptions(
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<VideoTag[]>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<VideoTag[]>>("/video/category/tag/list")
        .then((r) => r.data),
    apiName: "fetchTagOptions",
    setLoading,
  });
}

/**
 * 获取视频列表
 * @description 分页查询视频列表，支持状态、分类和关键字筛选
 * @param params 查询参数
 * @param setLoading 加载状态回调函数（可选）
 * @returns 视频列表及总数
 */
export async function fetchVideoList(
  params: VideoListParams,
  setLoading?: (loading: boolean) => void
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
    apiName: "fetchVideoList",
    setLoading,
  });

  const list = (res.data?.rows || []).map(mapVideoToFrontend);
  return { code: 200, msg: "ok", data: { list, total: res.data?.total || 0 } };
}

export async function fetchVideoDetail(
  id: string,
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<VideoItem>> {
  const res = await handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<BackendVideoDetail>>(`/video/detail/${id}`)
        .then((r) => r.data),
    apiName: "fetchVideoDetail",
    setLoading,
  });

  return { code: 200, msg: "ok", data: mapVideoToFrontend(res.data as BackendVideoDetail) };
}

export async function updateVideo(
  data: Partial<VideoItem> & { id: string },
  setLoading?: (loading: boolean) => void
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
    apiName: "updateVideo",
    setLoading,
  });
}

export async function deleteVideo(
  id: string,
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .delete<ApiResponse<boolean>>(`/video/detail/${id}`)
        .then((r) => r.data),
    apiName: "deleteVideo",
    setLoading,
  });
}

export async function batchDeleteVideos(
  ids: string[],
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  const idsStr = ids.join(",");
  return handleRequest({
    requestFn: () =>
      request.instance
        .delete<ApiResponse<boolean>>(`/video/detail/${idsStr}`)
        .then((r) => r.data),
    apiName: "batchDeleteVideos",
    setLoading,
  });
}

export async function batchUpdateVideoStatus(
  data: BatchUpdateVideoStatusRequest,
  setLoading?: (loading: boolean) => void
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
    apiName: "batchUpdateVideoStatus",
    setLoading,
  });
}

export async function toggleVideoPinned(
  id: string,
  pinned: boolean,
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .put<ApiResponse<boolean>>(`/video/detail/${id}/pinned`, null, {
          params: { pinned: pinned ? 1 : 0 },
        })
        .then((r) => r.data),
    apiName: "toggleVideoPinned",
    setLoading,
  });
}

export async function toggleVideoRecommended(
  id: string,
  recommended: boolean,
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .put<ApiResponse<boolean>>(`/video/detail/${id}/recommended`, null, {
          params: { recommended: recommended ? 1 : 0 },
        })
        .then((r) => r.data),
    apiName: "toggleVideoRecommended",
    setLoading,
  });
}

export async function fetchVideoComments(
  videoId: string,
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<CommentItem[]>> {
  const res = await handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<BackendVideoComment[]>>("/video/comment/list", {
          params: { videoId },
        })
        .then((r) => r.data),
    apiName: "fetchVideoComments",
    setLoading,
  });

  return { code: 200, msg: "ok", data: (res.data || []).map(mapCommentToFrontend) };
}

export async function deleteVideoComment(
  commentId: string,
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .delete<ApiResponse<boolean>>(`/video/comment/${commentId}`)
        .then((r) => r.data),
    apiName: "deleteVideoComment",
    setLoading,
  });
}

export async function fetchDraftList(
  params: { page: number; pageSize: number },
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<{ list: DraftItem[]; total: number }>> {
  const res = await handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<PageResult<BackendVideoDetail>>>("/video/detail/draft/list", {
          params: { pageNum: params.page, pageSize: params.pageSize },
        })
        .then((r) => r.data),
    apiName: "fetchDraftList",
    setLoading,
  });

  const list = (res.data?.rows || []).map(mapDraftToFrontend);
  return { code: 200, msg: "ok", data: { list, total: res.data?.total || 0 } };
}

export async function saveDraft(
  data: Omit<DraftItem, "id" | "createdAt" | "updatedAt">,
  setLoading?: (loading: boolean) => void
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
    apiName: "saveDraft",
    setLoading,
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

export async function deleteDraft(
  id: string,
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .delete<ApiResponse<boolean>>(`/video/detail/${id}`)
        .then((r) => r.data),
    apiName: "deleteDraft",
    setLoading,
  });
}

export async function fetchReviewQueue(
  params: ReviewQueueParams,
  setLoading?: (loading: boolean) => void
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
    apiName: "fetchReviewQueue",
    setLoading,
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

export async function submitReviewResult(
  data: SubmitReviewRequest,
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
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
    apiName: "submitReviewResult",
    setLoading,
  });
}

export async function submitBatchReviewResult(
  data: SubmitBatchReviewRequest,
  setLoading?: (loading: boolean) => void
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
    apiName: "submitBatchReviewResult",
    setLoading,
  });
}

export async function fetchReviewLogs(
  params: { page: number; pageSize: number },
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<PageResult<ReviewLogItem>>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<PageResult<ReviewLogItem>>>("/video/audit/logs", {
          params: { pageNum: params.page, pageSize: params.pageSize },
        })
        .then((r) => r.data),
    apiName: "fetchReviewLogs",
    setLoading,
  });
}

export async function fetchViolationReasons(
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<{ id: string; label: string }[]>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<{ id: string; label: string }[]>>("/video/audit/violation-reasons")
        .then((r) => r.data),
    apiName: "fetchViolationReasons",
    setLoading,
  });
}

export async function initMultipartUpload(
  fileName: string,
  contentType: string,
  md5: string,
  setLoading?: (loading: boolean) => void
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
    apiName: "initMultipartUpload",
    setLoading,
  });
  return res.data as string;
}

export async function uploadPart(
  uploadId: string,
  partNumber: number,
  chunk: Blob,
  setLoading?: (loading: boolean) => void
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
    apiName: "uploadPart",
    setLoading,
  });
  return res.data as string;
}

export async function completeMultipartUpload(
  fileName: string,
  uploadId: string,
  md5: string,
  parts: { partNumber: number; etag: string }[],
  setLoading?: (loading: boolean) => void
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
    apiName: "completeMultipartUpload",
    setLoading,
  });
}

export async function uploadVideo(
  file: File,
  onProgress?: (percent: number) => void
): Promise<string> {
  const md5 = await calculateMD5(file);

  const uploadId = await initMultipartUpload(
    file.name,
    file.type || "application/octet-stream",
    md5
  );

  const chunks = Math.ceil(file.size / CHUNK_SIZE);
  const parts: { partNumber: number; etag: string }[] = [];

  for (let i = 0; i < chunks; i++) {
    const partNumber = i + 1;
    const start = i * CHUNK_SIZE;
    const end = Math.min(file.size, start + CHUNK_SIZE);
    const chunk = file.slice(start, end);

    const etag = await uploadPart(uploadId, partNumber, chunk);
    parts.push({ partNumber, etag });

    if (onProgress) {
      onProgress(Math.round(((i + 1) / chunks) * 100));
    }
  }

  await completeMultipartUpload(file.name, uploadId, md5, parts);

  return uploadId;
}

export async function uploadCoverImage(
  file: File,
  setLoading?: (loading: boolean) => void
): Promise<FileInfo> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await handleRequest({
    requestFn: () =>
      request.instance
        .post<ApiResponse<FileInfo>>("/file/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then((r) => r.data),
    apiName: "uploadCoverImage",
    setLoading,
  });

  return res.data as FileInfo;
}

export async function uploadCover(
  file: Blob,
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<string>> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await handleRequest({
    requestFn: () =>
      request.instance
        .post<ApiResponse<FileInfo>>("/files/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then((r) => r.data),
    apiName: "uploadCover",
    setLoading,
  });

  return { code: 200, msg: "ok", data: (res.data as FileInfo).filePath };
}

export async function fetchUploadTaskList(
  params: UploadTaskListParams,
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<UploadTaskListResponse>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<UploadTaskListResponse>>("/video/detail/upload/list", {
          params,
        })
        .then((r) => r.data),
    apiName: "fetchUploadTaskList",
    setLoading,
  });
}
