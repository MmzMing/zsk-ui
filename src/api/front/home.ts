// ===== 1. 依赖导入区域 =====
import { contentRequest as request, handleRequestWithMock, handleApiCall } from "../axios";
import type { ApiResponse } from "../types";
import {
  mockHomeVideos,
  mockHomeArticles,
  mockHomeReviews,
  mockHomeSlides,
} from "../mock/front/home";

// ===== 2. TODO待处理导入区域 =====

// ===== 3. 状态控制逻辑区域 =====
/**
 * 默认文章封面图
 */
export const DEFAULT_ARTICLE_COVER = "/DefaultImage/MyDefaultImage.jpg";



// ===== 4. 通用工具函数区域 =====

// ===== 5. 注释代码函数区 =====

// ===== 6. 错误处理函数区域 =====

// ===== 7. 数据处理函数区域 =====

// ===== 8. UI渲染逻辑区域 =====

// ===== 9. 页面初始化与事件绑定 =====

// ===== 10. TODO任务管理区域 =====

// ===== 11. 导出区域 =====

/**
 * 首页 Mock 数据导出 (供初始化状态使用)
 */
export {
  mockHomeVideos,
  mockHomeArticles,
  mockHomeReviews,
  mockHomeSlides,
} from "../mock/front/home";

/**
 * 视频资源类型定义
 */
export type VideoSource = {
  /** 视频源地址 */
  src: string;
  /** 视频类型 (如 video/mp4) */
  type: string;
};

/**
 * 字幕资源类型定义
 */
export type Subtitle = {
  /** 字幕源地址 */
  src: string;
  /** 字幕标签名称 */
  label: string;
  /** 语言代码 (如 zh, en) */
  lang: string;
  /** 是否默认启用 */
  default?: boolean;
};

/**
 * 首页视频项类型定义
 */
export type HomeVideo = {
  /** 视频ID */
  id: string;
  /** 视频分类 */
  category: string;
  /** 视频时长 (如 12:45) */
  duration: string;
  /** 视频标题 */
  title: string;
  /** 视频描述 */
  description?: string;
  /** 播放量 */
  views: string;
  /** 点赞数 */
  likes?: number;
  /** 评论数 */
  comments?: number;
  /** 发布日期 */
  date: string;
  /** 封面图URL */
  cover?: string;
  /** 视频源信息 */
  sources?: string | VideoSource[];
  /** 字幕信息 */
  subtitles?: Subtitle[];
};

/**
 * 首页文章项类型定义
 */
export type HomeArticle = {
  /** 文章ID */
  id: string;
  /** 文章分类 */
  category: string;
  /** 文章标题 */
  title: string;
  /** 发布日期 */
  date: string;
  /** 文章摘要 */
  summary: string;
  /** 浏览量 */
  views: string;
  /** 作者 */
  author?: string;
  /** 封面图URL */
  cover?: string;
};

/**
 * 首页评论/反馈项类型定义
 */
export type HomeReview = {
  /** 评价ID */
  id: string;
  /** 评价人姓名 */
  name: string;
  /** 评价人角色/职位 */
  role: string;
  /** 评价来源 */
  source: string;
  /** 评价日期 */
  date: string;
  /** 评价内容 */
  content: string;
  /** 情感倾向 */
  tone: string;
};

/**
 * 特性卡片类型定义
 */
export type FeatureCard = {
  /** 特性标题 */
  title: string;
  /** 特性描述 */
  description: string;
  /** 特性标签 */
  tag: string;
};

/**
 * 首页幻灯片类型定义
 */
export type HomeSlide = {
  /** 幻灯片ID */
  id: string;
  /** 幻灯片标签 */
  tag: string;
  /** 幻灯片标题 */
  title: string;
  /** 幻灯片描述 */
  description: string;
  /** 核心特性列表 */
  features: FeatureCard[];
  /** 完整特性列表 */
  featureList: FeatureCard[];
  /** 预览组件类型 */
  previewType: "kanban" | "list" | "profile";
};

/**
 * 获取首页视频列表
 * @returns 首页视频列表响应
 */
export async function fetchHomeVideos() {
  return handleApiCall({
    requestFn: () =>
      handleRequestWithMock(
        () =>
          request.instance
            .get<ApiResponse<HomeVideo[]>>("/home/videos")
            .then((r) => r.data),
        mockHomeVideos,
        "fetchHomeVideos"
      ).then((res) => res.data),
  });
}

/**
 * 获取首页文章列表
 * @returns 首页文章列表响应
 */
export async function fetchHomeArticles() {
  return handleApiCall({
    requestFn: () =>
      handleRequestWithMock(
        () =>
          request.instance
            .get<ApiResponse<HomeArticle[]>>("/home/articles")
            .then((r) => r.data),
        mockHomeArticles,
        "fetchHomeArticles"
      ).then((res) => res.data),
  });
}

/**
 * 获取首页评论列表
 * @returns 首页评论列表响应
 */
export async function fetchHomeReviews() {
  return handleApiCall({
    requestFn: () =>
      handleRequestWithMock(
        () =>
          request.instance
            .get<ApiResponse<HomeReview[]>>("/home/reviews")
            .then((r) => r.data),
        mockHomeReviews,
        "fetchHomeReviews"
      ).then((res) => res.data),
  });
}

/**
 * 获取首页幻灯片列表
 * @returns 首页幻灯片列表响应
 */
export async function fetchHomeSlides() {
  return handleApiCall({
    requestFn: () =>
      handleRequestWithMock(
        () =>
          request.instance
            .get<ApiResponse<HomeSlide[]>>("/home/slides")
            .then((r) => r.data),
        mockHomeSlides,
        "fetchHomeSlides"
      ).then((res) => res.data),
  });
}

