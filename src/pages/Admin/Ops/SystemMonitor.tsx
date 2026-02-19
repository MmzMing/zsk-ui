/**
 * 系统监控页面
 * @module pages/Admin/Ops/SystemMonitor
 * @description 系统资源使用情况及实时趋势图展示
 */

import React, { useMemo, useState, useEffect, useCallback } from "react";
import { Card, Chip, Button, DateRangePicker } from "@heroui/react";
import { Loading } from "@/components/Loading";
import type { LineConfig } from "@ant-design/plots";
import { Line } from "@ant-design/plots";
import { useAppStore } from "@/store";
import {
  getSystemMonitorFullData,
  type MonitorPoint,
  type MonitorOverview,
  type MonitorMetric,
} from "@/api/admin/ops";
import { addToast } from "@heroui/react";
import { handleDebugOutput } from "@/utils";
import { useAdminDataLoader } from "@/hooks";

// ===== 2. TODO待处理导入区域 =====

/**
 * 系统监控页面组件
 * 展示系统资源使用情况及实时趋势图
 */
function SystemMonitorPage() {
  // ===== 3. 状态控制逻辑区域 =====
  /** 是否暂停刷新 */
  const [paused, setPaused] = useState(false);
  /** 主题模式 */
  const { themeMode } = useAppStore();
  /** 监控数据点列表 */
  const [monitorData, setMonitorData] = useState<MonitorPoint[]>([]);
  /** 系统资源概览数据 */
  const [overview, setOverview] = useState<MonitorOverview>({
    cpu: 0,
    memory: 0,
    disk: 0,
    network: 0,
    jvmHeap: 0,
    jvmThread: 0,
    hostName: "",
    hostIp: "",
    osName: "",
  });
  /** 系统监控数据加载器 */
  const { loading, loadData: loadSystemData } = useAdminDataLoader<{
    monitorData: MonitorPoint[];
    overview: MonitorOverview;
  }>();

  // ===== 4. 通用工具函数区域 =====
  /**
   * 打印调试日志
   * @param message 日志消息
   */
  const showDebugLog = useCallback((message: string) => {
    handleDebugOutput({
      debugLevel: "info",
      debugMessage: "[SystemMonitor]",
      debugDetail: message,
    });
  }, []);

  /** 图表主题配置 */
  const chartTheme = useMemo(() => {
    if (themeMode === "dark") return "classicDark";
    if (themeMode === "light") return "classic";
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "classicDark"
      : "classic";
  }, [themeMode]);

  /** 是否存在严重告警 */
  const hasCritical = useMemo(
    () => overview.cpu >= 80 || overview.disk >= 80,
    [overview.cpu, overview.disk]
  );

  /** 过滤后的监控数据 */
  const filteredData = useMemo(() => monitorData || [], [monitorData]);

  /** 折线图配置对象 */
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
            fontSize: 10,
          },
        },
        grid: {
          line: {
            style: {
              stroke: "rgba(148,163,184,0.35)",
              lineDash: [4, 4],
            },
          },
        },
      },
      xAxis: {
        label: {
          style: {
            fontSize: 10,
          },
        },
      },
      legend: {
        position: "top",
      },
      tooltip: {
        shared: true,
      },
      theme: chartTheme,
    }),
    [filteredData, chartTheme]
  );

  // ===== 5. 注释代码函数区 =====
  /**
   * handleRefreshMonitorData
   * 示例：处理手动刷新监控数据的逻辑
   */
  // const handleRefreshMonitorData = () => {
  //   loadData();
  // };

  // ===== 6. 错误处理函数区域 =====
  /**
   * 统一错误提示处理
   * @param error 错误对象
   * @param prefix 错误前缀描述
   */
  const showErrorFn = useCallback(
    (error: unknown, prefix: string) => {
      const message = error instanceof Error ? error.message : String(error);
      addToast({
        title: `${prefix}失败`,
        description: message,
        color: "danger",
      });
      showDebugLog(`${prefix}出错: ${message}`);
    },
    [showDebugLog]
  );

  // ===== 7. 数据处理函数区域 =====
  /** 加载监控数据及概览信息 */
  const loadData = useCallback(async () => {
    const result = await loadSystemData(() => getSystemMonitorFullData({
      setLoading: () => {},
      onError: (err) => showErrorFn(err, "获取监控数据"),
    }), {
      showErrorToast: true,
      errorMessage: '获取系统监控数据失败'
    });

    if (result) {
      if (result.monitorData.length > 0) setMonitorData(result.monitorData);
      if (result.overview) setOverview(result.overview);
    }
  }, [showErrorFn, loadSystemData]);

  /** 切换暂停/恢复状态 */
  const handleTogglePaused = useCallback(() => {
    setPaused((prev) => !prev);
  }, []);

  // ===== 8. UI渲染逻辑区域 =====
  /**
   * 渲染资源概览卡片
   * @param label 资源名称
   * @param value 资源使用率 (0-100)
   * @param key 资源标识符
   */
  const renderOverviewCard = (
    label: string,
    value: number,
    key: MonitorMetric
  ) => {
    const percent = Math.round(value);
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
              <span
                className={badgeClass + " inline-flex h-2 w-2 rounded-full"}
              />
              <span className="text-xs text-[var(--text-color-secondary)]">
                {critical ? "高负载" : "正常"}
              </span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <div className={"text-xl font-semibold " + colorClass}>
              {percent}%
            </div>
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

  // ===== 9. 页面初始化与事件绑定 =====
  /** 初始化加载数据 */
  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadData]);

  // ===== 10. TODO任务管理区域 =====

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

      <div className="grid gap-4 md:grid-cols-4 min-h-[120px]">
        {loading ? (
          <>
            <Card className="border border-[var(--border-color)] bg-[var(--bg-elevated)]/95 h-[120px] flex items-center justify-center">
              <Loading height={60} />
            </Card>
            <Card className="border border-[var(--border-color)] bg-[var(--bg-elevated)]/95 h-[120px] flex items-center justify-center">
              <Loading height={60} />
            </Card>
            <Card className="border border-[var(--border-color)] bg-[var(--bg-elevated)]/95 h-[120px] flex items-center justify-center">
              <Loading height={60} />
            </Card>
            <Card className="border border-[var(--border-color)] bg-[var(--bg-elevated)]/95 h-[120px] flex items-center justify-center">
              <Loading height={60} />
            </Card>
          </>
        ) : (
          <>
            {renderOverviewCard("CPU 使用率", overview.cpu, "cpu")}
            {renderOverviewCard("内存使用率", overview.memory, "memory")}
            {renderOverviewCard("磁盘使用率", overview.disk, "disk")}
            {renderOverviewCard("网络使用率", overview.network, "network")}
          </>
        )}
      </div>

      <Card className="border border-[var(--border-color)] bg-[var(--bg-elevated)]/95 min-h-[300px]">
        {loading ? (
          <Loading height={300} />
        ) : (
          <div className="p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm font-medium">资源使用趋势</div>
                <div className="text-xs text-[var(--text-color-secondary)]">
                  按时间观察 CPU、内存、磁盘与网络的使用变化，用于定位异常时间段。
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-[var(--text-color-secondary)]">
                    时间范围：
                  </span>
                  <DateRangePicker
                    aria-label="资源使用时间范围"
                    size="sm"
                    variant="bordered"
                    className="w-56 text-xs"
                    classNames={{
                      inputWrapper: [
                        "h-8",
                        "bg-transparent",
                        "border border-[var(--border-color)]",
                        "dark:border-white/20",
                        "hover:border-[var(--primary-color)]/80!",
                        "group-data-[focus=true]:border-[var(--primary-color)]!",
                        "transition-colors",
                        "shadow-none",
                      ].join(" "),
                      input: "text-xs",
                      selectorButton:
                        "text-[var(--text-color-secondary)] hover:text-[var(--primary-color)] transition-colors",
                    }}
                  />
                </div>
                <Button
                  size="sm"
                  variant="bordered"
                  className="text-xs h-7"
                  onPress={handleTogglePaused}
                >
                  {paused ? "恢复实时" : "暂停刷新"}
                </Button>
              </div>
            </div>
            <div className="h-72">
              <Line {...lineConfig} />
            </div>
          </div>
        )}
      </Card>

      <div className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] min-h-[200px]">
        {loading ? (
          <>
            <Card className="border border-[var(--border-color)] bg-[var(--bg-elevated)]/95 h-[200px] flex items-center justify-center">
              <Loading height={100} />
            </Card>
            <Card className="border border-[var(--border-color)] bg-[var(--bg-elevated)]/95 h-[200px] flex items-center justify-center">
              <Loading height={100} />
            </Card>
          </>
        ) : (
          <>
            <Card className="border border-[var(--border-color)] bg-[var(--bg-elevated)]/95">
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">异常告警列表（示例）</div>
                  {hasCritical && (
                    <Chip
                      size="sm"
                      color="danger"
                      variant="flat"
                      className="text-xs"
                    >
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
                  <div className="text-sm font-medium">
                    服务器节点状态（示例）
                  </div>
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
          </>
        )}
      </div>
    </div>
  );
}

// ===== 11. 导出区域 =====
export default SystemMonitorPage;

