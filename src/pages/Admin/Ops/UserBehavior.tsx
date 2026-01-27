// ===== 1. 依赖导入区域 =====
import React, { useMemo, useState, useEffect, useCallback } from "react";
import {
  Button,
  Card,
  Chip,
  DateRangePicker,
  Tab,
  Tooltip,
} from "@heroui/react";
import { AdminSearchInput } from "@/components/Admin/AdminSearchInput";
import { AdminTabs } from "@/components/Admin/AdminTabs";
import { Loading } from "@/components/Loading";
import type { LineConfig } from "@ant-design/plots";
import { Line } from "@ant-design/plots";
import { getLocalTimeZone } from "@internationalized/date";
import { FiRotateCcw } from "react-icons/fi";
import { useAppStore } from "../../../store";
import {
  getBehaviorFullData,
  type BehaviorUser,
  type BehaviorRange,
  type BehaviorPoint,
  type BehaviorEvent,
} from "../../../api/admin/ops";
import { addToast } from "@heroui/react";
import { handleDebugOutput } from "@/lib/utils";

// ===== 2. TODO待处理导入区域 =====

/**
 * 用户行为分析页面组件
 * 提供用户操作轨迹分析、风险评估及明细查询功能
 */
function UserBehaviorPage() {
  // ===== 3. 状态控制逻辑区域 =====
  /** 是否正在加载数据 */
  const [loading, setLoading] = useState(true);
  /** 当前选中的用户 ID */
  const [activeUserId, setActiveUserId] = useState<string>("6201");
  /** 时间范围筛选 */
  const [range, setRange] = useState<BehaviorRange>("today");
  /** 搜索关键字 */
  const [keyword, setKeyword] = useState("");
  /** 当前视图模式：时序图或明细列表 */
  const [activeView, setActiveView] = useState<"timeline" | "list">("timeline");
  /** 主题模式 */
  const { themeMode } = useAppStore();
  /** 用户列表数据 */
  const [users, setUsers] = useState<BehaviorUser[]>([]);
  /** 行为事件明细数据 */
  const [events, setEvents] = useState<BehaviorEvent[]>([]);
  /** 行为轨迹时序数据 */
  const [timeline, setTimeline] = useState<BehaviorPoint[]>([]);

  // ===== 4. 通用工具函数区域 =====
  /**
   * 打印调试日志
   * @param message 日志消息
   */
  const showDebugLog = useCallback((message: string) => {
    handleDebugOutput({
      debugLevel: "info",
      debugMessage: "[UserBehavior]",
      debugDetail: message,
    });
  }, []);

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

  /**
   * 获取风险等级对应的 UI 属性
   * @param level 风险等级
   */
  const getRiskChipProps = useCallback((level: BehaviorUser["riskLevel"]) => {
    if (level === "high") {
      return {
        color: "danger" as const,
        label: "高风险",
        className: "bg-red-500/10 text-red-500",
      };
    }
    if (level === "medium") {
      return {
        color: "warning" as const,
        label: "中风险",
        className: "bg-orange-500/10 text-orange-500",
      };
    }
    return {
      color: "success" as const,
      label: "低风险",
      className: "bg-emerald-500/10 text-emerald-500",
    };
  }, []);

  /** 图表主题配置 */
  const chartTheme = useMemo(() => {
    if (themeMode === "dark") return "classicDark";
    if (themeMode === "light") return "classic";
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "classicDark"
      : "classic";
  }, [themeMode]);

  /** 当前选中的用户对象 */
  const activeUser = useMemo(
    () => users.find((item) => item.id === activeUserId) ?? users[0],
    [users, activeUserId]
  );

  /** 过滤后的行为事件列表 */
  const filteredEvents = useMemo(() => events, [events]);

  /** 转换后的图表数据 */
  const lineData = useMemo(() => {
    return timeline.map((item) => ({
      time: item.time,
      value: item.count,
    }));
  }, [timeline]);

  /** 折线图配置对象 */
  const lineConfig: LineConfig = useMemo(
    () => ({
      data: lineData,
      xField: "time",
      yField: "value",
      smooth: true,
      yAxis: {
        min: 0,
        label: {
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
      point: {
        size: 3,
      },
      tooltip: {
        formatter: (datum: { value: number }) => ({
          name: "操作次数",
          value: `${datum.value} 次`,
        }),
      },
      theme: chartTheme,
    }),
    [lineData, chartTheme]
  );

  // ===== 5. 注释代码函数区 =====

  // ===== 6. 错误处理函数区域 =====

  // ===== 7. 数据处理函数区域 =====
  /** 加载用户行为相关数据 */
  const loadData = useCallback(async () => {
    const result = await getBehaviorFullData({
      userId: activeUserId,
      range,
      keyword,
      setLoading,
      onError: (err) => showErrorFn(err, "加载行为分析数据"),
    });

    if (result) {
      setUsers(result.users);
      setTimeline(result.timeline);
      setEvents(result.events);
    }
  }, [activeUserId, range, keyword, showErrorFn]);

  /** 重置所有筛选条件 */
  const handleResetFilter = useCallback(() => {
    setKeyword("");
    setActiveUserId("6201");
    setRange("today");
  }, []);

  /** 处理搜索关键字变更 */
  const handleKeywordChange = useCallback((value: string) => {
    setKeyword(value);
  }, []);

  /** 处理用户切换 */
  const handleUserChange = useCallback((key: React.Key) => {
    setActiveUserId(key as string);
  }, []);

  /** 处理视图切换 */
  const handleViewChange = useCallback((key: React.Key) => {
    setActiveView(key as "timeline" | "list");
  }, []);

  /** 处理时间范围变更 */
  const handleRangeChange = useCallback(
    (
      value: {
        start: { toDate: (tz: string) => Date };
        end: { toDate: (tz: string) => Date };
      } | null
    ) => {
      if (!value || !value.start || !value.end) {
      setRange("today");
      return;
    }
    try {
      const timeZone = getLocalTimeZone();
      const startDate = value.start.toDate(timeZone);
      const endDate = value.end.toDate(timeZone);
      const diffMs = endDate.getTime() - startDate.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
      if (diffDays <= 1) {
        setRange("today");
      } else {
        setRange("7d");
      }
    } catch {
      setRange("today");
    }
  }, []);

  // ===== 8. UI渲染逻辑区域 =====

  // ===== 9. 页面初始化与事件绑定 =====
  /** 初始化及筛选变更时加载数据 */
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
          <span>系统运维 · 用户行为</span>
        </div>
        <h1 className="text-lg md:text-xl font-semibold tracking-tight">
          分析后台用户行为轨迹
        </h1>
        <p className="text-xs text-[var(--text-color-secondary)] max-w-2xl">
          通过行为轨迹时序图与明细列表，定位高风险操作与异常登录，辅助审计与安全分析。
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,1.4fr)]">
        <Card className="border border-[var(--border-color)] bg-[var(--bg-elevated)]/95">
          <div className="p-3 space-y-4 text-xs border-b border-[var(--border-color)]">
            {/* 第一层：搜索与基础筛选 */}
            <div className="flex flex-wrap items-center gap-3">
              <AdminSearchInput
                className="w-64"
                placeholder="按操作类型、模块或关键字搜索"
                value={keyword}
                onValueChange={handleKeywordChange}
              />
              <DateRangePicker
                aria-label="用户行为时间范围"
                size="sm"
                variant="bordered"
                className="w-56 text-[11px]"
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
                onChange={handleRangeChange}
              />
              <Tooltip content="重置筛选">
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                  onPress={handleResetFilter}
                >
                  <FiRotateCcw className="text-sm" />
                </Button>
              </Tooltip>
            </div>

            {/* 第二层：状态/用户筛选 */}
            <div className="flex flex-wrap items-center gap-2">
              <AdminTabs
                aria-label="选择用户"
                size="sm"
                selectedKey={activeUserId}
                onSelectionChange={handleUserChange}
                classNames={{
                  tabList: "p-0 h-7 gap-0",
                  tab: "h-7 px-4 text-xs",
                }}
              >
                {users.map((user) => (
                  <Tab key={user.id} title={user.name} />
                ))}
              </AdminTabs>
            </div>

            {/* 第三层：其他操作（当前暂无，预留空间或放导出按钮） */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="text-[10px] text-[var(--text-color-secondary)] opacity-70">
                当前展示为模拟行为数据，用于演示审计追踪与安全分析功能。
              </div>
            </div>

            <AdminTabs
              aria-label="用户行为分析视图"
              size="sm"
              selectedKey={activeView}
              onSelectionChange={handleViewChange}
              className="mt-1"
              classNames={{
                tabList: "p-0 h-8 gap-0",
                tab: "h-8 px-3 text-xs",
              }}
            >
              <Tab key="timeline" title="行为轨迹时序图">
                <div className="mt-2 space-y-2 relative min-h-[240px]">
                  {loading ? (
                    <Loading height={240} />
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div className="text-[var(--text-color-secondary)]">
                            操作频次随时间分布
                          </div>
                          <div className="text-[11px] text-[var(--text-color-secondary)]">
                            当前展示用户最近时间段的操作次数变化，用于识别异常高频操作。
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-[10px]">
                          <span className="text-[var(--text-color-secondary)]">
                            当前分析基于上方选择的时间范围
                          </span>
                        </div>
                      </div>
                      <div className="h-60">
                        <Line {...lineConfig} />
                      </div>
                    </>
                  )}
                </div>
              </Tab>
              <Tab key="list" title="行为明细列表">
                <div className="mt-2 space-y-2 relative min-h-[320px]">
                  {loading ? (
                    <Loading height={320} />
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <div className="text-[var(--text-color-secondary)]">
                          近期行为明细
                        </div>
                        <div className="text-[11px] text-[var(--text-color-secondary)]">
                          共 {filteredEvents.length} 条记录
                        </div>
                      </div>
                      <div className="max-h-80 overflow-auto space-y-1.5">
                        {filteredEvents.length === 0 ? (
                          <div className="px-2 py-4 text-[11px] text-[var(--text-color-secondary)]">
                            未找到匹配的行为记录，可尝试调整关键字或切换用户。
                          </div>
                        ) : (
                          filteredEvents.map((item) => {
                            const riskProps = getRiskChipProps(item.riskLevel);
                            return (
                              <div
                                key={item.id}
                                className="flex items-start justify-between gap-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-elevated)]/70 px-3 py-2"
                              >
                                <div className="flex flex-col gap-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">
                                      {item.action}
                                    </span>
                                    <Chip
                                      size="sm"
                                      variant="flat"
                                      className={
                                        "text-[10px] px-2 h-5 " +
                                        riskProps.className
                                      }
                                      color={riskProps.color}
                                    >
                                      {riskProps.label}
                                    </Chip>
                                  </div>
                                  <div className="text-[11px] text-[var(--text-color-secondary)]">
                                    模块：{item.module}
                                  </div>
                                  <div className="text-[11px] text-[var(--text-color-secondary)]">
                                    {item.detail}
                                  </div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                  <span className="text-[11px] text-[var(--text-color-secondary)]">
                                    {item.time}
                                  </span>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </>
                  )}
                </div>
              </Tab>
            </AdminTabs>
          </div>
        </Card>

        <Card className="border border-[var(--border-color)] bg-[var(--bg-elevated)]/95">
          <div className="p-4 space-y-3 text-xs relative min-h-[200px]">
            {loading ? (
              <Loading height={200} />
            ) : !activeUser ? (
              <div className="flex h-full items-center justify-center text-[var(--text-color-secondary)]">
                暂无用户数据
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="text-[var(--text-color-secondary)]">
                      用户侧边信息面板
                    </div>
                    <div className="text-sm font-medium">
                      {activeUser.name}（{activeUser.role}）
                    </div>
                  </div>
                  <Chip
                    size="sm"
                    variant="flat"
                    className={
                      "text-xs " +
                      getRiskChipProps(activeUser.riskLevel).className
                    }
                    color={getRiskChipProps(activeUser.riskLevel).color}
                  >
                    {getRiskChipProps(activeUser.riskLevel).label}
                  </Chip>
                </div>
                <div className="space-y-2">
                  <div className="space-y-1">
                    <div className="text-[var(--text-color-secondary)]">
                      所属部门
                    </div>
                    <div>{activeUser.department}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[var(--text-color-secondary)]">
                      最近登录时间
                    </div>
                    <div>{activeUser.lastLoginAt}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[var(--text-color-secondary)]">
                      最近登录 IP
                    </div>
                    <div>{activeUser.lastLoginIp}</div>
                  </div>
                </div>
                <div className="pt-2 border-t border-[var(--border-color)] space-y-2">
                  <div className="text-[var(--text-color-secondary)]">
                    安全建议（示例）
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-xs text-[var(--text-color-secondary)]">
                    <li>
                      定期检查该用户的高风险操作记录，如批量删除、敏感配置变更。
                    </li>
                    <li>建议开启登录保护策略，如 IP 白名单或多因素认证。</li>
                    <li>
                      结合系统日志模块，交叉验证该用户操作与系统异常之间的关联。
                    </li>
                  </ul>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ===== 11. 导出区域 =====
export default UserBehaviorPage;

