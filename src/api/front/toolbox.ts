// ===== 1. 依赖导入区域 =====
import { request, handleRequest } from "../axios";
import { SearchResult } from "./search";
import { getMockToolboxDetail } from "../mock/front/toolbox";
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
 * 工具箱详情类型定义
 */
export type ToolboxDetail = {
  /** 工具ID */
  id: string;
  /** 标题 */
  title: string;
  /** 描述 */
  description: string;
  /** Logo图标URL */
  logo: string;
  /** 标签列表 */
  tags: string[];
  /** 访问链接 */
  url: string;
  /** 预览图列表 */
  images: string[];
  /** 特性功能点列表 */
  features: string[];
  /** 相关工具列表 */
  relatedTools: SearchResult[];
  /** 统计数据 */
  stats: {
    /** 浏览量 */
    views: number;
    /** 点赞数 */
    likes: number;
    /** 使用量 */
    usage: number;
  };
  /** 作者信息 */
  author?: {
    /** 作者姓名 */
    name: string;
    /** 头像URL */
    avatar: string;
  };
  /** 创建日期 */
  createAt: string;
};

/**
 * 获取工具箱详情
 * @param id 工具ID
 * @returns 工具详情数据
 */
export async function getToolboxDetail(id: string): Promise<ToolboxDetail> {
  const { data } = await handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<ToolboxDetail>>(`/system/toolbox/${id}`)
        .then((r) => r.data),
    mockData: getMockToolboxDetail(id),
    apiName: "getToolboxDetail",
  });
  return data;
}

// --- Mock Data ---
