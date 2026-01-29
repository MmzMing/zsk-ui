// ===== 1. 依赖导入区域 =====
import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  SelectItem,
  Button,
  Card,
  Chip,
  DateRangePicker,
  Pagination,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tooltip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  useDisclosure,
  addToast
} from "@heroui/react";
import {
  FiCheck,
  FiRotateCcw,
  FiX,
  FiPlayCircle,
  FiAlertCircle,
  FiActivity
} from "react-icons/fi";

import { AdminSearchInput } from "@/components/Admin/AdminSearchInput";
import { AdminSelect } from "@/components/Admin/AdminSelect";
import { AdminTabs } from "@/components/Admin/AdminTabs";
import { Loading } from "@/components/Loading";

import {
  fetchReviewQueue,
  fetchReviewLogs,
  submitReviewResult,
  submitBatchReviewResult,
  fetchViolationReasons,
  fetchVideoDetail,
  type ReviewQueueItem,
  type ReviewLogItem,
  type ReviewStatus,
  type RiskLevel,
  type VideoItem
} from "@/api/admin/video";
import { handleApiCall } from "@/api/axios";

// ===== 2. TODO待处理导入区域 =====
import { Checkbox, CheckboxGroup, Textarea } from "@heroui/react";

// 类型定义
type AuditModule = "video" | "comment" | "violation" | "rules";
type StatusFilter = "all" | ReviewStatus;

/**
 * 视频审核页面组件
 */
export default function VideoReviewPage() {
  // ===== 3. 状态控制逻辑区域 =====
  
  /** 加载状态 */
  const [loading, setLoading] = useState(false);
  const [logsLoading, setLogsLoading] = useState(false);

  /** 当前激活的审核子模块 */
  const [activeModule, setActiveModule] = useState<AuditModule>("video");
  
  /** 审核状态筛选 */
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  /** 搜索关键字 */
  const [keyword, setKeyword] = useState("");
  /** 分类筛选 */
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  /** 上传人筛选 */
  const [uploaderFilter, setUploaderFilter] = useState("");
  /** 时间筛选 */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [dateRange, setDateRange] = useState<any>(null);

  /** 当前页码 */
  const [page, setPage] = useState(1);
  /** 审核队列数据 */
  const [queue, setQueue] = useState<ReviewQueueItem[]>([]);
  const [total, setTotal] = useState(0);

  /** 选中的项目 ID 列表 */
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  /** 审核日志数据 */
  const [logs, setLogs] = useState<ReviewLogItem[]>([]);

  /** 审核 Modal 控制 */
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  /** 当前正在审核的视频详情 */
  const [activeReviewItem, setActiveReviewItem] = useState<ReviewQueueItem | null>(null);
  /** 视频详情（含播放地址） */
  const [videoDetail, setVideoDetail] = useState<VideoItem | null>(null);
  /** 违规原因列表 */
  const [violationReasons, setViolationReasons] = useState<{ id: string; label: string }[]>([]);
  /** 选中的违规原因 */
  const [selectedViolationIds, setSelectedViolationIds] = useState<string[]>([]);
  /** 驳回原因说明 */
  const [rejectReason, setRejectReason] = useState("");
  /** 视频加载状态 */
  const [videoLoading, setVideoLoading] = useState(false);
  /** 提交状态 */
  const [submitting, setSubmitting] = useState(false);

  /** 每页条数 */
  const pageSize = 8;
  /** 是否有选中的项 */
  const hasSelection = selectedIds.length > 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  /** 模拟分类数据 (也可以从API获取) */
  const allCategories = useMemo(
    () =>
      Array.from(
        new Set(queue.map(item => item.category))
      ),
    [queue]
  );

  // ===== 4. 通用工具函数区域 =====
  /**
   * 获取风险等级标签
   */
  const getRiskLabel = (level: RiskLevel) => {
    const labels: Record<RiskLevel, string> = {
      low: "低",
      medium: "中",
      high: "高"
    };
    return labels[level] || "未知";
  };

  /**
   * 获取风险等级颜色
   */
  const getRiskColor = (level: RiskLevel) => {
    const colors: Record<RiskLevel, "default" | "warning" | "danger"> = {
      low: "default",
      medium: "warning",
      high: "danger"
    };
    return colors[level] || "default";
  };

  /**
   * 获取审核状态标签
   */
  const getStatusLabel = (status: ReviewStatus) => {
    const labels: Record<ReviewStatus, string> = {
      pending: "待审核",
      approved: "已通过",
      rejected: "已驳回"
    };
    return labels[status] || "未知";
  };

  // ===== 5. 注释代码函数区 =====

  // ===== 6. 错误处理函数区域 =====

  // ===== 7. 数据处理函数区域 =====
  /**
   * 加载审核队列数据
   */
  const loadQueue = useCallback(async () => {
    const res = await handleApiCall({
      requestFn: () => fetchReviewQueue({
        page,
        pageSize,
        status: statusFilter === "all" ? undefined : statusFilter,
        keyword: keyword.trim() || undefined,
        queueType: "manual"
      }),
      setLoading
    });

    if (res && res.data) {
      setQueue(res.data.list);
      setTotal(res.data.total);
    }
  }, [page, statusFilter, keyword]);

  /**
   * 加载审核日志 (根据选中项)
   */
  const loadLogs = useCallback(async () => {
    if (!hasSelection) {
      setLogs([]);
      return;
    }
    
    // 使用 video API 获取日志
    const res = await handleApiCall({
      requestFn: () => fetchReviewLogs({
        page: 1, // 日志暂时只显示第一页
        pageSize: 10,
        reviewer: undefined 
      }),
      setLoading: setLogsLoading
    });

    if (res && res.data) {
      // 简单过滤一下模拟数据，匹配选中项
      const filteredLogs = res.data.filter(log => selectedIds.includes(log.videoId));
      setLogs(filteredLogs.length > 0 ? filteredLogs : res.data);
    }
  }, [selectedIds, hasSelection]);

  /**
   * 加载视频详情和违规原因
   */
  const loadReviewDetail = useCallback(async (id: string) => {
    setVideoLoading(true);
    // 并行请求
    const [videoRes, reasonsRes] = await Promise.all([
      handleApiCall({
        requestFn: () => fetchVideoDetail(id),
        setLoading: undefined // 不控制全局 loading
      }),
      handleApiCall({
        requestFn: () => fetchViolationReasons(),
        setLoading: undefined
      })
    ]);

    if (videoRes && videoRes.data) {
      setVideoDetail(videoRes.data);
    }
    if (reasonsRes && reasonsRes.data) {
      setViolationReasons(reasonsRes.data);
    }
    setVideoLoading(false);
  }, []);

  /**
   * 监听 activeReviewItem 变化加载详情
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeReviewItem) {
        loadReviewDetail(activeReviewItem.id);
        // 重置表单
        setSelectedViolationIds([]);
        setRejectReason("");
      } else {
        setVideoDetail(null);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [activeReviewItem, loadReviewDetail]);

  // 当选中项变化时加载队列
  useEffect(() => {
    const timer = setTimeout(() => {
      loadQueue();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadQueue]);

  // 当选中项变化时加载日志
  useEffect(() => {
    const timer = setTimeout(() => {
      loadLogs();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadLogs]);

  /**
   * 处理分页变化
   */
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    setSelectedIds([]);
  };

  /**
   * 处理表格选择变化
   */
  const handleTableSelectionChange = (keys: "all" | Set<React.Key>) => {
    if (keys === "all") {
      setSelectedIds(queue.map(item => item.id));
      return;
    }
    setSelectedIds(Array.from(keys).map(String));
  };

  /**
   * 重置筛选
   */
  const handleResetFilter = () => {
    setStatusFilter("all");
    setKeyword("");
    setCategoryFilter("all");
    setUploaderFilter("");
    setPage(1);
    setSelectedIds([]);
    setDateRange(null);
  };

  /**
   * 处理审核点击
   */
  const handleAuditClick = (item: ReviewQueueItem) => {
    setActiveReviewItem(item);
    onOpen();
  };

  /**
   * 处理状态更新 (单个)
   */
  const handleUpdateStatus = async (id: string, status: Exclude<ReviewStatus, "pending">) => {
    // 如果是驳回，需要校验原因
    if (status === "rejected") {
      if (selectedViolationIds.length === 0 && !rejectReason.trim()) {
        addToast({
          title: "操作失败",
          description: "驳回时请至少选择一个违规原因或填写驳回说明",
          color: "danger"
        });
        return;
      }
    }

    const res = await handleApiCall({
      requestFn: () => submitReviewResult({
        reviewId: id,
        status,
        reason: status === "rejected" ? rejectReason : undefined,
        violationIds: status === "rejected" ? selectedViolationIds : undefined
      }),
      setLoading: setSubmitting
    });

    if (res && res.code === 200) {
      addToast({
        title: "操作成功",
        description: `审核${status === "approved" ? "通过" : "驳回"}操作成功`,
        color: "success"
      });
      // 刷新列表
      loadQueue();
      // 如果在弹窗中，关闭弹窗
      if (activeReviewItem?.id === id) {
        onClose();
        setActiveReviewItem(null);
      }
    }
  };

  /**
   * 处理批量通过
   */
  const handleBatchApprove = async () => {
    if (!hasSelection) return;
    
    const confirmed = window.confirm("确认批量通过选中的审核任务？");
    if (!confirmed) return;

    const res = await handleApiCall({
      requestFn: () => submitBatchReviewResult({
        reviewIds: selectedIds,
        status: "approved"
      }),
      setLoading: setSubmitting
    });

    if (res && res.code === 200) {
      addToast({
        title: "批量审核成功",
        description: "已成功通过选中的视频审核任务。",
        color: "success"
      });
      setSelectedIds([]);
      loadQueue();
    }
  };

  /**
   * 处理批量驳回
   */
  const handleBatchReject = async () => {
    if (!hasSelection) return;

    const confirmed = window.confirm("确认批量驳回选中的审核任务？");
    if (!confirmed) return;

    const res = await handleApiCall({
      requestFn: () => submitBatchReviewResult({
        reviewIds: selectedIds,
        status: "rejected"
      }),
      setLoading: setSubmitting
    });

    if (res && res.code === 200) {
      addToast({
        title: "批量审核成功",
        description: "已成功驳回选中的视频审核任务。",
        color: "success"
      });
      setSelectedIds([]);
      loadQueue();
    }
  };

  // ===== 8. UI渲染逻辑区域 =====
  return (
    <div className="space-y-4">
      {/* 标题区域 */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 rounded-full bg-[color-mix(in_srgb,var(--primary-color)_10%,transparent)] px-3 py-1 text-xs text-[var(--primary-color)]">
          <span>视频管理 · 审核管理</span>
        </div>
        <h1 className="text-lg md:text-xl font-semibold tracking-tight">
          视频审核队列
        </h1>
        <p className="text-[var(--text-color-secondary)] max-w-2xl text-sm">
          支持视频预览、审核判定与操作日志记录，确保平台内容的合规性。
        </p>
      </div>

      <Card className="border border-[var(--border-color)] bg-[var(--bg-elevated)]/95">
        <div className="p-3 grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,3fr)]">
          {/* 左侧功能导航 */}
          <Card className="border border-[var(--border-color)] bg-[var(--bg-elevated)]/95 shadow-none">
            <div className="p-3 space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">审核功能导航</div>
                </div>
                <Chip size="sm" variant="flat">
                  审核中心
                </Chip>
              </div>
              <div className="mt-2 space-y-1">
                {[
                  {
                    key: "video" as AuditModule,
                    label: "视频审核",
                    description: "管理视频内容的审核流程。"
                  },
                  {
                    key: "comment" as AuditModule,
                    label: "评论审核",
                    description: "对视频下的评论进行判定。"
                  },
                  {
                    key: "violation" as AuditModule,
                    label: "违规库",
                    description: "集中管理已判定违规的样本。"
                  },
                  {
                    key: "rules" as AuditModule,
                    label: "规则配置",
                    description: "配置审核规则与通知策略。"
                  }
                ].map(item => {
                  const active = activeModule === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      className={
                        "w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-left border transition-colors " +
                        (active
                          ? "border-[var(--primary-color)] bg-[color-mix(in_srgb,var(--primary-color)_12%,transparent)] text-[var(--primary-color)]"
                          : "border-transparent text-[var(--text-color-secondary)] hover:bg-[color-mix(in_srgb,var(--primary-color)_6%,transparent)] hover:text-[var(--text-color)]")
                      }
                      onClick={() => {
                        setActiveModule(item.key);
                      }}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[10px]">
                            {item.key.charAt(0).toUpperCase()}
                          </span>
                          <span className="font-medium">{item.label}</span>
                        </div>
                      </div>
                      {active && (
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary-color)]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
            {/* 底部统计信息 - 预留位置 */}
            <div className="mt-auto p-3 border-t border-[var(--border-color)]">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-[var(--text-color-secondary)]">今日已审</span>
                <span className="font-medium">128</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--text-color-secondary)]">待审任务</span>
                <span className="font-medium text-[var(--primary-color)]">{total}</span>
              </div>
            </div>
          </Card>

          {/* 右侧内容区域 */}
          <div className="space-y-4 min-w-0">
            {activeModule === "video" && (
              <>
                {/* 队列卡片 */}
                <Card className="border border-[var(--border-color)] bg-[var(--bg-elevated)]/95 shadow-none">
                  <div className="p-4 space-y-4 border-b border-[var(--border-color)]">
                    {/* 搜索与筛选 */}
                    <div className="flex flex-wrap items-center gap-3">
                      <AdminSearchInput
                        className="w-64"
                        placeholder="按标题 / ID 搜索视频"
                        value={keyword}
                        onValueChange={value => {
                          setKeyword(value);
                          setPage(1);
                          setSelectedIds([]);
                        }}
                      />
                      <AdminSearchInput
                        className="w-40"
                        placeholder="按上传人筛选"
                        value={uploaderFilter}
                        onValueChange={value => {
                          setUploaderFilter(value);
                          setPage(1);
                          setSelectedIds([]);
                        }}
                      />
                      <AdminSelect
                        aria-label="视频分类筛选"
                        size="sm"
                        className="w-40"
                        selectedKeys={[categoryFilter]}
                        onSelectionChange={keys => {
                          const key = Array.from(keys)[0];
                          setCategoryFilter(key ? String(key) : "all");
                          setPage(1);
                          setSelectedIds([]);
                        }}
                        items={[
                          { label: "全部分类", value: "all" },
                          ...allCategories.map(item => ({
                            label: item,
                            value: item
                          }))
                        ]}
                        isClearable
                      >
                        {(item: { label: string; value: string }) => (
                          <SelectItem key={item.value}>
                            {item.label}
                          </SelectItem>
                        )}
                      </AdminSelect>
                      <DateRangePicker
                        aria-label="上传时间筛选"
                        size="sm"
                        variant="bordered"
                        className="w-56"
                        value={dateRange}
                        onChange={setDateRange}
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
                          selectorButton: "text-[var(--text-color-secondary)] hover:text-[var(--primary-color)] transition-colors"
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

                    {/* 状态切换 */}
                    <div className="flex items-center gap-3">
                      <span className="text-[var(--text-color-secondary)] text-sm">状态：</span>
                      <AdminTabs
                        aria-label="审核状态筛选"
                        size="sm"
                        selectedKey={statusFilter}
                        onSelectionChange={key => {
                          setStatusFilter(key as StatusFilter);
                          setPage(1);
                          setSelectedIds([]);
                        }}
                      >
                        <Tab key="all" title="全部" />
                        <Tab key="pending" title="待审核" />
                        <Tab key="approved" title="已通过" />
                        <Tab key="rejected" title="已驳回" />
                      </AdminTabs>
                    </div>
                  </div>

                  <div className="p-3 space-y-3">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div className="flex flex-wrap items-center gap-2 text-[var(--text-color-secondary)] text-xs">
                        <span>当前展示需要审核的视频队列。</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          size="sm"
                          variant="light"
                          color="success"
                          className="h-8 text-success hover:bg-success/10 text-xs"
                          isDisabled={!hasSelection || loading || submitting}
                          startContent={<FiCheck />}
                          onPress={handleBatchApprove}
                        >
                          批量通过
                        </Button>
                        <Button
                          size="sm"
                          variant="light"
                          color="danger"
                          className="h-8 text-danger hover:bg-danger/10 text-xs"
                          isDisabled={!hasSelection || loading || submitting}
                          startContent={<FiX />}
                          onPress={handleBatchReject}
                        >
                          批量驳回
                        </Button>
                      </div>
                    </div>

                    <div className="overflow-x-auto border border-[var(--border-color)] rounded-lg bg-[var(--bg-elevated)]/50 w-full">
                      <div className="min-w-[900px] w-full">
                        <Table
                          aria-label="视频审核队列表格"
                          removeWrapper
                          className="min-w-full text-xs"
                          selectionMode="multiple"
                          selectedKeys={selectedIds.length === queue.length && queue.length > 0 ? "all" : new Set(selectedIds)}
                          onSelectionChange={handleTableSelectionChange}
                          classNames={{
                            th: "whitespace-nowrap",
                            td: "whitespace-nowrap"
                          }}
                        >
                        <TableHeader className="bg-[var(--bg-elevated)]/80">
                          <TableColumn className="px-3 py-2 text-left font-medium">标题</TableColumn>
                          <TableColumn className="px-3 py-2 text-left font-medium">上传人</TableColumn>
                          <TableColumn className="px-3 py-2 text-left font-medium">分类</TableColumn>
                          <TableColumn className="px-3 py-2 text-left font-medium">风险等级</TableColumn>
                          <TableColumn className="px-3 py-2 text-left font-medium">AI 预审核</TableColumn>
                          <TableColumn className="px-3 py-2 text-left font-medium">审核状态</TableColumn>
                          <TableColumn className="px-3 py-2 text-left font-medium">提交时间</TableColumn>
                          <TableColumn className="px-3 py-2 text-center font-medium">操作</TableColumn>
                        </TableHeader>
                        <TableBody
                          items={loading ? [] : queue}
                          emptyContent="当前队列暂无待处理的视频"
                          isLoading={loading}
                          loadingContent={<Loading height={200} text="加载审核队列中..." />}
                        >
                          {item => (
                            <TableRow key={item.id}>
                              <TableCell className="px-3 py-2 align-top">
                                <div className="flex flex-col gap-1">
                                  <span className="font-medium text-sm line-clamp-2">
                                    {item.title}
                                  </span>
                                  <span className="text-[10px] text-[var(--text-color-secondary)] font-mono">
                                    任务 ID: {item.id}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="px-3 py-2 align-top">
                                <span>{item.uploader}</span>
                              </TableCell>
                              <TableCell className="px-3 py-2 align-top">
                                <Chip size="sm" variant="flat" className="text-[0.625rem]" radius="full">
                                  {item.category}
                                </Chip>
                              </TableCell>
                              <TableCell className="px-3 py-2 align-top">
                                <Chip
                                  size="sm"
                                  variant="flat"
                                  color={getRiskColor(item.riskLevel)}
                                  className="text-[0.625rem]"
                                  radius="full"
                                >
                                  {getRiskLabel(item.riskLevel)}风险
                                </Chip>
                              </TableCell>
                              <TableCell className="px-3 py-2 align-top">
                                <Chip
                                  size="sm"
                                  variant="flat"
                                  className="text-[0.625rem]"
                                  radius="full"
                                >
                                  {item.isAiChecked ? "已由 AI 预审核" : "未开启"}
                                </Chip>
                              </TableCell>
                              <TableCell className="px-3 py-2 align-top">
                                <Chip
                                  size="sm"
                                  variant="flat"
                                  color={
                                    item.status === "pending" 
                                      ? "warning" 
                                      : item.status === "approved"
                                      ? "success"
                                      : "danger"
                                  }
                                  className="text-[0.625rem]"
                                  radius="full"
                                >
                                  {getStatusLabel(item.status)}
                                </Chip>
                              </TableCell>
                              <TableCell className="px-3 py-2 align-top">
                                <span className="text-[var(--text-color-secondary)] text-xs">
                                  {item.createdAt}
                                </span>
                              </TableCell>
                              <TableCell className="px-3 py-2 align-top">
                                <div className="flex items-center gap-2 justify-center">
                                  <Tooltip content="审核">
                                    <Button
                                      isIconOnly
                                      size="sm"
                                      variant="light"
                                      className="text-warning hover:bg-warning/10"
                                      onPress={() => handleAuditClick(item)}
                                    >
                                      <FiPlayCircle className="text-lg" />
                                    </Button>
                                  </Tooltip>
                                  <Tooltip content="通过">
                                    <Button
                                      isIconOnly
                                      size="sm"
                                      variant="light"
                                      className="text-success hover:bg-success/10"
                                      onPress={() => handleUpdateStatus(item.id, "approved")}
                                    >
                                      <FiCheck className="text-lg" />
                                    </Button>
                                  </Tooltip>
                                  <Tooltip content="驳回">
                                    <Button
                                      isIconOnly
                                      size="sm"
                                      variant="light"
                                      className="text-danger hover:bg-danger/10"
                                      onPress={() => handleUpdateStatus(item.id, "rejected")}
                                    >
                                      <FiX className="text-lg" />
                                    </Button>
                                  </Tooltip>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                    <div className="mt-3 flex flex-col gap-2 text-[0.6875rem] md:flex-row md:items-center md:justify-between">
                      <div className="flex items-center gap-2">
                        <span>
                          共 {total} 条记录，当前第 {page} / {totalPages} 页
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Pagination
                          size="sm"
                          total={totalPages}
                          page={page}
                          onChange={handlePageChange}
                          showControls
                        />
                      </div>
                    </div>
                  </div>
                </Card>

                {/* 系统审核日志卡片 */}
                <Card className="border border-[var(--border-color)] bg-[var(--bg-elevated)]/95 shadow-none">
                  <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FiActivity className="text-[var(--primary-color)]" />
                      <span className="font-medium text-sm">系统审核日志</span>
                    </div>
                    <Chip size="sm" variant="flat" className="bg-zinc-800 text-zinc-400 text-xs">
                      {hasSelection ? `已选择 ${selectedIds.length} 项` : "请选择表格数据查看日志"}
                    </Chip>
                  </div>
                  <div className="p-3">
                    <div className="overflow-x-auto border border-[var(--border-color)] rounded-lg bg-[var(--bg-elevated)]/50 w-full">
                      <div className="min-w-[800px] w-full">
                        <Table
                          aria-label="视频审核日志表格"
                          removeWrapper
                          className="min-w-full text-xs"
                          classNames={{
                            th: "whitespace-nowrap",
                            td: "whitespace-nowrap"
                          }}
                        >
                        <TableHeader className="bg-[var(--bg-elevated)]/80">
                          <TableColumn className="px-3 py-2 text-left font-medium">视频 ID/标题</TableColumn>
                          <TableColumn className="px-3 py-2 text-left font-medium">审核人</TableColumn>
                          <TableColumn className="px-3 py-2 text-left font-medium">审核时间</TableColumn>
                          <TableColumn className="px-3 py-2 text-left font-medium">审核结果</TableColumn>
                          <TableColumn className="px-3 py-2 text-left font-medium">审核说明</TableColumn>
                        </TableHeader>
                        <TableBody
                          items={logs}
                          emptyContent="请选择上方表格项以查看对应的审核日志"
                          isLoading={logsLoading}
                          loadingContent={<Loading height={100} text="获取审核日志中..." />}
                        >
                          {item => (
                            <TableRow key={item.id}>
                              <TableCell className="px-3 py-2 align-top">
                                <div className="flex flex-col gap-1">
                                  <span className="font-medium line-clamp-1">
                                    {item.title}
                                  </span>
                                  <span className="text-[10px] text-[var(--text-color-secondary)] font-mono">
                                    ID: {item.videoId}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="px-3 py-2 align-top">
                                <span>{item.reviewer}</span>
                              </TableCell>
                              <TableCell className="px-3 py-2 align-top">
                                <span className="text-[var(--text-color-secondary)]">{item.reviewedAt}</span>
                              </TableCell>
                              <TableCell className="px-3 py-2 align-top">
                                <Chip
                                  size="sm"
                                  variant="flat"
                                  color={item.result === "approved" ? "success" : "danger"}
                                  className="text-[0.625rem]"
                                  radius="full"
                                >
                                  {item.result === "approved" ? "已通过" : "已驳回"}
                                </Chip>
                              </TableCell>
                              <TableCell className="px-3 py-2 align-top">
                                <div className="max-w-xs line-clamp-1 text-[var(--text-color-secondary)]">
                                  {item.remark}
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              </Card>
              </>
            )}

            {/* 其他模块占位 */}
            {activeModule === "comment" && (
              <Card className="p-4 border border-[var(--border-color)] bg-[var(--bg-elevated)]/95">
                <div className="text-center text-[var(--text-color-secondary)] py-10">
                  评论审核模块开发中...
                </div>
              </Card>
            )}
            {activeModule === "violation" && (
              <Card className="p-4 border border-[var(--border-color)] bg-[var(--bg-elevated)]/95">
                <div className="text-center text-[var(--text-color-secondary)] py-10">
                  违规评论库模块开发中...
                </div>
              </Card>
            )}
            {activeModule === "rules" && (
               <Card className="p-4 border border-[var(--border-color)] bg-[var(--bg-elevated)]/95">
                <div className="text-center text-[var(--text-color-secondary)] py-10">
                  审核规则配置模块开发中...
                </div>
              </Card>
            )}
          </div>
        </div>
      </Card>

      {/* 视频审核弹窗 */}
      <Modal
        size="4xl"
        isOpen={isOpen}
        scrollBehavior="inside"
        onOpenChange={onOpenChange}
        classNames={{
          base: "max-h-[90vh]",
          header: "border-b border-[var(--border-color)]",
          footer: "border-t border-[var(--border-color)]",
          body: "p-0"
        }}
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1 py-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary-color)]/10 text-[var(--primary-color)]">
                    <FiPlayCircle className="text-lg" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-lg font-semibold leading-none">视频审核面板</div>
                    <div className="text-xs font-normal text-[var(--text-color-secondary)]">
                      审核任务 ID: {activeReviewItem?.id}
                    </div>
                  </div>
                </div>
              </ModalHeader>
              <ModalBody>
                <div className="grid h-full md:grid-cols-[1fr_1.2fr]">
                  {/* 左侧：预览区域 */}
                  <div className="flex flex-col border-r border-[var(--border-color)] bg-[var(--bg-elevated)]/30">
                    <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--border-color)] bg-[var(--bg-elevated)]/80 px-4 py-3 backdrop-blur-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">内容预览</span>
                        <Chip size="sm" variant="flat" color="primary" className="h-5 text-[10px]">
                          视频模式
                        </Chip>
                      </div>
                    </div>

                    <div className="flex-1 overflow-auto p-4 space-y-4">
                      <Card className="aspect-video flex items-center justify-center border border-[var(--border-color)] bg-black p-0 text-center shadow-none overflow-hidden relative group">
                        {videoLoading ? (
                          <div className="space-y-3">
                            <FiPlayCircle className="mx-auto text-5xl text-white/30 animate-pulse" />
                            <div className="text-xs text-white/50">视频资源加载中...</div>
                          </div>
                        ) : (
                          <video
                            src={videoDetail?.videoUrl || videoDetail?.url || "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"}
                            controls
                            className="w-full h-full object-contain"
                            poster={videoDetail?.cover}
                          >
                            您的浏览器不支持视频播放。
                          </video>
                        )}
                      </Card>

                      <div className="space-y-4">
                        <div className="rounded-xl border border-[var(--border-color)] bg-white dark:bg-zinc-900 p-4 space-y-3">
                          <div className="flex items-center gap-2 pb-2 border-b border-[var(--border-color)]">
                            <FiAlertCircle className="text-primary" />
                            <span className="text-xs font-semibold">视频基本信息</span>
                          </div>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs">
                            <div className="space-y-1">
                              <div className="text-[var(--text-color-secondary)]">视频标题</div>
                              <div className="font-medium truncate">{activeReviewItem?.title}</div>
                            </div>
                            <div className="space-y-1 text-right">
                              <div className="text-[var(--text-color-secondary)]">上传者</div>
                              <div className="font-medium">{activeReviewItem?.uploader}</div>
                            </div>
                            <div className="space-y-1">
                              <div className="text-[var(--text-color-secondary)]">所属分类</div>
                              <div className="font-medium">{activeReviewItem?.category}</div>
                            </div>
                            <div className="space-y-1 text-right">
                              <div className="text-[var(--text-color-secondary)]">风险等级</div>
                              <div>
                                <Chip
                                  size="sm"
                                  variant="flat"
                                  color={getRiskColor(activeReviewItem?.riskLevel || "low")}
                                  className="h-5 text-[10px]"
                                >
                                  {getRiskLabel(activeReviewItem?.riskLevel || "low")}风险
                                </Chip>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="rounded-xl border border-dashed border-[var(--border-color)] p-4">
                          <div className="text-[11px] text-[var(--text-color-secondary)] leading-relaxed text-center italic">
                            "AI 预审核结果：检测到部分画面可能包含敏感内容，建议人工核实 01:23 - 01:45 处的背景展示。"
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 右侧：操作区域 */}
                  <div className="flex flex-col bg-white dark:bg-zinc-950">
                    <div className="flex-1 overflow-auto p-6 space-y-8">
                      {/* 审核操作 */}
                      <section className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-semibold">审核操作</div>
                          <div className="text-[11px] text-[var(--text-color-secondary)]">请选择最终处理结果</div>
                        </div>

                        {/* 违规原因选择 (总是显示，但在通过时禁用或忽略) */}
                        <div className="space-y-3 bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-[var(--border-color)]">
                          <div className="text-xs font-medium text-[var(--text-color-secondary)] mb-2">
                            违规判定 (驳回必选)
                          </div>
                          <CheckboxGroup
                            value={selectedViolationIds}
                            onValueChange={setSelectedViolationIds}
                            size="sm"
                            classNames={{ wrapper: "gap-3" }}
                          >
                            <div className="grid grid-cols-2 gap-2">
                              {violationReasons.map(reason => (
                                <Checkbox key={reason.id} value={reason.id}>
                                  {reason.label}
                                </Checkbox>
                              ))}
                            </div>
                          </CheckboxGroup>
                          
                          <Textarea
                            label="其他违规说明"
                            placeholder="请输入详细的驳回理由或补充说明..."
                            minRows={2}
                            size="sm"
                            variant="bordered"
                            value={rejectReason}
                            onValueChange={setRejectReason}
                            className="mt-3"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <Button
                            color="success"
                            variant="flat"
                            className="h-16 flex-col gap-1 border-2 border-transparent transition-all hover:border-success/30 data-[selected=true]:border-success data-[selected=true]:bg-success/10"
                            startContent={<FiCheck className="text-lg" />}
                            onPress={() => {
                              if (activeReviewItem) {
                                handleUpdateStatus(activeReviewItem.id, "approved");
                              }
                            }}
                            isLoading={submitting}
                          >
                            <span className="text-sm font-semibold">审核通过</span>
                            <span className="text-[10px] opacity-70">内容符合规范，允许发布</span>
                          </Button>
                          <Button
                            color="danger"
                            variant="flat"
                            className="h-16 flex-col gap-1 border-2 border-transparent transition-all hover:border-danger/30 data-[selected=true]:border-danger data-[selected=true]:bg-danger/10"
                            startContent={<FiX className="text-lg" />}
                            onPress={() => {
                              if (activeReviewItem) {
                                handleUpdateStatus(activeReviewItem.id, "rejected");
                              }
                            }}
                            isLoading={submitting}
                          >
                            <span className="text-sm font-semibold">审核驳回</span>
                            <span className="text-[10px] opacity-70">内容违规，禁止发布</span>
                          </Button>
                        </div>
                      </section>
                    </div>
                  </div>
                </div>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
