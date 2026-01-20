import React, { useMemo, useState } from "react";
import { Card, Chip, Button, Tab } from "@heroui/react";
import { AdminTabs } from "@/components/Admin/AdminTabs";
import type { ColumnConfig, LineConfig } from "@ant-design/plots";
import { Column, Line } from "@ant-design/plots";
import { useAppStore } from "../../../store";

type CacheInstance = {
  id: string;
  name: string;
  usage: number;
  nodes: number;
  hitRate: number;
};

const instances: CacheInstance[] = [
  { id: "redis-main", name: "Redis 主实例", usage: 0.91, nodes: 3, hitRate: 0.93 },
  { id: "redis-session", name: "会话缓存", usage: 0.76, nodes: 2, hitRate: 0.97 },
  { id: "redis-feed", name: "Feed 流缓存", usage: 0.84, nodes: 4, hitRate: 0.89 }
];

const hitRateTrendData: LineConfig["data"] = [
  { time: "10:00", value: 96, type: "命中率" },
  { time: "10:10", value: 95, type: "命中率" },
  { time: "10:20", value: 93, type: "命中率" },
  { time: "10:30", value: 94, type: "命中率" },
  { time: "10:40", value: 95, type: "命中率" }
];

const qpsTrendData: ColumnConfig["data"] = [
  { time: "10:00", value: 430, type: "请求 QPS" },
  { time: "10:10", value: 520, type: "请求 QPS" },
  { time: "10:20", value: 610, type: "请求 QPS" },
  { time: "10:30", value: 580, type: "请求 QPS" },
  { time: "10:40", value: 640, type: "请求 QPS" }
];

function CacheMonitorPage() {
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [activeInstanceId, setActiveInstanceId] = useState("redis-main");
  const { themeMode } = useAppStore();

  const chartTheme =
    themeMode === "dark"
      ? "classicDark"
      : themeMode === "light"
        ? "classic"
        : window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "classicDark"
          : "classic";

  const sortedInstances = useMemo(() => {
    const list = [...instances];
    list.sort((a, b) =>
      order === "desc" ? b.usage - a.usage : a.usage - b.usage
    );
    return list;
  }, [order]);

  const activeInstance = useMemo(
    () => sortedInstances.find(item => item.id === activeInstanceId) ?? sortedInstances[0],
    [sortedInstances, activeInstanceId]
  );

  const hitLineConfig: LineConfig = useMemo(
    () => ({
      data: hitRateTrendData,
      xField: "time",
      yField: "value",
      smooth: true,
      yAxis: {
        min: 80,
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
      theme: chartTheme
    }),
    [chartTheme]
  );

  const qpsColumnConfig: ColumnConfig = useMemo(
    () => ({
      data: qpsTrendData,
      xField: "time",
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
    }),
    [chartTheme]
  );

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 rounded-full bg-[color-mix(in_srgb,var(--primary-color)_10%,transparent)] px-3 py-1 text-xs text-[var(--primary-color)]">
          <span>系统运维 · 缓存监控</span>
        </div>
        <h1 className="text-lg md:text-xl font-semibold tracking-tight">
          观察缓存实例运行状态与性能表现
        </h1>
        <p className="text-xs text-[var(--text-color-secondary)] max-w-2xl">
          通过实例列表与多维图表快速了解缓存使用率、命中率与性能趋势，提前发现潜在瓶颈。
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,260px)_minmax(0,1fr)]">
        <Card className="border border-[var(--border-color)] bg-[var(--bg-elevated)]/95">
          <div className="p-3 flex items-center justify-between border-b border-[var(--border-color)]">
            <div className="text-xs font-medium">缓存实例列表</div>
            <div className="flex items-center gap-2 text-xs">
              <Button
                size="sm"
                variant={order === "desc" ? "solid" : "light"}
                className="text-xs h-7"
                onPress={() => setOrder("desc")}
              >
                从高到低
              </Button>
              <Button
                size="sm"
                variant={order === "asc" ? "solid" : "light"}
                className="text-xs h-7"
                onPress={() => setOrder("asc")}
              >
                从低到高
              </Button>
            </div>
          </div>
          <div className="p-2 space-y-2 text-xs max-h-72 overflow-auto">
            {sortedInstances.map(item => {
              const percent = Math.round(item.usage * 100);
              const critical = percent >= 90;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={
                    "w-full flex items-center justify-between gap-2 px-3 py-2 rounded-md border text-left transition-colors " +
                    (activeInstance?.id === item.id
                      ? "border-[var(--primary-color)] bg-[color-mix(in_srgb,var(--primary-color)_10%,transparent)]"
                      : "border-[var(--border-color)] hover:bg-[var(--bg-elevated)]/90")
                  }
                  onClick={() => setActiveInstanceId(item.id)}
                >
                  <div className="flex flex-col">
                    <span className="text-[var(--text-color)]">{item.name}</span>
                    <span className="text-xs text-[var(--text-color-secondary)]">
                      节点数：{item.nodes} · 命中率 {Math.round(item.hitRate * 100)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {critical && (
                      <Chip size="sm" color="danger" variant="flat" className="text-xs">
                        即将满
                      </Chip>
                    )}
                    <span className="text-xs">{percent}%</span>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        <Card className="border border-[var(--border-color)] bg-[var(--bg-elevated)]/95">
          <div className="p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-medium">
                  {activeInstance?.name ?? "请选择缓存实例"}
                </span>
                {activeInstance && (
                  <span className="text-[11px] text-[var(--text-color-secondary)]">
                    当前使用率 {Math.round(activeInstance.usage * 100)}%，命中率{" "}
                    {Math.round(activeInstance.hitRate * 100)}%
                  </span>
                )}
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <div className="text-[var(--text-color-secondary)]">内存占用</div>
                <div className="text-sm">
                  {activeInstance ? `${Math.round(activeInstance.usage * 100)}%` : "-"}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-[var(--text-color-secondary)]">命中率</div>
                <div className="text-sm">
                  {activeInstance ? `${Math.round(activeInstance.hitRate * 100)}%` : "-"}
                </div>
              </div>
            </div>
            {activeInstance && activeInstance.hitRate < 0.9 && (
              <div className="text-[11px] text-yellow-500">
                命中率低于 90%，建议检查缓存键粒度、过期策略与热点数据是否合理。
              </div>
            )}
            <AdminTabs
              aria-label="缓存监控图表"
              size="sm"
              className="mt-1"
            >
              <Tab key="hit" title="命中率趋势">
                <div className="h-56 mt-2">
                  <Line {...hitLineConfig} />
                </div>
              </Tab>
              <Tab key="qps" title="QPS 趋势">
                <div className="h-56 mt-2">
                  <Column {...qpsColumnConfig} />
                </div>
              </Tab>
            </AdminTabs>
          </div>
        </Card>
      </div>

      <Card className="border border-[var(--border-color)] bg-[var(--bg-elevated)]/95">
        <div className="p-4 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">缓存操作日志（示例）</div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between px-2 py-1 rounded-md bg-[var(--bg-elevated)]/80">
              <span>10:40</span>
              <span className="text-xs text-[var(--text-color-secondary)]">
                [redis-main] 批量删除键前缀为 session:* 的 120 个键
              </span>
            </div>
            <div className="flex items-center justify-between px-2 py-1 rounded-md bg-[var(--bg-elevated)]/80">
              <span>10:30</span>
              <span className="text-xs text-[var(--text-color-secondary)]">
                [redis-feed] 刷新热点列表缓存，耗时 120ms
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default CacheMonitorPage;
