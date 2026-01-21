import React, { useMemo, useState } from "react";
import {
  Button,
  Card,
  Chip,
  DateRangePicker,
  Input,
  Pagination,
  Select,
  SelectItem,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Tab
} from "@heroui/react";
import { AdminTabs } from "@/components/Admin/AdminTabs";
import { FiDownload, FiSearch } from "react-icons/fi";

type LogLevel = "INFO" | "WARN" | "ERROR";

type SystemLogItem = {
  id: string;
  time: string;
  level: LogLevel;
  module: string;
  message: string;
  detail: string;
  traceId: string;
};

const systemLogs: SystemLogItem[] = [
  {
    id: "log_001",
    time: "2026-01-18 10:40:21",
    level: "ERROR",
    module: "缓存服务",
    message: "批量删除缓存键失败",
    detail: "实例 redis-main，前缀 session:* 删除过程中部分键不存在，已记录失败列表。",
    traceId: "trace-ops-1001"
  },
  {
    id: "log_002",
    time: "2026-01-18 10:38:03",
    level: "WARN",
    module: "系统监控",
    message: "磁盘使用率接近阈值",
    detail: "节点 node-01 /data 分区使用率达到 82%，已触发告警。",
    traceId: "trace-monitor-2033"
  },
  {
    id: "log_003",
    time: "2026-01-18 10:32:10",
    level: "INFO",
    module: "认证中心",
    message: "后台登录成功",
    detail: "用户 admin 登录成功，来源 IP 192.168.0.10。",
    traceId: "trace-auth-7780"
  },
  {
    id: "log_004",
    time: "2026-01-18 10:28:44",
    level: "INFO",
    module: "接口网关",
    message: "接口响应时间统计",
    detail: "过去 5 分钟内 /api/admin/dashboard/overview P95 耗时 280ms。",
    traceId: "trace-gw-4432"
  },
  {
    id: "log_005",
    time: "2026-01-18 10:21:07",
    level: "WARN",
    module: "审核中心",
    message: "审核接口调用频率异常",
    detail: "用户 auditor 在 1 分钟内连续触发 20 次审核操作，已记录行为日志。",
    traceId: "trace-audit-9920"
  },
  {
    id: "log_006",
    time: "2026-01-18 10:12:33",
    level: "ERROR",
    module: "内容管理",
    message: "视频转码失败",
    detail: "任务 job_20260118_1001 转码异常，中途网络断开，已进入重试队列。",
    traceId: "trace-video-5501"
  },
  {
    id: "log_007",
    time: "2026-01-18 10:05:59",
    level: "INFO",
    module: "系统配置",
    message: "更新站点配置",
    detail: "管理员 admin 更新了站点标题与 Logo 配置。",
    traceId: "trace-config-3302"
  },
  {
    id: "log_008",
    time: "2026-01-18 09:58:42",
    level: "INFO",
    module: "认证中心",
    message: "后台登录成功",
    detail: "用户 editor 使用邮箱验证码登录成功。",
    traceId: "trace-auth-7779"
  }
];

const logModules = ["全部模块", "接口网关", "认证中心", "系统监控", "缓存服务", "内容管理", "审核中心", "系统配置"];

function getLevelChipProps(level: LogLevel) {
  if (level === "ERROR") {
    return {
      color: "danger" as const,
      className: "bg-red-500/10 text-red-500",
      label: "ERROR"
    };
  }
  if (level === "WARN") {
    return {
      color: "warning" as const,
      className: "bg-orange-500/10 text-orange-500",
      label: "WARN"
    };
  }
  return {
    color: "default" as const,
    className: "bg-sky-500/10 text-sky-500",
    label: "INFO"
  };
}

function SystemLogPage() {
  const [activeLevel, setActiveLevel] = useState<LogLevel | "all">("all");
  const [activeModule, setActiveModule] = useState("全部模块");
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState("");

  const filteredLogs = useMemo(() => {
    const trimmed = keyword.trim().toLowerCase();
    return systemLogs.filter(item => {
      if (activeLevel !== "all" && item.level !== activeLevel) {
        return false;
      }
      if (activeModule !== "全部模块" && item.module !== activeModule) {
        return false;
      }
      if (trimmed) {
        const content = `${item.message} ${item.detail} ${item.traceId}`.toLowerCase();
        if (!content.includes(trimmed)) {
          return false;
        }
      }
      return true;
    });
  }, [activeLevel, activeModule, keyword]);

  const pageSize = 6;
  const total = filteredLogs.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const pageItems = filteredLogs.slice(startIndex, endIndex);

  const handleResetFilter = () => {
    setActiveLevel("all");
    setActiveModule("全部模块");
    setKeyword("");
    setPage(1);
    setMessage("");
  };

  const handleExportCurrent = () => {
    setMessage(
      `已提交导出当前筛选结果的日志文件，共 ${filteredLogs.length} 条记录。实际导出逻辑待接入 /api/admin/ops/logs/export 接口。`
    );
  };

  const handleExportAll = () => {
    setMessage(
      "已提交导出全部日志的任务，建议在实际环境中限制导出时间范围与最大条数，避免影响系统性能。"
    );
  };

  const handlePageChange = (next: number) => {
    if (next < 1 || next > totalPages) {
      return;
    }
    setPage(next);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 rounded-full bg-[color-mix(in_srgb,var(--primary-color)_10%,transparent)] px-3 py-1 text-xs text-[var(--primary-color)]">
          <span>系统运维 · 系统日志</span>
        </div>
        <h1 className="text-lg md:text-xl font-semibold tracking-tight">
          聚合查看系统运行日志
        </h1>
        <p className="text-xs text-[var(--text-color-secondary)] max-w-2xl">
          支持按日志级别、模块、关键字快速过滤，并提供导出当前筛选结果的能力，便于排查线上问题。
        </p>
      </div>

      <Card className="border border-[var(--border-color)] bg-[var(--bg-elevated)]/95">
        <div className="p-3 space-y-4 text-xs border-b border-[var(--border-color)]">
          {/* 第一层：搜索与基础筛选 */}
          <div className="flex flex-wrap items-center gap-3">
            <Input
              size="sm"
              variant="bordered"
              className="w-64"
              placeholder="按关键字、traceId 搜索日志"
              startContent={
                <FiSearch className="text-xs text-[var(--text-color-secondary)]" />
              }
              value={keyword}
              onValueChange={value => {
                setKeyword(value);
                setPage(1);
              }}
              classNames={{
                inputWrapper: "h-8 text-xs",
                input: "text-xs"
              }}
            />

            <Select
              aria-label="模块筛选"
              size="sm"
              className="w-40"
              selectedKeys={[activeModule]}
              onSelectionChange={keys => {
                const key = Array.from(keys)[0];
                setActiveModule(key ? String(key) : "全部模块");
                setPage(1);
              }}
              items={logModules.map(item => ({
                label: item,
                value: item
              }))}
              isClearable
            >
              {item => (
                <SelectItem key={item.value}>
                  {item.label}
                </SelectItem>
              )}
            </Select>

            <DateRangePicker
              aria-label="日志时间范围筛选"
              size="sm"
              variant="bordered"
              className="w-60 text-xs"
            />

            <Button
              size="sm"
              variant="light"
              className="h-8 text-xs"
              onPress={handleResetFilter}
            >
              重置筛选
            </Button>
          </div>

          {/* 第二层：状态/级别筛选 */}
          <div className="flex flex-wrap items-center gap-2">
            <AdminTabs
              aria-label="日志级别"
              size="sm"
              selectedKey={activeLevel}
              onSelectionChange={(key: React.Key) => setActiveLevel(key as LogLevel | "all")}
              classNames={{
                tabList: "p-0 h-7 gap-0",
                tab: "h-7 px-4 text-xs"
              }}
            >
              <Tab key="all" title="全部级别" />
              <Tab key="INFO" title="INFO" />
              <Tab key="WARN" title="WARN" />
              <Tab key="ERROR" title="ERROR" />
            </AdminTabs>
          </div>

          {/* 第三层：操作按钮 */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="flat"
              className="h-8 text-xs"
              startContent={<FiDownload className="text-xs" />}
              onPress={handleExportCurrent}
            >
              导出当前列表
            </Button>
            <Button
              size="sm"
              variant="light"
              className="h-8 text-xs"
              startContent={<FiDownload className="text-xs" />}
              onPress={handleExportAll}
            >
              导出全部
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[10px] text-[var(--text-color-secondary)] opacity-70">
            <span>当前展示为模拟日志数据，实际字段与格式请以后端实现为准。</span>
          </div>
        </div>

        {message && (
          <div className="px-4 py-2 flex items-center justify-between text-xs border-b border-[var(--border-color)] bg-[var(--bg-elevated)]/80">
            <span className="text-[var(--text-color-secondary)]">{message}</span>
            <Button
              size="sm"
              variant="light"
              className="h-7 text-xs"
              onPress={() => setMessage("")}
            >
              知道了
            </Button>
          </div>
        )}

        <div className="p-3">
          <div className="overflow-auto border border-[var(--border-color)] rounded-lg">
            <Table
              aria-label="系统日志列表"
              className="min-w-full text-xs"
            >
              <TableHeader className="bg-[var(--bg-elevated)]/80">
                <TableColumn className="px-3 py-2 text-left font-medium w-40">
                  时间
                </TableColumn>
                <TableColumn className="px-3 py-2 text-left font-medium w-20">
                  级别
                </TableColumn>
                <TableColumn className="px-3 py-2 text-left font-medium w-32">
                  模块
                </TableColumn>
                <TableColumn className="px-3 py-2 text-left font-medium">
                  概要
                </TableColumn>
                <TableColumn className="px-3 py-2 text-left font-medium w-40">
                  traceId
                </TableColumn>
              </TableHeader>
              <TableBody
                items={pageItems}
                emptyContent="未找到匹配的日志记录，可调整筛选条件或关键字后重试。"
              >
                {item => {
                  const levelProps = getLevelChipProps(item.level);
                  return (
                    <TableRow
                      key={item.id}
                      className="border-t border-[var(--border-color)] hover:bg-[var(--bg-elevated)]/60 align-top"
                    >
                      <TableCell className="px-3 py-2 whitespace-nowrap">
                        {item.time}
                      </TableCell>
                      <TableCell className="px-3 py-2">
                        <Chip
                          size="sm"
                          variant="flat"
                          className={"text-[10px] " + levelProps.className}
                          color={levelProps.color}
                        >
                          {levelProps.label}
                        </Chip>
                      </TableCell>
                      <TableCell className="px-3 py-2 whitespace-nowrap">
                        {item.module}
                      </TableCell>
                      <TableCell className="px-3 py-2">
                        <div className="flex flex-col gap-1">
                          <div className="font-medium">{item.message}</div>
                          <div className="text-[11px] text-[var(--text-color-secondary)]">
                            {item.detail}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-3 py-2 whitespace-nowrap font-mono text-[11px]">
                        {item.traceId}
                      </TableCell>
                    </TableRow>
                  );
                }}
              </TableBody>
            </Table>
          </div>

          <div className="mt-3 flex flex-col gap-2 text-xs md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <span>
                共 {total} 条记录，当前第 {currentPage} / {totalPages} 页
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Pagination
                size="sm"
                total={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                showControls
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default SystemLogPage;
