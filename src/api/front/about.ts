/**
 * 关于页面相关 API
 * @module api/front/about
 * @description 提供关于页面的技术栈展示、常见问题等功能接口
 */

import { request, handleRequest } from "../request";
import type { ApiResponse } from "../types";

/**
 * 技术栈项
 * @description 用于展示系统使用的技术栈
 */
export type TechStackItem = {
  /** 技术栈ID */
  id: string;
  /** 技术名称 */
  name: string;
  /** 技术描述 */
  description: string;
};

/**
 * 常见问题项
 * @description 单个FAQ条目
 */
export type FAQItem = {
  /** 问题ID */
  id: string;
  /** 问题内容 */
  question: string;
  /** 答案内容 */
  answer: string;
};

/**
 * 常见问题分类
 * @description 按类别分组的FAQ列表
 */
export type FAQCategory = {
  /** 分类标题 */
  title: string;
  /** 该分类下的问题列表 */
  items: FAQItem[];
};

/**
 * 获取技术栈列表
 * @description 获取系统使用的技术栈信息
 * @param setLoading 加载状态回调函数（可选）
 * @returns 技术栈列表
 */
export async function fetchTechStack(
  setLoading?: (loading: boolean) => void
): Promise<TechStackItem[]> {
  const { data } = await handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<TechStackItem[]>>("/system/about/skill")
        .then((r) => r.data),
    apiName: "fetchTechStack",
    setLoading,
  });
  return data || [];
}

/**
 * 获取常见问题列表
 * @description 获取按分类组织的FAQ列表
 * @param setLoading 加载状态回调函数（可选）
 * @returns FAQ分类列表
 */
export async function fetchFAQ(
  setLoading?: (loading: boolean) => void
): Promise<FAQCategory[]> {
  const { data } = await handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<FAQCategory[]>>("/system/about/faq")
        .then((r) => r.data),
    apiName: "fetchFAQ",
    setLoading,
  });
  return data || [];
}
