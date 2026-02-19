/**
 * 工具箱相关 API
 * @module api/front/toolbox
 */

import { request } from "../request";
import { SearchResult } from "./search";

export type ToolboxDetail = {
  id: string;
  title: string;
  description: string;
  logo: string;
  tags: string[];
  url: string;
  images: string[];
  features: string[];
  relatedTools: SearchResult[];
  stats: {
    views: number;
    likes: number;
    usage: number;
  };
  author?: {
    name: string;
    avatar: string;
  };
  createAt: string;
};

export async function getToolboxDetail(id: string): Promise<ToolboxDetail> {
  return request.get<ToolboxDetail>(`/system/toolbox/${id}`);
}

export async function getToolboxList(params?: {
  category?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ list: ToolboxDetail[]; total: number }> {
  return request.get("/system/toolbox/list", { params });
}

export async function toggleToolboxLike(id: string): Promise<{ isLiked: boolean; count: number }> {
  return request.post(`/system/toolbox/like/${id}`);
}

export async function incrementToolboxUsage(id: string): Promise<void> {
  return request.post(`/system/toolbox/usage/${id}`);
}
