// ===== 1. 依赖导入区域 =====
import { request, handleRequestWithMock, handleApiCall } from "../axios";
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
} from "../mock/admin/video";

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

/**
 * 视频分类类型
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
 */
export type VideoTag = {
  /** 标签ID */
  id: string;
  /** 标签名称 */
  name: string;
};

/**
 * 上传初始化请求参数
 */
export type UploadInitRequest = {
  /** 视频标题 */
  title: string;
  /** 视频分类 */
  category: string;
  /** 视频描述 */
  description?: string;
  /** 文件名 */
  fileName: string;
  /** 文件大小 */
  fileSize: number;
  /** 文件MD5 */
  fileMd5: string;
  /** 是否开启AI审核 */
  enableAiCheck: boolean;
};

/**
 * 上传初始化响应数据
 */
export type UploadInitResponse = {
  /** 上传ID */
  uploadId: string;
  /** 是否需要上传 */
  needUpload: boolean;
  /** 已上传分片索引 */
  uploadedChunks: number[];
};

/**
 * 上传分片请求参数
 */
export type UploadChunkRequest = {
  /** 上传ID */
  uploadId: string;
  /** 分片索引 */
  chunkIndex: number;
  /** 总分片数 */
  chunkCount: number;
  /** 分片大小 */
  chunkSize: number;
  /** 分片文件 */
  file: Blob;
};

/**
 * 上传分片响应数据
 */
export type UploadChunkResponse = {
  /** 上传ID */
  uploadId: string;
  /** 分片索引 */
  chunkIndex: number;
  /** 是否接收成功 */
  received: boolean;
};

/**
 * 上传合并请求参数
 */
export type UploadMergeRequest = {
  /** 上传ID */
  uploadId: string;
  /** 文件MD5 */
  fileMd5: string;
};

/**
 * 上传合并响应数据
 */
export type UploadMergeResponse = {
  /** 视频ID */
  videoId: string;
  /** 播放地址 */
  playUrl: string;
};

/**
 * 上传任务状态
 */
export type UploadTaskStatus = "waiting" | "uploading" | "success" | "error";

/**
 * 上传任务项
 */
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
    /** 类型 */
    type: "text" | "image";
    /** 文本内容 */
    text?: string;
    /** 字体大小 */
    fontSize?: number;
    /** 透明度 */
    opacity: number;
    /** 位置 */
    position: string;
    /** 图片名称 */
    imageName?: string;
    /** 缩放比例 */
    scale?: number;
    /** 自动适应 */
    autoFit?: boolean;
  };
};

/**
 * 上传任务列表查询参数
 */
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

/**
 * 上传任务列表响应
 */
export type UploadTaskListResponse = {
  /** 任务列表 */
  list: UploadTaskItem[];
  /** 总条数 */
  total: number;
};

/**
 * 视频状态
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
 * 视频项类型
 */
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

/**
 * 视频列表查询参数
 */
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

/**
 * 视频列表响应
 */
export type VideoListResponse = {
  /** 视频列表 */
  list: VideoItem[];
  /** 总条数 */
  total: number;
};

/**
 * 批量更新视频状态请求参数
 */
export type BatchUpdateVideoStatusRequest = {
  /** 视频ID列表 */
  ids: string[];
  /** 目标状态 */
  status: Exclude<VideoStatus, "draft">;
};

/**
 * 审核队列类型
 */
export type ReviewQueueType = "ai" | "manual";

/**
 * 审核状态
 */
export type ReviewStatus = "pending" | "approved" | "rejected";

/**
 * 风险等级
 */
export type RiskLevel = "low" | "medium" | "high";

/**
 * 审核队列项
 */
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

/**
 * 审核日志项
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
  /** 备注 */
  remark: string;
};

/**
 * 视频章节项
 */
export type ChapterItem = {
  /** 章节ID */
  id: string;
  /** 章节标题 */
  title: string;
  /** 时间点(秒) */
  timeInSeconds: number;
};

/**
 * 字幕轨道
 */
export type SubtitleTrack = {
  /** 轨道ID */
  id: string;
  /** 语言 */
  language: string;
  /** 文件名 */
  fileName: string;
};

/**
 * 草稿项
 */
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

/**
 * 权限类型
 */
export type PermissionType = "public" | "private" | "password";

/**
 * 水印类型
 */
export type WatermarkType = "text" | "image";

/**
 * 水印位置
 */
export type WatermarkPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "center-left"
  | "center"
  | "center-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

/**
 * 审核队列查询参数
 */
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

/**
 * 审核队列响应
 */
export type ReviewQueueResponse = {
  /** 审核项列表 */
  list: ReviewQueueItem[];
  /** 总条数 */
  total: number;
};

/**
 * 提交审核结果请求参数
 */
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

/**
 * 批量提交审核结果请求参数
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
 * 批量提交审核结果
 * @param data 批量审核结果参数
 */
export async function submitBatchReviewResult(
  data: SubmitBatchReviewRequest
): Promise<ApiResponse<boolean>> {
  return handleRequestWithMock(
    () =>
      request.instance
        .post<ApiResponse<boolean>>("/admin/content/video/review/batch-submit", data)
        .then((r) => r.data),
    true,
    "submitBatchReviewResult"
  );
}

/**
 * 获取审核日志
 * @param params 查询参数
 */
export async function fetchReviewLogs(params: {
  page: number;
  pageSize: number;
  reviewer?: string;
}): Promise<ApiResponse<ReviewLogItem[]>> {
  return handleRequestWithMock(
    () =>
      request.instance
        .get<ApiResponse<ReviewLogItem[]>>("/admin/content/video/review/logs", {
          params,
        })
        .then((r) => r.data),
    mockReviewLogs,
    "fetchReviewLogs"
  );
}

/**
 * 获取视频分类
 */
export async function fetchVideoCategories(): Promise<ApiResponse<VideoCategory[]>> {
  return handleRequestWithMock(
    () =>
      request.instance
        .get<ApiResponse<VideoCategory[]>>("/admin/content/video/categories")
        .then((r) => r.data),
    mockVideoCategories,
    "fetchVideoCategories"
  );
}

/**
 * 获取标签选项
 */
export async function fetchTagOptions(): Promise<ApiResponse<VideoTag[]>> {
  return handleRequestWithMock(
    () =>
      request.instance
        .get<ApiResponse<VideoTag[]>>("/admin/content/video/tags")
        .then((r) => r.data),
    mockTagOptions,
    "fetchTagOptions"
  );
}

/**
 * 获取草稿列表
 * @param params 分页参数
 */
export async function fetchDraftList(params: {
  page: number;
  pageSize: number;
}): Promise<ApiResponse<{ list: DraftItem[]; total: number }>> {
  return handleRequestWithMock(
    () =>
      request.instance
        .get<ApiResponse<{ list: DraftItem[]; total: number }>>(
          "/admin/content/video/draft/list",
          { params }
        )
        .then((r) => r.data),
    {
      list: mockVideoDrafts,
      total: mockVideoDrafts.length,
    },
    "fetchDraftList"
  );
}

/**
 * 保存草稿
 * @param data 草稿数据
 */
export async function saveDraft(
  data: Omit<DraftItem, "id" | "createdAt" | "updatedAt">
): Promise<ApiResponse<DraftItem>> {
  return handleRequestWithMock(
    () =>
      request.instance
        .post<ApiResponse<DraftItem>>("/admin/content/video/draft", data)
        .then((r) => r.data),
    {
      id: "mock-draft-id",
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as DraftItem,
    "saveDraft"
  );
}

/**
 * 删除草稿
 * @param id 草稿ID
 */
export async function deleteDraft(id: string): Promise<ApiResponse<boolean>> {
  return handleRequestWithMock(
    () =>
      request.instance
        .delete<ApiResponse<boolean>>(`/admin/content/video/draft/${id}`)
        .then((r) => r.data),
    true,
    "deleteDraft"
  );
}

/**
 * 初始化视频上传
 * @param data 初始化参数
 */
export async function initVideoUpload(
  data: UploadInitRequest
): Promise<ApiResponse<UploadInitResponse>> {
  return handleRequestWithMock(
    () =>
      request.instance
        .post<ApiResponse<UploadInitResponse>>(
          "/admin/content/video/upload/init",
          data
        )
        .then((r) => r.data),
    {
      uploadId: "mock-upload-id",
      needUpload: true,
      uploadedChunks: [],
    },
    "initVideoUpload"
  );
}

/**
 * 上传视频分片
 * @param requestParams 分片参数
 */
export async function uploadVideoChunk(
  requestParams: UploadChunkRequest
): Promise<ApiResponse<UploadChunkResponse>> {
  const formData = new FormData();
  formData.append("uploadId", requestParams.uploadId);
  formData.append("chunkIndex", String(requestParams.chunkIndex));
  formData.append("chunkCount", String(requestParams.chunkCount));
  formData.append("chunkSize", String(requestParams.chunkSize));
  formData.append("content", requestParams.file);

  return handleRequestWithMock(
    () =>
      request.instance
        .post<ApiResponse<UploadChunkResponse>>(
          "/admin/content/video/upload/chunk",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        )
        .then((r) => r.data),
    {
      uploadId: requestParams.uploadId,
      chunkIndex: requestParams.chunkIndex,
      received: true,
    },
    "uploadVideoChunk"
  );
}

/**
 * 合并视频上传
 * @param data 合并参数
 */
export async function mergeVideoUpload(
  data: UploadMergeRequest
): Promise<ApiResponse<UploadMergeResponse>> {
  return handleRequestWithMock(
    () =>
      request.instance
        .post<ApiResponse<UploadMergeResponse>>(
          "/admin/content/video/upload/merge",
          data
        )
        .then((r) => r.data),
    {
      videoId: "mock-video-id",
      playUrl: "http://mock-play-url.com/video.mp4",
    },
    "mergeVideoUpload"
  );
}

/**
 * 获取上传任务列表
 * @param params 查询参数
 */
export async function fetchUploadTaskList(
  params: UploadTaskListParams
): Promise<ApiResponse<UploadTaskListResponse>> {
  return handleRequestWithMock(
    () =>
      request.instance
        .get<ApiResponse<UploadTaskListResponse>>(
          "/admin/content/video/upload/list",
          {
            params,
          }
        )
        .then((r) => r.data),
    {
      list: mockVideoUploadTasks,
      total: mockVideoUploadTasks.length,
    },
    "fetchUploadTaskList"
  );
}

/**
 * 获取视频列表
 * @param params 查询参数
 * @param setLoading 加载状态设置函数
 */
export async function fetchVideoList(
  params: VideoListParams,
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<VideoListResponse>> {
  return handleApiCall({
    requestFn: () =>
      handleRequestWithMock(
        () =>
          request.instance
            .get<ApiResponse<VideoListResponse>>("/admin/content/video/list", {
              params,
            })
            .then((r) => r.data),
        {
          list: mockVideos,
          total: mockVideos.length,
        },
        "fetchVideoList"
      ),
    setLoading,
  });
}

/**
 * 批量更新视频状态
 * @param data 更新参数
 * @param setLoading 加载状态设置函数
 */
export async function batchUpdateVideoStatus(
  data: BatchUpdateVideoStatusRequest,
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  return handleApiCall({
    requestFn: () =>
      handleRequestWithMock(
        () =>
          request.instance
            .post<ApiResponse<boolean>>("/admin/content/video/status/batch", data)
            .then((r) => r.data),
        true,
        "batchUpdateVideoStatus"
      ),
    setLoading,
  });
}

/**
 * 获取审核队列
 * @param params 查询参数
 */
export async function fetchReviewQueue(
  params: ReviewQueueParams
): Promise<ApiResponse<ReviewQueueResponse>> {
  return handleRequestWithMock(
    () =>
      request.instance
        .get<ApiResponse<ReviewQueueResponse>>(
          "/admin/content/video/review/list",
          {
            params,
          }
        )
        .then((r) => r.data),
    {
      list: mockReviewQueueItems,
      total: mockReviewQueueItems.length,
    },
    "fetchReviewQueue"
  );
}

/**
 * 提交审核结果
 * @param data 审核结果参数
 */
export async function submitReviewResult(
  data: SubmitReviewRequest
): Promise<ApiResponse<boolean>> {
  return handleRequestWithMock(
    () =>
      request.instance
        .post<ApiResponse<boolean>>("/admin/content/video/review/submit", data)
        .then((r) => r.data),
    true,
    "submitReviewResult"
  );
}

/**
 * 获取违规原因列表
 */
export async function fetchViolationReasons(): Promise<ApiResponse<{ id: string; label: string }[]>> {
  return handleRequestWithMock(
    () =>
      request.instance
        .get<ApiResponse<{ id: string; label: string }[]>>("/admin/content/video/review/violation-reasons")
        .then((r) => r.data),
    mockViolationReasons,
    "fetchViolationReasons"
  );
}

/**
 * 更新视频信息
 * @param data 视频信息
 * @param setLoading 加载状态设置函数
 */
export async function updateVideo(
  data: Partial<VideoItem> & { id: string },
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  return handleApiCall({
    requestFn: () =>
      handleRequestWithMock(
        () =>
          request.instance
            .put<ApiResponse<boolean>>(`/admin/content/video/${data.id}`, data)
            .then((r) => r.data),
        true,
        "updateVideo"
      ),
    setLoading,
  });
}

/**
 * 上传视频封面
 * @param file 封面文件
 */
export async function uploadCover(file: Blob): Promise<ApiResponse<string>> {
  return handleRequestWithMock(
    () => {
      const formData = new FormData();
      formData.append("file", file);
      return request.instance
        .post<ApiResponse<string>>("/admin/content/video/upload/cover", formData)
        .then((r) => r.data);
    },
    "public/DefaultImage/MyDefaultHomeVodie.png",
    "uploadCover"
  );
}

/**
 * 删除视频
 * @param id 视频ID
 * @param setLoading 加载状态设置函数
 */
export async function deleteVideo(
  id: string,
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  return handleApiCall({
    requestFn: () =>
      handleRequestWithMock(
        () =>
          request.instance
            .delete<ApiResponse<boolean>>(`/admin/content/video/${id}`)
            .then((r) => r.data),
        true,
        "deleteVideo"
      ),
    setLoading,
  });
}

/**
 * 批量删除视频
 * @param ids 视频ID列表
 * @param setLoading 加载状态设置函数
 */
export async function batchDeleteVideos(
  ids: string[],
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  return handleApiCall({
    requestFn: () =>
      handleRequestWithMock(
        () =>
          request.instance
            .post<ApiResponse<boolean>>("/admin/content/video/batch-delete", { ids })
            .then((r) => r.data),
        true,
        "batchDeleteVideos"
      ),
    setLoading,
  });
}

/**
 * 切换视频置顶状态
 * @param id 视频ID
 * @param pinned 是否置顶
 * @param setLoading 加载状态设置函数
 */
export async function toggleVideoPinned(
  id: string,
  pinned: boolean,
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  return handleApiCall({
    requestFn: () =>
      handleRequestWithMock(
        () =>
          request.instance
            .post<ApiResponse<boolean>>(`/admin/content/video/${id}/pinned`, { pinned })
            .then((r) => r.data),
        true,
        "toggleVideoPinned"
      ),
    setLoading,
  });
}

/**
 * 切换视频推荐状态
 * @param id 视频ID
 * @param recommended 是否推荐
 * @param setLoading 加载状态设置函数
 */
export async function toggleVideoRecommended(
  id: string,
  recommended: boolean,
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  return handleApiCall({
    requestFn: () =>
      handleRequestWithMock(
        () =>
          request.instance
            .post<ApiResponse<boolean>>(`/admin/content/video/${id}/recommended`, {
              recommended,
            })
            .then((r) => r.data),
        true,
        "toggleVideoRecommended"
      ),
    setLoading,
  });
}

/**
 * 获取视频详情
 * @param id 视频ID
 */
export async function fetchVideoDetail(id: string): Promise<ApiResponse<VideoItem>> {
  return handleRequestWithMock(
    () => request.instance.get(`/admin/content/video/${id}`).then((r) => r.data),
    mockVideos.find((v) => v.id === id) || mockVideos[0],
    "fetchVideoDetail"
  );
}
