import { request } from "../axios";

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
  type: "video" | "document" | "tool" | "user";
  title: string;
  description: string;
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
  category?: SearchCategory;
  sort?: SearchSortKey;
  duration?: string | null;
  timeRange?: string | null;
  tag?: string | null;
};

export async function searchAll(params: SearchAllParams) {
  return request.get<SearchAllApiData>("/search/all", {
    params: {
      keyword: params.keyword || undefined,
      category:
        params.category && params.category !== "all" ? params.category : undefined,
      sort: params.sort,
      duration: params.duration || undefined,
      timeRange: params.timeRange || undefined,
      tag: params.tag || undefined
    }
  });
}
