// ===== 1. 依赖导入区域 =====
import { request, handleRequest } from "../axios";
import { 
  mockTechStack, 
  mockFAQ, 
  type TechStackItem, 
  type FAQCategory 
} from "../mock/front/about";
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

export type { TechStackItem, FAQCategory };

/**
 * 获取技术栈列表
 * @returns 技术栈列表数据
 */
export async function fetchTechStack(): Promise<TechStackItem[]> {
  const { data } = await handleRequest({
    requestFn: () => request.instance.get<ApiResponse<TechStackItem[]>>("/about/skill").then(r => r.data),
    mockData: mockTechStack,
    apiName: "fetchTechStack"
  });
  return data;
}

/**
 * 获取 FAQ 列表
 * @returns FAQ 列表数据
 */
export async function fetchFAQ(): Promise<FAQCategory[]> {
  const { data } = await handleRequest({
    requestFn: () => request.instance.get<ApiResponse<FAQCategory[]>>("/about/faq").then(r => r.data),
    mockData: mockFAQ,
    apiName: "fetchFAQ"
  });
  return data;
}
