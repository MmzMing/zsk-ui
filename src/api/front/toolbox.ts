import { request } from "../axios";
import { SearchResult } from "./search";
import { getMockToolboxDetail } from "../mock/front/toolbox";

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
  const isDev = import.meta.env.DEV;

  try {
    const res = await request.get<ToolboxDetail>(`/toolbox/${id}`);
    if (res) return res;
    throw new Error("Empty response");
  } catch (error) {
    if (isDev) {
      return getMockToolboxDetail(id);
    }
    throw error;
  }
}

// --- Mock Data ---
