import React, { useEffect, useMemo, useState } from "react";
import {
  Select,
  SelectItem,
  Button,
  Card,
  Chip,
  DateRangePicker,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tab
} from "@heroui/react";
import { AdminTabs } from "@/components/Admin/AdminTabs";
import {
  FiAlertCircle,
  FiCheck,
  FiFilter,
  FiFlag,
  FiMessageSquare,
  FiPlayCircle,
  FiSearch,
  FiX
} from "react-icons/fi";

import { fetchReviewQueue, submitReviewResult } from "../../../api/admin/video";

type ReviewStatus = "pending" | "approved" | "rejected";

type FinalReviewStatus = Exclude<ReviewStatus, "pending">;

type RiskLevel = "low" | "medium" | "high";

type ReviewItem = {
  id: string;
  title: string;
  uploader: string;
  category: string;
  status: ReviewStatus;
  riskLevel: RiskLevel;
  isAiChecked: boolean;
  createdAt: string;
};

type QueueType = "ai" | "manual";

type StatusFilter = "all" | ReviewStatus;

type AuditModule = "video" | "comment" | "violation" | "rules";

type ReviewLogItem = {
  id: string;
  videoId: string;
  title: string;
  reviewer: string;
  reviewedAt: string;
  result: "approved" | "rejected";
  remark: string;
};

const initialAiQueueItems: ReviewItem[] = [
  {
    id: "rv_ai_001",
    title: "敏感词检测示例视频 01",
    uploader: "editor",
    category: "内容管理",
    status: "pending",
    riskLevel: "high",
    isAiChecked: true,
    createdAt: "2026-01-18 10:20:01"
  },
  {
    id: "rv_ai_002",
    title: "评论区易引发争议的案例",
    uploader: "editor",
    category: "运营案例",
    status: "pending",
    riskLevel: "medium",
    isAiChecked: true,
    createdAt: "2026-01-18 10:18:32"
  }
];

const initialManualQueueItems: ReviewItem[] = [
  {
    id: "rv_manual_001",
    title: "从 0 搭建个人知识库前端",
    uploader: "admin",
    category: "工程实践",
    status: "pending",
    riskLevel: "low",
    isAiChecked: false,
    createdAt: "2026-01-18 09:58:42"
  },
  {
    id: "rv_manual_002",
    title: "如何把零散笔记整理成知识库",
    uploader: "editor",
    category: "效率方法",
    status: "approved",
    riskLevel: "low",
    isAiChecked: false,
    createdAt: "2026-01-17 16:21:07"
  }
];

const reviewLogs: ReviewLogItem[] = [
  {
    id: "log_001",
    videoId: "rv_manual_001",
    title: "从 0 搭建个人知识库前端",
    reviewer: "auditor",
    reviewedAt: "2026-01-18 10:30:12",
    result: "approved",
    remark: "内容健康，适合公开播放。"
  },
  {
    id: "log_002",
    videoId: "rv_ai_001",
    title: "敏感词检测示例视频 01",
    reviewer: "auditor",
    reviewedAt: "2026-01-18 10:12:45",
    result: "rejected",
    remark: "涉及高风险敏感词，建议重新剪辑后再提交。"
  },
  {
    id: "log_003",
    videoId: "rv_manual_002",
    title: "如何把零散笔记整理成知识库",
    reviewer: "auditor",
    reviewedAt: "2026-01-17 17:05:21",
    result: "approved",
    remark: "审核通过，已进入推荐队列。"
  }
];

function getRiskLabel(level: RiskLevel) {
  if (level === "low") {
    return "低";
  }
  if (level === "medium") {
    return "中";
  }
  return "高";
}

function getRiskColor(level: RiskLevel) {
  if (level === "low") {
    return "default";
  }
  if (level === "medium") {
    return "warning";
  }
  return "danger";
}

function getStatusLabel(status: ReviewStatus) {
  if (status === "pending") {
    return "待审核";
  }
  if (status === "approved") {
    return "已通过";
  }
  return "已驳回";
}

function getStatusColor(status: ReviewStatus) {
  if (status === "pending") {
    return "default";
  }
  if (status === "approved") {
    return "success";
  }
  return "danger";
}

function VideoReviewPage() {
  const [activeModule, setActiveModule] = useState<AuditModule>("video");
  const [videoTab, setVideoTab] = useState<"queue" | "logs">("queue");
  const [queueType, setQueueType] = useState<QueueType>("ai");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [keyword, setKeyword] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [uploaderFilter, setUploaderFilter] = useState("");
  const [page, setPage] = useState(1);
  const [aiQueue, setAiQueue] = useState<ReviewItem[]>(() => initialAiQueueItems);
  const [manualQueue, setManualQueue] = useState<ReviewItem[]>(() => initialManualQueueItems);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeReviewItem, setActiveReviewItem] = useState<ReviewItem | null>(null);
  const [logReviewerFilter, setLogReviewerFilter] = useState("");
  const [, setLoading] = useState(false);
  const hasSelection = selectedIds.length > 0;

  const pageSize = 8;

  const baseItems = queueType === "ai" ? aiQueue : manualQueue;

  const allCategories = useMemo(
    () =>
      Array.from(
        new Set(
          [...aiQueue, ...manualQueue].map(item => item.category)
        )
      ),
    [aiQueue, manualQueue]
  );

  useEffect(() => {
    let cancelled = false;
    async function loadQueue() {
      setLoading(true);
      try {
        const response = await fetchReviewQueue({
          queueType,
          status: statusFilter === "all" ? undefined : statusFilter,
          keyword: keyword.trim() || undefined,
          page: 1,
          pageSize: 200
        });
        if (cancelled) {
          return;
        }
        if (queueType === "ai") {
          setAiQueue(response.list);
        } else {
          setManualQueue(response.list);
        }
        setSelectedIds([]);
        setPage(1);
      } catch (error) {
        console.error(error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    loadQueue();
    return () => {
      cancelled = true;
    };
  }, [queueType, statusFilter, keyword]);

  const filteredItems = useMemo(() => {
    const trimmed = keyword.trim().toLowerCase();
    const uploaderTrimmed = uploaderFilter.trim().toLowerCase();
    return baseItems.filter(item => {
      if (statusFilter !== "all" && item.status !== statusFilter) {
        return false;
      }
      if (trimmed) {
        const content = `${item.title} ${item.uploader} ${item.category}`.toLowerCase();
        if (!content.includes(trimmed)) {
          return false;
        }
      }
      if (categoryFilter !== "all" && item.category !== categoryFilter) {
        return false;
      }
      if (uploaderTrimmed && !item.uploader.toLowerCase().includes(uploaderTrimmed)) {
        return false;
      }
      return true;
    });
  }, [baseItems, categoryFilter, keyword, statusFilter, uploaderFilter]);

  const total = filteredItems.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const pageItems = filteredItems.slice(startIndex, endIndex);

  const filteredReviewLogs = useMemo(() => {
    const trimmed = logReviewerFilter.trim().toLowerCase();
    if (!trimmed) {
      return reviewLogs;
    }
    return reviewLogs.filter(item =>
      item.reviewer.toLowerCase().includes(trimmed)
    );
  }, [logReviewerFilter]);

  const handlePageChange = (next: number) => {
    if (next < 1 || next > totalPages) {
      return;
    }
    setPage(next);
    setSelectedIds([]);
  };

  const handleResetFilter = () => {
    setStatusFilter("all");
    setKeyword("");
    setCategoryFilter("all");
    setUploaderFilter("");
    setPage(1);
    setSelectedIds([]);
  };

  const handleUpdateStatus = async (id: string, status: FinalReviewStatus) => {
    try {
      await submitReviewResult({
        reviewId: id,
        status
      });
      if (queueType === "ai") {
        setAiQueue(previous =>
          previous.map(item =>
            item.id === id
              ? {
                  ...item,
                  status
                }
              : item
          )
        );
      } else {
        setManualQueue(previous =>
          previous.map(item =>
            item.id === id
              ? {
                  ...item,
                  status
                }
              : item
          )
        );
      }
      setSelectedIds(current =>
        current.filter(itemId => itemId !== id)
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleTableSelectionChange = (keys: "all" | Set<React.Key>) => {
    if (keys === "all") {
      setSelectedIds(filteredItems.map(item => item.id));
      return;
    }
    setSelectedIds(Array.from(keys).map(String));
  };

  const handleBatchApprove = async () => {
    if (!hasSelection) {
      return;
    }
    const confirmed = window.confirm("确认批量通过选中的审核任务？");
    if (!confirmed) {
      return;
    }
    const ids = selectedIds;
    try {
      await Promise.all(
        ids.map(id =>
          submitReviewResult({
            reviewId: id,
            status: "approved"
          })
        )
      );
      if (queueType === "ai") {
        setAiQueue(previous =>
          previous.map(item =>
            ids.includes(item.id)
              ? {
                  ...item,
                  status: "approved"
                }
              : item
          )
        );
      } else {
        setManualQueue(previous =>
          previous.map(item =>
            ids.includes(item.id)
              ? {
                  ...item,
                  status: "approved"
                }
              : item
          )
        );
      }
      setSelectedIds([]);
    } catch (error) {
      console.error(error);
    }
  };

  const handleBatchReject = async () => {
    if (!hasSelection) {
      return;
    }
    const confirmed = window.confirm("确认批量驳回选中的审核任务？");
    if (!confirmed) {
      return;
    }
    const ids = selectedIds;
    try {
      await Promise.all(
        ids.map(id =>
          submitReviewResult({
            reviewId: id,
            status: "rejected"
          })
        )
      );
      if (queueType === "ai") {
        setAiQueue(previous =>
          previous.map(item =>
            ids.includes(item.id)
              ? {
                  ...item,
                  status: "rejected"
                }
              : item
          )
        );
      } else {
        setManualQueue(previous =>
          previous.map(item =>
            ids.includes(item.id)
              ? {
                  ...item,
                  status: "rejected"
                }
              : item
          )
        );
      }
      setSelectedIds([]);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 rounded-full bg-[color-mix(in_srgb,var(--primary-color)_10%,transparent)] px-3 py-1 text-xs text-[var(--primary-color)]">
          <span>视频管理 · 审核管理</span>
        </div>
        <h1 className="text-lg md:text-xl font-semibold tracking-tight">
          结合 AI 预审核与人工复核的视频审核队列
        </h1>
        <p className="text-xs text-[var(--text-color-secondary)] max-w-2xl">
          左右队列分别承载 AI 预审核与人工审核任务，后续可与审核接口、违规评论库与敏感词配置联动，构建完整的内容安全闭环。
        </p>
      </div>

      <Card className="border border-[var(--border-color)] bg-[var(--bg-elevated)]/95">
        <div className="p-3 space-y-3 text-xs border-b border-[var(--border-color)]">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-[color-mix(in_srgb,var(--primary-color)_8%,transparent)] px-3 py-1 text-xs text-[var(--primary-color)]">
                <FiFilter className="text-xs" />
                <span>左侧在不同审核子模块之间切换，右侧展示对应内容。</span>
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-color-secondary)]">
              <span>当前为示例数据，后续会与实际审核接口与违规评论库对接。</span>
            </div>
          </div>
        </div>

        <div className="p-3 grid gap-4 md:grid-cols-[minmax(0,1.1fr)_minmax(0,2.1fr)]">
          <Card className="border border-[var(--border-color)] bg-[var(--bg-elevated)]/95">
            <div className="p-3 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-xs font-medium">审核功能导航</div>
                  <div className="text-xs text-[var(--text-color-secondary)]">
                    采用左侧功能导航树快速切换「视频审核 / 评论审核 / 违规评论库 / 审核规则配置」。
                  </div>
                </div>
                <Chip size="sm" variant="flat" className="text-xs">
                  审核中心
                </Chip>
              </div>
              <div className="mt-2 space-y-1">
                {[
                  {
                    key: "video" as AuditModule,
                    label: "视频审核",
                    description: "管理视频内容的 AI 预审核与人工复核流程。"
                  },
                  {
                    key: "comment" as AuditModule,
                    label: "评论审核",
                    description: "对视频下的评论进行敏感词检测与人工判定。"
                  },
                  {
                    key: "violation" as AuditModule,
                    label: "违规评论库",
                    description: "集中管理已判定违规的评论样本，提供给 AI 学习。"
                  },
                  {
                    key: "rules" as AuditModule,
                    label: "审核规则配置",
                    description: "配置 AI 预审核灵敏度、自动审核规则与通知策略。"
                  }
                ].map(item => {
                  const active = activeModule === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      className={
                        "w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-left text-xs border transition-colors " +
                        (active
                          ? "border-[var(--primary-color)] bg-[color-mix(in_srgb,var(--primary-color)_12%,transparent)] text-[var(--primary-color)]"
                          : "border-transparent text-[var(--text-color-secondary)] hover:bg-[color-mix(in_srgb,var(--primary-color)_6%,transparent)] hover:text-[var(--text-color)]")
                      }
                      onClick={() => {
                        setActiveModule(item.key);
                        setVideoTab("queue");
                      }}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--bg-elevated)] border border-[var(--border-color)] text-xs">
                            {item.key === "video" && "V"}
                            {item.key === "comment" && "C"}
                            {item.key === "violation" && "B"}
                            {item.key === "rules" && "R"}
                          </span>
                          <span className="text-xs font-medium">{item.label}</span>
                        </div>
                        <div className="text-[var(--text-color-secondary)]">{item.description}</div>
                      </div>
                      {active && (
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary-color)]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </Card>

          <div className="space-y-3 text-xs">
            {activeModule === "video" && (
              <Card className="border border-[var(--border-color)] bg-[var(--bg-elevated)]/95">
                <div className="p-3 space-y-3 border-b border-[var(--border-color)]">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                      <Input
                        size="sm"
                        variant="bordered"
                        className="w-64"
                        placeholder="按标题 / ID 搜索视频"
                        value={keyword}
                        onValueChange={value => {
                          setKeyword(value);
                          setPage(1);
                          setSelectedIds([]);
                        }}
                        startContent={
                          <FiSearch className="text-xs text-[var(--text-color-secondary)]" />
                        }
                        classNames={{
                          inputWrapper: "h-8 text-xs",
                          input: "text-xs"
                        }}
                      />
                      <Input
                        size="sm"
                        variant="bordered"
                        className="w-40"
                        placeholder="按上传人筛选"
                        value={uploaderFilter}
                        onValueChange={value => {
                          setUploaderFilter(value);
                          setPage(1);
                          setSelectedIds([]);
                        }}
                        classNames={{
                          inputWrapper: "h-8 text-xs",
                          input: "text-xs"
                        }}
                      />
                      <Select
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
                        {item => (
                          <SelectItem key={item.value}>
                            {item.label}
                          </SelectItem>
                        )}
                      </Select>
                      <DateRangePicker
                        aria-label="上传时间筛选"
                        size="sm"
                        variant="bordered"
                        className="w-56 text-xs"
                      />
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <AdminTabs
                        aria-label="审核状态筛选"
                        size="sm"
                        selectedKey={statusFilter}
                        onSelectionChange={key => {
                          const value = key as StatusFilter;
                          setStatusFilter(value);
                          setPage(1);
                          setSelectedIds([]);
                        }}
                        classNames={{
                          tabList: "p-0 h-8 gap-0",
                          tab: "h-8 px-3 text-xs"
                        }}
                      >
                        <Tab key="all" title="全部" />
                        <Tab key="pending" title="待审核" />
                        <Tab key="approved" title="已通过" />
                        <Tab key="rejected" title="已驳回" />
                      </AdminTabs>
                      <Button
                        size="sm"
                        variant="light"
                        className="h-8 text-xs"
                        onPress={handleResetFilter}
                      >
                        重置筛选
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-color-secondary)]">
                    <FiFilter className="text-xs" />
                    <span>支持按审核状态、上传时间、上传人、分类等多条件组合筛选。</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <AdminTabs
                      aria-label="视频审核子模块"
                      size="sm"
                      selectedKey={videoTab}
                      onSelectionChange={key => {
                        const value = key as "queue" | "logs";
                        setVideoTab(value);
                      }}
                      classNames={{
                        tabList: "p-0 h-8 gap-0",
                        tab: "h-8 px-4 text-xs"
                      }}
                    >
                      <Tab key="queue" title="审核队列" />
                      <Tab key="logs" title="审核日志" />
                    </AdminTabs>
                    <AdminTabs
                      aria-label="审核队列切换"
                      size="sm"
                      selectedKey={queueType}
                      onSelectionChange={key => {
                        const value = key as QueueType;
                        setQueueType(value);
                        setPage(1);
                        setSelectedIds([]);
                      }}
                      classNames={{
                        tabList: "p-0 h-8 gap-0",
                        tab: "h-8 px-4 text-xs"
                      }}
                    >
                      <Tab key="ai" title="AI 预审核队列" />
                      <Tab key="manual" title="人工审核队列" />
                    </AdminTabs>
                  </div>
                </div>

                {videoTab === "queue" && (
                  <div className="p-3 space-y-3">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-color-secondary)]">
                        <span>
                          当前展示
                          {queueType === "ai" ? " AI 预审核标记的可疑视频队列。" : " 需要人工复核的视频队列。"}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          size="sm"
                          variant="light"
                          className="h-8 text-xs"
                          isDisabled={!hasSelection}
                          startContent={<FiCheck className="text-xs" />}
                          onPress={handleBatchApprove}
                        >
                          批量通过
                        </Button>
                        <Button
                          size="sm"
                          variant="light"
                          color="danger"
                          className="h-8 text-xs"
                          isDisabled={!hasSelection}
                          startContent={<FiX className="text-xs" />}
                          onPress={handleBatchReject}
                        >
                          批量驳回
                        </Button>
                      </div>
                    </div>

                    <div className="overflow-auto border border-[var(--border-color)] rounded-lg">
                      <Table
                        aria-label="视频审核队列"
                        className="min-w-full text-xs"
                        selectionMode="multiple"
                        selectedKeys={new Set(selectedIds)}
                        onSelectionChange={handleTableSelectionChange}
                      >
                        <TableHeader className="bg-[var(--bg-elevated)]/80">
                          <TableColumn className="px-3 py-2 text-left font-medium">
                            标题
                          </TableColumn>
                          <TableColumn className="px-3 py-2 text-left font-medium">
                            上传人
                          </TableColumn>
                          <TableColumn className="px-3 py-2 text-left font-medium">
                            分类
                          </TableColumn>
                          <TableColumn className="px-3 py-2 text-left font-medium">
                            风险等级
                          </TableColumn>
                          <TableColumn className="px-3 py-2 text-left font-medium">
                            AI 预审核
                          </TableColumn>
                          <TableColumn className="px-3 py-2 text-left font-medium">
                            审核状态
                          </TableColumn>
                          <TableColumn className="px-3 py-2 text-left font-medium">
                            提交时间
                          </TableColumn>
                          <TableColumn className="px-3 py-2 text-left font-medium">
                            操作
                          </TableColumn>
                        </TableHeader>
                        <TableBody
                          items={pageItems}
                          emptyContent="当前队列暂无待处理的视频，新的审核任务会自动进入对应队列。"
                        >
                          {item => (
                            <TableRow key={item.id}>
                              <TableCell className="px-3 py-2 align-top">
                                <div className="flex flex-col gap-1">
                                  <div className="font-medium line-clamp-2">{item.title}</div>
                                  <div className="text-xs text-[var(--text-color-secondary)]">
                                    审核任务 ID：{item.id}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="px-3 py-2 align-top">
                                {item.uploader}
                              </TableCell>
                              <TableCell className="px-3 py-2 align-top">
                                <Chip size="sm" variant="flat" className="text-xs">
                                  {item.category}
                                </Chip>
                              </TableCell>
                              <TableCell className="px-3 py-2 align-top">
                                <Chip
                                  size="sm"
                                  variant="flat"
                                  color={getRiskColor(item.riskLevel)}
                                  className="text-xs"
                                >
                                  {getRiskLabel(item.riskLevel)}风险
                                </Chip>
                              </TableCell>
                              <TableCell className="px-3 py-2 align-top">
                                <Chip
                                  size="sm"
                                  variant={item.isAiChecked ? "flat" : "bordered"}
                                  className="text-xs"
                                >
                                  {item.isAiChecked ? "已由 AI 预审核" : "未开启"}
                                </Chip>
                              </TableCell>
                              <TableCell className="px-3 py-2 align-top">
                                <Chip
                                  size="sm"
                                  variant="flat"
                                  color={getStatusColor(item.status)}
                                  className="text-xs"
                                >
                                  {getStatusLabel(item.status)}
                                </Chip>
                              </TableCell>
                              <TableCell className="px-3 py-2 align-top">
                                {item.createdAt}
                              </TableCell>
                              <TableCell className="px-3 py-2 align-top">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <Button
                                    size="sm"
                                    variant="light"
                                    className="h-7 text-xs"
                                    startContent={<FiPlayCircle className="text-xs" />}
                                    onPress={() => setActiveReviewItem(item)}
                                  >
                                    审核
                                  </Button>
                                  <Modal
                                    isOpen={activeReviewItem?.id === item.id}
                                    onOpenChange={isOpen => {
                                      if (!isOpen && activeReviewItem?.id === item.id) {
                                        setActiveReviewItem(null);
                                      }
                                    }}
                                  >
                                    <ModalContent>
                                      {onClose => (
                                        <>
                                          <ModalHeader className="flex flex-col gap-1">
                                            <div className="text-sm">视频审核面板</div>
                                            <div className="text-xs text-[var(--text-color-secondary)]">
                                              结合左侧预览与右侧审核表单，完成「通过 / 驳回」操作。
                                            </div>
                                          </ModalHeader>
                                          <ModalBody>
                                            <div className="grid gap-3 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1.6fr)] text-xs">
                                              <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                  <div className="flex items-center gap-1.5">
                                                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-[var(--bg-elevated)] border border-[var(--border-color)]">
                                                      <FiPlayCircle className="text-base" />
                                                    </span>
                                                    <span className="text-xs font-medium">
                                                      视频预览
                                                    </span>
                                                  </div>
                                                  <Chip
                                                    size="sm"
                                                    variant="flat"
                                                    className="text-xs"
                                                  >
                                                    倍速 / 全屏占位
                                                  </Chip>
                                                </div>
                                                <div className="aspect-video rounded-lg border border-[var(--border-color)] bg-[color-mix(in_srgb,var(--bg-elevated)_70%,black_30%)] flex items-center justify-center text-xs text-[var(--text-color-secondary)]">
                                                  {activeReviewItem?.title ?? item.title}
                                                </div>
                                                <div className="space-y-1 text-xs text-[var(--text-color-secondary)]">
                                                  <div>视频 ID：{item.id}</div>
                                                  <div>
                                                    上传人：{item.uploader} · 分类：{item.category}
                                                  </div>
                                                </div>
                                              </div>
                                              <div className="space-y-3">
                                                <div className="space-y-1">
                                                  <div className="text-xs font-medium">
                                                    审核结论
                                                  </div>
                                                  <div className="grid grid-cols-2 gap-2">
                                                    <Button
                                                      size="sm"
                                                      variant="flat"
                                                      color="success"
                                                      className="h-8 text-xs"
                                                      onPress={() => {
                                                        handleUpdateStatus(item.id, "approved");
                                                        onClose();
                                                      }}
                                                    >
                                                      直接通过
                                                    </Button>
                                                    <Button
                                                      size="sm"
                                                      variant="flat"
                                                      color="danger"
                                                      className="h-8 text-xs"
                                                      onPress={() => {
                                                        handleUpdateStatus(item.id, "rejected");
                                                        onClose();
                                                      }}
                                                    >
                                                      直接驳回
                                                    </Button>
                                                  </div>
                                                </div>
                                                <div className="space-y-1">
                                                  <div className="text-xs font-medium">
                                                    预设驳回原因占位
                                                  </div>
                                                  <Input
                                                    size="sm"
                                                    variant="bordered"
                                                    placeholder="例如：涉及高风险敏感词 / 画面不合规"
                                                    classNames={{
                                                      inputWrapper: "h-8 text-xs",
                                                      input: "text-xs"
                                                    }}
                                                  />
                                                </div>
                                                <div className="space-y-1">
                                                  <div className="text-xs font-medium">
                                                    审核说明占位
                                                  </div>
                                                  <textarea
                                                    className="w-full min-h-[80px] rounded-md border border-[var(--border-color)] bg-[var(--bg-elevated)] px-2.5 py-1.5 text-xs outline-none focus-visible:ring-1 focus-visible:ring-[var(--primary-color)]"
                                                    placeholder="补充说明本次审核结论，后续会与后端审核日志字段对齐。"
                                                  />
                                                </div>
                                                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--text-color-secondary)]">
                                                  <span>审核结果与完整轨迹建议统一由后端返回。</span>
                                                  <Button
                                                    size="sm"
                                                    variant="light"
                                                    className="h-8 text-xs"
                                                    onPress={onClose}
                                                  >
                                                    关闭
                                                  </Button>
                                                </div>
                                              </div>
                                            </div>
                                          </ModalBody>
                                        </>
                                      )}
                                    </ModalContent>
                                  </Modal>
                                  <Button
                                    size="sm"
                                    variant="light"
                                    className="h-7 text-xs"
                                    startContent={<FiFlag className="text-xs" />}
                                  >
                                    标记可疑
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="light"
                                    className="h-7 text-xs"
                                    startContent={<FiMessageSquare className="text-xs" />}
                                  >
                                    评论占位
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="light"
                                    className="h-7 text-xs"
                                    startContent={<FiCheck className="text-xs" />}
                                    onPress={() => handleUpdateStatus(item.id, "approved")}
                                  >
                                    快速通过
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="light"
                                    color="danger"
                                    className="h-7 text-xs"
                                    startContent={<FiX className="text-xs" />}
                                    onPress={() => handleUpdateStatus(item.id, "rejected")}
                                  >
                                    快速驳回
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>

                    <div className="mt-3 flex flex-col gap-2 text-[11px] md:flex-row md:items-center md:justify-between">
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
                )}

                {videoTab === "logs" && (
                  <div className="p-3 space-y-3">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-[var(--text-color-secondary)]">
                        <span>按时间倒序展示视频审核日志，支持按审核人与时间范围筛选。</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Input
                          size="sm"
                          variant="bordered"
                          className="w-40"
                          placeholder="按审核人筛选"
                          value={logReviewerFilter}
                          onValueChange={value => setLogReviewerFilter(value)}
                          classNames={{
                            inputWrapper: "h-8 text-xs",
                            input: "text-xs"
                          }}
                        />
                        <DateRangePicker
                          aria-label="审核时间筛选"
                          size="sm"
                          variant="bordered"
                          className="w-56 text-[11px]"
                        />
                      </div>
                    </div>
                    <div className="overflow-auto border border-[var(--border-color)] rounded-lg">
                      <Table
                        aria-label="视频审核日志"
                        className="min-w-full text-xs"
                      >
                        <TableHeader className="bg-[var(--bg-elevated)]/80">
                          <TableColumn className="px-3 py-2 text-left font-medium">
                            视频 ID/标题
                          </TableColumn>
                          <TableColumn className="px-3 py-2 text-left font-medium">
                            审核人
                          </TableColumn>
                          <TableColumn className="px-3 py-2 text-left font-medium">
                            审核时间
                          </TableColumn>
                          <TableColumn className="px-3 py-2 text-left font-medium">
                            审核结果
                          </TableColumn>
                          <TableColumn className="px-3 py-2 text-left font-medium">
                            审核说明
                          </TableColumn>
                        </TableHeader>
                        <TableBody
                          items={filteredReviewLogs}
                          emptyContent="暂无审核日志记录。"
                        >
                          {item => (
                            <TableRow key={item.id}>
                              <TableCell className="px-3 py-2 align-top">
                                <div className="flex flex-col gap-1">
                                  <div className="font-medium line-clamp-2">
                                    {item.title}
                                  </div>
                                  <div className="text-[11px] text-[var(--text-color-secondary)]">
                                    视频 ID：{item.videoId}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="px-3 py-2 align-top">
                                {item.reviewer}
                              </TableCell>
                              <TableCell className="px-3 py-2 align-top">
                                {item.reviewedAt}
                              </TableCell>
                              <TableCell className="px-3 py-2 align-top">
                                <Chip
                                  size="sm"
                                  variant="flat"
                                  color={item.result === "approved" ? "success" : "danger"}
                                  className="text-[10px]"
                                >
                                  {item.result === "approved" ? "已通过" : "已驳回"}
                                </Chip>
                              </TableCell>
                              <TableCell className="px-3 py-2 align-top">
                                <div className="max-w-xs line-clamp-2">
                                  {item.remark}
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                    <div className="text-[11px] text-[var(--text-color-secondary)]">
                      审核日志仅支持查看，不支持编辑，后续会与「最近操作记录」模块打通，统一展示审核类操作。
                    </div>
                  </div>
                )}
              </Card>
            )}

            {activeModule === "comment" && (
              <Card className="border border-[var(--border-color)] bg-[var(--bg-elevated)]/95">
                <div className="p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="text-xs font-medium">评论审核</div>
                      <div className="text-[11px] text-[var(--text-color-secondary)]">
                        顶部支持多维度筛选，列表展示评论内容、敏感词等级与关联视频信息。
                      </div>
                    </div>
                    <AdminTabs
                      aria-label="评论审核子模块"
                      size="sm"
                      radius="full"
                      variant="bordered"
                      defaultSelectedKey="pending"
                      classNames={{
                        tabList: "p-0 h-8 border-[var(--border-color)] gap-0",
                        cursor: "bg-[var(--primary-color)]",
                        tab: "h-8 px-3 text-[10px] data-[selected=true]:text-white"
                      }}
                    >
                      <Tab key="pending" title="待审核" />
                      <Tab key="reviewed" title="已审核" />
                    </AdminTabs>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Input
                      size="sm"
                      variant="bordered"
                      className="w-64"
                      placeholder="按评论内容 / 关联视频标题搜索"
                      startContent={
                        <FiSearch className="text-[12px] text-[var(--text-color-secondary)]" />
                      }
                      classNames={{
                        inputWrapper: "h-8 text-xs",
                        input: "text-xs"
                      }}
                    />
                    <DateRangePicker
                      aria-label="评论时间范围"
                      size="sm"
                      variant="bordered"
                      className="w-56 text-[11px]"
                    />
                  </div>
                  <div className="overflow-auto border border-[var(--border-color)] rounded-lg">
                    <Table
                      aria-label="评论审核示例列表"
                      className="min-w-full text-xs"
                    >
                      <TableHeader className="bg-[var(--bg-elevated)]/80">
                        <TableColumn className="px-3 py-2 text-left font-medium">
                          评论内容
                        </TableColumn>
                        <TableColumn className="px-3 py-2 text-left font-medium">
                          关联视频
                        </TableColumn>
                        <TableColumn className="px-3 py-2 text-left font-medium">
                          评论者
                        </TableColumn>
                        <TableColumn className="px-3 py-2 text-left font-medium">
                          敏感词等级
                        </TableColumn>
                        <TableColumn className="px-3 py-2 text-left font-medium">
                          评论时间
                        </TableColumn>
                        <TableColumn className="px-3 py-2 text-left font-medium">
                          操作
                        </TableColumn>
                      </TableHeader>
                      <TableBody
                        emptyContent="当前暂无需人工处理的评论记录。"
                      >
                        <TableRow key="comment_demo_1">
                          <TableCell className="px-3 py-2 align-top">
                            <span className="text-[11px]">
                              这段内容是不是有点过于绝对了？
                            </span>
                          </TableCell>
                          <TableCell className="px-3 py-2 align-top">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-xs font-medium">
                                效率翻倍：如何把零散笔记整理成知识库
                              </span>
                              <span className="text-[11px] text-[var(--text-color-secondary)]">
                                视频 ID：vd_20260118001
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="px-3 py-2 align-top">
                            user_01
                          </TableCell>
                          <TableCell className="px-3 py-2 align-top">
                            <Chip
                              size="sm"
                              variant="flat"
                              color="warning"
                              className="text-[10px]"
                            >
                              中
                            </Chip>
                          </TableCell>
                          <TableCell className="px-3 py-2 align-top">
                            2026-01-18 10:32:01
                          </TableCell>
                          <TableCell className="px-3 py-2 align-top">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <Button size="sm" variant="light" className="h-7 text-[10px]">
                                通过
                              </Button>
                              <Button
                                size="sm"
                                variant="light"
                                color="danger"
                                className="h-7 text-[10px]"
                              >
                                驳回
                              </Button>
                              <Button size="sm" variant="light" className="h-7 text-[10px]">
                                标记违规
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </Card>
            )}

            {activeModule === "violation" && (
              <Card className="border border-[var(--border-color)] bg-[var(--bg-elevated)]/95">
                <div className="p-3 space-y-3">
                  <div className="space-y-1">
                    <div className="text-xs font-medium">违规评论库</div>
                    <div className="text-[11px] text-[var(--text-color-secondary)]">
                      将审核驳回或标记违规的评论集中管理，支持下架、删除与限制播放等处理方式。
                    </div>
                  </div>
                  <div className="overflow-auto border border-[var(--border-color)] rounded-lg">
                    <Table
                      aria-label="违规评论示例列表"
                      className="min-w-full text-xs"
                    >
                      <TableHeader className="bg-[var(--bg-elevated)]/80">
                        <TableColumn className="px-3 py-2 text-left font-medium">
                          评论内容
                        </TableColumn>
                        <TableColumn className="px-3 py-2 text-left font-medium">
                          违规类型
                        </TableColumn>
                        <TableColumn className="px-3 py-2 text-left font-medium">
                          标注关键词
                        </TableColumn>
                        <TableColumn className="px-3 py-2 text-left font-medium">
                          审核时间
                        </TableColumn>
                        <TableColumn className="px-3 py-2 text-left font-medium">
                          处理方式
                        </TableColumn>
                      </TableHeader>
                      <TableBody emptyContent="暂无违规评论样本。">
                        <TableRow key="violation_demo_1">
                          <TableCell className="px-3 py-2 align-top">
                            <span className="text-[11px]">
                              这段评论因包含高风险敏感词已被标记为违规。
                            </span>
                          </TableCell>
                          <TableCell className="px-3 py-2 align-top">
                            <Chip
                              size="sm"
                              variant="flat"
                              color="danger"
                              className="text-[10px]"
                            >
                              高风险敏感词
                            </Chip>
                          </TableCell>
                          <TableCell className="px-3 py-2 align-top">
                            <span className="text-[11px]">示例敏感词 A / B</span>
                          </TableCell>
                          <TableCell className="px-3 py-2 align-top">
                            2026-01-18 10:10:00
                          </TableCell>
                          <TableCell className="px-3 py-2 align-top">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <Button size="sm" variant="light" className="h-7 text-[10px]">
                                下架
                              </Button>
                              <Button
                                size="sm"
                                variant="light"
                                color="danger"
                                className="h-7 text-[10px]"
                              >
                                删除
                              </Button>
                              <Button size="sm" variant="light" className="h-7 text-[10px]">
                                限制播放
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                  <div className="text-[11px] text-[var(--text-color-secondary)]">
                    删除操作建议由审核负责人二次确认，后续会与权限与操作日志模块对齐，实现完整的审批链路。
                  </div>
                </div>
              </Card>
            )}

            {activeModule === "rules" && (
              <Card className="border border-[var(--border-color)] bg-[var(--bg-elevated)]/95">
                <div className="p-3 space-y-3">
                  <div className="space-y-1">
                    <div className="text-xs font-medium">审核规则配置</div>
                    <div className="text-[11px] text-[var(--text-color-secondary)]">
                      按「AI 预审核规则 / 自动审核规则 / 审核通知配置 / 审核权限配置」分标签页展示，后续可接入真实表单配置。
                    </div>
                  </div>
                  <AdminTabs
                    aria-label="审核规则配置标签"
                    size="sm"
                    defaultSelectedKey="ai"
                    classNames={{
                      tabList: "p-0 h-8 gap-0",
                      tab: "h-8 px-3 text-[10px]"
                    }}
                  >
                    <Tab key="ai" title="AI 预审核规则">
                      <div className="mt-3 space-y-2 text-[11px]">
                        <div>示例：配置 AI 审核灵敏度为「严格 / 标准 / 宽松」。</div>
                        <div>实际环境下会以表单字段形式呈现，并与后端规则接口对接。</div>
                      </div>
                    </Tab>
                    <Tab key="auto" title="自动审核规则">
                      <div className="mt-3 space-y-2 text-[11px]">
                        <div>示例：配置「低风险内容自动通过、极高风险内容自动驳回」等策略。</div>
                      </div>
                    </Tab>
                    <Tab key="notify" title="审核通知配置">
                      <div className="mt-3 space-y-2 text-[11px]">
                        <div>示例：配置审核结果通知方式（站内信 / 邮件 / 短信）。</div>
                      </div>
                    </Tab>
                    <Tab key="permission" title="审核权限配置">
                        <div className="mt-3 space-y-2 text-[11px]">
                          <div>示例：只允许具备「审核负责人」角色的账号调整规则，普通审核员仅可查看。</div>
                        </div>
                      </Tab>
                    </AdminTabs>
                </div>
              </Card>
            )}
          </div>
        </div>
      </Card>

      <Card className="border border-[var(--border-color)] bg-[var(--bg-elevated)]/95">
        <div className="p-3 flex flex-col gap-2 text-[11px] md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <FiAlertCircle className="text-[14px] text-[var(--text-color-secondary)]" />
            <span className="text-[var(--text-color-secondary)]">
              审核结果与完整轨迹建议统一由后端返回，前端仅负责渲染时间轴与详情信息，避免在前端拼装业务状态机。
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default VideoReviewPage;
