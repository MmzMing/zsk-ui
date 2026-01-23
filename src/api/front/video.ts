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
    description?: string;
    authorName?: string;
    date?: string;
  }[];
  // Add episodes for selection
  episodes: {
    id: string;
    title: string;
    videoUrl?: string; // Optional if we fetch detail on click, but usually selection has url or we fetch by id
    duration: string;
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
  replyTo?: {
    id: string;
    name: string;
  };
};

export async function fetchVideoComments(
  id: string,
  params: { page: number; pageSize: number; sort?: 'hot' | 'new' }
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
  replyToId?: string;
}) {
  return request.post<CommentItem>(`/content/video/comment`, data);
}

export async function toggleCommentLike(commentId: string) {
  return request.post<{ isLiked: boolean; likes: number }>(
    `/content/comment/like/${commentId}`
  );
}
