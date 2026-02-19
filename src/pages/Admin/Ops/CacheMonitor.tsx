/**
 * 缓存监控页面
 * @module pages/Admin/Ops/CacheMonitor
 * @description 缓存实例监控页面，展示缓存命中率、QPS趋势等指标
 */

import React, { useMemo, useState, useEffect, useCallback } from "react";
import { Card, Chip, Button, Tab, addToast } from "@heroui/react";
import { AdminTabs } from "@/components/Admin/AdminTabs";
import { Loading } from "@/components/Loading";
import type { ColumnConfig, LineConfig } from "@ant-design/plots";
import { Column, Line } from "@ant-design/plots";
import { useAppStore } from "@/store";
import {
  CacheInstanceItem as CacheInstance,
  getCacheMonitorInitialData,
  getCacheInstanceDetailData,
  clearCacheInstanceData,
  CacheLogItem,
} from "@/api/admin/ops";
import { useAdminDataLoader } from "@/hooks";

// ===== 2. TODO待处理导入区域 =====

function CacheMonitorPage() {
  // ===== 3. 状态控制逻辑区域 =====
  /** 实例排序顺序 */
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  /** 当前选中的实例 ID */
  const [activeInstanceId, setActiveInstanceId] = useState("");
  /** 缓存实例列表 */
  const [instances, setInstances] = useState<CacheInstance[]>([]);
  /** 命中率趋势数据 */
  const [hitRateTrendData, setHitRateTrendData] = useState<LineConfig["data"]>(
    []
  );
  /** QPS 趋势数据 */
  const [qpsTrendData, setQpsTrendData] = useState<ColumnConfig["data"]>([]);
  /** 缓存操作日志 */
  const [cacheLogs, setCacheLogs] = useState<CacheLogItem[]>([]);
  
  /** 初始化数据加载器 */
  const { loading: loading, loadData: fetchInitialData } = useAdminDataLoader<{
    instances: CacheInstance[];
    defaultInstance: CacheInstance | null;
    detail: {
      hitRateTrendData: unknown[] | undefined;
      qpsTrendData: unknown[] | undefined;
      cacheLogs: CacheLogItem[];
    } | null;
  }>();
  /** 详情数据加载器 */
  const { loading: loadingTrend, loadData: fetchDetailData } = useAdminDataLoader<{
    hitRateTrendData: unknown[] | undefined;
    qpsTrendData: unknown[] | undefined;
    cacheLogs: CacheLogItem[];
  }>();
  /** 清理缓存加载器 */
  const { loadData: fetchClearCache } = useAdminDataLoader<boolean>();
  /** 应用主题模式 */
  const { themeMode } = useAppStore();

  // ===== 4. 通用工具函数区域 =====
  /** 获取图表主题配置 */
  const chartTheme =
    themeMode === "dark"
      ? "classicDark"
      : themeMode === "light"
      ? "classic"
      : window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "classicDark"
      : "classic";

  // ===== 5. 注释代码函数区 =====

  // ===== 6. 错误处理函数区域 =====
  /**
   * 统一错误提示处理
   * @param error 错误对象
   * @param prefix 错误前缀描述
   */
  const showErrorFn = useCallback((error: unknown, prefix: string) => {
    const message = error instanceof Error ? error.message : String(error);
    addToast({
      title: `${prefix}失败`,
      description: message,
      color: "danger",
    });
  }, []);

  // ===== 7. 数据处理函数区域 =====
  /** 加载初始实例列表及默认详情 */
  const loadInitialData = useCallback(async () => {
    const result = await fetchInitialData(() => getCacheMonitorInitialData({
      setLoading: () => {},
      setLoadingTrend: () => {},
      onError: (err) => showErrorFn(err, "加载实例列表"),
    }), {
      showErrorToast: true,
      errorMessage: '加载缓存监控数据失败'
    });

    if (result && result.instances.length > 0) {
      setInstances(result.instances);
      setActiveInstanceId(result.defaultInstance?.id || "");

      if (result.detail) {
        setHitRateTrendData(result.detail.hitRateTrendData || []);
        setQpsTrendData(result.detail.qpsTrendData || []);
        setCacheLogs(result.detail.cacheLogs || []);
      }
    }
  }, [showErrorFn, fetchInitialData]);

  /** 加载选中实例的详情数据 */
  const loadDetailData = useCallback(async (instanceId: string) => {
    if (!instanceId) return;

    const result = await fetchDetailData(() => getCacheInstanceDetailData({
      instanceId,
      setLoading: () => {},
      onError: (err: unknown) => showErrorFn(err, "加载实例详情")
    }), {
      showErrorToast: true,
      errorMessage: '加载缓存实例详情失败'
    });

    if (result) {
      setHitRateTrendData(result.hitRateTrendData || []);
      setQpsTrendData(result.qpsTrendData || []);
      setCacheLogs(result.cacheLogs || []);
    }
  }, [showErrorFn, fetchDetailData]);

  /** 处理清空缓存操作 */
  const handleClearCache = async () => {
    const success = await fetchClearCache(() => clearCacheInstanceData({
      setLoading: () => {},
      onError: (err) => showErrorFn(err, "清理缓存"),
    }), {
      showErrorToast: true,
      errorMessage: '清理缓存失败'
    });

    if (success) {
      addToast({
        title: "清理成功",
        description: `已清理缓存数据。`,
        color: "success",
      });
      loadDetailData(activeInstanceId);
    }
  };

  /** 排序后的实例列表 */
  const sortedInstances = useMemo(() => {
    const list = [...instances];
    list.sort((a, b) =>
      order === "desc" ? b.usage - a.usage : a.usage - b.usage
    );
    return list;
  }, [order, instances]);

  /** 当前活动的实例对象 */
  const activeInstance = useMemo(
    () =>
      sortedInstances.find((item) => item.id === activeInstanceId) ??
      sortedInstances[0],
    [sortedInstances, activeInstanceId]
  );

  /** 命中率趋势图表配置 */
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
      theme: chartTheme,
    }),
    [hitRateTrendData, chartTheme]
  );

  /** QPS 趋势图表配置 */
  const qpsColumnConfig: ColumnConfig = useMemo(
    () => ({
      data: qpsTrendData,
      xField: "time",
      yField: "value",
      seriesField: "type",
      columnStyle: {
        radius: [4, 4, 0, 0],
      },
      xAxis: {
        label: {
          style: {
            fontSize: 10,
          },
        },
      },
      yAxis: {
        label: {
          style: {
            fontSize: 10,
          },
        },
      },
      legend: {
        position: "top",
      },
      theme: chartTheme,
    }),
    [qpsTrendData, chartTheme]
  );

    // ===== 9. 页面初始化与事件绑定 =====
  /** 初始化加载实例列表 */
  useEffect(() => {
    const timer = setTimeout(() => {
      loadInitialData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadInitialData]);

  /** 当手动切换选中实例时，加载对应的趋势数据和日志 */
  useEffect(() => {
    // 只有当 activeInstanceId 存在且不是初始加载（即 loading 为 false）时才执行
    if (!activeInstanceId || loading) return;

    const timer = setTimeout(() => {
      loadDetailData(activeInstanceId);
    }, 0);
    return () => clearTimeout(timer);
  }, [activeInstanceId, loading, loadDetailData]);

  // ===== 10. TODO任务管理区域 =====

  // ===== 8. UI渲染逻辑区域 =====
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
          <div className="p-2 space-y-2 text-xs max-h-[500px] overflow-auto relative min-h-[200px]">
            {loading ? (
              <Loading height={200} />
            ) : (
              sortedInstances.map((item) => {
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
                      <span className="text-[var(--text-color)]">
                        {item.name}
                      </span>
                      <span className="text-xs text-[var(--text-color-secondary)]">
                        节点数：{item.nodes} · 命中率{" "}
                        {Math.round(item.hitRate * 100)}%
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {critical && (
                        <Chip
                          size="sm"
                          color="danger"
                          variant="flat"
                          className="text-xs"
                        >
                          即将满
                        </Chip>
                      )}
                      <span className="text-xs">{percent}%</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </Card>

        <Card className="border border-[var(--border-color)] bg-[var(--bg-elevated)]/95 min-h-[400px]">
          <div className="p-4 space-y-3 text-xs relative">
            {loading || loadingTrend ? (
              <Loading height={320} />
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {activeInstance?.name ?? "请选择缓存实例"}
                    </span>
                    {activeInstance && (
                      <span className="text-[11px] text-[var(--text-color-secondary)]">
                        当前使用率 {Math.round(activeInstance.usage * 100)}%
                        ，命中率 {Math.round(activeInstance.hitRate * 100)}%
                      </span>
                    )}
                  </div>
                  {activeInstance && (
                    <Button
                      size="sm"
                      color="danger"
                      variant="flat"
                      className="h-7 text-xs"
                      onPress={handleClearCache}
                    >
                      清空缓存
                    </Button>
                  )}
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1">
                    <div className="text-[var(--text-color-secondary)]">
                      内存占用
                    </div>
                    <div className="text-sm font-medium">
                      {activeInstance
                        ? `${Math.round(activeInstance.usage * 100)}%`
                        : "-"}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[var(--text-color-secondary)]">
                      命中率
                    </div>
                    <div className="text-sm font-medium">
                      {activeInstance
                        ? `${Math.round(activeInstance.hitRate * 100)}%`
                        : "-"}
                    </div>
                  </div>
                </div>
                {activeInstance && activeInstance.hitRate < 0.9 && (
                  <div className="text-[11px] text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded border border-yellow-500/20">
                    命中率低于 90%，建议检查缓存键粒度、过期策略与热点数据是否合理。
                  </div>
                )}
                <AdminTabs aria-label="缓存监控图表" size="sm" className="mt-1">
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
              </>
            )}
          </div>
        </Card>
      </div>

      <Card className="border border-[var(--border-color)] bg-[var(--bg-elevated)]/95">
        <div className="p-4 space-y-3 text-xs relative min-h-[120px]">
          {loadingTrend ? (
            <Loading height={80} />
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">缓存操作日志</div>
              </div>
              <div className="space-y-1">
                {cacheLogs.length > 0 ? (
                  cacheLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between px-2 py-1 rounded-md bg-[var(--bg-elevated)]/80"
                    >
                      <span>{log.time}</span>
                      <span className="text-xs text-[var(--text-color-secondary)]">
                        [{log.instanceId}] {log.message}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-[var(--text-color-secondary)]">
                    暂无操作日志
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}

// ===== 10. TODO任务管理区域 =====

// ===== 11. 导出区域 =====
export default CacheMonitorPage;
