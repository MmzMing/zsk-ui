import { request } from "../axios";

export type UploadInitRequest = {
  title: string;
  category: string;
  description?: string;
  fileName: string;
  fileSize: number;
  fileMd5: string;
  enableAiCheck: boolean;
};

export type UploadInitResponse = {
  uploadId: string;
  needUpload: boolean;
  uploadedChunks: number[];
};

export async function initVideoUpload(data: UploadInitRequest) {
  return request.post<UploadInitResponse>(
    "/admin/content/video/upload/init",
    data
  );
}

export type UploadChunkRequest = {
  uploadId: string;
  chunkIndex: number;
  chunkCount: number;
  chunkSize: number;
  file: Blob;
};

export type UploadChunkResponse = {
  uploadId: string;
  chunkIndex: number;
  received: boolean;
};

export async function uploadVideoChunk(requestParams: UploadChunkRequest) {
  const formData = new FormData();
  formData.append("uploadId", requestParams.uploadId);
  formData.append("chunkIndex", String(requestParams.chunkIndex));
  formData.append("chunkCount", String(requestParams.chunkCount));
  formData.append("chunkSize", String(requestParams.chunkSize));
  formData.append("content", requestParams.file);

  return request.post<UploadChunkResponse>(
    "/admin/content/video/upload/chunk",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  );
}

export type UploadMergeRequest = {
  uploadId: string;
  fileMd5: string;
};

export type UploadMergeResponse = {
  videoId: string;
  playUrl: string;
};

export async function mergeVideoUpload(data: UploadMergeRequest) {
  return request.post<UploadMergeResponse>(
    "/admin/content/video/upload/merge",
    data
  );
}

export type UploadTaskStatus = "waiting" | "uploading" | "success" | "error";

export type UploadTaskItem = {
  id: string;
  title: string;
  fileName: string;
  category: string;
  tags?: string[];
  size: number;
  status: UploadTaskStatus;
  progress: number;
  isAiChecked: boolean;
  aiRiskLevel?: "low" | "medium" | "high";
  coverImage?: string;
  createdAt: string;
};

export type UploadTaskListParams = {
  page: number;
  pageSize: number;
  status?: UploadTaskStatus | "all";
  keyword?: string;
};

export type UploadTaskListResponse = {
  list: UploadTaskItem[];
  total: number;
};

export async function fetchUploadTaskList(params: UploadTaskListParams) {
  return request.get<UploadTaskListResponse>(
    "/admin/content/video/upload/list",
    {
      params
    }
  );
}

export type VideoStatus = "draft" | "published" | "offline" | "pending" | "approved" | "rejected" | "scheduled";

export type VideoItem = {
  id: string;
  title: string;
  category: string;
  status: VideoStatus;
  duration: string;
  plays: number;
  likes: number;
  comments: number;
  createdAt: string;
  updatedAt: string;
  cover?: string;
  tags?: string[];
  videoUrl?: string;
  description?: string;
  pinned?: boolean;
  recommended?: boolean;
};

export type VideoListParams = {
  page: number;
  pageSize: number;
  status?: VideoStatus | "all";
  category?: string;
  keyword?: string;
};

export type VideoListResponse = {
  list: VideoItem[];
  total: number;
};

export async function fetchVideoList(params: VideoListParams) {
  return request.get<VideoListResponse>("/admin/content/video/list", {
    params
  });
}

export type BatchUpdateVideoStatusRequest = {
  ids: string[];
  status: Exclude<VideoStatus, "draft">;
};

export async function batchUpdateVideoStatus(data: BatchUpdateVideoStatusRequest) {
  return request.post<boolean>("/admin/content/video/status/batch", data);
}

export type ReviewQueueType = "ai" | "manual";

export type ReviewStatus = "pending" | "approved" | "rejected";

export type ReviewQueueItem = {
  id: string;
  title: string;
  uploader: string;
  category: string;
  status: ReviewStatus;
  riskLevel: "low" | "medium" | "high";
  isAiChecked: boolean;
  createdAt: string;
};

export type ReviewQueueParams = {
  queueType: ReviewQueueType;
  status?: ReviewStatus | "all";
  keyword?: string;
  page: number;
  pageSize: number;
};

export type ReviewQueueResponse = {
  list: ReviewQueueItem[];
  total: number;
};

export async function fetchReviewQueue(params: ReviewQueueParams) {
  return request.get<ReviewQueueResponse>(
    "/admin/content/video/review/list",
    {
      params
    }
  );
}

export type SubmitReviewRequest = {
  reviewId: string;
  status: Exclude<ReviewStatus, "pending">;
  reason?: string;
};

export async function submitReviewResult(data: SubmitReviewRequest) {
  return request.post<boolean>("/admin/content/video/review/submit", data);
}
