/**
 * 用户相关 API
 * @module api/front/user
 */

import { request } from "../request";

export type UserProfile = {
  id: string;
  username: string;
  name: string;
  avatar: string;
  banner?: string;
  level?: number;
  tags?: string[];
  bio: string;
  location?: string;
  website?: string;
  stats: {
    followers: number;
    following: number;
    works: number;
    likes: number;
  };
  isFollowing: boolean;
};

export type UserWorkItem = {
  id: string;
  type: "video" | "article" | "document";
  title: string;
  coverUrl: string;
  views: number;
  createdAt: string;
};

export type UserFavoriteItem = {
  id: string;
  type: "video" | "article" | "document";
  title: string;
  coverUrl: string;
  author: string;
  createdAt: string;
};

export async function fetchUserProfile(id: string): Promise<UserProfile> {
  return request.get<UserProfile>(`/user/profile/${id}`);
}

export async function fetchUserWorks(
  id: string,
  params?: { page?: number; pageSize?: number }
): Promise<{ list: UserWorkItem[]; total: number }> {
  return request.get(`/user/works/${id}`, { params });
}

export async function fetchUserFavorites(
  id: string,
  params?: { page?: number; pageSize?: number }
): Promise<{ list: UserFavoriteItem[]; total: number }> {
  return request.get(`/user/favorites/${id}`, { params });
}

export async function toggleFollow(userId: string): Promise<{ isFollowing: boolean }> {
  return request.post(`/user/follow/${userId}`);
}

export async function updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
  return request.put("/user/profile", data);
}
