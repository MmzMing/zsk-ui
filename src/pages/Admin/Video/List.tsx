// ===== 1. 依赖导入区域 =====
import React, { useMemo, useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  Chip,
  Pagination,
  SelectItem,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tab,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Textarea,
  Switch,
  Select,
  Tooltip,
  useDisclosure,
  addToast
} from "@heroui/react";
import { AdminSearchInput } from "@/components/Admin/AdminSearchInput";
import { AdminSelect } from "@/components/Admin/AdminSelect";
import { AdminTabs } from "@/components/Admin/AdminTabs";
import { Column } from "@ant-design/plots";
import {
  FiEdit2,
  FiRotateCcw,
  FiPlayCircle,
  FiPlus,
  FiTrash2,
  FiMessageSquare
} from "react-icons/fi";
import ReactPlayer from "react-player";
import { useAppStore } from "../../../store";

// 修复 ReactPlayer 类型问题
const Player = ReactPlayer as unknown as React.ComponentType<Record<string, unknown>>;

import { routes } from "../../../router/routes";
import {
  fetchVideoList,
  updateVideo,
  batchDeleteVideos,
  toggleVideoPinned,
  toggleVideoRecommended,
  batchUpdateVideoStatus,
  fetchVideoComments,
  deleteVideoComment,
  type VideoItem,
  type VideoStatus,
  type CommentItem
} from "@/api/admin/video";
import { Loading } from "@/components/Loading";

// ===== 2. TODO待处理导入区域 =====

// ===== 3. 状态控制逻辑区域 =====
/**
 * 视频状态过滤类型
 */
type StatusFilter = "all" | VideoStatus;

/**
 * 视频表单状态类型
 */
type VideoFormState = {
  id: string;
  title: string;
  category: string;
  description: string;
  cover: string;
  videoUrl: string;
  tags: string;
  status: VideoStatus;
  duration: string;
  pinned: boolean;
  recommended: boolean;
  relatedVideos: VideoItem[];
};

// ===== 4. 通用工具函数区域 =====
/**
 * 视频分类常量
 */
const VIDEO_CATEGORIES = ["前端基础", "工程实践", "效率方法", "个人成长", "系统设计"];

/**
 * 图表模拟数据
 */
const CHART_DATA = [
  { date: "01-12", plays: 120 },
  { date: "01-13", plays: 268 },
  { date: "01-14", plays: 356 },
  { date: "01-15", plays: 412 },
  { date: "01-16", plays: 298 },
  { date: "01-17", plays: 520 },
  { date: "01-18", plays: 489 }
];

/**
 * 获取状态文本标签
 * @param status 视频状态
 * @returns 对应的中文文本
 */
function getStatusLabel(status: VideoStatus): string {
  const statusMap: Record<VideoStatus, string> = {
    draft: "草稿",
    published: "已发布",
    offline: "已下架",
    pending: "审核中",
    approved: "已通过",
    rejected: "已拒绝",
    scheduled: "定时发布"
  };
  return statusMap[status] || "未知";
}

/**
 * 获取状态颜色类型
 * @param status 视频状态
 * @returns 对应的颜色标识
 */
function getStatusColor(status: VideoStatus): "default" | "primary" | "secondary" | "success" | "warning" | "danger" {
  const colorMap: Record<VideoStatus, "default" | "primary" | "secondary" | "success" | "warning" | "danger"> = {
    draft: "default",
    published: "success",
    offline: "warning",
    pending: "primary",
    approved: "success",
    rejected: "danger",
    scheduled: "secondary"
  };
  return colorMap[status] || "default";
}

// ===== 5. 注释代码函数区 =====

// ===== 6. 错误处理函数区域 =====
/**
 * 显示全局错误提示
 * @param message 错误消息
 */
function showErrorFn(message: string) {
  addToast({
    title: "错误",
    description: message,
    color: "danger"
  });
}

// ===== 7. 数据处理函数区域 =====
/**
 * 处理标签字符串转换为数组
 * @param tagsStr 标签字符串（逗号分隔）
 * @returns 标签数组
 */
function handleProcessTags(tagsStr: string): string[] {
  return tagsStr
    .split(/[,，]/)
    .map(t => t.trim())
    .filter(Boolean);
}

// ===== 8. UI渲染逻辑区域 =====

// ===== 9. 页面初始化与事件绑定 =====
/**
 * 视频管理列表页面
 * @returns 页面JSX元素
 */
function VideoListPage() {
  // --- 状态定义 ---
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);
  const [editingVideo, setEditingVideo] = useState<VideoFormState | null>(null);
  const [commentVideoId, setCommentVideoId] = useState<string | null>(null);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [isCommentsLoading, setIsCommentsLoading] = useState(false);
  
  const { isOpen: isPreviewOpen, onOpen: onPreviewOpen, onClose: onPreviewClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isCommentOpen, onOpen: onCommentOpen, onClose: onCommentClose } = useDisclosure();
  const { themeMode } = useAppStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();

  // --- 逻辑计算 ---
  const pageSize = 8;

  /**
   * 加载视频列表数据
   */
  const loadVideoList = useCallback(async () => {
    const res = await fetchVideoList({
      page: 1,
      pageSize: 1000 // 获取全量数据用于前端筛选
    }, setIsLoading);

    if (res && res.code === 200) {
      setVideos(res.data.list);
    }
  }, []);

  // 初始化加载
  useEffect(() => {
    const timer = setTimeout(() => {
      loadVideoList();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadVideoList]);

  /**
   * 过滤后的视频列表
   */
  const filteredVideos = useMemo(() => {
    const trimmed = keyword.trim().toLowerCase();
    return videos.filter(item => {
      if (categoryFilter !== "all" && item.category !== categoryFilter) {
        return false;
      }
      if (statusFilter !== "all" && item.status !== statusFilter) {
        return false;
      }
      if (trimmed) {
        const content = `${item.title} ${item.category} ${item.id}`.toLowerCase();
        if (!content.includes(trimmed)) {
          return false;
        }
      }
      return true;
    });
  }, [videos, keyword, categoryFilter, statusFilter]);

  // 分页计算
  const total = filteredVideos.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const pageItems = filteredVideos.slice(startIndex, startIndex + pageSize);

  const hasSelection = selectedIds.length > 0;

  /**
   * 推荐位显示逻辑
   */
  const displayRecommended = useMemo(() => {
    const pinned = videos.filter(v => v.pinned);
    const recommended = videos.filter(v => v.recommended && !v.pinned);
    const result = [...pinned, ...recommended];
    return result.slice(0, 4);
  }, [videos]);

  // --- 事件处理函数 ---
  
  /**
   * 处理搜索与筛选重置
   */
  const handleResetFilter = () => {
    setKeyword("");
    setCategoryFilter("all");
    setStatusFilter("all");
    setPage(1);
    setSelectedIds([]);
  };

  /**
   * 处理分页切换
   * @param next 下一页页码
   */
  const handlePageChange = (next: number) => {
    if (next < 1 || next > totalPages) return;
    setPage(next);
    setSelectedIds([]);
  };

  /**
   * 处理表格选择变更
   * @param keys 选中的key集合
   */
  const handleTableSelectionChange = (keys: "all" | Set<React.Key>) => {
    if (keys === "all") {
      setSelectedIds(pageItems.map(item => item.id));
      return;
    }
    setSelectedIds(Array.from(keys).map(String));
  };

  /**
   * 打开编辑弹窗
   * @param item 视频项
   */
  const handleOpenEdit = (item: VideoItem) => {
    setEditingVideo({
      id: item.id,
      title: item.title,
      category: item.category,
      description: item.description || "",
      cover: item.cover || "",
      videoUrl: item.videoUrl || "",
      tags: item.tags?.join(", ") || "",
      status: item.status,
      duration: item.duration,
      pinned: !!item.pinned,
      recommended: !!item.recommended,
      relatedVideos: []
    });
    onEditOpen();
  };

  /**
   * 提交视频更新
   */
  const handleUpdateVideo = async () => {
    if (!editingVideo) return;
    if (!editingVideo.title.trim()) {
      showErrorFn("视频标题不能为空");
      return;
    }

    const res = await updateVideo({
      id: editingVideo.id,
      title: editingVideo.title,
      category: editingVideo.category,
      description: editingVideo.description,
      cover: editingVideo.cover,
      tags: handleProcessTags(editingVideo.tags),
      status: editingVideo.status,
      pinned: editingVideo.pinned,
      recommended: editingVideo.recommended
    }, setIsLoading);

    if (res && res.code === 200) {
      addToast({
        title: "更新成功",
        description: `视频「${editingVideo.title}」已更新`,
        color: "success"
      });
      loadVideoList();
      onEditClose();
    }
  };

  /**
   * 切换置顶状态
   * @param item 视频项
   */
  const handleTogglePinned = async (item: VideoItem) => {
    const nextPinned = !item.pinned;
    const res = await toggleVideoPinned(item.id, nextPinned, setIsLoading);
    if (res && res.code === 200) {
      addToast({
        title: nextPinned ? "已设为置顶" : "已取消置顶",
        description: `视频「${item.title}」状态已更新`,
        color: "success"
      });
      loadVideoList();
    }
  };

  /**
   * 切换推荐状态
   * @param item 视频项
   */
  const handleToggleRecommended = async (item: VideoItem) => {
    const nextRecommended = !item.recommended;
    const res = await toggleVideoRecommended(item.id, nextRecommended, setIsLoading);
    if (res && res.code === 200) {
      addToast({
        title: nextRecommended ? "已设为推荐" : "已取消推荐",
        description: `视频「${item.title}」状态已更新`,
        color: "success"
      });
      loadVideoList();
    }
  };

  /**
   * 批量更新视频状态
   * @param status 目标状态
   */
  const handleBatchUpdateStatus = async (status: Exclude<VideoStatus, "draft">) => {
    if (selectedIds.length === 0) return;
    const res = await batchUpdateVideoStatus({
      ids: selectedIds,
      status
    }, setIsLoading);

    if (res && res.code === 200) {
      addToast({
        title: "批量操作成功",
        description: `已成功更新 ${selectedIds.length} 个视频的状态`,
        color: "success"
      });
      setSelectedIds([]);
      loadVideoList();
    }
  };

  /**
   * 批量删除视频
   */
  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) return;
    const confirmed = window.confirm(`确定要删除选中的 ${selectedIds.length} 个视频吗？此操作不可撤销。`);
    if (!confirmed) return;

    const res = await batchDeleteVideos(selectedIds, setIsLoading);
    if (res && res.code === 200) {
      addToast({
        title: "批量删除成功",
        description: `已删除 ${selectedIds.length} 个视频`,
        color: "success"
      });
      setSelectedIds([]);
      loadVideoList();
    }
  };

  /**
   * 处理截图与预览
   */
  const handlePreviewVideo = (url: string) => {
    setPreviewVideoUrl(url);
    onPreviewOpen();
  };

  /**
   * 加载视频评论
   * @param videoId 视频ID
   */
  const loadComments = async (videoId: string) => {
    setCommentVideoId(videoId);
    onCommentOpen();
    setIsCommentsLoading(true);
    try {
      const res = await fetchVideoComments(videoId);
      if (res && res.code === 200) {
        setComments(res.data);
      }
    } finally {
      setIsCommentsLoading(false);
    }
  };

  /**
   * 删除评论
   * @param commentId 评论ID
   */
  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm("确定要删除这条评论吗？")) return;
    const res = await deleteVideoComment(commentId);
    if (res && res.code === 200) {
      addToast({
        title: "删除成功",
        description: "该评论已被移除",
        color: "success"
      });
      if (commentVideoId) {
        const resList = await fetchVideoComments(commentVideoId);
        if (resList && resList.code === 200) {
          setComments(resList.data);
        }
      }
    }
  };

  /**
   * 视频截图
   */
  const handleCaptureFrame = () => {
    if (!videoRef.current || !editingVideo) return;
    
    try {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/png");
        setEditingVideo({ ...editingVideo, cover: dataUrl });
        addToast({
          title: "截图成功",
          description: "已将当前视频帧设为封面",
          color: "success"
        });
      }
    } catch {
      showErrorFn("视频源可能存在跨域限制，无法截取");
    }
  };

  // --- 图表配置 ---
  const chartTheme = useMemo(() => {
    if (themeMode === "dark") return "classicDark";
    if (themeMode === "light") return "classic";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "classicDark" : "classic";
  }, [themeMode]);

  const chartConfig = {
    data: CHART_DATA,
    xField: "date",
    yField: "plays",
    height: 180,
    autoFit: true,
    columnStyle: {
      radiusTopLeft: 4,
      radiusTopRight: 4
    },
    color: "var(--primary-color)",
    padding: [12, 12, 32, 32],
    xAxis: {
      label: {
        style: {
          fill: "var(--text-color-secondary)",
          fontSize: 10,
          fontFamily: "ArkPixel-12px"
        }
      }
    },
    yAxis: {
      label: {
        style: {
          fill: "var(--text-color-secondary)",
          fontSize: 10,
          fontFamily: "ArkPixel-12px"
        }
      },
      grid: {
        line: {
          style: {
            stroke: "var(--border-color)",
            lineWidth: 0.5
          }
        }
      }
    },
    tooltip: {
      showTitle: false
    },
    theme: chartTheme
  };

  // --- JSX渲染 ---
  return (
    <div className="space-y-4" style={{ fontFamily: "ArkPixel-12px" }}>
      {/* 头部标题区域 */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 rounded-full bg-[color-mix(in_srgb,var(--primary-color)_10%,transparent)] px-3 py-1 text-[0.6875rem] text-[var(--primary-color)]">
          <span>视频管理 · 视频列表</span>
        </div>
        <h1 className="text-lg md:text-xl font-semibold tracking-tight" style={{ fontFamily: "inherit" }}>
          统一管理已上传视频的状态与核心指标
        </h1>
        <p className="text-xs text-[var(--text-color-secondary)] max-w-2xl">
          支持按分类、状态与关键字筛选视频列表，对接内容中心接口，实现上架、下架与数据分析。
        </p>
      </div>

      {/* 推荐位区域 */}
      <Card className="border border-[var(--border-color)] bg-[var(--bg-elevated)]/95">
        <div className="p-3 border-b border-[var(--border-color)]">
          <div className="flex items-center justify-between">
            <div className="text-xs font-medium">推荐位与置顶视频</div>
            <div className="text-[0.6875rem] text-[var(--text-color-secondary)]">
              顶部预留 4 个推荐位，对应前台页面的视频推荐区。
            </div>
          </div>
        </div>
        <div className="p-3">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            {[0, 1, 2, 3].map(index => {
              const item = displayRecommended[index] ?? null;
              if (!item) {
                return (
                  <Card
                    key={index}
                    className="border border-dashed border-[var(--border-color)] bg-[var(--bg-elevated)]/60"
                  >
                    <div className="p-3 flex items-center justify-center text-[0.6875rem] text-[var(--text-color-secondary)]">
                      空推荐位
                    </div>
                  </Card>
                );
              }
              return (
                <Card
                  key={`recommend-${index}`}
                  className="border border-[var(--border-color)] bg-[var(--bg-elevated)]/90"
                >
                  <div className="p-3 flex flex-col gap-2 text-[0.6875rem]">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="text-xs font-medium line-clamp-2">
                          {item.title}
                        </div>
                        <div className="text-[var(--text-color-secondary)]">
                          视频 ID：{item.id}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {item.pinned && (
                          <Chip
                            size="sm"
                            variant="flat"
                            color="danger"
                            className="text-[0.625rem]"
                            radius="full"
                          >
                            置顶
                          </Chip>
                        )}
                        {item.recommended && (
                          <Chip
                            size="sm"
                            variant="flat"
                            color="primary"
                            className="text-[0.625rem]"
                            radius="full"
                          >
                            推荐
                          </Chip>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[var(--text-color-secondary)]">
                      <span>分类：{item.category}</span>
                      <span>播放量：{item.plays.toLocaleString()}</span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </Card>

      {/* 筛选与操作区域 */}
      <Card className="border border-[var(--border-color)] bg-[var(--bg-elevated)]/95">
        <div className="p-3 space-y-3 text-xs border-b border-[var(--border-color)]">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                className="h-8 text-[0.6875rem]"
                startContent={<FiPlus className="text-xs" />}
                onPress={() => navigate(`${routes.admin}/video/upload`)}
              >
                新建视频
              </Button>
              <Button
                size="sm"
                variant="flat"
                className="h-8 text-[0.6875rem]"
                isDisabled={!hasSelection}
                onPress={() => handleBatchUpdateStatus("published")}
              >
                批量上架
              </Button>
              <Button
                size="sm"
                variant="flat"
                className="h-8 text-[0.6875rem]"
                isDisabled={!hasSelection}
                onPress={() => handleBatchUpdateStatus("offline")}
              >
                批量下架
              </Button>
              <Button
                size="sm"
                color="danger"
                variant="flat"
                className="h-8 text-[0.6875rem]"
                isDisabled={!hasSelection}
                startContent={<FiTrash2 className="text-xs" />}
                onPress={handleBatchDelete}
              >
                批量删除
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[0.6875rem] text-[var(--text-color-secondary)]">
              <span>共找到 {total} 个视频</span>
            </div>
          </div>
        </div>

        <div className="p-3 space-y-4 text-xs">
          {/* 搜索与分类筛选 */}
          <div className="flex flex-wrap items-center gap-3">
            <AdminSearchInput
              className="w-64"
              placeholder="按标题 / ID 搜索视频"
              value={keyword}
              onValueChange={value => {
                setKeyword(value);
                setPage(1);
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
              }}
              items={[
                { label: "全部分类", value: "all" },
                ...VIDEO_CATEGORIES.map(item => ({ label: item, value: item }))
              ]}
              isClearable
            >
              {(item: { label: string; value: string }) => (
                <SelectItem key={item.value}>
                  {item.label}
                </SelectItem>
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

          {/* 状态筛选 */}
          <div className="flex flex-wrap items-center gap-3">
            <AdminTabs
              aria-label="视频状态筛选"
              size="sm"
              radius="full"
              color="primary"
              selectedKey={statusFilter}
              onSelectionChange={key => {
                const value = key as StatusFilter;
                setStatusFilter(value);
                setPage(1);
              }}
            >
              <Tab key="all" title="全部状态" />
              <Tab key="draft" title="草稿" />
              <Tab key="published" title="已发布" />
              <Tab key="offline" title="已下架" />
            </AdminTabs>
          </div>
        </div>

        {/* 视频表格 */}
        <div className="p-3">
          <div className="overflow-auto border border-[var(--border-color)] rounded-lg">
            <Table
              aria-label="视频列表"
              className="min-w-full text-xs"
              selectionMode="multiple"
              selectedKeys={selectedIds.length ? new Set(selectedIds) : new Set()}
              onSelectionChange={handleTableSelectionChange}
            >
              <TableHeader className="bg-[var(--bg-elevated)]/80">
                <TableColumn className="px-3 py-2 text-left font-medium">视频信息</TableColumn>
                <TableColumn className="px-3 py-2 text-left font-medium">分类与标签</TableColumn>
                <TableColumn className="px-3 py-2 text-left font-medium">状态</TableColumn>
                <TableColumn className="px-3 py-2 text-left font-medium">核心指标</TableColumn>
                <TableColumn className="px-3 py-2 text-left font-medium">置顶/推荐</TableColumn>
                <TableColumn className="px-3 py-2 text-left font-medium">更新时间</TableColumn>
                <TableColumn className="px-3 py-2 text-left font-medium">操作</TableColumn>
              </TableHeader>
              <TableBody
                items={pageItems}
                emptyContent={isLoading ? " " : "未找到匹配的视频。"}
                loadingContent={<Loading />}
                isLoading={isLoading}
              >
                {item => (
                  <TableRow
                    key={item.id}
                    className="border-t border-[var(--border-color)] hover:bg-[var(--bg-elevated)]/60"
                  >
                    <TableCell className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-16 h-9 rounded bg-[var(--bg-elevated)] border border-[var(--border-color)] overflow-hidden flex-shrink-0 cursor-pointer group relative"
                          onClick={() => handlePreviewVideo(item.videoUrl || item.url || "")}
                        >
                          {item.cover ? (
                            <img src={item.cover} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[var(--text-color-secondary)]">
                              <FiPlayCircle className="text-lg" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <FiPlayCircle className="text-white text-sm" />
                          </div>
                        </div>
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <span className="font-medium truncate max-w-[200px]">{item.title}</span>
                          <span className="text-[var(--text-color-secondary)] font-mono text-[0.625rem]">
                            ID: {item.id} · {item.duration}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-3 py-2">
                      <div className="flex flex-col gap-1 items-start">
                        <span className="text-[var(--text-color-secondary)]">{item.category}</span>
                        <div className="flex flex-wrap gap-1">
                          {item.tags?.slice(0, 2).map((tag, idx) => (
                            <span key={idx} className="text-[0.625rem] px-1.5 py-0.5 rounded bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[var(--text-color-secondary)]">
                              {tag}
                            </span>
                          ))}
                          {(item.tags?.length || 0) > 2 && (
                            <span className="text-[0.625rem] text-[var(--text-color-secondary)]">...</span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-3 py-2">
                      <Chip
                        size="sm"
                        variant="flat"
                        color={getStatusColor(item.status)}
                        className="h-5 text-[0.625rem]"
                      >
                        {getStatusLabel(item.status)}
                      </Chip>
                    </TableCell>
                    <TableCell className="px-3 py-2">
                      <div className="flex flex-col gap-0.5 text-[var(--text-color-secondary)]">
                        <span>播放: {item.plays.toLocaleString()}</span>
                        <span>点赞: {item.likes + item.comments}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-3 py-2">
                      <div className="flex flex-col gap-1 items-start">
                        <Switch
                          size="sm"
                          isSelected={item.pinned}
                          onValueChange={() => handleTogglePinned(item)}
                          classNames={{ label: "text-[0.625rem]" }}
                        >
                          置顶
                        </Switch>
                        <Switch
                          size="sm"
                          isSelected={item.recommended}
                          onValueChange={() => handleToggleRecommended(item)}
                          classNames={{ label: "text-[0.625rem]" }}
                        >
                          推荐
                        </Switch>
                      </div>
                    </TableCell>
                    <TableCell className="px-3 py-2">
                      <span className="text-[var(--text-color-secondary)]">{item.updatedAt}</span>
                    </TableCell>
                    <TableCell className="px-3 py-2">
                      <div className="flex items-center gap-1">
                        <Tooltip content="数据概览">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            className="h-7 w-7"
                            onPress={() => setActiveVideoId(item.id)}
                          >
                            <FiPlayCircle className="text-sm" />
                          </Button>
                        </Tooltip>
                        <Tooltip content="查看评论">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            className="h-7 w-7"
                            onPress={() => loadComments(item.id)}
                          >
                            <FiMessageSquare className="text-sm" />
                          </Button>
                        </Tooltip>
                        <Tooltip content="编辑详情">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            className="h-7 w-7"
                            onPress={() => handleOpenEdit(item)}
                          >
                            <FiEdit2 className="text-sm" />
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
            page={currentPage}
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

      {/* 侧边分析面板 */}
      <Modal
        isOpen={!!activeVideoId}
        onOpenChange={() => setActiveVideoId(null)}
        size="lg"
        scrollBehavior="inside"
        classNames={{
          base: "m-0 h-screen max-h-screen rounded-none",
          header: "border-b border-[var(--border-color)]",
          body: "p-4",
          closeButton: "top-4 right-4"
        }}
      >
        <ModalContent>
          {() => {
            const video = videos.find(v => v.id === activeVideoId);
            if (!video) return null;
            return (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  <span className="text-sm font-semibold truncate pr-8">{video.title}</span>
                  <span className="text-[0.625rem] text-[var(--text-color-secondary)] font-normal">
                    数据概览与播放趋势分析
                  </span>
                </ModalHeader>
                <ModalBody className="space-y-6">
                  {/* 核心指标卡片 */}
                  <div className="grid grid-cols-3 gap-2">
                    <Card className="bg-[var(--bg-elevated)]/50 p-3 border border-[var(--border-color)]">
                      <div className="text-[var(--text-color-secondary)] mb-1">播放总量</div>
                      <div className="text-lg font-semibold">{video.plays.toLocaleString()}</div>
                    </Card>
                    <Card className="bg-[var(--bg-elevated)]/50 p-3 border border-[var(--border-color)]">
                      <div className="text-[var(--text-color-secondary)] mb-1">获赞数</div>
                      <div className="text-lg font-semibold">{video.likes.toLocaleString()}</div>
                    </Card>
                    <Card className="bg-[var(--bg-elevated)]/50 p-3 border border-[var(--border-color)]">
                      <div className="text-[var(--text-color-secondary)] mb-1">评论数</div>
                      <div className="text-lg font-semibold">{video.comments.toLocaleString()}</div>
                    </Card>
                  </div>

                  {/* 趋势图表 */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-medium">近 7 日播放量趋势</div>
                      <Chip size="sm" variant="flat" color="success" className="h-5 text-[0.625rem]">
                        增长 12.5%
                      </Chip>
                    </div>
                    <div className="h-[180px] w-full">
                      <Column {...chartConfig} />
                    </div>
                  </div>

                  {/* 详细信息列表 */}
                  <div className="space-y-3">
                    <div className="text-xs font-medium">基本信息详情</div>
                    <div className="space-y-2 text-[0.6875rem]">
                      <div className="flex justify-between py-1 border-b border-[var(--border-color)] border-dashed">
                        <span className="text-[var(--text-color-secondary)]">视频 ID</span>
                        <span className="font-mono">{video.id}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-[var(--border-color)] border-dashed">
                        <span className="text-[var(--text-color-secondary)]">所属分类</span>
                        <span>{video.category}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-[var(--border-color)] border-dashed">
                        <span className="text-[var(--text-color-secondary)]">视频状态</span>
                        <span>{getStatusLabel(video.status)}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-[var(--border-color)] border-dashed">
                        <span className="text-[var(--text-color-secondary)]">上传时间</span>
                        <span>{video.createdAt}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-[var(--border-color)] border-dashed">
                        <span className="text-[var(--text-color-secondary)]">最后更新</span>
                        <span>{video.updatedAt}</span>
                      </div>
                    </div>
                  </div>
                </ModalBody>
              </>
            );
          }}
        </ModalContent>
      </Modal>

      {/* 编辑弹窗 */}
      <Modal 
        isOpen={isEditOpen} 
        onOpenChange={onEditClose}
        size="3xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <span className="text-sm font-semibold">编辑视频详情</span>
              </ModalHeader>
              <ModalBody>
                {editingVideo && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 左侧：视频与封面 */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="text-xs font-medium">视频预览与截图</div>
                        <div className="aspect-video bg-black rounded-lg overflow-hidden relative group">
                          <Player
                            url={editingVideo.videoUrl}
                            width="100%"
                            height="100%"
                            controls
                            onReady={() => {
                              // 获取原生 video 引用用于截图
                              if (videoRef.current) {
                                const internal = (videoRef.current as unknown as { getInternalPlayer: () => HTMLVideoElement }).getInternalPlayer?.();
                                if (internal) (videoRef.current as unknown as HTMLVideoElement) = internal;
                              }
                            }}
                          />
                        </div>
                        <Button
                          size="sm"
                          fullWidth
                          variant="flat"
                          startContent={<FiPlayCircle />}
                          onPress={handleCaptureFrame}
                        >
                          截取当前帧作为封面
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <div className="text-xs font-medium">封面图预览</div>
                        <div className="aspect-video bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-color)] overflow-hidden">
                          {editingVideo.cover ? (
                            <img src={editingVideo.cover} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[var(--text-color-secondary)] text-[0.6875rem]">
                              暂无封面
                            </div>
                          )}
                        </div>
                        <Input
                          size="sm"
                          label="封面地址"
                          value={editingVideo.cover}
                          onValueChange={v => setEditingVideo({ ...editingVideo, cover: v })}
                        />
                      </div>
                    </div>

                    {/* 右侧：表单信息 */}
                    <div className="space-y-4">
                      <Input
                        isRequired
                        label="视频标题"
                        placeholder="请输入视频标题"
                        value={editingVideo.title}
                        onValueChange={v => setEditingVideo({ ...editingVideo, title: v })}
                      />
                      <Select
                        isRequired
                        label="所属分类"
                        selectedKeys={[editingVideo.category]}
                        onSelectionChange={keys => {
                          const key = Array.from(keys)[0];
                          if (key) setEditingVideo({ ...editingVideo, category: String(key) });
                        }}
                      >
                        {VIDEO_CATEGORIES.map(cat => (
                          <SelectItem key={cat}>{cat}</SelectItem>
                        ))}
                      </Select>
                      <Textarea
                        label="视频描述"
                        placeholder="请输入视频描述"
                        value={editingVideo.description}
                        onValueChange={v => setEditingVideo({ ...editingVideo, description: v })}
                      />
                      <Input
                        label="标签 (逗号分隔)"
                        placeholder="前端, React, 教程"
                        value={editingVideo.tags}
                        onValueChange={v => setEditingVideo({ ...editingVideo, tags: v })}
                      />
                      <div className="flex items-center gap-6 pt-2">
                        <Switch
                          isSelected={editingVideo.pinned}
                          onValueChange={v => setEditingVideo({ ...editingVideo, pinned: v })}
                        >
                          <span className="text-xs">置顶视频</span>
                        </Switch>
                        <Switch
                          isSelected={editingVideo.recommended}
                          onValueChange={v => setEditingVideo({ ...editingVideo, recommended: v })}
                        >
                          <span className="text-xs">设为推荐</span>
                        </Switch>
                      </div>
                    </div>
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onEditClose}>取消</Button>
                <Button color="primary" onPress={handleUpdateVideo}>保存更新</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* 视频预览弹窗 */}
      <Modal 
        isOpen={isPreviewOpen} 
        onOpenChange={onPreviewClose}
        size="4xl"
        classNames={{
          base: "bg-black",
          closeButton: "text-white hover:bg-white/10"
        }}
      >
        <ModalContent>
          {() => (
            <ModalBody className="p-0">
              <div className="aspect-video w-full">
                {previewVideoUrl && (
                  <Player
                    url={previewVideoUrl}
                    width="100%"
                    height="100%"
                    controls
                    playing
                  />
                )}
              </div>
            </ModalBody>
          )}
        </ModalContent>
      </Modal>

      {/* 评论管理弹窗 */}
      <Modal
        isOpen={isCommentOpen}
        onOpenChange={onCommentClose}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          {() => {
            const video = videos.find(v => v.id === commentVideoId);
            return (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  <span className="text-sm font-semibold">视频评论管理</span>
                  {video && (
                    <span className="text-[0.625rem] text-[var(--text-color-secondary)] font-normal">
                      正在查看视频「{video.title}」的评论
                    </span>
                  )}
                </ModalHeader>
                <ModalBody>
                  {isCommentsLoading ? (
                    <div className="h-40 flex items-center justify-center">
                      <Loading />
                    </div>
                  ) : comments.length > 0 ? (
                    <div className="space-y-4 py-2">
                      {comments.map(comment => (
                         <div key={comment.id} className="group flex gap-3 p-3 rounded-lg bg-[var(--bg-elevated)]/50 border border-[var(--border-color)]">
                            <div className="w-8 h-8 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-color)] overflow-hidden flex-shrink-0">
                            {comment.avatar ? (
                              <img src={comment.avatar} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[0.625rem] text-[var(--text-color-secondary)]">
                                {comment.username.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium">{comment.username}</span>
                              <span className="text-[0.625rem] text-[var(--text-color-secondary)]">{comment.createdAt}</span>
                            </div>
                            <p className="text-[0.6875rem] text-[var(--text-color-secondary)] leading-relaxed">
                              {comment.content}
                            </p>
                          </div>
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            color="danger"
                            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                            onPress={() => handleDeleteComment(comment.id)}
                          >
                            <FiTrash2 className="text-xs" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-40 flex flex-col items-center justify-center gap-2 text-[var(--text-color-secondary)]">
                      <FiMessageSquare className="text-2xl opacity-20" />
                      <span className="text-xs">该视频目前没有评论</span>
                    </div>
                  )}
                </ModalBody>
                <ModalFooter>
                  <Button variant="light" size="sm" onPress={onCommentClose}>关闭</Button>
                </ModalFooter>
              </>
            );
          }}
        </ModalContent>
      </Modal>
    </div>
  );
}

// ===== 10. TODO任务管理区域 =====

// ===== 11. 导出区域 =====
export default VideoListPage;
