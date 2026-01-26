// ===== 1. 依赖导入区域 =====
import React, { useState, useEffect, useCallback } from "react";
import {
  Button,
  Card,
  Chip,
  DateRangePicker,
  Pagination,
  SelectItem,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Tab,
  Tooltip,
  addToast,
} from "@heroui/react";
import { AdminSearchInput } from "@/components/Admin/AdminSearchInput";
import { AdminSelect } from "@/components/Admin/AdminSelect";
import { AdminTabs } from "@/components/Admin/AdminTabs";
import { Loading } from "@/components/Loading";
import { FiDownload, FiRotateCcw } from "react-icons/fi";
import {
  SystemLogItem,
  LogLevel,
  getSystemLogListData,
} from "../../../api/admin/ops";

// ===== 2. TODO待处理导入区域 =====

function SystemLogPage() {
  // ===== 3. 状态控制逻辑区域 =====
  /** 是否正在加载日志 */
  const [loading, setLoading] = useState(false);
  /** 当前选中的日志级别 */
  const [activeLevel, setActiveLevel] = useState<LogLevel | "all">("all");
  /** 当前选中的模块 */
  const [activeModule, setActiveModule] = useState("全部模块");
  /** 搜索关键字 */
  const [keyword, setKeyword] = useState("");
  /** 当前页码 */
  const [page, setPage] = useState(1);
  /** 日志列表数据 */
  const [logs, setLogs] = useState<SystemLogItem[]>([]);
  /** 总记录数 */
  const [total, setTotal] = useState(0);
  /** 顶部提示消息 */
  const [message, setMessage] = useState("");

  // ===== 4. 通用工具函数区域 =====
  /** 日志模块列表 */
  const logModules = [
    "全部模块",
    "接口网关",
    "认证中心",
    "系统监控",
    "缓存服务",
    "内容管理",
    "审核中心",
    "系统配置",
  ];

  /** 每页条数 */
  const pageSize = 6;

  /**
   * 根据日志级别获取对应的 UI 属性
   * @param level 日志级别
   * @returns UI 属性对象
   */
  const getLevelChipProps = (level: LogLevel) => {
    if (level === "ERROR") {
      return {
        color: "danger" as const,
        className: "bg-red-500/10 text-red-500",
        label: "ERROR",
      };
    }
    if (level === "WARN") {
      return {
        color: "warning" as const,
        className: "bg-orange-500/10 text-orange-500",
        label: "WARN",
      };
    }
    return {
      color: "default" as const,
      className: "bg-sky-500/10 text-sky-500",
      label: "INFO",
    };
  };

  // ===== 5. 注释代码函数区 =====

  // ===== 6. 错误处理函数区域 =====
  /**
   * 统一错误提示处理
   * @param error 错误对象
   * @param prefix 错误前缀描述
   */
  const showErrorFn = (error: unknown, prefix: string) => {
    const message = error instanceof Error ? error.message : String(error);
    addToast({
      title: `${prefix}失败`,
      description: message,
      color: "danger",
    });
  };

  // ===== 7. 数据处理函数区域 =====
  /** 加载系统日志列表 */
  const loadData = useCallback(async () => {
    const data = await getSystemLogListData({
      page,
      pageSize,
      keyword,
      module: activeModule === "全部模块" ? undefined : activeModule,
      level: activeLevel === "all" ? undefined : activeLevel,
      setLoading,
      onError: (err) => showErrorFn(err, "加载系统日志"),
    });

    if (data) {
      setLogs(data.list);
      setTotal(data.total);
    }
  }, [activeLevel, activeModule, keyword, page]);

  /** 重置筛选条件 */
  const handleResetFilter = () => {
    setActiveLevel("all");
    setActiveModule("全部模块");
    setKeyword("");
    setPage(1);
    setMessage("");
  };

  /** 处理导出当前筛选结果 */
  const handleExportCurrent = () => {
    setMessage(
      `已提交导出当前筛选结果的日志文件，共 ${logs.length} 条记录。实际导出逻辑待接入 /api/admin/ops/logs/export 接口。`
    );
  };

  /** 处理导出全部日志 */
  const handleExportAll = () => {
    setMessage(
      "已提交导出全部日志的任务，建议在实际环境中限制导出时间范围与最大条数，避免影响系统性能。"
    );
  };

  /** 处理页码切换 */
  const handlePageChange = (next: number) => {
    if (next < 1 || next > totalPages) {
      return;
    }
    setPage(next);
  };

  /** 总页数 */
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  /** 当前显示页码 */
  const currentPage = Math.min(page, totalPages);
  /** 当前页显示的数据 */
  const pageItems = logs;

  // ===== 9. 页面初始化与事件绑定 =====
  /** 监听筛选条件变化并加载数据 */
  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadData]);

  // ===== 8. UI渲染逻辑区域 =====
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
            <AdminSearchInput
              className="w-64"
              placeholder="按关键字、traceId 搜索日志"
              value={keyword}
              onValueChange={(value) => {
                setKeyword(value);
                setPage(1);
              }}
            />

            <AdminSelect
              aria-label="模块筛选"
              size="sm"
              className="w-40"
              selectedKeys={[activeModule]}
              onSelectionChange={(keys) => {
                const key = Array.from(keys)[0];
                setActiveModule(key ? String(key) : "全部模块");
                setPage(1);
              }}
              items={logModules.map((item) => ({
                label: item,
                value: item,
              }))}
              isClearable
            >
              {(item: { label: string; value: string }) => (
                <SelectItem key={item.value}>{item.label}</SelectItem>
              )}
            </AdminSelect>

            <DateRangePicker
              aria-label="日志时间范围筛选"
              size="sm"
              variant="bordered"
              className="w-60"
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

          {/* 第二层：状态/级别筛选 */}
          <div className="flex flex-wrap items-center gap-2">
            <AdminTabs
              aria-label="日志级别"
              size="sm"
              selectedKey={activeLevel}
              onSelectionChange={(key: React.Key) =>
                setActiveLevel(key as LogLevel | "all")
              }
              classNames={{
                tabList: "p-0 h-7 gap-0",
                tab: "h-7 px-4 text-xs",
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
            <Table aria-label="系统日志列表" className="min-w-full text-xs">
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
                items={loading ? [] : pageItems}
                emptyContent="未找到匹配的日志记录，可调整筛选条件或关键字后重试。"
                isLoading={loading}
                loadingContent={
                  <Loading height={200} text="获取系统日志数据中..." />
                }
              >
                {(item) => {
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

// ===== 11. 导出区域 =====
export default SystemLogPage;
