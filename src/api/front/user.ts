// ===== 1. 依赖导入区域 =====
import { request, handleRequest } from "../axios";
import type { ApiResponse } from "../types";
import { mockUserProfile, mockUserWorks, mockUserFavorites } from "../mock/front/userDetail";

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
 * 用户详情类型定义
 */
export type UserProfile = {
  /** 用户ID */
  id: string;
  /** 用户名 */
  username: string;
  /** 昵称 */
  name: string;
  /** 头像URL */
  avatar: string;
  /** 背景图URL */
  banner?: string;
  /** 等级 */
  level?: number;
  /** 标签 */
  tags?: string[];
  /** 个人简介 */
  bio: string;
  /** 所在地 */
  location?: string;
  /** 个人网站 */
  website?: string;
  /** 统计数据 */
  stats: {
    /** 粉丝数 */
    followers: number;
    /** 关注数 */
    following: number;
    /** 作品数 */
    works: number;
    /** 点赞数 */
    likes: number;
  };
  /** 是否已关注 */
  isFollowing: boolean;
};

/**
 * 用户作品项类型定义
 */
export type UserWorkItem = {
  /** 作品ID */
  id: string;
  /** 作品类型 */
  type: "video" | "article" | "document";
  /** 标题 */
  title: string;
  /** 封面图URL */
  coverUrl: string;
  /** 浏览量 */
  views: number;
  /** 创建时间 */
  createdAt: string;
};

/**
 * 获取用户资料详情
 * @param id 用户ID
 * @returns 用户资料详情
 */
export async function fetchUserProfile(id: string) {
  const { data } = await handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<UserProfile>>(`/user/profile/${id}`)
        .then((r) => r.data),
    mockData: mockUserProfile,
    apiName: "fetchUserProfile",
  });
  return data;
}

/**
 * 更新用户资料
 * @param data 待更新的用户资料
 * @returns 更新后的用户资料
 */
export async function updateUserProfile(data: Partial<UserProfile>) {
  const { data: resData } = await handleRequest({
    requestFn: () =>
      request.instance
        .post<ApiResponse<UserProfile>>("/user/profile/update", data)
        .then((r) => r.data),
    mockData: { ...mockUserProfile, ...data },
    apiName: "updateUserProfile",
  });
  return resData;
}

/**
 * 切换用户关注状态
 * @param id 用户ID
 * @returns 关注状态
 */
export async function toggleFollowUser(id: string) {
  const { data } = await handleRequest({
    requestFn: () =>
      request.instance
        .post<ApiResponse<{ isFollowing: boolean }>>(`/user/follow/${id}`)
        .then((r) => r.data),
    mockData: { isFollowing: true },
    apiName: "toggleFollowUser",
  });
  return data;
}

/**
 * 获取用户作品列表
 * @param id 用户ID
 * @param params 分页及过滤参数
 * @returns 用户作品列表
 */
export async function fetchUserWorks(
  id: string,
  params: {
    /** 当前页码 */
    page: number;
    /** 每页条数 */
    pageSize: number;
    /** 作品类型 */
    type?: string;
  }
) {
  const { data } = await handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<{ list: UserWorkItem[]; total: number }>>(
          `/user/works/${id}`,
          { params }
        )
        .then((r) => r.data),
    mockData: { list: mockUserWorks, total: mockUserWorks.length },
    apiName: "fetchUserWorks",
  });
  return data;
}

/**
 * 获取用户收藏列表
 * @param id 用户ID
 * @param params 分页参数
 * @returns 用户收藏列表
 */
export async function fetchUserFavorites(
  id: string,
  params: {
    /** 当前页码 */
    page: number;
    /** 每页条数 */
    pageSize: number;
  }
) {
  const { data } = await handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<{ list: UserWorkItem[]; total: number }>>(
          `/user/favorites/${id}`,
          { params }
        )
        .then((r) => r.data),
    mockData: { list: mockUserFavorites, total: mockUserFavorites.length },
    apiName: "fetchUserFavorites",
  });
  return data;
}
