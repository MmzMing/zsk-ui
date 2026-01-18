import { request } from "../axios";

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
  }[];
};

export async function fetchVideoDetail(id: string) {
  return request.get<VideoDetail>(`/content/video/detail/${id}`);
}

export async function toggleVideoLike(id: string) {
  return request.post<{ isLiked: boolean; count: number }>(
    `/content/video/like/${id}`
  );
}

export async function toggleVideoFavorite(id: string) {
  return request.post<{ isFavorited: boolean; count: number }>(
    `/content/video/favorite/${id}`
  );
}

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
};

export async function fetchVideoComments(
  id: string,
  params: { page: number; pageSize: number }
) {
  return request.get<{ list: CommentItem[]; total: number }>(
    `/content/video/comments/${id}`,
    { params }
  );
}

export async function postVideoComment(data: {
  videoId: string;
  content: string;
  parentId?: string;
}) {
  return request.post<CommentItem>(`/content/video/comment`, data);
}
