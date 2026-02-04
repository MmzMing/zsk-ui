// ===== 1. 依赖导入区域 =====
import { request, handleRequest } from "../axios";
import type { ApiResponse } from "../types";
import { mockVideoData, mockVideoComments } from "../mock/front/videoDetail";

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
 * 视频详情类型定义
 */
export type VideoDetail = {
  /** 视频ID */
  id: string;
  /** 视频标题 */
  title: string;
  /** 视频描述 */
  description: string;
  /** 视频播放地址 */
  videoUrl: string;
  /** 封面图URL */
  coverUrl: string;
  /** 作者信息 */
  author: {
    /** 作者ID */
    id: string;
    /** 作者名称 */
    name: string;
    /** 作者头像URL */
    avatar: string;
    /** 粉丝数 */
    fans: string;
    /** 是否已关注 */
    isFollowing: boolean;
  };
  /** 统计数据 */
  stats: {
    /** 播放量 */
    views: string;
    /** 点赞数 */
    likes: number;
    /** 收藏数 */
    favorites: number;
    /** 发布日期 */
    date: string;
    /** 是否已点赞 */
    isLiked: boolean;
    /** 是否已收藏 */
    isFavorited: boolean;
  };
  /** 标签列表 */
  tags: string[];
  /** 推荐视频列表 */
  recommendations: {
    /** 视频ID */
    id: string;
    /** 视频标题 */
    title: string;
    /** 封面图URL */
    coverUrl: string;
    /** 视频时长 */
    duration: string;
    /** 播放量 */
    views: string;
    /** 描述 */
    description?: string;
    /** 作者名称 */
    authorName?: string;
    /** 发布日期 */
    date?: string;
  }[];
  /** 分集信息 */
  episodes: {
    /** 分集ID */
    id: string;
    /** 分集标题 */
    title: string;
    /** 分集视频地址 */
    videoUrl?: string;
    /** 分集时长 */
    duration: string;
  }[];
};

/**
 * 评论项类型定义
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
    /** 作者名称 */
    name: string;
    /** 作者头像URL */
    avatar: string;
  };
  /** 创建时间 */
  createdAt: string;
  /** 点赞数 */
  likes: number;
  /** 是否已点赞 */
  isLiked: boolean;
  /** 子评论列表 */
  replies?: CommentItem[];
  /** 回复对象信息 */
  replyTo?: {
    /** 被回复人ID */
    id: string;
    /** 被回复人名称 */
    name: string;
  };
};

/**
 * 发表视频评论参数
 */
export interface PostVideoCommentParams {
  /** 视频ID */
  videoId: string;
  /** 评论内容 */
  content: string;
  /** 父评论ID */
  parentId?: string;
  /** 回复对象评论ID */
  replyToId?: string;
}

/**
 * 获取视频详情
 * @param id 视频ID
 * @param setLoading 加载状态设置函数
 */
export async function fetchVideoDetail(id: string, setLoading?: (loading: boolean) => void) {
  return handleRequest({
    requestFn: () => request.instance.get<ApiResponse<VideoDetail>>(`/content/video/detail/${id}`).then(r => r.data),
    mockData: mockVideoData,
    setLoading,
    apiName: "fetchVideoDetail"
  });
}

/**
 * 切换视频点赞状态
 * @param id 视频ID
 */
export async function toggleVideoLike(id: string) {
  return handleRequest({
    requestFn: () => request.instance.post<ApiResponse<{ isLiked: boolean; count: number }>>(`/content/video/like/${id}`).then(r => r.data),
    mockData: { isLiked: true, count: 123 },
    apiName: "toggleVideoLike"
  });
}

/**
 * 切换视频收藏状态
 * @param id 视频ID
 */
export async function toggleVideoFavorite(id: string) {
  return handleRequest({
    requestFn: () => request.instance.post<ApiResponse<{ isFavorited: boolean; count: number }>>(`/content/video/favorite/${id}`).then(r => r.data),
    mockData: { isFavorited: true, count: 456 },
    apiName: "toggleVideoFavorite"
  });
}

/**
 * 获取视频评论列表
 * @param id 视频ID
 * @param params 分页及排序参数
 */
export async function fetchVideoComments(
  id: string,
  params: {
    page: number;
    pageSize: number;
    sort?: "hot" | "new";
  }
) {
  return handleRequest({
    requestFn: () => request.instance.get<ApiResponse<{ list: CommentItem[]; total: number }>>(`/content/video/comments/${id}`, { params }).then(r => r.data),
    mockData: { list: mockVideoComments, total: mockVideoComments.length },
    apiName: "fetchVideoComments"
  });
}

/**
 * 发表视频评论
 * @param data 评论内容数据
 */
export async function postVideoComment(data: PostVideoCommentParams) {
  return handleRequest({
    requestFn: () => request.instance.post<ApiResponse<CommentItem>>(`/content/video/comment`, data).then(r => r.data),
    mockData: {
      id: "mock-" + Date.now(),
      content: data.content,
      author: { id: "mock-user", name: "Mock用户", avatar: "" },
      createdAt: new Date().toISOString(),
      likes: 0,
      isLiked: false,
    },
    apiName: "postVideoComment"
  });
}

/**
 * 切换评论点赞状态
 * @param commentId 评论ID
 */
export async function toggleCommentLike(commentId: string) {
  return handleRequest({
    requestFn: () => request.instance.post<ApiResponse<{ isLiked: boolean; likes: number }>>(`/content/comment/like/${commentId}`, null, { params: { type: "video" } }).then(r => r.data),
    mockData: { isLiked: true, likes: 99 },
    apiName: "toggleCommentLike"
  });
}
