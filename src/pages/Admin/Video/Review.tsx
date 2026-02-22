/**
 * 视频审核页面
 * @module pages/Admin/Video/Review
 * @description 视频内容审核，支持审核队列、审核日志、违规处理等功能
 */

import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  SelectItem,
  Button,
  Card,
  Chip,
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
  FiAlertCircle
} from "react-icons/fi";

import { AdminSearchInput } from "@/components/Admin/AdminSearchInput";
import { AdminSelect } from "@/components/Admin/AdminSelect";
import { AdminTabs } from "@/components/Admin/AdminTabs";
import { Loading } from "@/components/Loading";

import {
  fetchReviewQueue,
  submitReviewResult,
  submitBatchReviewResult,
  fetchViolationReasons,
  fetchVideoDetail,
  type BackendVideoDetail
} from "@/api/admin/video";

import { useAdminDataLoader } from "@/hooks";
import { handleError } from "@/utils";
import { PAGINATION } from "@/constants";

import { Checkbox, CheckboxGroup, Textarea } from "@heroui/react";

/** 审核模块类型 */
type AuditModule = "video" | "comment" | "violation" | "rules";

/** 审核状态筛选类型 */
type StatusFilter = "all" | number;

/**
 * 视频审核页面组件
 * @returns 页面JSX元素
 */
export default function VideoReviewPage() {
  /** 当前激活的审核子模块 */
  const [activeModule, setActiveModule] = useState<AuditModule>("video");

  /** 审核状态筛选 */
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  /** 搜索关键字 */
  const [keyword, setKeyword] = useState("");

  /** 选中的项目 ID 列表 */
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  /** 审核 Modal 控制 */
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  /** 当前正在审核的视频详情 */
  const [activeReviewItem, setActiveReviewItem] = useState<BackendVideoDetail | null>(null);
  /** 视频详情（含播放地址） */
  const [videoDetail, setVideoDetail] = useState<BackendVideoDetail | null>(null);
  /** 违规原因列表 */
  const [violationReasons, setViolationReasons] = useState<{ id: string; label: string }[]>([]);
  /** 选中的违规原因 */
  const [selectedViolationIds, setSelectedViolationIds] = useState<string[]>([]);
  /** 驳回原因说明 */
  const [rejectReason, setRejectReason] = useState("");
  /** 视频加载状态 */
  const [videoLoading, setVideoLoading] = useState(false);

  /** 每页条数 */
  const pageSize = PAGINATION.DEFAULT_PAGE_SIZE;
  /** 是否有选中的项 */
  const hasSelection = selectedIds.length > 0;

  /**
   * 获取审核状态标签
   * @param status 状态值
   * @returns 状态文本
   */
  const getStatusLabel = (status: number) => {
    const labels: Record<number, string> = {
      0: "待审核",
      1: "已通过",
      2: "已驳回"
    };
    return labels[status] || "未知";
  };

  /**
   * 获取审核状态颜色
   * @param status 状态值
   * @returns 颜色类型
   */
  const getStatusColor = (status: number): "default" | "primary" | "secondary" | "success" | "warning" | "danger" => {
    const colors: Record<number, "default" | "primary" | "secondary" | "success" | "warning" | "danger"> = {
      0: "primary",
      1: "success",
      2: "danger"
    };
    return colors[status] || "default";
  };

  /** 页面状态 */
  const [page, setPage] = useState(1);

  /** 使用自定义 hook 加载审核队列数据 */
  const {
    data: queueData,
    loading: loading,
    loadData: loadQueue
  } = useAdminDataLoader<{ rows: BackendVideoDetail[]; total: number }>();

  /**
   * 加载队列数据
   */
  const loadQueueData = useCallback(async () => {
    await loadQueue(async () => {
      const response = await fetchReviewQueue({
        page,
        pageSize,
        status: statusFilter === "all" ? undefined : Number(statusFilter),
        keyword: keyword.trim() || undefined
      });
      return response.data || { rows: [], total: 0 };
    }, {
      showErrorToast: true,
      errorMessage: '加载审核队列数据失败'
    });
  }, [page, pageSize, statusFilter, keyword, loadQueue]);

  const queue = useMemo(() => queueData?.rows || [], [queueData]);
  const total = queueData?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  /**
   * 加载视频详情和违规原因
   * @param id 视频ID
   */
  const loadReviewDetail = useCallback(async (id: string) => {
    setVideoLoading(true);
    try {
      const [videoRes, reasonsRes] = await Promise.all([
        fetchVideoDetail(id),
        fetchViolationReasons()
      ]);

      if (videoRes && videoRes.data) {
        setVideoDetail(videoRes.data);
      }
      if (reasonsRes && reasonsRes.data) {
        setViolationReasons(reasonsRes.data);
      }
    } catch (error) {
      handleError(error, {
        showToast: true,
        errorMessage: "加载审核详情失败"
      });
    } finally {
      setVideoLoading(false);
    }
  }, []);

  /**
   * 监听 activeReviewItem 变化加载详情
   */
  useEffect(() => {
    if (activeReviewItem) {
      loadReviewDetail(String(activeReviewItem.id));
      setSelectedViolationIds([]);
      setRejectReason("");
    } else {
      setVideoDetail(null);
    }
  }, [activeReviewItem, loadReviewDetail]);

  /** 当选中项变化时加载队列 */
  useEffect(() => {
    loadQueueData();
  }, [loadQueueData]);

  /**
   * 处理分页变化
   * @param newPage 新页码
   */
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    setSelectedIds([]);
  };

  /**
   * 处理表格选择变化
   * @param keys 选中的键
   */
  const handleTableSelectionChange = (keys: "all" | Set<React.Key>) => {
    if (keys === "all") {
      setSelectedIds(queue.map(item => String(item.id)));
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
    setPage(1);
    setSelectedIds([]);
  };

  /**
   * 处理审核点击
   * @param item 视频数据
   */
  const handleAuditClick = (item: BackendVideoDetail) => {
    setActiveReviewItem(item);
    onOpen();
  };

  /**
   * 处理状态更新 (单个)
   * @param id 视频ID
   * @param status 审核状态
   */
  const handleUpdateStatus = async (id: string, status: number) => {
    if (status === 2) {
      if (selectedViolationIds.length === 0 && !rejectReason.trim()) {
        addToast({
          title: "操作失败",
          description: "驳回时请至少选择一个违规原因或填写驳回说明",
          color: "danger"
        });
        return;
      }
    }

    try {
      const res = await submitReviewResult({
        videoId: id,
        auditStatus: status,
        auditMind: status === 2 ? rejectReason : undefined
      });

      if (res && res.code === 200) {
        addToast({
          title: "操作成功",
          description: `审核${status === 1 ? "通过" : "驳回"}操作成功`,
          color: "success"
        });
        onClose();
        loadQueueData();
      }
    } catch (error) {
      handleError(error, {
        showToast: true,
        errorMessage: "审核操作失败"
      });
    }
  };

  /**
   * 处理批量审核
   * @param status 审核状态
   */
  const handleBatchUpdateStatus = async (status: number) => {
    if (!hasSelection) return;

    try {
      const res = await submitBatchReviewResult({
        videoIds: selectedIds,
        auditStatus: status
      });

      if (res && res.code === 200) {
        addToast({
          title: "批量操作成功",
          description: `已成功${status === 1 ? "通过" : "驳回"} ${selectedIds.length} 个视频`,
          color: "success"
        });
        setSelectedIds([]);
        loadQueueData();
      }
    } catch (error) {
      handleError(error, {
        showToast: true,
        errorMessage: "批量操作失败"
      });
    }
  };

  /** JSX渲染 */
  return (
    <div className="space-y-4">
      {/* 头部标题区域 */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 rounded-full bg-[color-mix(in_srgb,var(--primary-color)_10%,transparent)] px-3 py-1 text-[0.6875rem] text-[var(--primary-color)]">
          <span>视频管理 · 审核中心</span>
        </div>
        <h1 className="text-lg md:text-xl font-semibold tracking-tight">
          审核视频内容，确保平台内容合规
        </h1>
        <p className="text-xs text-[var(--text-color-secondary)] max-w-2xl">
          支持按状态、分类、上传人筛选待审核视频，提供预览、驳回、通过等审核操作。
        </p>
      </div>

      {/* 筛选与操作区域 */}
      <Card className="border border-[var(--border-color)] bg-[var(--bg-elevated)]/95">
        <div className="p-3 space-y-3 text-xs border-b border-[var(--border-color)]">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                color="success"
                variant="flat"
                className="h-8 text-[0.6875rem]"
                startContent={<FiCheck className="text-xs" />}
                isDisabled={!hasSelection}
                onPress={() => handleBatchUpdateStatus(1)}
              >
                批量通过
              </Button>
              <Button
                size="sm"
                color="danger"
                variant="flat"
                className="h-8 text-[0.6875rem]"
                startContent={<FiX className="text-xs" />}
                isDisabled={!hasSelection}
                onPress={() => handleBatchUpdateStatus(2)}
              >
                批量驳回
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[0.6875rem] text-[var(--text-color-secondary)]">
              <span>共 {total} 个待审核项</span>
            </div>
          </div>
        </div>

        <div className="p-3 space-y-4 text-xs">
          {/* 搜索与筛选 */}
          <div className="flex flex-wrap items-center gap-3">
            <AdminSearchInput
              className="w-64"
              placeholder="按标题 / ID 搜索"
              value={keyword}
              onValueChange={value => {
                setKeyword(value);
                setPage(1);
              }}
            />
            <AdminSelect
              aria-label="状态筛选"
              size="sm"
              className="w-32"
              selectedKeys={[String(statusFilter)]}
              onSelectionChange={keys => {
                const key = Array.from(keys)[0];
                setStatusFilter(key ? (key === "all" ? "all" : Number(key)) : "all");
                setPage(1);
              }}
              items={[
                { label: "全部状态", value: "all" },
                { label: "待审核", value: "0" },
                { label: "已通过", value: "1" },
                { label: "已驳回", value: "2" }
              ]}
            >
              {(item: { label: string; value: string }) => (
                <SelectItem key={item.value}>{item.label}</SelectItem>
              )}
            </AdminSelect>
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

          {/* Tab 切换 */}
          <AdminTabs
            aria-label="审核模块切换"
            size="sm"
            radius="full"
            color="primary"
            selectedKey={activeModule}
            onSelectionChange={key => setActiveModule(key as AuditModule)}
          >
            <Tab key="video" title="视频审核" />
            <Tab key="comment" title="评论审核" />
            <Tab key="violation" title="违规处理" />
            <Tab key="rules" title="规则配置" />
          </AdminTabs>
        </div>

        {/* 审核队列表格 */}
        <div className="p-3">
          <div className="overflow-auto border border-[var(--border-color)] rounded-lg">
            <Table
              aria-label="审核队列"
              className="min-w-full text-xs"
              selectionMode="multiple"
              selectedKeys={selectedIds.length ? new Set(selectedIds) : new Set()}
              onSelectionChange={handleTableSelectionChange}
            >
              <TableHeader className="bg-[var(--bg-elevated)]/80">
                <TableColumn className="px-3 py-2 text-left font-medium">视频信息</TableColumn>
                <TableColumn className="px-3 py-2 text-left font-medium">上传者</TableColumn>
                <TableColumn className="px-3 py-2 text-left font-medium">分类</TableColumn>
                <TableColumn className="px-3 py-2 text-left font-medium">状态</TableColumn>
                <TableColumn className="px-3 py-2 text-left font-medium">提交时间</TableColumn>
                <TableColumn className="px-3 py-2 text-left font-medium">操作</TableColumn>
              </TableHeader>
              <TableBody
                items={queue}
                emptyContent={loading ? " " : "暂无待审核视频。"}
                loadingContent={<Loading />}
                isLoading={loading}
              >
                {item => (
                  <TableRow
                    key={item.id}
                    className="border-t border-[var(--border-color)] hover:bg-[var(--bg-elevated)]/60"
                  >
                    <TableCell className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-9 rounded bg-[var(--bg-elevated)] border border-[var(--border-color)] overflow-hidden flex-shrink-0">
                          {item.coverUrl ? (
                            <img src={item.coverUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[var(--text-color-secondary)]">
                              <FiPlayCircle className="text-lg" />
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <span className="font-medium truncate max-w-[200px]">{item.videoTitle}</span>
                          <span className="text-[var(--text-color-secondary)] font-mono text-[0.625rem]">
                            ID: {item.id}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-3 py-2">
                      <span className="text-[var(--text-color-secondary)]">{item.userId}</span>
                    </TableCell>
                    <TableCell className="px-3 py-2">
                      <span className="text-[var(--text-color-secondary)]">{item.broadCode}</span>
                    </TableCell>
                    <TableCell className="px-3 py-2">
                      <Chip
                        size="sm"
                        variant="flat"
                        color={getStatusColor(item.auditStatus || 0)}
                        className="h-5 text-[0.625rem]"
                      >
                        {getStatusLabel(item.auditStatus || 0)}
                      </Chip>
                    </TableCell>
                    <TableCell className="px-3 py-2">
                      <span className="text-[var(--text-color-secondary)]">{item.createTime}</span>
                    </TableCell>
                    <TableCell className="px-3 py-2">
                      <div className="flex items-center gap-1">
                        <Tooltip content="审核视频">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            className="h-7 w-7"
                            onPress={() => handleAuditClick(item)}
                          >
                            <FiAlertCircle className="text-sm" />
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

        {/* 分页控制 */}
        <div className="p-3 border-t border-[var(--border-color)] flex items-center justify-between">
          <div className="text-[0.6875rem] text-[var(--text-color-secondary)]">
            已选择 {selectedIds.length} 项 · 每页 {pageSize} 条
          </div>
          <Pagination
            total={totalPages}
            page={page}
            onChange={handlePageChange}
            size="sm"
            radius="full"
            showControls
            classNames={{
              cursor: "bg-[var(--primary-color)] text-white"
            }}
          />
        </div>
      </Card>

      {/* 审核弹窗 */}
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size="3xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <span className="text-sm font-semibold">视频审核</span>
                {activeReviewItem && (
                  <span className="text-[0.625rem] text-[var(--text-color-secondary)] font-normal">
                    {activeReviewItem.videoTitle}
                  </span>
                )}
              </ModalHeader>
              <ModalBody className="space-y-4">
                {videoLoading ? (
                  <div className="h-40 flex items-center justify-center">
                    <Loading />
                  </div>
                ) : videoDetail ? (
                  <>
                    {/* 视频预览 */}
                    <div className="aspect-video bg-black rounded-lg overflow-hidden">
                      <video
                        src={videoDetail.videoUrl}
                        className="w-full h-full object-contain"
                        controls
                        poster={videoDetail.coverUrl}
                      />
                    </div>

                    {/* 违规原因选择 */}
                    <div className="space-y-2">
                      <div className="text-xs font-medium">违规原因（驳回时选择）</div>
                      <CheckboxGroup
                        value={selectedViolationIds}
                        onValueChange={setSelectedViolationIds}
                        className="gap-2"
                      >
                        {violationReasons.map(reason => (
                          <Checkbox key={reason.id} value={reason.id} size="sm">
                            {reason.label}
                          </Checkbox>
                        ))}
                      </CheckboxGroup>
                    </div>

                    {/* 驳回说明 */}
                    <Textarea
                      label="驳回说明"
                      placeholder="请输入驳回原因说明..."
                      value={rejectReason}
                      onValueChange={setRejectReason}
                      minRows={3}
                    />
                  </>
                ) : (
                  <div className="h-40 flex items-center justify-center text-[var(--text-color-secondary)]">
                    加载视频详情失败
                  </div>
                )}
              </ModalBody>
              <div className="p-4 flex justify-end gap-2">
                <Button variant="light" onPress={onClose}>取消</Button>
                <Button
                  color="danger"
                  variant="flat"
                  onPress={() => activeReviewItem && handleUpdateStatus(String(activeReviewItem.id), 2)}
                  isDisabled={videoLoading}
                >
                  驳回
                </Button>
                <Button
                  color="success"
                  onPress={() => activeReviewItem && handleUpdateStatus(String(activeReviewItem.id), 1)}
                  isDisabled={videoLoading}
                >
                  通过
                </Button>
              </div>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
