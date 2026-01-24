import { request } from "../axios";
import type { ApiResponse } from "../types";
import { 
  mockVideos, 
  mockInitialAiQueueItems, 
  mockInitialManualQueueItems, 
  mockVideoUploadTasks,
  mockVideoCategories,
  mockTagOptions,
  mockVideoDrafts
} from "../mock/admin/video";

export type VideoCategory = {
  id: string;
  name: string;
  children: { id: string; name: string }[];
};

export type VideoTag = {
  id: string;
  name: string;
};

export async function fetchVideoCategories() {
  try {
    return await request.get<VideoCategory[]>("/admin/content/video/categories");
  } catch (error) {
    console.error("fetchVideoCategories API Error:", error);
    if (import.meta.env.DEV) {
      return mockVideoCategories;
    }
    throw error;
  }
}

export async function fetchTagOptions() {
  try {
    return await request.get<VideoTag[]>("/admin/content/video/tags");
  } catch (error) {
    console.error("fetchTagOptions API Error:", error);
    if (import.meta.env.DEV) {
      return mockTagOptions;
    }
    throw error;
  }
}

export async function fetchDraftList(params: { page: number; pageSize: number }) {
  try {
    return await request.get<{ list: DraftItem[]; total: number }>("/admin/content/video/draft/list", { params });
  } catch (error) {
    console.error("fetchDraftList API Error:", error);
    if (import.meta.env.DEV) {
      return {
        list: mockVideoDrafts,
        total: mockVideoDrafts.length
      };
    }
    throw error;
  }
}

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
  try {
    return await request.post<UploadInitResponse>(
      "/admin/content/video/upload/init",
      data
    );
  } catch (error) {
    console.error("initVideoUpload API Error:", error);
    throw error;
  }
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

  try {
    return await request.post<UploadChunkResponse>(
      "/admin/content/video/upload/chunk",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      }
    );
  } catch (error) {
    console.error("uploadVideoChunk API Error:", error);
    throw error;
  }
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
  try {
    return await request.post<UploadMergeResponse>(
      "/admin/content/video/upload/merge",
      data
    );
  } catch (error) {
    console.error("mergeVideoUpload API Error:", error);
    throw error;
  }
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
  // Watermark
  watermarkEnabled?: boolean;
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
  try {
    return await request.get<UploadTaskListResponse>(
      "/admin/content/video/upload/list",
      {
        params
      }
    );
  } catch (error) {
    console.error("fetchUploadTaskList API Error:", error);
    if (import.meta.env.DEV) {
      console.warn("Using mock data for fetchUploadTaskList");
      return {
        list: mockVideoUploadTasks,
        total: mockVideoUploadTasks.length
      };
    }
    throw error;
  }
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

export async function fetchVideoList(params: VideoListParams): Promise<ApiResponse<VideoListResponse>> {
  try {
    const response = await request.instance.get<ApiResponse<VideoListResponse>>("/admin/content/video/list", {
      params
    });
    return response.data;
  } catch (error) {
    console.error("fetchVideoList API Error:", error);
    if (import.meta.env.DEV) {
      console.warn("Using mock data for fetchVideoList");
      return {
        code: 200,
        msg: "",
        data: {
          list: mockVideos,
          total: mockVideos.length
        }
      };
    }
    throw error;
  }
}

export type BatchUpdateVideoStatusRequest = {
  ids: string[];
  status: Exclude<VideoStatus, "draft">;
};

export async function batchUpdateVideoStatus(data: BatchUpdateVideoStatusRequest) {
  try {
    return await request.post<boolean>("/admin/content/video/status/batch", data);
  } catch (error) {
    console.error("batchUpdateVideoStatus API Error:", error);
    throw error;
  }
}

export type ReviewQueueType = "ai" | "manual";

export type ReviewStatus = "pending" | "approved" | "rejected";

export type RiskLevel = "low" | "medium" | "high";

export type ReviewQueueItem = {
  id: string;
  title: string;
  uploader: string;
  category: string;
  status: ReviewStatus;
  riskLevel: RiskLevel;
  isAiChecked: boolean;
  createdAt: string;
};

export type ReviewLogItem = {
  id: string;
  videoId: string;
  title: string;
  reviewer: string;
  reviewedAt: string;
  result: "approved" | "rejected";
  remark: string;
};

export type ChapterItem = {
  id: string;
  title: string;
  timeInSeconds: number;
};

export type SubtitleTrack = {
  id: string;
  language: string;
  fileName: string;
};

export type DraftItem = {
  id: string;
  title: string;
  category: string;
  description: string;
  coverImage?: string;
  createdAt: string;
  updatedAt: string;
};

export type PermissionType = "public" | "private" | "password";

export type WatermarkType = "text" | "image";

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

export async function fetchReviewQueue(params: ReviewQueueParams): Promise<ApiResponse<ReviewQueueResponse>> {
  try {
    const response = await request.instance.get<ApiResponse<ReviewQueueResponse>>(
      "/admin/content/video/review/list",
      {
        params
      }
    );
    return response.data;
  } catch (error) {
    console.error("fetchReviewQueue API Error:", error);
    if (import.meta.env.DEV) {
      console.warn("Using mock data for fetchReviewQueue");
      return {
        code: 200,
        msg: "",
        data: {
          list: params.queueType === "ai" ? mockInitialAiQueueItems : mockInitialManualQueueItems,
          total: 100
        }
      };
    }
    throw error;
  }
}

export type SubmitReviewRequest = {
  reviewId: string;
  status: Exclude<ReviewStatus, "pending">;
  reason?: string;
};

export async function submitReviewResult(data: SubmitReviewRequest): Promise<ApiResponse<boolean>> {
  try {
    const response = await request.instance.post<ApiResponse<boolean>>("/admin/content/video/review/submit", data);
    return response.data;
  } catch (error) {
    console.error("submitReviewResult API Error:", error);
    throw error;
  }
}
