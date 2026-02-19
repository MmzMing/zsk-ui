/**
 * 仪表盘相关 API
 * @module api/admin/dashboard
 * @description 提供仪表盘概览数据、流量统计、趋势分析、管理日志等接口
 */

import React from "react";
import { request, handleRequest } from "../request";
import type { ApiResponse } from "../types";

/**
 * 仪表盘概览项
 * @description 用于展示仪表盘顶部的统计卡片数据
 */
export type DashboardOverviewItem = {
  /** 唯一标识键，用于 React 渲染优化 */
  key: string;
  /** 显示标签，如"总用户数"、"今日访问"等 */
  label: string;
  /** 当前值，格式化后的字符串 */
  value: string;
  /** 变化幅度，如"+12.5%"或"-3.2%" */
  delta: string;
  /** 详细描述说明 */
  description: string;
  /** 图标组件，使用 React.ComponentType 类型 */
  icon: React.ComponentType<{ className?: string }>;
};

/**
 * 仪表盘流量统计项
 * @description 用于流量趋势图表的数据点
 */
export type DashboardTrafficItem = {
  /** 流量类型，如"文档"、"视频"等 */
  type: string;
  /** 日期，格式如"2024-01-15" */
  date: string;
  /** 访问量数值 */
  value: number;
};

/**
 * 仪表盘趋势项
 * @description 用于趋势折线图的数据点
 */
export type DashboardTrendItem = {
  /** 日期，格式如"2024-01-15" */
  date: string;
  /** 对应数值 */
  value: number;
};

/**
 * 最近管理日志项
 * @description 用于展示管理员操作日志列表
 */
export type RecentAdminLogItem = {
  /** 日志唯一标识 */
  id: string;
  /** 操作分类：content-内容管理、user-用户管理、system-系统管理 */
  category: "content" | "user" | "system" | string;
  /** 操作人姓名 */
  operator: string;
  /** 操作动作名称，如"删除"、"编辑"等 */
  action: string;
  /** 操作详细描述 */
  detail: string;
  /** 操作创建时间，ISO 格式字符串 */
  createdAt: string;
};

/**
 * 最近管理日志响应数据
 * @description 分页查询管理日志的返回结构
 */
export type RecentAdminLogResponse = {
  /** 日志列表 */
  list: RecentAdminLogItem[];
  /** 总记录数 */
  total: number;
};

/**
 * 最近管理日志请求参数
 * @description 分页查询管理日志的参数结构
 */
export type RecentAdminLogParams = {
  /** 操作分类过滤：content-内容管理、user-用户管理、system-系统管理 */
  category?: "content" | "user" | "system";
  /** 当前页码，从 1 开始 */
  page: number;
  /** 每页数量 */
  pageSize: number;
};

/**
 * 分析指标项
 * @description 用于数据分析页面的指标卡片
 */
export type AnalysisMetricItem = {
  /** 唯一标识键 */
  key: string;
  /** 显示标签 */
  label: string;
  /** 当前值 */
  value: string;
  /** 变化幅度 */
  delta: string;
  /** 详细描述 */
  description: string;
  /** 变化趋势：up-上升、down-下降、stable-稳定 */
  tone: "up" | "down" | "stable" | string;
};

/**
 * 分析时间分布项
 * @description 用于时间分布图表的数据点
 */
export type AnalysisTimeDistributionItem = {
  /** 数据类型，如"文档"、"视频"等 */
  type: string;
  /** 时间点，格式如"08:00"、"09:00"等 */
  time: string;
  /** 对应数值 */
  value: number;
};

/**
 * 分析时间分布请求参数
 * @description 查询时间分布数据的参数结构
 */
export type AnalysisTimeDistributionParams = {
  /** 查询日期，格式如"2024-01-15" */
  date?: string;
  /** 时间步长：hour-按小时、half-hour-按半小时 */
  step?: "hour" | "half-hour";
};

/**
 * 获取仪表盘概览卡片数据
 * @param setLoading 加载状态回调函数
 * @returns 概览数据列表
 */
export async function fetchDashboardOverview(
  setLoading?: (loading: boolean) => void
): Promise<DashboardOverviewItem[]> {
  const { data } = await handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<DashboardOverviewItem[]>>("/system/dashboard/overview")
        .then((r) => r.data),
    apiName: "fetchDashboardOverview",
    setLoading,
  });
  return data || [];
}

/**
 * 获取仪表盘流量统计数据
 * @param params 查询参数，range 为时间范围
 * @param setLoading 加载状态回调函数
 * @returns 流量数据列表
 */
export async function fetchDashboardTraffic(
  params: { range?: string },
  setLoading?: (loading: boolean) => void
): Promise<DashboardTrafficItem[]> {
  const { data } = await handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<DashboardTrafficItem[]>>("/system/dashboard/traffic", {
          params,
        })
        .then((r) => r.data),
    apiName: "fetchDashboardTraffic",
    setLoading,
  });
  return data || [];
}

/**
 * 获取仪表盘趋势数据
 * @param params 查询参数，range 为时间范围
 * @param setLoading 加载状态回调函数
 * @returns 趋势数据列表
 */
export async function fetchDashboardTrend(
  params: { range?: string },
  setLoading?: (loading: boolean) => void
): Promise<DashboardTrendItem[]> {
  const { data } = await handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<DashboardTrendItem[]>>("/system/dashboard/trend", {
          params,
        })
        .then((r) => r.data),
    apiName: "fetchDashboardTrend",
    setLoading,
  });
  return data || [];
}

/**
 * 获取最近管理日志
 * @param params 查询参数，包含分类过滤和分页信息
 * @param setLoading 加载状态回调函数
 * @returns 日志列表及总数
 */
export async function fetchRecentAdminLogs(
  params: RecentAdminLogParams,
  setLoading?: (loading: boolean) => void
): Promise<RecentAdminLogResponse> {
  const { data } = await handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<RecentAdminLogResponse>>("/system/logs/recent", {
          params,
        })
        .then((r) => r.data),
    apiName: "fetchRecentAdminLogs",
    setLoading,
  });
  return data || { list: [], total: 0 };
}

/**
 * 获取分析指标数据
 * @param setLoading 加载状态回调函数
 * @returns 分析指标数据列表
 */
export async function fetchAnalysisMetrics(
  setLoading?: (loading: boolean) => void
): Promise<AnalysisMetricItem[]> {
  const { data } = await handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<AnalysisMetricItem[]>>(
          "/system/dashboard/analysis/metrics"
        )
        .then((r) => r.data),
    apiName: "fetchAnalysisMetrics",
    setLoading,
  });
  return data || [];
}

/**
 * 获取分析时间分布数据
 * @param params 查询参数，包含日期和时间步长
 * @param setLoading 加载状态回调函数
 * @returns 时间分布数据列表
 */
export async function fetchAnalysisTimeDistribution(
  params: AnalysisTimeDistributionParams,
  setLoading?: (loading: boolean) => void
): Promise<AnalysisTimeDistributionItem[]> {
  const { data } = await handleRequest({
    requestFn: () =>
      request.instance
        .get<ApiResponse<AnalysisTimeDistributionItem[]>>(
          "/system/dashboard/analysis/time-distribution",
          { params }
        )
        .then((r) => r.data),
    apiName: "fetchAnalysisTimeDistribution",
    setLoading,
  });
  return data || [];
}
