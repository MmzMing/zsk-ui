// ===== 1. 依赖导入区域 =====
import React, { useMemo, useEffect, useState, useCallback } from "react";
import { Card, Chip } from "@heroui/react";
import { FiBarChart2 } from "react-icons/fi";
import type { ColumnConfig } from "@ant-design/plots";
import { Column } from "@ant-design/plots";
import { useAppStore } from "../../store";
import { 
  fetchAnalysisMetrics, 
  fetchAnalysisTimeDistribution,
  type AnalysisMetricItem,
  type AnalysisTimeDistributionItem
} from "../../api/admin/dashboard";
import Loading from "../../components/Loading";

// ===== 2. TODO待处理导入区域 =====

// ===== 3. 状态控制逻辑区域 =====
/**
 * 仪表盘分析页面
 */
function AnalysisPage() {
  const { themeMode } = useAppStore();
  
  /** 指标卡片数据 */
  const [metricCards, setMetricCards] = useState<AnalysisMetricItem[]>([]);
  /** 大屏图表数据 */
  const [bigScreenData, setBigScreenData] = useState<AnalysisTimeDistributionItem[]>([]);
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

  /** 图表配置项 */
  const columnConfig: ColumnConfig = useMemo(
    () => ({
      data: bigScreenData,
      isGroup: true,
      xField: "time",
      yField: "value",
      seriesField: "type",
      columnStyle: {
        radius: [6, 6, 0, 0]
      },
      xAxis: {
        label: {
          style: {
            fontSize: 12
          }
        }
      },
      yAxis: {
        label: {
          style: {
            fontSize: 12
          }
        },
        grid: {
          line: {
            style: {
              stroke: "rgba(148, 163, 184, 0.3)",
              lineDash: [4, 4]
            }
          }
        }
      },
      legend: {
        position: "top"
      },
      theme: chartTheme
    }),
    [bigScreenData, chartTheme]
  );

  // ===== 4. 通用工具函数区域 =====


  // ===== 5. 注释代码函数区 =====

  // ===== 6. 错误处理函数区域 =====

  // ===== 7. 数据处理函数区域 =====
  /**
   * 获取分析页面初始化数据
   */
  const handleFetchAnalysisData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [metricsRes, distributionRes] = await Promise.all([
        fetchAnalysisMetrics(),
        fetchAnalysisTimeDistribution({})
      ]);
      setMetricCards(metricsRes);
      setBigScreenData(distributionRes);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ===== 8. UI渲染逻辑区域 =====
  /**
   * 渲染指标变化趋势
   * @param delta 变化值
   * @param tone 趋势基调 (up/down/stable)
   */
  const renderMetricDelta = (delta: string, tone: string) => {
    if (tone === "stable") {
      return (
        <span className="text-xs text-[var(--text-color-secondary)]">
          {delta}
        </span>
      );
    }
    const colorClass = tone === "down" ? "text-rose-400" : "text-emerald-400";
    return (
      <span className={`text-xs ${colorClass}`}>
        {delta}
      </span>
    );
  };

  /**
   * 渲染大屏核心内容
   */
  const renderScreenContent = () => (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-[color-mix(in_srgb,var(--primary-color)_10%,transparent)] px-3 py-1 text-xs text-[var(--primary-color)]">
            <FiBarChart2 className="text-xs" />
            <span>后台管理 · 仪表盘分析大屏</span>
          </div>
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight">
            从数字大屏视角观察知识库整体态势
          </h1>
          <p className="text-xs text-[var(--text-color-secondary)] max-w-2xl leading-relaxed">
            聚合访问量、内容规模与系统稳定性等关键指标，用于在展示场景中一目了然地展示当前站点运行情况，
            支持在全屏模式下隐藏导航与标签页，仅保留核心数据看板。
          </p>
        </div>
      </div>

      {/* 指标卡片网格 */}
      <div className="grid gap-4 lg:grid-cols-4">
        {isLoading ? (
          // 加载状态下渲染占位卡片
          Array.from({ length: 4 }).map((_, i) => (
            <Card
              key={i}
              className="border border-[var(--border-color)] bg-[var(--bg-elevated)]/95 min-h-[120px] flex items-center justify-center"
            >
              <Loading />
            </Card>
          ))
        ) : (
          metricCards.map(item => (
            <Card
              key={item.key}
              className="border border-[var(--border-color)] bg-[var(--bg-elevated)]/95"
            >
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-[var(--text-color-secondary)]">
                    {item.label}
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <div className="text-2xl font-semibold">
                    {item.value}
                  </div>
                  {renderMetricDelta(item.delta, item.tone)}
                </div>
                <div className="text-[11px] text-[var(--text-color-secondary)]">
                  {item.description}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* 图表卡片 */}
      <Card className="flex-1 border border-[var(--border-color)] bg-[var(--bg-elevated)]/95">
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">
                黄金时间段访问分布
              </div>
              <div className="text-xs text-[var(--text-color-secondary)]">
                用于在展示场景中突出一天内不同时间段的访问高峰
              </div>
            </div>
            {!isLoading && (
              <Chip size="sm" variant="flat" className="text-xs">
                数据来自 API
              </Chip>
            )}
          </div>
          <div className="h-72 flex items-center justify-center">
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
    </div>
  );

  // ===== 9. 页面初始化与事件绑定 =====
  useEffect(() => {
    handleFetchAnalysisData();
  }, [handleFetchAnalysisData]);

  return (
    <div className="relative">
      <div className="space-y-6">
        {renderScreenContent()}
      </div>
    </div>
  );
}

// ===== 10. TODO任务管理区域 =====

// ===== 11. 导出区域 =====
export default AnalysisPage;


