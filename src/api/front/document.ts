/**
 * 文档相关 API
 * @module api/front/document
 * @description 提供文档详情、评论、点赞、收藏等功能接口
 */

import { request, handleRequest } from "../request";
import type { ApiResponse } from "../types";

/**
 * 目录项
 * @description 文档目录树形结构节点
 */
export interface TocItem {
  /** 目录项ID */
  id: string;
  /** 目录项文本 */
  text: string;
  /** 标题级别（1-6） */
  level: number;
  /** 子目录列表 */
  children: TocItem[];
}

/**
 * 文档详情
 * @description 文档详情页展示的完整数据
 */
export type DocDetail = {
  /** 文档ID */
  id: string;
  /** 文档标题 */
  title: string;
  /** 文档内容（Markdown格式） */
  content: string;
  /** 分类名称 */
  category: string;
  /** 发布日期 */
  date: string;
  /** 封面图URL */
  coverUrl?: string;
  /** 作者信息 */
  author: {
    /** 作者ID */
    id: string;
    /** 作者名称 */
    name: string;
    /** 作者头像 */
    avatar: string;
    /** 粉丝数（格式化字符串） */
    fans: string;
    /** 当前用户是否已关注 */
    isFollowing: boolean;
  };
  /** 统计数据 */
  stats: {
    /** 浏览量（格式化字符串） */
    views: string;
    /** 点赞数 */
    likes: number;
    /** 收藏数 */
    favorites: number;
    /** 发布日期 */
    date?: string;
    /** 当前用户是否已点赞 */
    isLiked: boolean;
    /** 当前用户是否已收藏 */
    isFavorited: boolean;
  };
  /** 推荐文档列表 */
  recommendations: {
    /** 推荐文档ID */
    id: string;
    /** 推荐文档标题 */
    title: string;
    /** 浏览量（格式化字符串） */
    views: string;
  }[];
};

/**
 * 评论项
 * @description 文档评论的单条数据
 */
export type CommentItem = {
  /** 评论ID */
  id: string;
  /** 评论内容 */
  content: string;
  /** 评论作者信息 */
  author: {
    /** 作者ID */
    id: string;
    /** 作者名称 */
    name: string;
    /** 作者头像 */
    avatar: string;
  };
  /** 评论时间 */
  createdAt: string;
  /** 点赞数 */
  likes: number;
  /** 当前用户是否已点赞 */
  isLiked: boolean;
  /** 回复列表 */
  replies?: CommentItem[];
  /** 回复目标信息（回复评论时存在） */
  replyTo?: {
    /** 被回复者ID */
    id: string;
    /** 被回复者名称 */
    name: string;
  };
};

/**
 * 发布评论参数
 * @description 发布文档评论时提交的数据
 */
export interface PostCommentParams {
  /** 文档ID */
  docId: string;
  /** 评论内容 */
  content: string;
  /** 父评论ID（回复评论时使用） */
  parentId?: string;
  /** 回复目标评论ID */
  replyToId?: string;
};

/**
 * 获取文档详情
 * @description 根据文档ID获取完整的文档信息
 * @param id 文档ID
 * @param setLoading 加载状态回调函数（可选）
 * @returns 文档详情数据
 */
export async function fetchDocDetail(
  id: string,
  setLoading?: (loading: boolean) => void
): Promise<DocDetail> {
  const { data } = await handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<DocDetail>>(`/document/detail/${id}`)
        .then((r) => r.data),
    setLoading,
    apiName: "fetchDocDetail",
  });
  return data;
}

/**
 * 切换文档点赞状态
 * @description 点赞或取消点赞文档
 * @param id 文档ID
 * @returns 点赞状态和点赞数
 */
export async function toggleDocLike(
  id: string
): Promise<{ isLiked: boolean; count: number }> {
  return request.post(`/document/like/${id}`);
}

/**
 * 切换文档收藏状态
 * @description 收藏或取消收藏文档
 * @param id 文档ID
 * @returns 收藏状态和收藏数
 */
export async function toggleDocFavorite(
  id: string
): Promise<{ isFavorited: boolean; count: number }> {
  return request.post(`/document/favorite/${id}`);
}

/**
 * 获取文档评论列表
 * @description 分页获取文档评论，支持排序
 * @param id 文档ID
 * @param params 分页和排序参数
 * @returns 评论列表和总数
 */
export async function fetchDocComments(
  id: string,
  params: {
    /** 当前页码 */
    page: number;
    /** 每页条数 */
    pageSize: number;
    /** 排序方式：hot-热门，new-最新 */
    sort?: "hot" | "new";
  }
): Promise<{ list: CommentItem[]; total: number }> {
  return request.get(`/document/comments/${id}`, { params });
}

/**
 * 发布文档评论
 * @description 发布新评论或回复评论
 * @param params 评论参数
 * @returns 新发布的评论数据
 */
export async function postDocComment(
  params: PostCommentParams
): Promise<CommentItem> {
  return request.post("/document/comment", params);
}

/**
 * 切换评论点赞状态
 * @description 点赞或取消点赞评论
 * @param commentId 评论ID
 * @returns 点赞状态和点赞数
 */
export async function toggleDocCommentLike(
  commentId: string
): Promise<{ isLiked: boolean; count: number }> {
  return request.post(`/document/comment/like/${commentId}`);
}
