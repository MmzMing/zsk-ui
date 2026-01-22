import React, { useMemo, useState } from "react";
import { Button, Card, Chip, DateRangePicker, Tab, Tooltip } from "@heroui/react";
import { AdminSearchInput } from "@/components/Admin/AdminSearchInput";
import { AdminTabs } from "@/components/Admin/AdminTabs";
import type { LineConfig } from "@ant-design/plots";
import { Line } from "@ant-design/plots";
import { getLocalTimeZone } from "@internationalized/date";
import { FiRotateCcw } from "react-icons/fi";
import { useAppStore } from "../../../store";

type BehaviorRange = "today" | "7d";

type BehaviorUser = {
  id: string;
  name: string;
  role: string;
  department: string;
  lastLoginAt: string;
  lastLoginIp: string;
  riskLevel: "low" | "medium" | "high";
};

type BehaviorEvent = {
  id: string;
  userId: string;
  time: string;
  action: string;
  module: string;
  detail: string;
  riskLevel: "low" | "medium" | "high";
};

type BehaviorPoint = {
  userId: string;
  range: BehaviorRange;
  time: string;
  count: number;
};

const behaviorUsers: BehaviorUser[] = [
  {
    id: "u_admin",
    name: "系统管理员",
    role: "超级管理员",
    department: "技术部",
    lastLoginAt: "2026-01-18 10:32:10",
    lastLoginIp: "192.168.0.10",
    riskLevel: "medium"
  },
  {
    id: "u_editor",
    name: "内容运营",
    role: "编辑",
    department: "内容运营部",
    lastLoginAt: "2026-01-18 09:58:42",
    lastLoginIp: "192.168.0.21",
    riskLevel: "low"
  },
  {
    id: "u_auditor",
    name: "审核专员",
    role: "审核员",
    department: "审核中心",
    lastLoginAt: "2026-01-18 10:05:17",
    lastLoginIp: "192.168.0.33",
    riskLevel: "low"
  }
];

const behaviorTimeline: BehaviorPoint[] = [
  { userId: "u_admin", range: "today", time: "09:00", count: 2 },
  { userId: "u_admin", range: "today", time: "10:00", count: 5 },
  { userId: "u_admin", range: "today", time: "11:00", count: 3 },
  { userId: "u_admin", range: "today", time: "12:00", count: 1 },
  { userId: "u_admin", range: "7d", time: "2026-01-12", count: 18 },
  { userId: "u_admin", range: "7d", time: "2026-01-13", count: 14 },
  { userId: "u_admin", range: "7d", time: "2026-01-14", count: 20 },
  { userId: "u_admin", range: "7d", time: "2026-01-15", count: 16 },
  { userId: "u_admin", range: "7d", time: "2026-01-16", count: 22 },
  { userId: "u_admin", range: "7d", time: "2026-01-17", count: 19 },
  { userId: "u_admin", range: "7d", time: "2026-01-18", count: 11 },
  { userId: "u_editor", range: "today", time: "09:00", count: 3 },
  { userId: "u_editor", range: "today", time: "10:00", count: 4 },
  { userId: "u_editor", range: "today", time: "11:00", count: 2 },
  { userId: "u_editor", range: "today", time: "12:00", count: 1 },
  { userId: "u_editor", range: "7d", time: "2026-01-12", count: 10 },
  { userId: "u_editor", range: "7d", time: "2026-01-13", count: 8 },
  { userId: "u_editor", range: "7d", time: "2026-01-14", count: 11 },
  { userId: "u_editor", range: "7d", time: "2026-01-15", count: 9 },
  { userId: "u_editor", range: "7d", time: "2026-01-16", count: 12 },
  { userId: "u_editor", range: "7d", time: "2026-01-17", count: 7 },
  { userId: "u_editor", range: "7d", time: "2026-01-18", count: 6 },
  { userId: "u_auditor", range: "today", time: "09:00", count: 1 },
  { userId: "u_auditor", range: "today", time: "10:00", count: 2 },
  { userId: "u_auditor", range: "today", time: "11:00", count: 2 },
  { userId: "u_auditor", range: "today", time: "12:00", count: 1 },
  { userId: "u_auditor", range: "7d", time: "2026-01-12", count: 6 },
  { userId: "u_auditor", range: "7d", time: "2026-01-13", count: 7 },
  { userId: "u_auditor", range: "7d", time: "2026-01-14", count: 5 },
  { userId: "u_auditor", range: "7d", time: "2026-01-15", count: 9 },
  { userId: "u_auditor", range: "7d", time: "2026-01-16", count: 8 },
  { userId: "u_auditor", range: "7d", time: "2026-01-17", count: 7 },
  { userId: "u_auditor", range: "7d", time: "2026-01-18", count: 4 }
];

const behaviorEvents: BehaviorEvent[] = [
  {
    id: "e1",
    userId: "u_admin",
    time: "10:32:10",
    action: "登录后台",
    module: "登录",
    detail: "账号密码登录成功，设备为 Chrome 浏览器",
    riskLevel: "low"
  },
  {
    id: "e2",
    userId: "u_admin",
    time: "10:35:22",
    action: "修改系统配置",
    module: "系统设置",
    detail: "更新站点名称与 Logo 配置",
    riskLevel: "medium"
  },
  {
    id: "e3",
    userId: "u_admin",
    time: "10:40:03",
    action: "批量删除缓存键",
    module: "系统运维",
    detail: "删除前缀为 session:* 的会话缓存 120 条",
    riskLevel: "high"
  },
  {
    id: "e4",
    userId: "u_admin",
    time: "10:46:17",
    action: "查看系统监控",
    module: "系统运维",
    detail: "查看最近 1 小时资源使用情况",
    riskLevel: "low"
  },
  {
    id: "e5",
    userId: "u_editor",
    time: "10:02:41",
    action: "登录后台",
    module: "登录",
    detail: "邮箱验证码登录成功",
    riskLevel: "low"
  },
  {
    id: "e6",
    userId: "u_editor",
    time: "10:08:03",
    action: "编辑文档",
    module: "内容管理",
    detail: "更新文档《知识库小破站 · 使用指南》的正文内容",
    riskLevel: "low"
  },
  {
    id: "e7",
    userId: "u_editor",
    time: "10:15:29",
    action: "发布视频",
    module: "内容管理",
    detail: "发布新视频《从 0 搭建个人知识库前端》",
    riskLevel: "medium"
  },
  {
    id: "e8",
    userId: "u_auditor",
    time: "10:06:54",
    action: "审核内容",
    module: "审核中心",
    detail: "审核通过 3 篇新提交的文档内容",
    riskLevel: "low"
  },
  {
    id: "e9",
    userId: "u_auditor",
    time: "10:18:37",
    action: "驳回内容",
    module: "审核中心",
    detail: "驳回 1 条涉嫌广告的评论内容",
    riskLevel: "medium"
  }
];

function getRiskChipProps(level: BehaviorUser["riskLevel"]) {
  if (level === "high") {
    return {
      color: "danger" as const,
      label: "高风险",
      className: "bg-red-500/10 text-red-500"
    };
  }
  if (level === "medium") {
    return {
      color: "warning" as const,
      label: "中风险",
      className: "bg-orange-500/10 text-orange-500"
    };
  }
  return {
    color: "success" as const,
    label: "低风险",
    className: "bg-emerald-500/10 text-emerald-500"
  };
}

function UserBehaviorPage() {
  const [activeUserId, setActiveUserId] = useState<string>("u_admin");
  const [range, setRange] = useState<BehaviorRange>("today");
  const [keyword, setKeyword] = useState("");
  const [activeView, setActiveView] = useState<"timeline" | "list">("timeline");
  const { themeMode } = useAppStore();

  const chartTheme =
    themeMode === "dark"
      ? "classicDark"
      : themeMode === "light"
        ? "classic"
        : window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "classicDark"
          : "classic";

  const handleResetFilter = () => {
    setKeyword("");
    setActiveUserId("u_admin");
    setRange("today");
  };

  const activeUser = useMemo(
    () => behaviorUsers.find(item => item.id === activeUserId) ?? behaviorUsers[0],
    [activeUserId]
  );

  const filteredEvents = useMemo(() => {
    const trimmed = keyword.trim().toLowerCase();
    return behaviorEvents.filter(item => {
      if (item.userId !== activeUser.id) {
        return false;
      }
      if (!trimmed) {
        return true;
      }
      const content = `${item.action} ${item.module} ${item.detail}`.toLowerCase();
      return content.includes(trimmed);
    });
  }, [activeUser.id, keyword]);

  const lineData = useMemo(
    () =>
      behaviorTimeline
        .filter(item => item.userId === activeUser.id && item.range === range)
        .map(item => ({
          time: item.time,
          value: item.count
        })),
    [activeUser.id, range]
  );

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
      point: {
        size: 3
      },
      tooltip: {
        formatter: (datum: { value: number }) => ({
          name: "操作次数",
          value: `${datum.value} 次`
        })
      },
      theme: chartTheme
    }),
    [lineData, chartTheme]
  );

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
                onValueChange={value => setKeyword(value)}
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
                    "shadow-none"
                  ].join(" "),
                  input: "text-xs",
                  selectorButton: "text-[var(--text-color-secondary)] hover:text-[var(--primary-color)] transition-colors"
                }}
                onChange={value => {
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
                }}
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
                onSelectionChange={(key) => setActiveUserId(key as string)}
                classNames={{
                  tabList: "p-0 h-7 gap-0",
                  tab: "h-7 px-4 text-xs",
                }}
              >
                {behaviorUsers.map((user) => (
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
              onSelectionChange={(key: React.Key) => setActiveView(key as "timeline" | "list")}
              className="mt-1"
              classNames={{
                tabList: "p-0 h-8 gap-0",
                tab: "h-8 px-3 text-xs"
              }}
            >
              <Tab key="timeline" title="行为轨迹时序图">
                <div className="mt-2 space-y-2">
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
                      <span className="text-[var(--text-color-secondary)]">当前分析基于上方选择的时间范围</span>
                    </div>
                  </div>
                  <div className="h-60">
                    <Line {...lineConfig} />
                  </div>
                </div>
              </Tab>
              <Tab key="list" title="行为明细列表">
                <div className="mt-2 space-y-2">
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
                      filteredEvents.map(item => {
                        const riskProps = getRiskChipProps(item.riskLevel);
                        return (
                          <div
                            key={item.id}
                            className="flex items-start justify-between gap-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-elevated)]/70 px-3 py-2"
                          >
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{item.action}</span>
                                <Chip
                                  size="sm"
                                  variant="flat"
                                  className={
                                    "text-[10px] px-2 h-5 " + riskProps.className
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
                </div>
              </Tab>
            </AdminTabs>
          </div>
        </Card>

        <Card className="border border-[var(--border-color)] bg-[var(--bg-elevated)]/95">
          <div className="p-4 space-y-3 text-xs">
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
                  "text-xs " + getRiskChipProps(activeUser.riskLevel).className
                }
                color={getRiskChipProps(activeUser.riskLevel).color}
              >
                {getRiskChipProps(activeUser.riskLevel).label}
              </Chip>
            </div>
            <div className="space-y-2">
              <div className="space-y-1">
                <div className="text-[var(--text-color-secondary)]">所属部门</div>
                <div>{activeUser.department}</div>
              </div>
              <div className="space-y-1">
                <div className="text-[var(--text-color-secondary)]">最近登录时间</div>
                <div>{activeUser.lastLoginAt}</div>
              </div>
              <div className="space-y-1">
                <div className="text-[var(--text-color-secondary)]">最近登录 IP</div>
                <div>{activeUser.lastLoginIp}</div>
              </div>
            </div>
            <div className="pt-2 border-t border-[var(--border-color)] space-y-2">
              <div className="text-[var(--text-color-secondary)]">
                安全建议（示例）
              </div>
              <ul className="list-disc pl-4 space-y-1 text-xs text-[var(--text-color-secondary)]">
                <li>定期检查该用户的高风险操作记录，如批量删除、敏感配置变更。</li>
                <li>建议开启登录保护策略，如 IP 白名单或多因素认证。</li>
                <li>结合系统日志模块，交叉验证该用户操作与系统异常之间的关联。</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default UserBehaviorPage;
