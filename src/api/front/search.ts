/**
 * 搜索相关 API
 * @module api/front/search
 */

import { request, handleRequest } from "../request";
import type { ApiResponse } from "../types";

export type SearchCategory = "all" | "video" | "document" | "tool" | "user";

export type SearchSortKey =
  | "hot"
  | "latest"
  | "like"
  | "usage"
  | "relevance"
  | "fans"
  | "active";

export type SearchResult = {
  id: string;
  rank?: number;
  type: "video" | "document" | "tool" | "user";
  title: string;
  authorId?: string;
  author?: string;
  authorAvatar?: string;
  description: string;
  category?: string;
  tags: string[];
  stats?: string;
  thumbnail?: string;
  avatar?: string;
  duration?: string;
  playCount?: number;
  commentCount?: number;
  readCount?: number;
  favoriteCount?: number;
  usageCount?: number;
  followers?: number;
  works?: number;
  isLive?: boolean;
  levelTag?: string;
  timeRange?: string;
  url?: string;
};

export type SearchAllApiData =
  | SearchResult[]
  | {
      list: SearchResult[];
      total?: number;
    };

export type SearchAllParams = {
  keyword?: string;
  type?: SearchCategory;
  sort?: SearchSortKey;
  duration?: string | null;
  timeRange?: string | null;
  category?: string | null;
  page?: number;
  pageSize?: number;
};

export async function searchAll(
  params: SearchAllParams
): Promise<SearchAllApiData> {
  const { data } = await handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<SearchAllApiData>>("/search", { params })
        .then((r) => r.data),
    apiName: "searchAll",
  });
  return data;
}

export async function searchVideos(
  params: Omit<SearchAllParams, "type">
): Promise<SearchAllApiData> {
  const { data } = await handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<SearchAllApiData>>("/search/videos", { params })
        .then((r) => r.data),
    apiName: "searchVideos",
  });
  return data;
}

export async function searchDocuments(
  params: Omit<SearchAllParams, "type">
): Promise<SearchAllApiData> {
  const { data } = await handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<SearchAllApiData>>("/search/documents", { params })
        .then((r) => r.data),
    apiName: "searchDocuments",
  });
  return data;
}

export async function searchTools(
  params: Omit<SearchAllParams, "type">
): Promise<SearchAllApiData> {
  const { data } = await handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<SearchAllApiData>>("/search/tools", { params })
        .then((r) => r.data),
    apiName: "searchTools",
  });
  return data;
}

export async function searchUsers(
  params: Omit<SearchAllParams, "type">
): Promise<SearchAllApiData> {
  const { data } = await handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<SearchAllApiData>>("/search/users", { params })
        .then((r) => r.data),
    apiName: "searchUsers",
  });
  return data;
}

export async function getHotSearchKeywords(): Promise<string[]> {
  return request.get<string[]>("/search/hot");
}

export async function getSearchSuggestions(keyword: string): Promise<string[]> {
  return request.get<string[]>("/search/suggestions", { params: { keyword } });
}
