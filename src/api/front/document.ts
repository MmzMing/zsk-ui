import { request } from "../axios";

export type DocDetail = {
  id: string;
  title: string;
  content: string; // HTML or Markdown
  category: string;
  date: string;
  coverUrl?: string;
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
    date?: string;
    isLiked: boolean;
    isFavorited: boolean;
  };
  recommendations: {
    id: string;
    title: string;
    views: string;
  }[];
};

export async function fetchDocDetail(id: string) {
  return request.get<DocDetail>(`/content/doc/detail/${id}`);
}

export async function toggleDocLike(id: string) {
  return request.post<{ isLiked: boolean; count: number }>(
    `/content/doc/like/${id}`
  );
}

export async function toggleDocFavorite(id: string) {
  return request.post<{ isFavorited: boolean; count: number }>(
    `/content/doc/favorite/${id}`
  );
}

// Reusing CommentItem from video or defining new one if needed, assuming similar structure
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

export async function fetchDocComments(
  id: string,
  params: { page: number; pageSize: number; sort?: 'hot' | 'new' }
) {
  return request.get<{ list: CommentItem[]; total: number }>(
    `/content/doc/comments/${id}`,
    { params }
  );
}

export async function postDocComment(data: {
  docId: string;
  content: string;
  parentId?: string;
  replyToId?: string;
}) {
  return request.post<CommentItem>(`/content/doc/comment`, data);
}

export async function toggleDocCommentLike(commentId: string) {
  return request.post<{ isLiked: boolean; likes: number }>(
    `/content/comment/like/${commentId}`,
    null,
    { params: { type: "doc" } }
  );
}
