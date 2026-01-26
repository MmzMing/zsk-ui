// ===== 1. 依赖导入区域 =====
import React, { useMemo, useEffect, useState, useCallback } from "react";
import { Card, Chip, Button, Tooltip, Tab } from "@heroui/react";
import { AdminTabs } from "@/components/Admin/AdminTabs";
import {
  FiBarChart2,
  FiTrendingUp,
  FiRefreshCw
} from "react-icons/fi";
import type { ColumnConfig, LineConfig } from "@ant-design/plots";
import { Column, Line } from "@ant-design/plots";
import { useAppStore } from "../../store";
import { 
  fetchDashboardOverview, 
  fetchDashboardTraffic, 
  fetchDashboardTrend,
  type DashboardOverviewItem,
  type DashboardTrafficItem,
  type DashboardTrendItem
} from "../../api/admin/dashboard";
import Loading from "../../components/Loading";

// ===== 2. TODO待处理导入区域 =====

// ===== 3. 状态控制逻辑区域 =====
/**
 * 后台管理首页 - 仪表盘总览
 */
function AdminPage() {
  const { themeMode } = useAppStore();

  /** 概览卡片数据 */
  const [overviewCards, setOverviewCards] = useState<DashboardOverviewItem[]>([]);
  /** 流量统计数据 */
  const [trafficData, setTrafficData] = useState<DashboardTrafficItem[]>([]);
  /** 访问趋势数据 */
  const [trendData, setTrendData] = useState<DashboardTrendItem[]>([]);
  /** 加载状态 */
  const [isLoading, setIsLoading] = useState(true);

  /** 图表主题配置 */
  const chartTheme = useMemo(() => {
    return themeMode === "dark"
      ? "classicDark"
      : themeMode === "light"
        ? "classic"
        : window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "classicDark"
          : "classic";
  }, [themeMode]);

  /** 柱状图配置 */
  const columnConfig: ColumnConfig = useMemo(() => ({
    data: trafficData,
    isGroup: true,
    xField: "date",
    yField: "value",
    seriesField: "type",
    columnStyle: {
      radius: [4, 4, 0, 0]
    },
    xAxis: {
      label: {
        style: {
          fontSize: 10
        }
      }
    },
    yAxis: {
      label: {
        style: {
          fontSize: 10
        }
      }
    },
    legend: {
      position: "top"
    },
    theme: chartTheme
  }), [trafficData, chartTheme]);

  /** 折线图配置 */
  const lineConfig: LineConfig = useMemo(() => ({
    data: trendData,
    xField: "date",
    yField: "value",
    smooth: true,
    point: {
      size: 3,
      shape: "circle"
    },
    xAxis: {
      label: {
        style: {
          fontSize: 10
        }
      }
    },
    yAxis: {
      label: {
        style: {
          fontSize: 10
        }
      }
    },
    theme: chartTheme
  }), [trendData, chartTheme]);

  // ===== 4. 通用工具函数区域 =====

  // ===== 5. 注释代码函数区 =====

  // ===== 6. 错误处理函数区域 =====

  // ===== 7. 数据处理函数区域 =====
  /**
   * 获取仪表盘页面初始化数据
   */
  const handleFetchInitData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [overviewRes, trafficRes, trendRes] = await Promise.all([
        fetchDashboardOverview(),
        fetchDashboardTraffic({ range: "7d" }),
        fetchDashboardTrend({ range: "7d" })
      ]);
      setOverviewCards(overviewRes);
      setTrafficData(trafficRes);
      setTrendData(trendRes);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ===== 8. UI渲染逻辑区域 =====
  /**
   * 渲染页面头部
   */
  const renderHeader = () => (
    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-[color-mix(in_srgb,var(--primary-color)_10%,transparent)] px-3 py-1 text-xs text-[var(--primary-color)]">
          <FiBarChart2 className="text-xs" />
          <span>后台管理 · 仪表盘总览</span>
        </div>
        <h1 className="text-xl md:text-2xl font-semibold tracking-tight">
          快速了解知识库的整体运行情况
        </h1>
        <p className="text-xs text-[var(--text-color-secondary)] max-w-2xl leading-relaxed">
          从内容规模、访问趋势到用户活跃度，一张总览面板帮助你快速判断当前站点的健康状况，
          后续可在各子模块中进一步查看详细数据与操作视图。
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Tooltip content="刷新当前看板数据">
          <Button
            isIconOnly
            size="sm"
            variant="light"
            color="danger"
            className="text-xs"
            onClick={handleFetchInitData}
            isLoading={isLoading}
          >
            <FiRefreshCw className="text-sm" />
          </Button>
        </Tooltip>
      </div>
    </div>
  );

  /**
   * 渲染概览卡片列表
   */
  const renderOverviewCards = () => (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {isLoading ? (
        Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border border-[var(--border-color)] bg-[var(--bg-elevated)]/95 min-h-[120px] flex items-center justify-center">
            <Loading />
          </Card>
        ))
      ) : (
        overviewCards.map(item => {
          const Icon = item.icon;
          return (
            <Card
              key={item.key}
              className="border border-[var(--border-color)] bg-[var(--bg-elevated)]/95"
            >
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-[var(--text-color-secondary)]">
                    {item.label}
                  </div>
                  <div className="h-8 w-8 rounded-full bg-[color-mix(in_srgb,var(--primary-color)_10%,transparent)] flex items-center justify-center text-[var(--primary-color)]">
                    <Icon className="text-sm" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <div className="text-xl font-semibold">{item.value}</div>
                  <div className="text-[11px] text-emerald-400">
                    {item.delta}
                  </div>
                </div>
                <div className="text-[11px] text-[var(--text-color-secondary)]">
                  {item.description}
                </div>
              </div>
            </Card>
          );
        })
      )}
    </div>
  );

  /**
   * 渲染图表区域
   */
  const renderCharts = () => (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2 border border-[var(--border-color)] bg-[var(--bg-elevated)]/95">
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">
                最近 7 天访问结构（文档 / 视频）
              </div>
              <div className="text-[11px] text-[var(--text-color-secondary)]">
                用于观察不同内容形态的访问占比与增长节奏
              </div>
            </div>
            {!isLoading && (
              <Chip size="sm" variant="flat" className="text-[10px]">
                数据来自 API
              </Chip>
            )}
          </div>
          <div className="h-64 flex items-center justify-center">
            {isLoading ? (
              <Loading />
            ) : (
              <div className="w-full h-full">
                <Column {...columnConfig} />
              </div>
            )}
          </div>
        </div>
      </Card>

      <Card className="border border-[var(--border-color)] bg-[var(--bg-elevated)]/95">
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">近 7 天总访问趋势</div>
              <div className="text-[11px] text-[var(--text-color-secondary)]">
                评估整体热度变化
              </div>
            </div>
            <FiTrendingUp className="text-[var(--primary-color)]" />
          </div>
          <div className="h-64 flex items-center justify-center">
            {isLoading ? (
              <Loading />
            ) : (
              <div className="w-full h-full">
                <Line {...lineConfig} />
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );

  /**
   * 渲染底部操作记录
   */
  const renderRecentLogs = () => (
    <Card className="border border-[var(--border-color)] bg-[var(--bg-elevated)]/95">
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium">最近操作记录</div>
            <div className="text-[11px] text-[var(--text-color-secondary)]">
              用于帮助管理员回顾最近的内容调整情况
            </div>
          </div>
        </div>
        <AdminTabs
          aria-label="最近操作记录"
          size="sm"
          className="mt-2"
          classNames={{
            tabList: "p-0 h-8 gap-0",
            tab: "h-8 px-3 text-xs"
          }}
        >
          <Tab key="content" title="内容调整">
            <ul className="space-y-2 text-xs text-[var(--text-color-secondary)]">
              <li>· 上架新文档《如何把视频课程拆解成学习笔记》</li>
              <li>· 更新视频《前端工程化下的内容管理实践》封面与标签</li>
              <li>· 调整首页推荐位权重：提升新手引导文档曝光度</li>
            </ul>
          </Tab>
          <Tab key="user" title="用户与权限">
            <ul className="space-y-2 text-xs text-[var(--text-color-secondary)]">
              <li>· 新增角色「内容审核员」，授予文档审核相关权限</li>
              <li>· 调整部分内部账号的后台访问范围</li>
            </ul>
          </Tab>
          <Tab key="system" title="系统与监控">
            <ul className="space-y-2 text-xs text-[var(--text-color-secondary)]">
              <li>· 每日离线统计任务执行成功，日志已归档</li>
              <li>· 无异常告警记录，系统运行稳定</li>
            </ul>
          </Tab>
        </AdminTabs>
      </div>
    </Card>
  );

  // ===== 9. 页面初始化与事件绑定 =====
  useEffect(() => {
    handleFetchInitData();
  }, [handleFetchInitData]);

  return (
    <div className="space-y-6">
      {renderHeader()}
      {renderOverviewCards()}
      {renderCharts()}
      {renderRecentLogs()}
    </div>
  );
}

// ===== 10. TODO任务管理区域 =====

// ===== 11. 导出区域 =====
export default AdminPage;
