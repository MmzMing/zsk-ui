// ===== 1. 依赖导入区域 =====
import { request, handleRequest } from "../axios";
import type { ApiResponse } from "../types";
import { mockSearchResults } from "../mock/front/search";

// ===== 2. TODO待处理导入区域 =====

// ===== 3. 状态控制逻辑区域 =====

// ===== 4. 通用工具函数区域 =====

// ===== 5. 注释代码函数区 =====

// ===== 6. 错误处理函数区域 =====

// ===== 7. 数据处理函数区域 =====
/**
 * 根据参数过滤 Mock 数据
 * @param params 搜索参数
 * @returns 过滤后的结果
 */
const filterMockData = (params: SearchAllParams): SearchAllApiData => {
  let filtered = [...mockSearchResults];

  // Type filter (was Category)
  if (!params.type || params.type === "all") {
    // 综合查询：只查询视频和文档
    filtered = filtered.filter(
      (item) => item.type === "video" || item.type === "document"
    );
  } else {
    filtered = filtered.filter((item) => item.type === params.type);
  }

  // Keyword filter
  if (params.keyword && params.keyword.trim() !== "") {
    const k = params.keyword.toLowerCase().trim();
    filtered = filtered.filter(
      (item) =>
        item.title.toLowerCase().includes(k) ||
        item.description.toLowerCase().includes(k)
    );
  }

  // Duration filter (Video only)
  if (params.duration && params.type === "video") {
    filtered = filtered.filter((item) => {
      if (item.type !== "video" || !item.duration) return false;
      const [min] = item.duration.split(":").map(Number);
      switch (params.duration) {
        case "lt10":
          return min < 10;
        case "10_30":
          return min >= 10 && min <= 30;
        case "30_60":
          return min > 30 && min <= 60;
        case "gt60":
          return min > 60;
        default:
          return true;
      }
    });
  }

  // Category filter (was Tag)
  if (params.category) {
    filtered = filtered.filter((item) => item.category === params.category);
  }

  // Pagination
  const page = params.page || 1;
  const pageSize = params.pageSize || 20;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const list = filtered.slice(start, end);

  return {
    list,
    total: filtered.length,
  };
};

// ===== 8. UI渲染逻辑区域 =====

// ===== 9. 页面初始化与事件绑定 =====

// ===== 10. TODO任务管理区域 =====

// ===== 11. 导出区域 =====

/**
 * 搜索分类类型
 */
export type SearchCategory = "all" | "video" | "document" | "tool" | "user";

/**
 * 搜索排序键类型
 */
export type SearchSortKey =
  | "hot"
  | "latest"
  | "like"
  | "usage"
  | "relevance"
  | "fans"
  | "active";

/**
 * 搜索结果项类型定义
 */
export type SearchResult = {
  /** 资源ID */
  id: string;
  /** 排名 */
  rank?: number;
  /** 资源类型 */
  type: "video" | "document" | "tool" | "user";
  /** 标题 */
  title: string;
  /** 作者ID */
  authorId?: string;
  /** 作者 */
  author?: string;
  /** 作者头像 */
  authorAvatar?: string;
  /** 描述 */
  description: string;
  /** 分类 (用于筛选) */
  category?: string;
  /** 标签列表 */
  tags: string[];
  /** 统计信息文本 */
  stats?: string;
  /** 缩略图URL */
  thumbnail?: string;
  /** 头像URL (用户类型) */
  avatar?: string;
  /** 视频时长 */
  duration?: string;
  /** 播放量 (视频类型) */
  playCount?: number;
  /** 评论数 */
  commentCount?: number;
  /** 阅读量 (文档类型) */
  readCount?: number;
  /** 收藏数 */
  favoriteCount?: number;
  /** 使用次数 (工具类型) */
  usageCount?: number;
  /** 粉丝数 (用户类型) */
  followers?: number;
  /** 作品数 (用户类型) */
  works?: number;
  /** 是否直播中 */
  isLive?: boolean;
  /** 等级标签 */
  levelTag?: string;
  /** 时间范围 */
  timeRange?: string;
  /** 跳转链接 */
  url?: string;
};

/**
 * 搜索接口返回数据类型
 */
export type SearchAllApiData =
  | SearchResult[]
  | {
      /** 结果列表 */
      list: SearchResult[];
      /** 总数 */
      total?: number;
    };

/**
 * 搜索参数类型定义
 */
export type SearchAllParams = {
  /** 搜索关键字 */
  keyword?: string;
  /** 搜索分类类型 (原 category) */
  type?: SearchCategory;
  /** 排序规则 */
  sort?: SearchSortKey;
  /** 视频时长筛选 */
  duration?: string | null;
  /** 发布时间范围 */
  timeRange?: string | null;
  /** 分类筛选 (原 tag) */
  category?: string | null;
  /** 页码 */
  page?: number;
  /** 每页条数 */
  pageSize?: number;
};

/**
 * 全站搜索接口
 * @param params 搜索参数
 * @param setLoading 可选的 loading 状态回调
 * @returns 搜索结果
 */
export async function searchAll(
  params: SearchAllParams,
  setLoading?: (loading: boolean) => void
) {
  // 准备 Mock 数据
  const mockData = filterMockData(params);

  const res = await handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<SearchAllApiData>>("/search/all", {
          params: {
            keyword: params.keyword || undefined,
            // type: 对应后端的一级分类
            type:
              params.type && params.type !== "all"
                ? params.type
                : "all",
            sort: params.sort,
            duration: params.duration || undefined,
            timeRange: params.timeRange || undefined,
            // category: 对应后端的二级分类 (原 tag)
            category: params.category || undefined,
            page: params.page || 1,
            pageSize: params.pageSize || 20,
          },
        })
        .then((r) => r.data),
    mockData,
    apiName: "searchAll",
    setLoading,
  });
  
  return res.data;
}
