import React, { useMemo } from "react";
import { Card, Chip } from "@heroui/react";
import {
  FiBarChart2
} from "react-icons/fi";
import type { ColumnConfig } from "@ant-design/plots";
import { Column } from "@ant-design/plots";
import { useAppStore } from "../../store";
import { mockMetricCards, mockBigScreenData } from "../../api/mock/admin/dashboard";

const metricCards = mockMetricCards;

const bigScreenData: ColumnConfig["data"] = mockBigScreenData;

function AnalysisPage() {
  const { themeMode } = useAppStore();
  const chartTheme =
    themeMode === "dark"
      ? "classicDark"
      : themeMode === "light"
        ? "classic"
        : window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "classicDark"
          : "classic";

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
    [chartTheme]
  );

  const renderMetricDelta = (delta: string, tone: string) => {
    if (tone === "stable") {
      return (
        <span className="text-xs text-[var(--text-color-secondary)]">
          {delta}
        </span>
      );
    }
    return (
      <span className="text-xs text-emerald-400">
        {delta}
      </span>
    );
  };

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

      <div className="grid gap-4 lg:grid-cols-4">
        {metricCards.map(item => (
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
        ))}
      </div>

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
            <Chip size="sm" variant="flat" className="text-xs">
              数据来自 mock · 待接入接口
            </Chip>
          </div>
          <div className="h-72">
            <Column {...columnConfig} />
          </div>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="relative">
      <div className="space-y-6">
        {renderScreenContent()}
      </div>
    </div>
  );
}

export default AnalysisPage;

