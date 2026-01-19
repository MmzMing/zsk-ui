import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Autocomplete,
  AutocompleteItem,
  Button,
  Card,
  Chip,
  Input,
  Pagination,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow
} from "@heroui/react";
import { Column } from "@ant-design/plots";
import {
  FiBarChart2,
  FiEdit2,
  FiEye,
  FiFilter,
  FiSearch,
  FiSlash,
  FiGrid,
  FiList,
  FiTrash2,
  FiMove,
  FiCheckSquare,
  FiPlus
} from "react-icons/fi";

import {
  fetchDocumentList,
  batchUpdateDocumentStatus,
  deleteDocument,
  moveDocumentCategory
} from "../../../api/admin/document";
import { useAppStore } from "../../../store";

type DocumentStatus = "draft" | "pending" | "approved" | "rejected" | "offline" | "scheduled" | "published";

type DocumentItem = {
  id: string;
  title: string;
  category: string;
  status: DocumentStatus;
  reads: number;
  likes: number;
  comments: number;
  createdAt: string;
  updatedAt: string;
  pinned?: boolean;
  recommended?: boolean;
};

type StatusFilter = "all" | DocumentStatus;

const documentCategories = ["前端基础", "工程实践", "效率方法", "个人成长", "系统设计"];

const initialDocuments: DocumentItem[] = [
  {
    id: "d_001",
    title: "如何把视频课程拆解成学习笔记",
    category: "效率方法",
    status: "approved",
    reads: 4210,
    likes: 532,
    comments: 84,
    createdAt: "2026-01-10 09:20:11",
    updatedAt: "2026-01-12 14:32:45",
    pinned: true,
    recommended: true
  },
  {
    id: "d_002",
    title: "从 0 搭建个人知识库前端",
    category: "工程实践",
    status: "approved",
    reads: 3289,
    likes: 421,
    comments: 63,
    createdAt: "2026-01-11 10:05:00",
    updatedAt: "2026-01-13 10:18:22",
    recommended: true
  },
  {
    id: "d_003",
    title: "知识库信息架构最佳实践",
    category: "系统设计",
    status: "pending",
    reads: 0,
    likes: 0,
    comments: 0,
    createdAt: "2026-01-12 16:08:33",
    updatedAt: "2026-01-12 16:08:33"
  },
  {
    id: "d_004",
    title: "Markdown 使用规范整理",
    category: "前端基础",
    status: "draft",
    reads: 0,
    likes: 0,
    comments: 0,
    createdAt: "2026-01-08 11:22:11",
    updatedAt: "2026-01-15 09:02:47"
  },
  {
    id: "d_005",
    title: "用知识库管理你的职业成长",
    category: "个人成长",
    status: "offline",
    reads: 980,
    likes: 112,
    comments: 15,
    createdAt: "2026-01-09 11:22:11",
    updatedAt: "2026-01-15 09:02:47"
  }
];

const chartData = [
  { date: "01-12", reads: 120 },
  { date: "01-13", reads: 268 },
  { date: "01-14", reads: 356 },
  { date: "01-15", reads: 412 },
  { date: "01-16", reads: 298 },
  { date: "01-17", reads: 520 },
  { date: "01-18", reads: 489 }
];

function getStatusLabel(status: DocumentStatus) {
  if (status === "draft") {
    return "草稿";
  }
  if (status === "pending") {
    return "待审核";
  }
  if (status === "approved") {
    return "已通过";
  }
  if (status === "rejected") {
    return "已驳回";
  }
  if (status === "offline") {
    return "已下架";
  }
  return "定时发布";
}

function getStatusColor(status: DocumentStatus) {
  if (status === "draft") {
    return "default";
  }
  if (status === "pending") {
    return "warning";
  }
  if (status === "approved") {
    return "success";
  }
  if (status === "rejected") {
    return "danger";
  }
  if (status === "offline") {
    return "secondary";
  }
  return "primary";
}

function DocumentListPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>(() => initialDocuments);
  const [keyword, setKeyword] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const navigate = useNavigate();

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

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchDocumentList({
          page: 1,
          pageSize: 100,
          status: "all",
          category: undefined,
          keyword: undefined
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const list = data.list.map((item: any) => ({
          ...item,
          reads: item.readCount,
          likes: item.likeCount,
          comments: item.commentCount,
          status: item.status as DocumentStatus
        }));
        setDocuments(list);
      } catch {
        setDocuments(initialDocuments);
      }
    }
    load();
  }, []);

  const filteredDocuments = useMemo(() => {
    const trimmed = keyword.trim().toLowerCase();
    return documents.filter(item => {
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
  }, [documents, keyword, categoryFilter, statusFilter]);

  const total = filteredDocuments.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const pageItems = filteredDocuments.slice(startIndex, endIndex);

  const hasSelection = selectedIds.length > 0;

  const pinnedDocuments = useMemo(
    () => documents.filter(item => item.pinned),
    [documents]
  );

  const recommendedDocuments = useMemo(
    () => documents.filter(item => item.recommended),
    [documents]
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

  const handleBatchDelete = async () => {
    if (!hasSelection) return;
    if (!window.confirm("确认批量删除选中的文档吗？此操作不可恢复。")) return;
    
    await deleteDocument(selectedIds).catch(() => undefined);
    setDocuments(prev => prev.filter(item => !selectedIds.includes(item.id)));
    setSelectedIds([]);
  };

  const handleBatchMove = async () => {
    if (!hasSelection) return;
    const category = window.prompt("请输入目标分类名称：", "前端基础");
    if (!category) return;

    await moveDocumentCategory(selectedIds, category).catch(() => undefined);
    setDocuments(prev => prev.map(item => selectedIds.includes(item.id) ? { ...item, category } : item));
    setSelectedIds([]);
  };

  const handleBatchOffline = async () => {
    if (!hasSelection) {
      return;
    }
    const confirmed = window.confirm("确认批量下架选中的文档吗？");
    if (!confirmed) {
      return;
    }
    await batchUpdateDocumentStatus({
      ids: selectedIds,
      status: "offline"
    }).catch(() => undefined);
    setDocuments(previous =>
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

  const handleBatchPublish = async () => {
    if (!hasSelection) {
      return;
    }
    const confirmed = window.confirm("确认批量上架选中的文档吗？");
    if (!confirmed) {
      return;
    }
    await batchUpdateDocumentStatus({
      ids: selectedIds,
      status: "published"
    }).catch(() => undefined);
    setDocuments(previous =>
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

  const handleTogglePinned = (id: string) => {
    setDocuments(previous =>
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
    setDocuments(previous =>
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

  const handleOpenSidebar = (id: string) => {
    setActiveDocumentId(id);
    setSidebarVisible(true);
  };

  const handleCloseSidebar = () => {
    setSidebarVisible(false);
  };

  const activeDocument = documents.find(item => item.id === activeDocumentId) ?? null;

  const chartConfig = {
    data: chartData,
    xField: "date",
    yField: "reads",
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
          <span>文档管理 · 文档列表</span>
        </div>
        <h1 className="text-lg md:text-xl font-semibold tracking-tight">
          统一管理知识库文档的状态与核心指标
        </h1>
        <p className="text-xs text-[var(--text-color-secondary)] max-w-2xl">
          支持按分类、状态与关键字筛选文档列表，后续可与实际内容中心接口对接，实现上架、下架与数据分析。
        </p>
      </div>

      <Card className="border border-[var(--border-color)] bg-[var(--bg-elevated)]/95">
        <div className="p-3 space-y-3 text-xs border-b border-[var(--border-color)]">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                className="h-8 text-[0.6875rem]"
                startContent={<FiPlus className="text-xs" />}
                onPress={() => navigate("/admin/document/edit/new")}
              >
                新建文档
              </Button>
              <Button
                size="sm"
                variant="light"
                className="h-8 text-[0.6875rem]"
                startContent={<FiFilter className="text-xs" />}
              >
                导入外部文档占位
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
                placeholder="按标题 / ID 搜索文档"
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
                aria-label="文档分类筛选"
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
                  ...documentCategories.map(item => ({ label: item, value: item }))
                ]}
              >
                {item => (
                  <AutocompleteItem key={item.value}>
                    {item.label}
                  </AutocompleteItem>
                )}
              </Autocomplete>
              <Tabs
                aria-label="文档状态筛选"
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
                <Tab key="pending" title="待审核" />
                <Tab key="approved" title="已通过" />
                <Tab key="rejected" title="已驳回" />
                <Tab key="offline" title="已下架" />
                <Tab key="scheduled" title="定时发布" />
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
                startContent={<FiCheckSquare className="text-xs" />}
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
              <Button
                size="sm"
                variant="light"
                className="h-8 text-[0.6875rem]"
                isDisabled={!hasSelection}
                startContent={<FiMove className="text-xs" />}
                onPress={handleBatchMove}
              >
                批量移动
              </Button>
              <Button
                size="sm"
                variant="light"
                color="danger"
                className="h-8 text-[0.6875rem]"
                isDisabled={!hasSelection}
                startContent={<FiTrash2 className="text-xs" />}
                onPress={handleBatchDelete}
              >
                批量删除
              </Button>
            </div>
            <div className="flex items-center gap-1">
                 <Button isIconOnly size="sm" variant={viewMode === "list" ? "solid" : "light"} onPress={() => setViewMode("list")}><FiList /></Button>
                 <Button isIconOnly size="sm" variant={viewMode === "grid" ? "solid" : "light"} onPress={() => setViewMode("grid")}><FiGrid /></Button>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[0.6875rem] text-[var(--text-color-secondary)]">
            <span>可根据业务需要扩展更多筛选条件，例如标签、难度、可见范围等。</span>
          </div>
        </div>

        <div className="p-3 space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-xs font-medium">推荐位与置顶文档</div>
              <div className="text-[0.6875rem] text-[var(--text-color-secondary)]">
                顶部预留 3 个推荐位，便于在前台突出重要文档。
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {[0, 1, 2].map(index => {
                const item = pinnedDocuments[index] ?? recommendedDocuments[index] ?? null;
                if (!item) {
                  return (
                    <Card
                      key={index}
                      className="border border-dashed border-[var(--border-color)] bg-[var(--bg-elevated)]/60"
                    >
                      <div className="p-3 flex items-center justify-center text-[0.6875rem] text-[var(--text-color-secondary)]">
                        空推荐位，可在列表中设置文档为置顶或推荐后填充。
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
                            文档 ID：{item.id}
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
                        <span>阅读量：{item.reads.toLocaleString()}</span>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {viewMode === "list" ? (
          <div className="overflow-auto border border-[var(--border-color)] rounded-lg">
            <Table
              aria-label="文档列表"
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
                  阅读量
                </TableColumn>
                <TableColumn className="px-3 py-2 text-right font-medium">
                  点赞
                </TableColumn>
                <TableColumn className="px-3 py-2 text-right font-medium">
                  评论
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
                emptyContent="暂未找到文档记录，可先在文档上传页面创建新内容。"
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
                          文档 ID：{item.id}
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
                      {item.reads.toLocaleString()}
                    </TableCell>
                    <TableCell className="px-3 py-2 align-top text-right">
                      {item.likes.toLocaleString()}
                    </TableCell>
                    <TableCell className="px-3 py-2 align-top text-right">
                      {item.comments.toLocaleString()}
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
                          onPress={() => navigate(`/admin/document/edit/${item.id}`)}
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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {pageItems.map(item => (
                <Card key={item.id} className="p-4 hover:shadow-md transition-shadow border border-[var(--border-color)]">
                   <div className="flex justify-between items-start mb-3">
                      <Chip size="sm" color={getStatusColor(item.status)} variant="flat" className="text-[0.625rem]">{getStatusLabel(item.status)}</Chip>
                      <div className="flex gap-1">
                         <Button isIconOnly size="sm" variant="light" className="h-6 w-6 min-w-6" onPress={() => navigate(`/admin/document/edit/${item.id}`)}><FiEdit2 className="text-xs" /></Button>
                         <Button isIconOnly size="sm" variant="light" className="h-6 w-6 min-w-6" onPress={() => handleOpenSidebar(item.id)}><FiBarChart2 className="text-xs" /></Button>
                      </div>
                   </div>
                   <div className="mb-2">
                       <h3 className="font-bold text-sm mb-1 line-clamp-1" title={item.title}>{item.title}</h3>
                       <div className="text-[0.6875rem] text-[var(--text-color-secondary)] flex gap-2">
                           <span>{item.category}</span>
                           <span>{item.updatedAt.split(" ")[0]}</span>
                       </div>
                   </div>
                   <div className="flex justify-between items-center text-[0.6875rem] text-[var(--text-color-secondary)] border-t border-[var(--border-color)] pt-2 mt-2">
                      <div className="flex gap-3">
                          <span>阅读 {item.reads}</span>
                          <span>点赞 {item.likes}</span>
                      </div>
                      <div className="flex gap-1">
                          {item.pinned && <span className="text-danger">置顶</span>}
                          {item.recommended && <span className="text-primary">推荐</span>}
                      </div>
                   </div>
                </Card>
              ))}
            </div>
          )}

          <div className="mt-3 flex flex-col gap-2 text-[0.6875rem] md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <span>
                共 {total} 篇文档，当前第 {currentPage} / {totalPages} 页
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

      {sidebarVisible && activeDocument && (
        <div className="fixed inset-0 z-40 flex items-end md:items-stretch justify-end bg-black/40">
          <div className="w-full md:max-w-md h-[70vh] md:h-full bg-[var(--bg-elevated)] border-l border-[var(--border-color)] shadow-xl flex flex-col">
            <div className="px-4 py-3 border-b border-[var(--border-color)] flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-sm font-medium flex items-center gap-2">
                  <FiBarChart2 className="text-[0.9375rem]" />
                  <span>文档数据详情</span>
                </div>
                <div className="text-[0.6875rem] text-[var(--text-color-secondary)]">
                  用于展示阅读趋势与核心转化指标，后续可与埋点系统数据对接。
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
                      <div className="text-sm font-medium">{activeDocument.title}</div>
                      <div className="text-[0.6875rem] text-[var(--text-color-secondary)]">
                        文档 ID：{activeDocument.id}
                      </div>
                    </div>
                    <Chip
                      size="sm"
                      variant="flat"
                      color={getStatusColor(activeDocument.status)}
                      className="text-[0.625rem]"
                    >
                      {getStatusLabel(activeDocument.status)}
                    </Chip>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[0.6875rem]">
                    <div className="space-y-0.5">
                      <div className="text-[var(--text-color-secondary)]">阅读量</div>
                      <div className="text-base font-semibold">
                        {activeDocument.reads.toLocaleString()}
                      </div>
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-[var(--text-color-secondary)]">收藏占位</div>
                      <div className="text-base font-semibold">82%</div>
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-[var(--text-color-secondary)]">点赞</div>
                      <div className="text-base font-semibold">
                        {activeDocument.likes.toLocaleString()}
                      </div>
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-[var(--text-color-secondary)]">评论</div>
                      <div className="text-base font-semibold">
                        {activeDocument.comments.toLocaleString()}
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
                      <span>最近 7 日阅读趋势</span>
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
                    <li>结合文档详情页与评论区分析用户反馈，优化章节结构与示例内容。</li>
                    <li>可以在阅读高峰前后搭配推送相关视频或工具，提升整体转化。</li>
                    <li>与审核模块联动，对被频繁投诉的文档加强规则校验与复核频次。</li>
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

export default DocumentListPage;
