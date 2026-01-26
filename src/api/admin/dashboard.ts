// ===== 1. 依赖导入区域 =====
import React from "react";
import { userRequest as request, handleApiCall } from "../axios";
import type { ApiResponse } from "../types";
import { 
  mockMetricCards, 
  mockBigScreenData,
  mockOverviewCards,
  mockTrafficData,
  mockTrendData
} from "../mock/admin/dashboard";

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

// --- 类型定义 ---

/** 仪表盘概览数据项 */
export type DashboardOverviewItem = {
  key: string;
  label: string;
  value: string;
  delta: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
};

/** 仪表盘流量统计项 */
export type DashboardTrafficItem = {
  /** 类型 (文档/视频) */
  type: string;
  /** 日期 */
  date: string;
  /** 访问值 */
  value: number;
};

/** 仪表盘趋势项 */
export type DashboardTrendItem = {
  /** 日期 */
  date: string;
  /** 数值 */
  value: number;
};

/** 最近管理日志项 */
export type RecentAdminLogItem = {
  /** 日志 ID */
  id: string;
  /** 分类 (内容/用户/系统等) */
  category: "content" | "user" | "system" | string;
  /** 操作人 */
  operator: string;
  /** 动作名称 */
  action: string;
  /** 详细描述 */
  detail: string;
  /** 创建时间 */
  createdAt: string;
};

/** 最近管理日志响应数据 */
export type RecentAdminLogResponse = {
  /** 日志列表 */
  list: RecentAdminLogItem[];
  /** 总条数 */
  total: number;
};

/** 最近管理日志请求参数 */
export type RecentAdminLogParams = {
  /** 分类过滤 */
  category?: "content" | "user" | "system";
  /** 页码 */
  page: number;
  /** 每页数量 */
  pageSize: number;
};

/** 分析指标项 */
export type AnalysisMetricItem = {
  key: string;
  label: string;
  value: string;
  delta: string;
  description: string;
  tone: "up" | "down" | "stable" | string;
};

/** 分析时间分布项 */
export type AnalysisTimeDistributionItem = {
  /** 类型 (文档/视频) */
  type: string;
  /** 时间点 */
  time: string;
  /** 数值 */
  value: number;
};

/** 分析时间分布请求参数 */
export type AnalysisTimeDistributionParams = {
  /** 日期 */
  date?: string;
  /** 时间步长 */
  step?: "hour" | "half-hour";
};

// --- API 函数 ---

/**
 * 获取仪表盘概览卡片数据
 * @returns {Promise<DashboardOverviewItem[]>} 概览数据列表
 */
export async function fetchDashboardOverview(): Promise<DashboardOverviewItem[]> {
  return handleApiCall({
    requestFn: () => request.instance.get<ApiResponse<DashboardOverviewItem[]>>("/admin/dashboard/overview").then(r => r.data.data),
    mockFn: () => mockOverviewCards as DashboardOverviewItem[],
    errorPrefix: "获取仪表盘概览数据失败"
  });
}

/**
 * 获取仪表盘流量统计数据
 * @param params 查询参数 (如：range 时间范围)
 * @returns {Promise<DashboardTrafficItem[]>} 流量数据列表
 */
export async function fetchDashboardTraffic(params: {
  range?: string;
}): Promise<DashboardTrafficItem[]> {
  return handleApiCall({
    requestFn: () => request.instance.get<ApiResponse<DashboardTrafficItem[]>>("/admin/dashboard/traffic", { params }).then(r => r.data.data),
    mockFn: () => mockTrafficData as DashboardTrafficItem[],
    errorPrefix: "获取流量统计数据失败"
  });
}

/**
 * 获取仪表盘趋势数据
 * @param params 查询参数 (如：range 时间范围)
 * @returns {Promise<DashboardTrendItem[]>} 趋势数据列表
 */
export async function fetchDashboardTrend(params: {
  range?: string;
}): Promise<DashboardTrendItem[]> {
  return handleApiCall({
    requestFn: () => request.instance.get<ApiResponse<DashboardTrendItem[]>>("/admin/dashboard/trend", { params }).then(r => r.data.data),
    mockFn: () => mockTrendData as DashboardTrendItem[],
    errorPrefix: "获取访问趋势数据失败"
  });
}

/**
 * 获取最近管理日志
 * @param params 查询参数 (category 分类, page 页码, pageSize 每页数量)
 * @returns {Promise<RecentAdminLogResponse>} 日志列表
 */
export async function fetchRecentAdminLogs(
  params: RecentAdminLogParams
): Promise<RecentAdminLogResponse> {
  const MOCK_LOGS: RecentAdminLogResponse = {
    list: [
      {
        id: "1",
        category: "content",
        operator: "Admin",
        action: "发布文档",
        detail: "发布了新文档《系统操作指南》",
        createdAt: new Date().toISOString(),
      },
      {
        id: "2",
        category: "user",
        operator: "System",
        action: "用户注册",
        detail: "新用户 user_123 注册成功",
        createdAt: new Date().toISOString(),
      },
    ],
    total: 2,
  };

  return handleApiCall({
    requestFn: () => request.instance.get<ApiResponse<RecentAdminLogResponse>>("/admin/logs/recent", { params }).then(r => r.data.data),
    mockFn: () => MOCK_LOGS,
    errorPrefix: "获取最近管理日志失败"
  });
}

/**
 * 获取分析指标数据
 * @returns {Promise<AnalysisMetricItem[]>} 分析指标数据列表
 */
export async function fetchAnalysisMetrics(): Promise<AnalysisMetricItem[]> {
  return handleApiCall({
    requestFn: () => request.instance.get<ApiResponse<AnalysisMetricItem[]>>("/admin/dashboard/analysis/metrics").then(r => r.data.data),
    mockFn: () => mockMetricCards as AnalysisMetricItem[],
    errorPrefix: "获取分析指标数据失败"
  });
}

/**
 * 获取分析时间分布数据
 * @param params 查询参数 (date 日期, step 步长)
 * @returns {Promise<AnalysisTimeDistributionItem[]>} 时间分布数据列表
 */
export async function fetchAnalysisTimeDistribution(
  params: AnalysisTimeDistributionParams
): Promise<AnalysisTimeDistributionItem[]> {
  return handleApiCall({
    requestFn: () => request.instance.get<ApiResponse<AnalysisTimeDistributionItem[]>>("/admin/dashboard/analysis/time-distribution", { params }).then(r => r.data.data),
    mockFn: () => mockBigScreenData as unknown as AnalysisTimeDistributionItem[],
    errorPrefix: "获取时间分布数据失败"
  });
}



