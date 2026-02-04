// ===== 1. 依赖导入区域 =====
import { request, handleRequest } from "../axios";
import { mockDocData, mockDocComments } from "../mock/front/docDetail";
import type { ApiResponse } from "../types";

// ===== 2. TODO待处理导入区域 =====

// ===== 3. 状态控制逻辑区域 =====

// ===== 4. 通用工具函数区域 =====

// ===== 5. 注释代码函数区 =====

// ===== 6. 错误处理函数区域 =====

// ===== 7. 数据处理函数区域 =====

// ===== 8. UI渲染逻辑区域 =====

// ===== 9. 页面初始化与事件绑定 =====

// ===== 10. TODO任务管理区域 =====

// ===== 11. 导出区域 =====

/**
 * 目录项类型定义
 */
export interface TocItem {
  /** 标识符 */
  id: string;
  /** 文本内容 */
  text: string;
  /** 层级 */
  level: number;
  /** 子节点 */
  children: TocItem[];
}

/**
 * 文档详情类型
 */
export type DocDetail = {
  /** 文档ID */
  id: string;
  /** 标题 */
  title: string;
  /** 内容 (HTML 或 Markdown) */
  content: string;
  /** 分类 */
  category: string;
  /** 日期 */
  date: string;
  /** 封面图地址 */
  coverUrl?: string;
  /** 作者信息 */
  author: {
    /** 作者ID */
    id: string;
    /** 作者名称 */
    name: string;
    /** 头像 */
    avatar: string;
    /** 粉丝数 */
    fans: string;
    /** 是否已关注 */
    isFollowing: boolean;
  };
  /** 统计数据 */
  stats: {
    /** 阅读数 */
    views: string;
    /** 点赞数 */
    likes: number;
    /** 收藏数 */
    favorites: number;
    /** 日期 */
    date?: string;
    /** 是否已点赞 */
    isLiked: boolean;
    /** 是否已收藏 */
    isFavorited: boolean;
  };
  /** 推荐文档列表 */
  recommendations: {
    /** 文档ID */
    id: string;
    /** 标题 */
    title: string;
    /** 阅读数 */
    views: string;
  }[];
};

/**
 * 评论项类型
 */
export type CommentItem = {
  /** 评论ID */
  id: string;
  /** 评论内容 */
  content: string;
  /** 作者信息 */
  author: {
    /** 作者ID */
    id: string;
    /** 名称 */
    name: string;
    /** 头像 */
    avatar: string;
  };
  /** 创建时间 */
  createdAt: string;
  /** 点赞数 */
  likes: number;
  /** 是否已点赞 */
  isLiked: boolean;
  /** 回复列表 */
  replies?: CommentItem[];
  /** 回复对象 */
  replyTo?: {
    /** 用户ID */
    id: string;
    /** 用户名称 */
    name: string;
  };
};

/**
 * 发表评论参数
 */
export interface PostCommentParams {
  /** 文档ID */
  docId: string;
  /** 评论内容 */
  content: string;
  /** 父级评论ID */
  parentId?: string;
  /** 回复目标用户ID */
  replyToId?: string;
}

/**
 * 获取文档详情
 * @param id 文档ID
 * @param setLoading 加载状态回调
 */
export async function fetchDocDetail(
  id: string,
  setLoading?: (loading: boolean) => void
) {
  const { data } = await handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<DocDetail>>(`/content/doc/detail/${id}`)
        .then((r) => r.data),
    mockData: mockDocData,
    setLoading,
    apiName: "fetchDocDetail",
  });
  return data;
}

/**
 * 切换文档点赞状态
 * @param id 文档ID
 */
export async function toggleDocLike(id: string) {
  const { data } = await handleRequest({
    requestFn: () =>
      request.instance
        .post<ApiResponse<{ isLiked: boolean; count: number }>>(
          `/content/doc/like/${id}`
        )
        .then((r) => r.data),
    mockData: {
      isLiked: !mockDocData.stats.isLiked,
      count: mockDocData.stats.likes + 1,
    },
    apiName: "toggleDocLike",
  });
  return data;
}

/**
 * 切换文档收藏状态
 * @param id 文档ID
 */
export async function toggleDocFavorite(id: string) {
  const { data } = await handleRequest({
    requestFn: () =>
      request.instance
        .post<ApiResponse<{ isFavorited: boolean; count: number }>>(
          `/content/doc/favorite/${id}`
        )
        .then((r) => r.data),
    mockData: {
      isFavorited: !mockDocData.stats.isFavorited,
      count: mockDocData.stats.favorites + 1,
    },
    apiName: "toggleDocFavorite",
  });
  return data;
}

/**
 * 获取文档评论列表
 * @param id 文档ID
 * @param params 分页及排序参数
 */
export async function fetchDocComments(
  id: string,
  params: { page: number; pageSize: number; sort?: "hot" | "new" }
) {
  const { data } = await handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<{ list: CommentItem[]; total: number }>>(
          `/content/doc/comments/${id}`,
          { params }
        )
        .then((r) => r.data),
    mockData: { list: mockDocComments, total: mockDocComments.length },
    apiName: "fetchDocComments",
  });
  return data;
}

/**
 * 发表文档评论
 * @param data 评论数据
 */
export async function postDocComment(data: PostCommentParams) {
  const { data: resData } = await handleRequest({
    requestFn: () =>
      request.instance
        .post<ApiResponse<CommentItem>>(`/content/doc/comment`, data)
        .then((r) => r.data),
    mockData: mockDocComments[0],
    apiName: "postDocComment",
  });
  return resData;
}

/**
 * 切换文档评论点赞状态
 * @param commentId 评论ID
 */
export async function toggleDocCommentLike(commentId: string) {
  const { data } = await handleRequest({
    requestFn: () =>
      request.instance
        .post<ApiResponse<{ isLiked: boolean; likes: number }>>(
          `/content/comment/like/${commentId}`,
          null,
          { params: { type: "doc" } }
        )
        .then((r) => r.data),
    mockData: { isLiked: true, likes: 10 },
    apiName: "toggleDocCommentLike",
  });
  return data;
}
