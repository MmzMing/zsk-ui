import React, { useMemo, useState } from "react";
import {
  Autocomplete,
  AutocompleteItem,
  Button,
  Card,
  Chip,
  Input,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tabs,
  Tab
} from "@heroui/react";
import { Column } from "@ant-design/plots";
import {
  FiBarChart2,
  FiEdit2,
  FiEye,
  FiFilm,
  FiSearch,
  FiSlash,
  FiUpload
} from "react-icons/fi";
import { useAppStore } from "../../../store";

type VideoStatus = "draft" | "published" | "offline";

type VideoItem = {
  id: string;
  title: string;
  category: string;
  status: VideoStatus;
  duration: string;
  plays: number;
  likes: number;
  comments: number;
  createdAt: string;
  updatedAt: string;
  pinned?: boolean;
  recommended?: boolean;
};

type StatusFilter = "all" | VideoStatus;

const videoCategories = ["前端基础", "工程实践", "效率方法", "个人成长"];

const initialVideos: VideoItem[] = [
  {
    id: "v_001",
    title: "从 0 搭建个人知识库前端",
    category: "工程实践",
    status: "published",
    duration: "18:24",
    plays: 3289,
    likes: 421,
    comments: 63,
    createdAt: "2026-01-10 09:20:11",
    updatedAt: "2026-01-12 14:32:45",
    pinned: true,
    recommended: true
  },
  {
    id: "v_002",
    title: "如何把零散笔记整理成知识库",
    category: "效率方法",
    status: "published",
    duration: "23:10",
    plays: 2410,
    likes: 356,
    comments: 48,
    createdAt: "2026-01-11 10:05:00",
    updatedAt: "2026-01-13 10:18:22",
    recommended: true
  },
  {
    id: "v_003",
    title: "React 19 下的前端工程化实践",
    category: "前端基础",
    status: "draft",
    duration: "31:42",
    plays: 0,
    likes: 0,
    comments: 0,
    createdAt: "2026-01-12 16:08:33",
    updatedAt: "2026-01-12 16:08:33"
  },
  {
    id: "v_004",
    title: "用知识库管理你的职业成长",
    category: "个人成长",
    status: "offline",
    duration: "19:56",
    plays: 980,
    likes: 112,
    comments: 15,
    createdAt: "2026-01-08 11:22:11",
    updatedAt: "2026-01-15 09:02:47"
  }
];

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

function VideoListPage() {
  const [videos, setVideos] = useState<VideoItem[]>(() => initialVideos);
  const [keyword, setKeyword] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [sidebarVisible, setSidebarVisible] = useState(false);

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
      previous.map(item =>
        item.id === id
          ? {
              ...item,
              pinned: !item.pinned
            }
          : item
      )
    );
  };

  const handleToggleRecommended = (id: string) => {
    setVideos(previous =>
      previous.map(item =>
        item.id === id
          ? {
              ...item,
              recommended: !item.recommended
            }
          : item
      )
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
    setSelectedIds([]);
  };

  const handleOpenSidebar = (id: string) => {
    setActiveVideoId(id);
    setSidebarVisible(true);
  };

  const handleCloseSidebar = () => {
    setSidebarVisible(false);
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
        <div className="p-3 space-y-3 text-xs border-b border-[var(--border-color)]">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                className="h-8 text-[0.6875rem]"
                startContent={<FiUpload className="text-xs" />}
              >
                新建视频占位
              </Button>
              <Button
                size="sm"
                variant="light"
                className="h-8 text-[0.6875rem]"
                startContent={<FiFilm className="text-xs" />}
              >
                导入外部视频占位
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[0.6875rem] text-[var(--text-color-secondary)]">
              <span>当前操作仅更新前端示例数据，后续与内容服务接口联动。</span>
            </div>
          </div>
        </div>

        <div className="p-3 space-y-3 text-xs">
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
                }}
                startContent={
                  <FiSearch className="text-xs text-[var(--text-color-secondary)]" />
                }
                classNames={{
                  inputWrapper: "h-8 text-xs",
                  input: "text-xs"
                }}
              />
              <Autocomplete
                aria-label="视频分类筛选"
                size="sm"
                variant="bordered"
                className="w-40"
                selectedKey={categoryFilter}
                onSelectionChange={key => {
                  if (key === null) {
                    return;
                  }
                  setCategoryFilter(String(key));
                  setPage(1);
                }}
                defaultItems={[
                  { label: "全部分类", value: "all" },
                  ...videoCategories.map(item => ({ label: item, value: item }))
                ]}
              >
                {item => (
                  <AutocompleteItem key={item.value}>
                    {item.label}
                  </AutocompleteItem>
                )}
              </Autocomplete>
              <Tabs
                aria-label="视频状态筛选"
                size="sm"
                radius="full"
                variant="bordered"
                selectedKey={statusFilter}
                onSelectionChange={key => {
                  const value = key as StatusFilter;
                  setStatusFilter(value);
                  setPage(1);
                }}
                classNames={{
                  tabList: "p-0 h-8 border-[var(--border-color)] gap-0",
                  cursor: "bg-[var(--primary-color)]",
                  tab: "h-8 px-3 text-[0.625rem] data-[selected=true]:text-white"
                }}
              >
                <Tab key="all" title="全部状态" />
                <Tab key="draft" title="草稿" />
                <Tab key="published" title="已发布" />
                <Tab key="offline" title="已下架" />
              </Tabs>
              <Button
                size="sm"
                variant="light"
                className="h-8 text-[0.6875rem]"
                onPress={handleResetFilter}
              >
                重置筛选
              </Button>
            </div>
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
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-xs font-medium">系列置顶 / 推荐位</div>
              <div className="text-[0.6875rem] text-[var(--text-color-secondary)]">
                顶部预留 3 个推荐位，便于在前台突出重要视频。
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {[0, 1, 2].map(index => {
                const item = pinnedVideos[index] ?? recommendedVideos[index] ?? null;
                if (!item) {
                  return (
                    <Card
                      key={index}
                      className="border border-dashed border-[var(--border-color)] bg-[var(--bg-elevated)]/60"
                    >
                      <div className="p-3 flex items-center justify-center text-[0.6875rem] text-[var(--text-color-secondary)]">
                        空推荐位，可在列表中设置视频为置顶或推荐后填充。
                      </div>
                    </Card>
                  );
                }
                return (
                  <Card
                    key={item.id}
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
                  标题
                </TableColumn>
                <TableColumn className="px-3 py-2 text-left font-medium">
                  分类
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
                items={pageItems}
                emptyContent="暂未找到视频记录，可先在视频上传页面创建新内容。"
              >
                {item => (
                  <TableRow key={item.id}>
                    <TableCell className="px-3 py-2 align-top">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium">{item.title}</span>
                          {item.pinned && (
                            <Chip
                              size="sm"
                              variant="flat"
                              color="danger"
                              className="text-[0.625rem]"
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
                      >
                        {item.category}
                      </Chip>
                    </TableCell>
                    <TableCell className="px-3 py-2 align-top">
                      <Chip
                        size="sm"
                        variant="flat"
                        color={getStatusColor(item.status)}
                        className="text-[0.625rem]"
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
                        >
                          编辑占位
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
                size="sm"
                variant="light"
                className="h-8 text-[0.6875rem]"
                onPress={handleCloseSidebar}
              >
                关闭
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
                    <Chip size="sm" variant="flat" className="text-[0.625rem]">
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
