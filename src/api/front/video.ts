/**
 * 视频相关 API
 * @module api/front/video
 */

import { request, handleRequest } from "../request";
import type { ApiResponse } from "../types";

export type VideoDetail = {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  coverUrl: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    fans: string;
    isFollowing: boolean;
  };
  stats: {
    views: string;
    likes: number;
    favorites: number;
    date: string;
    isLiked: boolean;
    isFavorited: boolean;
  };
  tags: string[];
  recommendations: {
    id: string;
    title: string;
    coverUrl: string;
    duration: string;
    views: string;
    description?: string;
    authorName?: string;
    date?: string;
  }[];
  episodes: {
    id: string;
    title: string;
    videoUrl?: string;
    duration: string;
  }[];
};

export type CommentItem = {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  createdAt: string;
  likes: number;
  isLiked: boolean;
  replies?: CommentItem[];
  replyTo?: {
    id: string;
    name: string;
  };
};

export interface PostVideoCommentParams {
  videoId: string;
  content: string;
  parentId?: string;
  replyToId?: string;
}

export async function fetchVideoDetail(
  id: string,
  setLoading?: (loading: boolean) => void
): Promise<VideoDetail> {
  const { data } = await handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<VideoDetail>>(`/video/detail/${id}`)
        .then((r) => r.data),
    setLoading,
    apiName: "fetchVideoDetail",
  });
  return data;
}

export async function toggleVideoLike(
  id: string
): Promise<{ isLiked: boolean; count: number }> {
  return request.post(`/video/like/${id}`);
}

export async function toggleVideoFavorite(
  id: string
): Promise<{ isFavorited: boolean; count: number }> {
  return request.post(`/video/favorite/${id}`);
}

export async function fetchVideoComments(
  id: string,
  params: {
    page: number;
    pageSize: number;
    sort?: "hot" | "new";
  }
): Promise<{ list: CommentItem[]; total: number }> {
  return request.get(`/video/comments/${id}`, { params });
}

export async function postVideoComment(
  params: PostVideoCommentParams
): Promise<CommentItem> {
  return request.post("/video/comment", params);
}

export async function toggleVideoCommentLike(
  commentId: string
): Promise<{ isLiked: boolean; count: number }> {
  return request.post(`/video/comment/like/${commentId}`);
}
