import React, { useMemo, useState } from "react";
import { Card, Chip, Button, DateRangePicker } from "@heroui/react";
import type { LineConfig } from "@ant-design/plots";
import { Line } from "@ant-design/plots";
import { useAppStore } from "../../../store";

type MonitorMetric = "cpu" | "memory" | "disk" | "network";

type MonitorPoint = {
  time: string;
  value: number;
  metric: MonitorMetric;
};

const monitorData: MonitorPoint[] = [
  { metric: "cpu", time: "10:00", value: 32 },
  { metric: "cpu", time: "10:10", value: 45 },
  { metric: "cpu", time: "10:20", value: 67 },
  { metric: "cpu", time: "10:30", value: 81 },
  { metric: "cpu", time: "10:40", value: 76 },
  { metric: "memory", time: "10:00", value: 58 },
  { metric: "memory", time: "10:10", value: 61 },
  { metric: "memory", time: "10:20", value: 63 },
  { metric: "memory", time: "10:30", value: 69 },
  { metric: "memory", time: "10:40", value: 72 },
  { metric: "disk", time: "10:00", value: 71 },
  { metric: "disk", time: "10:10", value: 74 },
  { metric: "disk", time: "10:20", value: 78 },
  { metric: "disk", time: "10:30", value: 83 },
  { metric: "disk", time: "10:40", value: 88 },
  { metric: "network", time: "10:00", value: 23 },
  { metric: "network", time: "10:10", value: 31 },
  { metric: "network", time: "10:20", value: 29 },
  { metric: "network", time: "10:30", value: 35 },
  { metric: "network", time: "10:40", value: 41 }
];

function SystemMonitorPage() {
  const [paused, setPaused] = useState(false);
  const { themeMode } = useAppStore();

  const chartTheme =
    themeMode === "dark"
      ? "classicDark"
      : themeMode === "light"
        ? "classic"
        : window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "classicDark"
          : "classic";

  const overview = useMemo(() => {
    return {
      cpu: 0.81,
      memory: 0.72,
      disk: 0.88,
      network: 0.41
    };
  }, []);

  const hasCritical = overview.cpu >= 0.8 || overview.disk >= 0.8;

  const filteredData = useMemo(() => monitorData, []);

  const lineConfig: LineConfig = useMemo(
    () => ({
      data: filteredData,
      xField: "time",
      yField: "value",
      seriesField: "metric",
      smooth: true,
      yAxis: {
        min: 0,
        max: 100,
        label: {
          formatter: (value: number | string) => `${value}%`,
          style: {
            fontSize: 10
          }
        },
        grid: {
          line: {
            style: {
              stroke: "rgba(148,163,184,0.35)",
              lineDash: [4, 4]
            }
          }
        }
      },
      xAxis: {
        label: {
          style: {
            fontSize: 10
          }
        }
      },
      legend: {
        position: "top"
      },
      tooltip: {
        shared: true
      },
      theme: chartTheme
    }),
    [filteredData, chartTheme]
  );

  const renderOverviewCard = (label: string, value: number, key: MonitorMetric) => {
    const percent = Math.round(value * 100);
    const critical = percent >= 80;
    const colorClass = critical ? "text-red-500" : "text-emerald-400";
    const badgeClass = critical ? "bg-red-500" : "bg-emerald-400";
    return (
      <Card
        key={key}
        className={
          "border border-[var(--border-color)] bg-[var(--bg-elevated)]/95 transition-colors " +
          (critical ? "ring-1 ring-red-500/60" : "")
        }
      >
        <div className="p-4 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="text-xs text-[var(--text-color-secondary)]">
              {label}
            </div>
            <div className="flex items-center gap-1">
              <span className={badgeClass + " inline-flex h-2 w-2 rounded-full"} />
              <span className="text-xs text-[var(--text-color-secondary)]">
                {critical ? "高负载" : "正常"}
              </span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <div className={"text-xl font-semibold " + colorClass}>{percent}%</div>
          </div>
          {critical && (
            <div className="text-xs text-red-500">
              使用率已超过 80%，建议排查相关服务或扩容资源。
            </div>
          )}
          {!critical && (
            <div className="text-xs text-[var(--text-color-secondary)]">
              指标处于安全区间，当前无异常告警。
            </div>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1">
          <div className="inline-flex items-center gap-2 rounded-full bg-[color-mix(in_srgb,var(--primary-color)_10%,transparent)] px-3 py-1 text-xs text-[var(--primary-color)]">
            <span>系统运维 · 系统监控</span>
          </div>
        <h1 className="text-lg md:text-xl font-semibold tracking-tight">
          实时监控系统资源与告警概况
        </h1>
        <p className="text-xs text-[var(--text-color-secondary)] max-w-2xl">
          通过概览面板快速掌握 CPU、内存、磁盘与网络使用率，并结合趋势图与告警列表排查潜在风险。
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {renderOverviewCard("CPU 使用率", overview.cpu, "cpu")}
        {renderOverviewCard("内存使用率", overview.memory, "memory")}
        {renderOverviewCard("磁盘使用率", overview.disk, "disk")}
        {renderOverviewCard("网络使用率", overview.network, "network")}
      </div>

      <Card className="border border-[var(--border-color)] bg-[var(--bg-elevated)]/95">
        <div className="p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm font-medium">
                资源使用趋势
              </div>
              <div className="text-xs text-[var(--text-color-secondary)]">
                按时间观察 CPU、内存、磁盘与网络的使用变化，用于定位异常时间段。
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-xs">
                <span className="text-[var(--text-color-secondary)]">时间范围：</span>
                <DateRangePicker
                  aria-label="资源使用时间范围"
                  size="sm"
                  variant="bordered"
                  className="w-56 text-xs"
                />
              </div>
              <Button
                size="sm"
                variant="bordered"
                className="text-xs h-7"
                onPress={() => setPaused(previous => !previous)}
              >
                {paused ? "恢复实时" : "暂停刷新"}
              </Button>
            </div>
          </div>
          <div className="h-72">
            <Line {...lineConfig} />
          </div>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card className="border border-[var(--border-color)] bg-[var(--bg-elevated)]/95">
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">异常告警列表（示例）</div>
              {hasCritical && (
                <Chip size="sm" color="danger" variant="flat" className="text-xs">
                  存在高优先级告警
                </Chip>
              )}
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between px-2 py-1 rounded-md bg-red-500/10 border border-red-500/40">
                <div className="flex flex-col">
                  <span className="font-medium text-red-500">
                    CPU 使用率持续高于 80%
                  </span>
                  <span className="text-xs text-[var(--text-color-secondary)]">
                    近 10 分钟内多次触发高负载告警，建议排查高耗时任务或扩容节点。
                  </span>
                </div>
                <span className="text-xs text-[var(--text-color-secondary)]">
                  10:40
                </span>
              </div>
              <div className="flex items-center justify-between px-2 py-1 rounded-md bg-yellow-500/10 border border-yellow-500/40">
                <div className="flex flex-col">
                  <span className="font-medium text-yellow-500">
                    磁盘使用率接近 90%
                  </span>
                  <span className="text-xs text-[var(--text-color-secondary)]">
                    建议清理无用日志或扩容磁盘空间，避免写入失败。
                  </span>
                </div>
                <span className="text-xs text-[var(--text-color-secondary)]">
                  10:35
                </span>
              </div>
            </div>
          </div>
        </Card>
        <Card className="border border-[var(--border-color)] bg-[var(--bg-elevated)]/95">
          <div className="p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">服务器节点状态（示例）</div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between px-2 py-1 rounded-md bg-emerald-500/5">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span>node-01</span>
                </div>
                <span className="text-xs text-[var(--text-color-secondary)]">
                  在线 · CPU 52% · 内存 61%
                </span>
              </div>
              <div className="flex items-center justify-between px-2 py-1 rounded-md bg-emerald-500/5">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span>node-02</span>
                </div>
                <span className="text-xs text-[var(--text-color-secondary)]">
                  在线 · CPU 48% · 内存 55%
                </span>
              </div>
              <div className="flex items-center justify-between px-2 py-1 rounded-md bg-yellow-500/10">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-yellow-500" />
                  <span>node-03</span>
                </div>
                <span className="text-xs text-[var(--text-color-secondary)]">
                  异常 · 网络波动 · 正在重试
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default SystemMonitorPage;
