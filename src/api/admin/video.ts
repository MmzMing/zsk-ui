import { request, handleRequest } from "../request";
import type { ApiResponse } from "../types";

const CHUNK_SIZE = 5 * 1024 * 1024;

// ===== 类型定义 =====

/**
 * 视频详情类型
 * @description 对应后端 video_detail 表的实体结构
 */
export type BackendVideoDetail = {
  /** 主键ID */
  id?: number;
  /** 文件ID */
  fileId?: string;
  /** 用户ID */
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
  /** 封面URL */
  coverUrl?: string;
  /** 视频URL */
  videoUrl?: string;
};

/**
 * 视频评论类型
 * @description 对应后端 video_comment 表的实体结构
 */
export type BackendVideoComment = {
  /** 评论ID */
  id?: number;
  /** 视频ID */
  videoId?: string;
  /** 评论用户ID */
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

/**
 * 视频评论项（前端展示用）
 * @description 视频评论列表项
 */
export type CommentItem = {
  /** 评论ID */
  id: string;
  /** 视频ID */
  videoId: string;
  /** 用户名 */
  userName: string;
  /** 用户头像 */
  avatar?: string;
  /** 评论内容 */
  content: string;
  /** 创建时间 */
  createdAt: string;
};

/**
 * 分页结果类型
 */
export type PageResult<T> = {
  /** 数据列表 */
  rows: T[];
  /** 总数 */
  total: number;
};

/**
 * 文件信息类型
 */
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

/**
 * 视频分类类型
 */
export type VideoCategory = {
  /** 分类ID */
  id: string;
  /** 分类名称 */
  name: string;
  /** 子分类 */
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
 * 视频状态枚举
 * @description 视频状态值
 */
export type VideoStatus = "pending" | "published" | "offline" | "draft";

/**
 * 审核状态枚举
 * @description 审核状态值
 */
export type ReviewStatus = "pending" | "approved" | "rejected";

/**
 * 风险等级枚举
 * @description 内容风险等级
 */
export type RiskLevel = "low" | "medium" | "high";

/**
 * 审核队列项
 * @description 视频审核队列中的项
 */
export type ReviewQueueItem = {
  /** ID */
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
  /** 是否AI检测 */
  isAiChecked: boolean;
  /** 创建时间 */
  createdAt: string;
};

/**
 * 审核日志项
 * @description 审核操作日志
 */
export type ReviewLogItem = {
  /** 日志ID */
  id: string;
  /** 视频ID */
  videoId: string;
  /** 视频标题 */
  videoTitle: string;
  /** 审核人 */
  reviewer: string;
  /** 审核时间 */
  reviewedAt: string;
  /** 审核结果 */
  result: string;
  /** 备注 */
  remark: string;
};

/**
 * 草稿项
 * @description 视频草稿
 */
export type DraftItem = {
  /** 草稿ID */
  id: string;
  /** 标题 */
  title: string;
  /** 分类 */
  category: string;
  /** 描述 */
  description?: string;
  /** 封面图 */
  coverImage?: string;
  /** 更新时间 */
  updatedAt: string;
};

/**
 * 章节项
 * @description 视频章节
 */
export type ChapterItem = {
  /** 章节ID */
  id: string;
  /** 章节标题 */
  title: string;
  /** 开始时间（秒） */
  startTime: number;
  /** 结束时间（秒） */
  endTime: number;
  /** 时间字符串 */
  time?: string;
  /** 时间秒数 */
  timeInSeconds?: number;
};

/**
 * 权限类型
 * @description 视频访问权限
 */
export type PermissionType = "public" | "private" | "paid" | "password";

/**
 * 视频项（兼容旧代码）
 * @deprecated 请使用 BackendVideoDetail
 */
export type VideoItem = BackendVideoDetail;

// ===== API 函数 =====

/**
 * 获取视频分类列表
 * @param setLoading 设置加载状态回调
 * @returns 分类列表响应
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
 * @param setLoading 设置加载状态回调
 * @returns 标签列表响应
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
 * @param params 查询参数
 * @param setLoading 设置加载状态回调
 * @returns 视频列表响应
 */
export async function fetchVideoList(
  params: {
    page: number;
    pageSize: number;
    category?: string;
    keyword?: string;
  },
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<PageResult<BackendVideoDetail>>> {
  return handleRequest({
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
}

/**
 * 获取视频详情
 * @param id 视频ID
 * @param setLoading 设置加载状态回调
 * @returns 视频详情响应
 */
export async function fetchVideoDetail(
  id: string,
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<BackendVideoDetail>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<BackendVideoDetail>>(`/video/detail/${id}`)
        .then((r) => r.data),
    apiName: "fetchVideoDetail",
    setLoading,
  });
}

/**
 * 更新视频
 * @param data 视频数据
 * @param setLoading 设置加载状态回调
 * @returns 更新结果响应
 */
export async function updateVideo(
  data: Partial<BackendVideoDetail> & { id: number },
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .put<ApiResponse<boolean>>("/video/detail", data)
        .then((r) => r.data),
    apiName: "updateVideo",
    setLoading,
  });
}

/**
 * 删除视频
 * @param id 视频ID
 * @param setLoading 设置加载状态回调
 * @returns 删除结果响应
 */
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

/**
 * 批量删除视频
 * @param ids 视频ID列表
 * @param setLoading 设置加载状态回调
 * @returns 删除结果响应
 */
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

/**
 * 批量更新视频状态
 * @param data 更新数据
 * @param setLoading 设置加载状态回调
 * @returns 更新结果响应
 */
export async function batchUpdateVideoStatus(
  data: { ids: number[]; status: number },
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .put<ApiResponse<boolean>>("/video/detail/status/batch", data)
        .then((r) => r.data),
    apiName: "batchUpdateVideoStatus",
    setLoading,
  });
}

/**
 * 切换视频置顶状态
 * @param id 视频ID
 * @param pinned 是否置顶（0-否 1-是）
 * @param setLoading 设置加载状态回调
 * @returns 更新结果响应
 */
export async function toggleVideoPinned(
  id: string,
  pinned: number,
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .put<ApiResponse<boolean>>(`/video/detail/${id}/pinned`, null, {
          params: { pinned },
        })
        .then((r) => r.data),
    apiName: "toggleVideoPinned",
    setLoading,
  });
}

/**
 * 切换视频推荐状态
 * @param id 视频ID
 * @param recommended 是否推荐（0-否 1-是）
 * @param setLoading 设置加载状态回调
 * @returns 更新结果响应
 */
export async function toggleVideoRecommended(
  id: string,
  recommended: number,
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .put<ApiResponse<boolean>>(`/video/detail/${id}/recommended`, null, {
          params: { recommended },
        })
        .then((r) => r.data),
    apiName: "toggleVideoRecommended",
    setLoading,
  });
}

/**
 * 获取视频评论列表
 * @param videoId 视频ID
 * @param setLoading 设置加载状态回调
 * @returns 评论列表响应
 */
export async function fetchVideoComments(
  videoId: string,
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<CommentItem[]>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<CommentItem[]>>("/video/comment/list", {
          params: { videoId },
        })
        .then((r) => r.data),
    apiName: "fetchVideoComments",
    setLoading,
  });
}

/**
 * 删除视频评论
 * @param commentId 评论ID
 * @param setLoading 设置加载状态回调
 * @returns 删除结果响应
 */
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

/**
 * 获取草稿列表
 * @param params 查询参数
 * @param setLoading 设置加载状态回调
 * @returns 草稿列表响应
 */
export async function fetchDraftList(
  params: { page: number; pageSize: number },
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<PageResult<BackendVideoDetail>>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<PageResult<BackendVideoDetail>>>("/video/detail/draft/list", {
          params: { pageNum: params.page, pageSize: params.pageSize },
        })
        .then((r) => r.data),
    apiName: "fetchDraftList",
    setLoading,
  });
}

/**
 * 保存草稿
 * @param data 草稿数据
 * @param setLoading 设置加载状态回调
 * @returns 保存结果响应（返回草稿ID）
 */
export async function saveDraft(
  data: Partial<BackendVideoDetail>,
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<number>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .post<ApiResponse<number>>("/video/detail/draft", { ...data, status: 3 })
        .then((r) => r.data),
    apiName: "saveDraft",
    setLoading,
  });
}

/**
 * 删除草稿
 * @param id 草稿ID
 * @param setLoading 设置加载状态回调
 * @returns 删除结果响应
 */
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

/**
 * 获取审核队列
 * @param params 查询参数
 * @param setLoading 设置加载状态回调
 * @returns 审核队列响应
 */
export async function fetchReviewQueue(
  params: {
    status?: number;
    page: number;
    pageSize: number;
    keyword?: string;
  },
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<PageResult<BackendVideoDetail>>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<PageResult<BackendVideoDetail>>>("/video/audit/queue", {
          params: {
            auditStatus: params.status,
            pageNum: params.page,
            pageSize: params.pageSize,
            videoTitle: params.keyword,
          },
        })
        .then((r) => r.data),
    apiName: "fetchReviewQueue",
    setLoading,
  });
}

/**
 * 提交审核结果
 * @param data 审核数据
 * @param setLoading 设置加载状态回调
 * @returns 提交结果响应
 */
export async function submitReviewResult(
  data: { videoId: string; auditStatus: number; auditMind?: string },
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .post<ApiResponse<boolean>>("/video/audit/submit", data)
        .then((r) => r.data),
    apiName: "submitReviewResult",
    setLoading,
  });
}

/**
 * 批量提交审核结果
 * @param data 批量审核数据
 * @param setLoading 设置加载状态回调
 * @returns 提交结果响应
 */
export async function submitBatchReviewResult(
  data: { videoIds: string[]; auditStatus: number; auditMind?: string },
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<boolean>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .post<ApiResponse<boolean>>("/video/audit/submitBatch", data)
        .then((r) => r.data),
    apiName: "submitBatchReviewResult",
    setLoading,
  });
}

/**
 * 获取审核日志
 * @param params 查询参数
 * @param setLoading 设置加载状态回调
 * @returns 审核日志响应
 */
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

/**
 * 获取违规原因列表
 * @param setLoading 设置加载状态回调
 * @returns 违规原因列表响应
 */
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

/**
 * 初始化分片上传
 * @param fileName 文件名
 * @param contentType 内容类型
 * @param md5 文件MD5
 * @param setLoading 设置加载状态回调
 * @returns 上传ID
 */
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

/**
 * 上传分片
 * @param uploadId 上传ID
 * @param partNumber 分片序号
 * @param chunk 分片数据
 * @param setLoading 设置加载状态回调
 * @returns 分片ETag
 */
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

/**
 * 完成分片上传
 * @param fileName 文件名
 * @param uploadId 上传ID
 * @param md5 文件MD5
 * @param parts 分片列表
 * @param setLoading 设置加载状态回调
 */
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

/**
 * 上传视频
 * @param file 视频文件
 * @param onProgress 进度回调
 * @returns 上传ID
 */
export async function uploadVideo(
  file: File,
  onProgress?: (percent: number) => void
): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const md5 = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

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

/**
 * 上传封面图片
 * @param file 图片文件
 * @param setLoading 设置加载状态回调
 * @returns 文件信息
 */
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

/**
 * 上传封面
 * @param file 图片数据
 * @param setLoading 设置加载状态回调
 * @returns 封面URL响应
 */
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

/**
 * 获取上传任务列表
 * @param params 查询参数
 * @param setLoading 设置加载状态回调
 * @returns 上传任务列表响应
 */
export async function fetchUploadTaskList(
  params: { page: number; pageSize: number; status?: string },
  setLoading?: (loading: boolean) => void
): Promise<ApiResponse<{ id: string; title: string; fileName: string; size: number; status: string; progress: number; createdAt: string }[]>> {
  return handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<{ id: string; title: string; fileName: string; size: number; status: string; progress: number; createdAt: string }[]>>("/video/detail/upload/list", {
          params,
        })
        .then((r) => r.data),
    apiName: "fetchUploadTaskList",
    setLoading,
  });
}
