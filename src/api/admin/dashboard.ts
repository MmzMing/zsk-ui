import { request } from "../axios";

export type AdminMenuItem = {
  id: string;
  name: string;
  path: string;
  icon?: string;
  permission?: string;
  children?: AdminMenuItem[];
};

export async function fetchAdminMenuTree() {
  return request.get<AdminMenuItem[]>("/admin/menu/tree");
}

export type DashboardOverview = {
  docTotal: number;
  docIncrease: number;
  videoTotal: number;
  videoIncrease: number;
  activeUsers: number;
  activeRate: number;
  pageViews: number;
  pvChangeRate: number;
};

export async function fetchDashboardOverview(params: { range?: string }) {
  return request.get<DashboardOverview>("/admin/dashboard/overview", {
    params
  });
}

export type DashboardTrafficItem = {
  type: "document" | "video";
  date: string;
  value: number;
};

export async function fetchDashboardTraffic(params: { range?: string }) {
  return request.get<DashboardTrafficItem[]>("/admin/dashboard/traffic", {
    params
  });
}

export type DashboardTrendItem = {
  date: string;
  value: number;
};

export async function fetchDashboardTrend(params: { range?: string }) {
  return request.get<DashboardTrendItem[]>("/admin/dashboard/trend", {
    params
  });
}

export type RecentAdminLogItem = {
  id: string;
  category: "content" | "user" | "system" | string;
  operator: string;
  action: string;
  detail: string;
  createdAt: string;
};

export type RecentAdminLogResponse = {
  list: RecentAdminLogItem[];
  total: number;
};

export type RecentAdminLogParams = {
  category?: "content" | "user" | "system";
  page: number;
  pageSize: number;
};

export async function fetchRecentAdminLogs(params: RecentAdminLogParams) {
  return request.get<RecentAdminLogResponse>("/admin/logs/recent", {
    params
  });
}

export type AnalysisMetrics = {
  pvToday: number;
  pvTodayChange: number;
  pv7d: number;
  pv7dChange: number;
  contentTotal: number;
  contentIncrease: number;
  systemHealthScore: number;
  systemHealthText: string;
};

export async function fetchAnalysisMetrics(params: { range?: string }) {
  return request.get<AnalysisMetrics>("/admin/dashboard/analysis/metrics", {
    params
  });
}

export type AnalysisTimeDistributionItem = {
  type: "document" | "video";
  time: string;
  value: number;
};

export type AnalysisTimeDistributionParams = {
  date?: string;
  step?: "hour" | "half-hour";
};

export async function fetchAnalysisTimeDistribution(
  params: AnalysisTimeDistributionParams
) {
  return request.get<AnalysisTimeDistributionItem[]>(
    "/admin/dashboard/analysis/time-distribution",
    {
      params
    }
  );
}

export type AnalysisDisplayConfig = {
  defaultTheme: "light" | "dark" | "auto" | string;
  allowedThemes: string[];
  autoThemeFollowSystem: boolean;
  fullScreenHideElements: string[];
};

export async function fetchAnalysisDisplayConfig() {
  return request.get<AnalysisDisplayConfig>(
    "/admin/dashboard/analysis/display-config"
  );
}
