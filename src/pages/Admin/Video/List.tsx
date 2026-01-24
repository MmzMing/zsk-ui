import React, { useMemo, useState, useRef, useEffect } from "react";
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
  FiBarChart2,
  FiEdit2,
  FiEye,
  FiSlash,
  FiUpload,
  FiPlayCircle,
  FiRotateCcw,
  FiX,
  FiCamera,
  FiPlus,
  FiTrash2
} from "react-icons/fi";
import ReactPlayer from "react-player";
import { useAppStore } from "../../../store";
import { fetchVideoList, type VideoItem, type VideoStatus } from "@/api/admin/video";
import { Loading } from "@/components/Loading";

type StatusFilter = "all" | VideoStatus;

const videoCategories = ["前端基础", "工程实践", "效率方法", "个人成长", "系统设计"];

const chartData = [
  { date: "01-12", plays: 120 },
  { date: "01-13", plays: 268 },
  { date: "01-14", plays: 356 },
  { date: "01-15", plays: 412 },
  { date: "01-16", plays: 298 },
  { date: "01-17", plays: 520 },
  { date: "01-18", plays: 489 }
];

function getStatusLabel(status: VideoStatus) {
  if (status === "draft") {
    return "草稿";
  }
  if (status === "published") {
    return "已发布";
  }
  return "已下架";
}

function getStatusColor(status: VideoStatus) {
  if (status === "draft") {
    return "default";
  }
  if (status === "published") {
    return "success";
  }
  return "warning";
}

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

function VideoListPage() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);
  const { isOpen: isPreviewOpen, onOpen: onPreviewOpen, onClose: onPreviewClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const [editingVideo, setEditingVideo] = useState<VideoFormState | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadVideos() {
      setLoading(true);
      try {
        const res = await fetchVideoList({
          page: 1,
          pageSize: 1000
        });
        if (cancelled) return;
        if (res && res.code === 200 && !res.msg) {
          setVideos(res.data.list);
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadVideos();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleEditClick = (item: VideoItem) => {
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
      relatedVideos: [] // 初始化为空，实际应从接口获取
    });
    onEditOpen();
  };

  const handleAddRelatedVideo = () => {
    if (!editingVideo) return;
    // 模拟添加逻辑：从现有视频列表中随机选择一个非当前且未添加的视频
    const candidates = videos.filter(v => 
      v.id !== editingVideo.id && 
      !editingVideo.relatedVideos.find(rv => rv.id === v.id)
    );
    
    if (candidates.length === 0) {
      addToast({ 
        title: "提示", 
        description: "暂无可添加的视频", 
        color: "warning" 
      });
      return;
    }
    
    const randomVideo = candidates[Math.floor(Math.random() * candidates.length)];
    setEditingVideo({
      ...editingVideo,
      relatedVideos: [...editingVideo.relatedVideos, randomVideo]
    });
  };

  const handleRemoveRelatedVideo = (id: string) => {
    if (!editingVideo) return;
    setEditingVideo({
      ...editingVideo,
      relatedVideos: editingVideo.relatedVideos.filter(v => v.id !== id)
    });
  };

  const handleUpdateVideo = () => {
    if (!editingVideo) return;

    if (!editingVideo.title.trim()) {
      addToast({
        title: "表单错误",
        description: "视频标题不能为空",
        color: "danger"
      });
      return;
    }

    setVideos(prev =>
      prev.map(v =>
        v.id === editingVideo.id
          ? {
              ...v,
              ...editingVideo,
              tags: editingVideo.tags
                .split(/[,，]/)
                .map(t => t.trim())
                .filter(Boolean),
              updatedAt: "刚刚"
            }
          : v
      )
    );

    addToast({
      title: "更新成功",
      description: `视频「${editingVideo.title}」已更新`,
      color: "success"
    });
    onEditClose();
  };

  const handleCaptureFrame = () => {
    if (!videoRef.current || !editingVideo) return;
    
    try {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // 注意：跨域视频可能导致 tainted canvas，无法导出 dataURL
        // 实际项目中需要配置 CORS 或使用代理
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/png");
        setEditingVideo({ ...editingVideo, cover: dataUrl });
        addToast({
          title: "截图成功",
          description: "已将当前视频帧设为封面",
          color: "success"
        });
      }
    } catch (error) {
      console.error(error);
      addToast({
        title: "截图失败",
        description: "视频源可能存在跨域限制，无法截取",
        color: "warning"
      });
    }
  };

  const { themeMode } = useAppStore();

  const chartTheme =
    themeMode === "dark"
      ? "classicDark"
      : themeMode === "light"
        ? "classic"
        : window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "classicDark"
          : "classic";

  const pageSize = 8;

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

  const total = filteredVideos.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const pageItems = filteredVideos.slice(startIndex, endIndex);

  const hasSelection = selectedIds.length > 0;

  const pinnedVideos = useMemo(
    () => videos.filter(item => item.pinned),
    [videos]
  );

  const recommendedVideos = useMemo(
    () => videos.filter(item => item.recommended),
    [videos]
  );

  const displayRecommended = useMemo(() => {
    const items: VideoItem[] = [];
    // 优先放置置顶视频
    pinnedVideos.forEach(v => {
      if (items.length < 4) items.push(v);
    });
    // 补足推荐视频（避免重复）
    recommendedVideos.forEach(v => {
      if (items.length < 4 && !items.find(i => i.id === v.id)) {
        items.push(v);
      }
    });
    return items;
  }, [pinnedVideos, recommendedVideos]);

  const handlePageChange = (next: number) => {
    if (next < 1 || next > totalPages) {
      return;
    }
    setPage(next);
    setSelectedIds([]);
  };

  const handleResetFilter = () => {
    setKeyword("");
    setCategoryFilter("all");
    setStatusFilter("all");
    setPage(1);
  };

  const handleTableSelectionChange = (keys: "all" | Set<React.Key>) => {
    if (keys === "all") {
      setSelectedIds(pageItems.map(item => item.id));
      return;
    }
    setSelectedIds(Array.from(keys).map(String));
  };

  const handleTogglePinned = (id: string) => {
    setVideos(previous =>
      previous.map(item => {
        if (item.id === id) {
          const nextPinned = !item.pinned;
          addToast({
            title: nextPinned ? "已设为置顶" : "已取消置顶",
            description: `视频「${item.title}」${nextPinned ? "已设为置顶" : "已取消置顶"}，实际逻辑待接入接口。`,
            color: "success"
          });
          return {
            ...item,
            pinned: nextPinned
          };
        }
        return item;
      })
    );
  };

  const handleToggleRecommended = (id: string) => {
    setVideos(previous =>
      previous.map(item => {
        if (item.id === id) {
          const nextRecommended = !item.recommended;
          addToast({
            title: nextRecommended ? "已设为推荐" : "已取消推荐",
            description: `视频「${item.title}」${nextRecommended ? "已设为推荐" : "已取消推荐"}，实际逻辑待接入接口。`,
            color: "success"
          });
          return {
            ...item,
            recommended: nextRecommended
          };
        }
        return item;
      })
    );
  };

  const handleBatchPublish = () => {
    if (!hasSelection) {
      return;
    }
    setVideos(previous =>
      previous.map(item => {
        if (!selectedIds.includes(item.id)) {
          return item;
        }
        return {
          ...item,
          status: "published"
        };
      })
    );
    addToast({
      title: "批量发布成功",
      description: `已成功发布 ${selectedIds.length} 个视频，实际逻辑待接入接口。`,
      color: "success"
    });
    setSelectedIds([]);
  };

  const handleBatchOffline = () => {
    if (!hasSelection) {
      return;
    }
    setVideos(previous =>
      previous.map(item => {
        if (!selectedIds.includes(item.id)) {
          return item;
        }
        return {
          ...item,
          status: "offline"
        };
      })
    );
    addToast({
      title: "批量下线成功",
      description: `已下线 ${selectedIds.length} 个视频，实际逻辑待接入接口。`,
      color: "success"
    });
    setSelectedIds([]);
  };

  const handleOpenSidebar = (id: string) => {
    setActiveVideoId(id);
    setSidebarVisible(true);
  };

  const handleCloseSidebar = () => {
    setSidebarVisible(false);
  };

  const handlePreviewVideo = (url: string) => {
    setPreviewVideoUrl(url);
    onPreviewOpen();
  };

  const activeVideo = videos.find(item => item.id === activeVideoId) ?? null;

  const chartConfig = {
    data: chartData,
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
          fontSize: 10
        }
      }
    },
    yAxis: {
      label: {
        style: {
          fill: "var(--text-color-secondary)",
          fontSize: 10
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

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 rounded-full bg-[color-mix(in_srgb,var(--primary-color)_10%,transparent)] px-3 py-1 text-[0.6875rem] text-[var(--primary-color)]">
          <span>视频管理 · 视频列表</span>
        </div>
        <h1 className="text-lg md:text-xl font-semibold tracking-tight">
          统一管理已上传视频的状态与核心指标
        </h1>
        <p className="text-xs text-[var(--text-color-secondary)] max-w-2xl">
          支持按分类、状态与关键字筛选视频列表，后续可与实际内容中心接口对接，实现上架、下架与数据分析。
        </p>
      </div>

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

      <Card className="border border-[var(--border-color)] bg-[var(--bg-elevated)]/95">
        <div className="p-3 space-y-3 text-xs border-b border-[var(--border-color)]">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                className="h-8 text-[0.6875rem]"
                startContent={<FiUpload className="text-xs" />}
              >
                新建视频
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[0.6875rem] text-[var(--text-color-secondary)]">
              <span>当前操作仅更新前端示例数据，后续与内容服务接口联动。</span>
            </div>
          </div>
        </div>

        <div className="p-3 space-y-4 text-xs">
          {/* 第一层：搜索框、下拉框、重置筛选 */}
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
                ...videoCategories.map(item => ({ label: item, value: item }))
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

          {/* 第二层：状态筛选 */}
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

          {/* 第三层：其他按钮 */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant="light"
                className="h-8 text-[0.6875rem]"
                isDisabled={!hasSelection}
                onPress={handleBatchPublish}
              >
                批量上架
              </Button>
              <Button
                size="sm"
                variant="light"
                color="warning"
                className="h-8 text-[0.6875rem]"
                isDisabled={!hasSelection}
                startContent={<FiSlash className="text-xs" />}
                onPress={handleBatchOffline}
              >
                批量下架
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[0.6875rem] text-[var(--text-color-secondary)]">
            <span>可根据业务需要扩展更多筛选条件，例如标签、难度、可见范围等。</span>
          </div>
        </div>

        <div className="p-3 space-y-3">
          <div className="overflow-auto border border-[var(--border-color)] rounded-lg">
            <Table
              aria-label="视频列表"
              className="min-w-full text-xs"
              selectionMode="multiple"
              selectedKeys={new Set(selectedIds)}
              onSelectionChange={handleTableSelectionChange}
            >
              <TableHeader className="bg-[var(--bg-elevated)]/80">
                <TableColumn className="px-3 py-2 text-left font-medium">
                  视频封面
                </TableColumn>
                <TableColumn className="px-3 py-2 text-left font-medium">
                  标题
                </TableColumn>
                <TableColumn className="px-3 py-2 text-left font-medium">
                  分类
                </TableColumn>
                <TableColumn className="px-3 py-2 text-left font-medium">
                  标签
                </TableColumn>
                <TableColumn className="px-3 py-2 text-left font-medium">
                  状态
                </TableColumn>
                <TableColumn className="px-3 py-2 text-right font-medium">
                  播放量
                </TableColumn>
                <TableColumn className="px-3 py-2 text-right font-medium">
                  点赞
                </TableColumn>
                <TableColumn className="px-3 py-2 text-right font-medium">
                  评论
                </TableColumn>
                <TableColumn className="px-3 py-2 text-left font-medium">
                  时长
                </TableColumn>
                <TableColumn className="px-3 py-2 text-left font-medium">
                  最近更新时间
                </TableColumn>
                <TableColumn className="px-3 py-2 text-left font-medium">
                  操作
                </TableColumn>
              </TableHeader>
              <TableBody
                items={loading ? [] : pageItems}
                emptyContent="暂未找到视频记录，可先在视频上传页面创建新内容。"
                isLoading={loading}
                loadingContent={<Loading height={200} text="获取视频列表数据中..." />}
              >
                {item => (
                  <TableRow key={item.id}>
                    <TableCell className="px-3 py-2 align-top">
                      {item.cover ? (
                        <img
                          src={item.cover}
                          alt={item.title}
                          className="w-12 h-8 object-cover rounded border border-[var(--border-color)]"
                        />
                      ) : (
                        <div className="w-12 h-8 bg-[var(--bg-content)] rounded border border-[var(--border-color)] flex items-center justify-center text-[var(--text-color-secondary)] text-[0.5rem]">
                          无封面
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="px-3 py-2 align-top">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium">{item.title}</span>
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            className="h-6 w-6 min-w-0 text-primary"
                            onPress={() => item.videoUrl && handlePreviewVideo(item.videoUrl)}
                            isDisabled={!item.videoUrl}
                          >
                            <FiPlayCircle className="text-base" />
                          </Button>
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
                        <div className="text-[0.6875rem] text-[var(--text-color-secondary)]">
                          视频 ID：{item.id}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-3 py-2 align-top">
                      <Chip
                        size="sm"
                        variant="flat"
                        className="text-[0.625rem]"
                        radius="full"
                      >
                        {item.category}
                      </Chip>
                    </TableCell>
                    <TableCell className="px-3 py-2 align-top">
                      <div className="flex flex-wrap gap-1 max-w-[150px]">
                        {item.tags?.length ? (
                          item.tags.map((tag, idx) => (
                            <Chip
                              key={idx}
                              size="sm"
                              variant="flat"
                              className="text-[0.625rem] bg-[var(--bg-content)]"
                              radius="full"
                            >
                              {tag}
                            </Chip>
                          ))
                        ) : (
                          <span className="text-[var(--text-color-secondary)] text-[0.625rem]">-</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-3 py-2 align-top">
                      <Chip
                        size="sm"
                        variant="flat"
                        color={getStatusColor(item.status)}
                        className="text-[0.625rem]"
                        radius="full"
                      >
                        {getStatusLabel(item.status)}
                      </Chip>
                    </TableCell>
                    <TableCell className="px-3 py-2 align-top text-right">
                      {item.plays.toLocaleString()}
                    </TableCell>
                    <TableCell className="px-3 py-2 align-top text-right">
                      {item.likes.toLocaleString()}
                    </TableCell>
                    <TableCell className="px-3 py-2 align-top text-right">
                      {item.comments.toLocaleString()}
                    </TableCell>
                    <TableCell className="px-3 py-2 align-top">
                      {item.duration}
                    </TableCell>
                    <TableCell className="px-3 py-2 align-top">
                      {item.updatedAt}
                    </TableCell>
                    <TableCell className="px-3 py-2 align-top">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Button
                          size="sm"
                          variant="light"
                          className="h-7 text-[0.625rem]"
                          startContent={<FiEdit2 className="text-[0.6875rem]" />}
                          onPress={() => handleEditClick(item)}
                        >
                          编辑
                        </Button>
                        <Button
                          size="sm"
                          variant="light"
                          className="h-7 text-[0.625rem]"
                          startContent={<FiEye className="text-[0.6875rem]" />}
                          onPress={() => handleOpenSidebar(item.id)}
                        >
                          数据详情
                        </Button>
                        <Button
                          size="sm"
                          variant="light"
                          className="h-7 text-[0.625rem]"
                          startContent={<FiBarChart2 className="text-[0.6875rem]" />}
                          onPress={() => handleOpenSidebar(item.id)}
                        >
                          趋势分析
                        </Button>
                        <Button
                          size="sm"
                          variant="light"
                          className="h-7 text-[0.625rem]"
                          onPress={() => handleTogglePinned(item.id)}
                        >
                          {item.pinned ? "取消置顶" : "设为置顶"}
                        </Button>
                        <Button
                          size="sm"
                          variant="light"
                          className="h-7 text-[0.625rem]"
                          onPress={() => handleToggleRecommended(item.id)}
                        >
                          {item.recommended ? "取消推荐" : "设为推荐"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-3 flex flex-col gap-2 text-[0.6875rem] md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <span>
                共 {total} 个视频，当前第 {currentPage} / {totalPages} 页
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

      {/* 视频预览弹窗 */}
      <Modal 
        isOpen={isPreviewOpen} 
        onClose={onPreviewClose}
        size="3xl"
        backdrop="blur"
        classNames={{
          base: "bg-[var(--bg-elevated)] border border-[var(--border-color)]",
          header: "border-b border-[var(--border-color)]",
        }}
      >
        <ModalContent>
          <ModalHeader className="text-sm font-medium">视频预览</ModalHeader>
          <ModalBody className="p-0 bg-black aspect-video flex items-center justify-center">
            {previewVideoUrl ? (
              <ReactPlayer
                {...({
                  url: previewVideoUrl,
                  controls: true,
                  width: "100%",
                  height: "100%",
                  playing: true
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                } as any)}
              />
            ) : (
              <div className="text-white text-xs">视频加载失败</div>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* 编辑视频弹窗 */}
      <Modal 
        isOpen={isEditOpen} 
        onClose={onEditClose}
        size="5xl"
        scrollBehavior="inside"
        classNames={{
          base: "bg-[var(--bg-elevated)] border border-[var(--border-color)]",
          header: "border-b border-[var(--border-color)]",
          footer: "border-t border-[var(--border-color)]",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                编辑视频
                <span className="text-xs font-normal text-[var(--text-color-secondary)]">
                  编辑视频基础信息与状态设置
                </span>
              </ModalHeader>
              <ModalBody className="flex flex-col md:flex-row gap-6 py-6">
                {editingVideo && (
                  <>
                    {/* 左侧：表单信息 */}
                    <div className="flex-1 space-y-4">
                        <Input
                          label="视频标题"
                          placeholder="请输入视频标题"
                          value={editingVideo.title}
                          onValueChange={(val) => setEditingVideo({ ...editingVideo, title: val })}
                          variant="bordered"
                          classNames={{ inputWrapper: "bg-[var(--bg-content)]" }}
                        />
                        
                        <div className="grid grid-cols-2 gap-4">
                          <Input
                            label="分类"
                            placeholder="视频分类"
                            value={editingVideo.category}
                            onValueChange={(val) => setEditingVideo({ ...editingVideo, category: val })}
                            variant="bordered"
                            classNames={{ inputWrapper: "bg-[var(--bg-content)]" }}
                          />
                          <Input
                            label="时长"
                            placeholder="00:00"
                            value={editingVideo.duration}
                            onValueChange={(val) => setEditingVideo({ ...editingVideo, duration: val })}
                            variant="bordered"
                            classNames={{ inputWrapper: "bg-[var(--bg-content)]" }}
                          />
                        </div>

                        <Textarea
                          label="视频描述"
                          placeholder="请输入视频详细描述"
                          value={editingVideo.description}
                          onValueChange={(val) => setEditingVideo({ ...editingVideo, description: val })}
                          variant="bordered"
                          classNames={{ inputWrapper: "bg-[var(--bg-content)]" }}
                        />

                        <Input
                          label="标签"
                          placeholder="使用逗号分隔多个标签"
                          value={editingVideo.tags}
                          onValueChange={(val) => setEditingVideo({ ...editingVideo, tags: val })}
                          variant="bordered"
                          description="示例：React, 教程, 前端"
                          classNames={{ inputWrapper: "bg-[var(--bg-content)]" }}
                        />

                        <div className="flex flex-col gap-2 p-3 rounded-medium border border-[var(--border-color)] bg-[var(--bg-content)]">
                            <span className="text-sm text-[var(--text-color-secondary)]">状态设置</span>
                            <div className="flex flex-wrap items-center gap-6">
                                <Select
                                    aria-label="发布状态"
                                    selectedKeys={[editingVideo.status]}
                                    onChange={(e) => setEditingVideo({ ...editingVideo, status: e.target.value as VideoStatus })}
                                    variant="bordered"
                                    disallowEmptySelection
                                    size="sm"
                                    className="w-32"
                                    classNames={{ trigger: "bg-[var(--bg-elevated)]" }}
                                >
                                    <SelectItem key="draft">草稿</SelectItem>
                                    <SelectItem key="published">已发布</SelectItem>
                                    <SelectItem key="offline">已下架</SelectItem>
                                </Select>

                                <Switch 
                                    size="sm"
                                    isSelected={editingVideo.pinned}
                                    onValueChange={(val) => setEditingVideo({ ...editingVideo, pinned: val })}
                                >
                                    置顶
                                </Switch>

                                <Switch 
                                    size="sm"
                                    isSelected={editingVideo.recommended}
                                    onValueChange={(val) => setEditingVideo({ ...editingVideo, recommended: val })}
                                >
                                    推荐
                                </Switch>
                            </div>
                        </div>
                    </div>

                    {/* 右侧：预览与截图 */}
                    <div className="w-full md:w-[320px] flex flex-col gap-4">
                      {/* 上层：封面预览 */}
                      <div className="space-y-2">
                        <span className="text-xs text-[var(--text-color-secondary)]">封面预览</span>
                        <div className="aspect-video rounded-lg overflow-hidden border border-[var(--border-color)] bg-black/5 relative group">
                            {editingVideo.cover ? (
                                <img 
                                    src={editingVideo.cover} 
                                    alt="Cover Preview" 
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-[var(--text-color-secondary)]">
                                    暂无封面
                                </div>
                            )}
                        </div>
                      </div>

                      {/* 下层：视频预览与截图 */}
                      <div className="space-y-2">
                         <span className="text-xs text-[var(--text-color-secondary)]">视频源与截图</span>
                         <div className="aspect-video rounded-lg overflow-hidden bg-black border border-[var(--border-color)]">
                            <video 
                                ref={videoRef}
                                src={editingVideo.videoUrl}
                                className="w-full h-full"
                                controls
                                crossOrigin="anonymous"
                            />
                         </div>
                         <Button 
                            size="sm" 
                            variant="flat" 
                            startContent={<FiCamera />}
                            onPress={handleCaptureFrame}
                            className="w-full"
                         >
                            截取当前帧为封面
                         </Button>
                      </div>

                      {/* 下层：相关视频 */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-[var(--text-color-secondary)]">相关视频</span>
                            <Button
                                size="sm"
                                variant="light"
                                isIconOnly
                                className="h-6 w-6 text-[var(--text-color-secondary)]"
                                onPress={handleAddRelatedVideo}
                            >
                                <FiPlus />
                            </Button>
                        </div>
                        <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                            {editingVideo.relatedVideos && editingVideo.relatedVideos.length > 0 ? (
                                editingVideo.relatedVideos.map((video) => (
                                    <div key={video.id} className="flex items-center gap-2 p-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-content)]">
                                        <div className="w-12 h-8 rounded overflow-hidden bg-black/5 flex-shrink-0 relative">
                                            {video.cover ? (
                                                <img src={video.cover} alt={video.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-[8px] text-[var(--text-color-secondary)] bg-[var(--bg-elevated)]">
                                                    无封面
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs truncate" title={video.title}>{video.title}</div>
                                            <div className="text-[10px] text-[var(--text-color-secondary)]">{video.id}</div>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="light"
                                            isIconOnly
                                            color="danger"
                                            className="h-6 w-6"
                                            onPress={() => handleRemoveRelatedVideo(video.id)}
                                        >
                                            <FiTrash2 className="text-xs" />
                                        </Button>
                                    </div>
                                ))
                            ) : (
                                <div className="text-xs text-[var(--text-color-secondary)] text-center py-4 border border-dashed border-[var(--border-color)] rounded-lg">
                                    暂无相关视频
                                </div>
                            )}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={onClose}>
                  取消
                </Button>
                <Button color="primary" onPress={handleUpdateVideo}>
                  保存修改
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {sidebarVisible && activeVideo && (
        <div className="fixed inset-0 z-40 flex items-end md:items-stretch justify-end bg-black/40">
          <div className="w-full md:max-w-md h-[70vh] md:h-full bg-[var(--bg-elevated)] border-l border-[var(--border-color)] shadow-xl flex flex-col">
            <div className="px-4 py-3 border-b border-[var(--border-color)] flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-sm font-medium flex items-center gap-2">
                  <FiBarChart2 className="text-[0.9375rem]" />
                  <span>视频数据详情</span>
                </div>
                <div className="text-[0.6875rem] text-[var(--text-color-secondary)]">
                  用于展示播放趋势与核心转化指标，后续可与埋点系统数据对接。
                </div>
              </div>
              <Button
                isIconOnly
                size="sm"
                variant="light"
                className="h-8 w-8 text-[var(--text-color-secondary)]"
                onPress={handleCloseSidebar}
              >
                <FiX className="text-sm" />
              </Button>
            </div>

            <div className="flex-1 overflow-auto p-4 space-y-4 text-xs">
              <Card className="border border-[var(--border-color)] bg-[var(--bg-elevated)]/95">
                <div className="p-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="text-sm font-medium">{activeVideo.title}</div>
                      <div className="text-[0.6875rem] text-[var(--text-color-secondary)]">
                        视频 ID：{activeVideo.id}
                      </div>
                    </div>
                    <Chip
                      size="sm"
                      variant="flat"
                      color={getStatusColor(activeVideo.status)}
                      className="text-[0.625rem]"
                      radius="full"
                    >
                      {getStatusLabel(activeVideo.status)}
                    </Chip>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[0.6875rem]">
                    <div className="space-y-0.5">
                      <div className="text-[var(--text-color-secondary)]">播放量</div>
                      <div className="text-base font-semibold">
                        {activeVideo.plays.toLocaleString()}
                      </div>
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-[var(--text-color-secondary)]">完播率占位</div>
                      <div className="text-base font-semibold">78%</div>
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-[var(--text-color-secondary)]">点赞</div>
                      <div className="text-base font-semibold">
                        {activeVideo.likes.toLocaleString()}
                      </div>
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-[var(--text-color-secondary)]">评论</div>
                      <div className="text-base font-semibold">
                        {activeVideo.comments.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="border border-[var(--border-color)] bg-[var(--bg-elevated)]/95">
                <div className="p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium flex items-center gap-2">
                      <FiBarChart2 className="text-sm" />
                      <span>最近 7 日播放趋势</span>
                    </div>
                    <Chip size="sm" variant="flat" className="text-[0.625rem]" radius="full">
                      示例数据
                    </Chip>
                  </div>
                  <div className="h-48">
                    <Column {...chartConfig} />
                  </div>
                </div>
              </Card>

              <Card className="border border-[var(--border-color)] bg-[var(--bg-elevated)]/95">
                <div className="p-3 space-y-2">
                  <div className="text-sm font-medium">运营建议占位</div>
                  <ul className="list-disc list-inside space-y-1 text-[0.6875rem] text-[var(--text-color-secondary)]">
                    <li>结合文档详情页与评论区分析用户反馈，优化内容结构与节奏。</li>
                    <li>可以在播放量高峰前后搭配推送相关文档或工具，提升整体转化。</li>
                    <li>与审核模块联动，对被频繁举报的视频加强 AI 预审核规则。</li>
                  </ul>
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VideoListPage;
