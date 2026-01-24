import { request } from "../axios";
import {
  mockDocumentUploadTasks,
  mockDocumentCategories,
  mockTagOptions,
  mockDraftList,
  mockDocumentList,
  mockReviewQueueItems,
  mockAdminDocument
} from "../mock/admin/document";

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

export type DocumentUploadInitResponse = {
  uploadId: string;
  needUpload: boolean;
  presignedUrl?: string;
};

export async function initDocumentUpload(data: DocumentUploadInitRequest) {
  try {
    return await request.post<DocumentUploadInitResponse>(
      "/admin/content/doc/upload/init",
      data
    );
  } catch (error) {
    console.error("initDocumentUpload error:", error);
    throw error;
  }
}

export type DocumentUploadFinishRequest = {
  uploadId: string;
  status: "success" | "error";
  errorMsg?: string;
};

export async function finishDocumentUpload(data: DocumentUploadFinishRequest) {
  try {
    return await request.post<boolean>(
      "/admin/content/doc/upload/finish",
      data
    );
  } catch (error) {
    console.error("finishDocumentUpload error:", error);
    throw error;
  }
}

export async function removeDocumentUploadTask(id: string) {
  try {
    return await request.post<boolean>(
      "/admin/content/doc/upload/remove",
      { id }
    );
  } catch (error) {
    console.error("removeDocumentUploadTask error:", error);
    throw error;
  }
}

export async function retryDocumentUploadTask(id: string) {
  try {
    return await request.post<boolean>(
      "/admin/content/doc/upload/retry",
      { id }
    );
  } catch (error) {
    console.error("retryDocumentUploadTask error:", error);
    throw error;
  }
}

export type DocumentUploadTaskItem = {
  id: string;
  title: string;
  fileName: string;
  size: number;
  status: "waiting" | "uploading" | "processing" | "success" | "error";
  progress: number;
  createdAt: string;
};

export type DocumentUploadTaskListResponse = {
  list: DocumentUploadTaskItem[];
  total: number;
};

export async function fetchDocumentUploadTaskList(params: {
  page: number;
  pageSize: number;
  status?: string;
}) {
  const isDev = import.meta.env.DEV;
  try {
    const res = await request.get<DocumentUploadTaskListResponse>(
      "/admin/content/doc/upload/list",
      { params }
    );
    if (res) return res;
    throw new Error("Empty response");
  } catch (error) {
    console.error("fetchDocumentUploadTaskList error:", error);
    if (isDev) {
      return {
        list: mockDocumentUploadTasks,
        total: mockDocumentUploadTasks.length
      };
    }
    throw error;
  }
}

export type DocumentStatus = "draft" | "pending" | "approved" | "rejected" | "offline" | "scheduled" | "published";

export type DocumentItem = {
  id: string;
  title: string;
  category: string;
  description?: string;
  status: DocumentStatus;
  readCount: number;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
  cover?: string;
  tags?: string[];
  pinned?: boolean;
  recommended?: boolean;
};

export type DocCategory = {
  id: string;
  name: string;
  children?: DocCategory[];
};

export type DocTag = {
  label: string;
  value: string;
};

export async function fetchDocumentCategories() {
  const isDev = import.meta.env.DEV;
  try {
    const res = await request.get<DocCategory[]>("/admin/content/doc/categories");
    if (res) return res;
    throw new Error("Empty response");
  } catch (error) {
    console.error("fetchDocumentCategories error:", error);
    if (isDev) {
      return mockDocumentCategories;
    }
    throw error;
  }
}

export async function fetchTagOptions() {
  const isDev = import.meta.env.DEV;
  try {
    const res = await request.get<DocTag[]>("/admin/content/doc/tags");
    if (res) return res;
    throw new Error("Empty response");
  } catch (error) {
    console.error("fetchTagOptions error:", error);
    if (isDev) {
      return mockTagOptions;
    }
    throw error;
  }
}

export async function fetchDraftList(params: { page: number; pageSize: number; search?: string }) {
  const isDev = import.meta.env.DEV;
  try {
    const res = await request.get<DocumentListResponse>("/admin/content/doc/drafts", { params });
    if (res) return res;
    throw new Error("Empty response");
  } catch (error) {
    console.error("fetchDraftList error:", error);
    if (isDev) {
      return {
        list: mockDraftList,
        total: mockDraftList.length
      };
    }
    throw error;
  }
}

export type DocumentListResponse = {
  list: DocumentItem[];
  total: number;
};

export async function fetchDocumentList(params: {
  page: number;
  pageSize: number;
  status?: string;
  category?: string;
  keyword?: string;
}) {
  const isDev = import.meta.env.DEV;
  try {
    const res = await request.get<DocumentListResponse>(
      "/admin/content/doc/list",
      { params }
    );
    if (res) return res;
    throw new Error("Empty response");
  } catch (error) {
    console.error("fetchDocumentList error:", error);
    if (isDev) {
      return {
        list: mockDocumentList,
        total: mockDocumentList.length
      };
    }
    throw error;
  }
}

export async function batchUpdateDocumentStatus(data: {
  ids: string[];
  status: "published" | "offline";
}) {
  try {
    return await request.post<boolean>(
      "/admin/content/doc/status/batch",
      data
    );
  } catch (error) {
    console.error("batchUpdateDocumentStatus error:", error);
    throw error;
  }
}

export type ReviewStatus = "pending" | "approved" | "rejected";
export type RiskLevel = "low" | "medium" | "high";

export type DocumentReviewItem = {
  id: string;
  title: string;
  uploader: string;
  category: string;
  status: ReviewStatus;
  riskLevel: RiskLevel;
  isAiChecked: boolean;
  createdAt: string;
};

export type DocumentReviewLogItem = {
  id: string;
  docId: string;
  title: string;
  reviewer: string;
  reviewedAt: string;
  result: "approved" | "rejected";
  remark: string;
};

export type DocumentReviewQueueResponse = {
  list: DocumentReviewItem[];
  total: number;
};

export async function fetchDocumentReviewQueue(params: {
  page: number;
  pageSize: number;
  status?: string;
  keyword?: string;
}) {
  const isDev = import.meta.env.DEV;
  try {
    const res = await request.get<DocumentReviewQueueResponse>(
      "/admin/content/doc/review/list",
      { params }
    );
    if (res) return res;
    throw new Error("Empty response");
  } catch (error) {
    console.error("fetchDocumentReviewQueue error:", error);
    if (isDev) {
      return {
        list: mockReviewQueueItems,
        total: mockReviewQueueItems.length
      };
    }
    throw error;
  }
}

export async function submitDocumentReview(data: {
  reviewId: string;
  status: "approved" | "rejected";
  reason?: string;
}) {
  try {
    return await request.post<boolean>(
      "/admin/content/doc/review/submit",
      data
    );
  } catch (error) {
    console.error("submitDocumentReview error:", error);
    throw error;
  }
}

export type DocumentDetail = {
  id: string;
  title: string;
  content: string;
  category: string;
  status: DocumentStatus;
  tags: string[];
  cover?: string;
  seo?: {
    title: string;
    description: string;
    keywords: string[];
  };
};

export async function getDocumentDetail(id: string) {
  const isDev = import.meta.env.DEV;
  try {
    const res = await request.get<DocumentDetail>(`/admin/content/doc/${id}`);
    if (res) return res;
    throw new Error("Empty response");
  } catch (error) {
    console.error("getDocumentDetail error:", error);
    if (isDev) {
      return mockAdminDocument;
    }
    throw error;
  }
}

export async function createDocument(data: Partial<DocumentDetail>) {
  try {
    return await request.post<string>("/admin/content/doc/create", data);
  } catch (error) {
    console.error("createDocument error:", error);
    throw error;
  }
}

export async function updateDocument(id: string, data: Partial<DocumentDetail>) {
  try {
    return await request.put<boolean>(`/admin/content/doc/${id}`, data);
  } catch (error) {
    console.error("updateDocument error:", error);
    throw error;
  }
}

export async function deleteDocument(ids: string[]) {
  try {
    return await request.delete("/admin/content/doc/batch", { data: { ids } });
  } catch (error) {
    console.error("deleteDocument error:", error);
    throw error;
  }
}

export async function moveDocumentCategory(ids: string[], category: string) {
  try {
    return await request.post("/admin/content/doc/category/batch", { ids, category });
  } catch (error) {
    console.error("moveDocumentCategory error:", error);
    throw error;
  }
}
