import { request } from "../axios";

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
  return request.post<DocumentUploadInitResponse>(
    "/admin/content/doc/upload/init",
    data
  );
}

export type DocumentUploadFinishRequest = {
  uploadId: string;
  status: "success" | "error";
  errorMsg?: string;
};

export async function finishDocumentUpload(data: DocumentUploadFinishRequest) {
  return request.post<boolean>(
    "/admin/content/doc/upload/finish",
    data
  );
}

export async function removeDocumentUploadTask(id: string) {
  return request.post<boolean>(
    "/admin/content/doc/upload/remove",
    { id }
  );
}

export async function retryDocumentUploadTask(id: string) {
  return request.post<boolean>(
    "/admin/content/doc/upload/retry",
    { id }
  );
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
  return request.get<DocumentUploadTaskListResponse>(
    "/admin/content/doc/upload/list",
    { params }
  );
}

export type DocumentItem = {
  id: string;
  title: string;
  category: string;
  status: "draft" | "published" | "offline" | "pending" | "approved" | "rejected" | "scheduled";
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
  return request.get<DocumentListResponse>(
    "/admin/content/doc/list",
    { params }
  );
}

export async function batchUpdateDocumentStatus(data: {
  ids: string[];
  status: "published" | "offline";
}) {
  return request.post<boolean>(
    "/admin/content/doc/status/batch",
    data
  );
}

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
  return request.get<DocumentReviewQueueResponse>(
    "/admin/content/doc/review/list",
    { params }
  );
}

export async function submitDocumentReview(data: {
  reviewId: string;
  status: "approved" | "rejected";
  reason?: string;
}) {
  return request.post<boolean>(
    "/admin/content/doc/review/submit",
    data
  );
}

export type DocumentDetail = {
  id: string;
  title: string;
  content: string;
  category: string;
  status: "draft" | "published" | "offline" | "pending";
  tags: string[];
  cover?: string;
  seo?: {
    title: string;
    description: string;
    keywords: string[];
  };
};

export async function getDocumentDetail(id: string) {
  return request.get<DocumentDetail>(`/admin/content/doc/${id}`);
}

export async function createDocument(data: Partial<DocumentDetail>) {
  return request.post<string>("/admin/content/doc/create", data);
}

export async function updateDocument(id: string, data: Partial<DocumentDetail>) {
  return request.put<boolean>(`/admin/content/doc/${id}`, data);
}

export async function deleteDocument(ids: string[]) {
  return request.delete("/admin/content/doc/batch", { data: { ids } });
}

export async function moveDocumentCategory(ids: string[], category: string) {
  return request.post("/admin/content/doc/category/batch", { ids, category });
}
