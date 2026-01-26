// ===== 1. 依赖导入区域 =====
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  Chip,
  Pagination,
  SelectItem,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tooltip,
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
  FiFilter,
  FiSlash,
  FiGrid,
  FiList,
  FiTrash2,
  FiMove,
  FiCheckSquare,
  FiPlus,
  FiRotateCcw,
  FiX
} from "react-icons/fi";

import {
  fetchDocumentList,
  batchUpdateDocumentStatus,
  deleteDocument,
  moveDocumentCategory,
  updateDocument,
  type DocumentItem,
  type DocumentStatus
} from "../../../api/admin/document";
import { useAppStore } from "../../../store";
import { handleApiCall } from "../../../api/axios";
import { Loading } from "@/components/Loading";

// ===== 2. TODO待处理导入区域 =====

// ===== 3. 状态控制逻辑区域 =====

/**
 * 状态筛选类型
 */
type StatusFilter = "all" | DocumentStatus;

/**
 * 文档分类选项
 */
const documentCategories = ["前端基础", "工程实践", "效率方法", "个人成长", "系统设计"];

/**
 * 图表示例数据
 */
const chartData = [
  { date: "01-12", reads: 120 },
  { date: "01-13", reads: 268 },
  { date: "01-14", reads: 356 },
  { date: "01-15", reads: 412 },
  { date: "01-16", reads: 298 },
  { date: "01-17", reads: 520 },
  { date: "01-18", reads: 489 }
];

// ===== 4. 通用工具函数区域 =====

/**
 * 获取状态文本
 * @param status 文档状态
 * @returns 状态文本
 */
const getStatusLabel = (status: DocumentStatus): string => {
  const statusMap: Record<DocumentStatus, string> = {
    draft: "草稿",
    pending: "待审核",
    approved: "已通过",
    rejected: "已驳回",
    offline: "已下架",
    scheduled: "定时发布",
    published: "已发布"
  };
  return statusMap[status] || status;
};

/**
 * 获取状态颜色
 * @param status 文档状态
 * @returns 颜色标识
 */
const getStatusColor = (status: DocumentStatus): "default" | "warning" | "success" | "danger" | "secondary" | "primary" => {
  const colorMap: Record<DocumentStatus, "default" | "warning" | "success" | "danger" | "secondary" | "primary"> = {
    draft: "default",
    pending: "warning",
    approved: "success",
    rejected: "danger",
    offline: "secondary",
    scheduled: "primary",
    published: "primary"
  };
  return colorMap[status] || "default";
};

// ===== 5. 注释代码函数区 =====

// ===== 6. 错误处理函数区域 =====

// ===== 7. 数据处理函数区域 =====

// ===== 8. UI渲染逻辑区域 =====

/**
 * 文档列表页面组件
 */
function DocumentListPage() {
  // --- 状态定义 ---
  /** 文档列表数据 */
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  /** 加载状态 */
  const [loading, setLoading] = useState<boolean>(false);
  /** 搜索关键词 */
  const [keyword, setKeyword] = useState<string>("");
  /** 分类筛选 */
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  /** 状态筛选 */
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  /** 当前页码 */
  const [page, setPage] = useState<number>(1);
  /** 已选中文档 ID 列表 */
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  /** 当前选中的文档 ID (用于侧边栏) */
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);
  /** 侧边栏可见性 */
  const [sidebarVisible, setSidebarVisible] = useState<boolean>(false);
  /** 视图模式 (列表/网格) */
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const navigate = useNavigate();
  const { themeMode } = useAppStore();

  /** 每页显示条数 */
  const pageSize = 8;

  // --- 计算属性 ---

  /** 图表主题 */
  const chartTheme = useMemo(() => {
    if (themeMode === "dark") return "classicDark";
    if (themeMode === "light") return "classic";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "classicDark" : "classic";
  }, [themeMode]);

  /** 过滤后的文档列表 */
  const filteredDocuments = useMemo(() => {
    const trimmed = keyword.trim().toLowerCase();
    return documents.filter(item => {
      if (categoryFilter !== "all" && item.category !== categoryFilter) return false;
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      if (trimmed) {
        const content = `${item.title} ${item.category} ${item.id}`.toLowerCase();
        if (!content.includes(trimmed)) return false;
      }
      return true;
    });
  }, [documents, keyword, categoryFilter, statusFilter]);

  /** 总记录数 */
  const total = filteredDocuments.length;
  /** 总页数 */
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  /** 当前页码 (校准后) */
  const currentPage = Math.min(page, totalPages);
  /** 分页后的列表 */
  const pageItems = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredDocuments.slice(startIndex, startIndex + pageSize);
  }, [filteredDocuments, currentPage]);

  /** 是否有选中项 */
  const hasSelection = selectedIds.length > 0;

  /** 置顶文档 */
  const pinnedDocuments = useMemo(() => documents.filter(item => item.pinned), [documents]);
  /** 推荐文档 */
  const recommendedDocuments = useMemo(() => documents.filter(item => item.recommended), [documents]);

  /** 当前活动的文档详情 */
  const activeDocument = useMemo(() => documents.find(item => item.id === activeDocumentId) ?? null, [documents, activeDocumentId]);

  // --- 事件处理 ---

  /**
   * 加载文档列表
   */
  const loadDocumentList = useCallback(async () => {
    setLoading(true);
    const res = await handleApiCall({
      requestFn: () => fetchDocumentList({
        page: 1,
        pageSize: 100,
        status: "all",
        category: undefined,
        keyword: undefined
      })
    });
    if (res && res.data) {
      setDocuments(res.data.list);
    }
    setLoading(false);
  }, []);

  /**
   * 分页切换
   */
  const handlePageChange = (next: number) => {
    if (next < 1 || next > totalPages) return;
    setPage(next);
    setSelectedIds([]);
  };

  /**
   * 重置筛选
   */
  const handleResetFilter = () => {
    setKeyword("");
    setCategoryFilter("all");
    setStatusFilter("all");
    setPage(1);
  };

  /**
   * 表格选中项变更
   */
  const handleTableSelectionChange = (keys: "all" | Set<React.Key>) => {
    if (keys === "all") {
      setSelectedIds(pageItems.map(item => item.id));
      return;
    }
    setSelectedIds(Array.from(keys).map(String));
  };

  /**
   * 批量删除
   */
  const handleBatchDelete = async () => {
    if (!hasSelection) return;
    const confirmed = window.confirm(`确定要删除选中的 ${selectedIds.length} 个文档吗？此操作不可恢复。`);
    if (!confirmed) return;

    const res = await handleApiCall({
      requestFn: () => deleteDocument(selectedIds)
    });

    if (res && res.code === 200) {
      addToast({
        title: "批量删除成功",
        description: `已成功删除 ${selectedIds.length} 个文档。`,
        color: "success"
      });
      loadDocumentList();
      setSelectedIds([]);
    }
  };

  /**
   * 批量移动分类
   */
  const handleBatchMove = async () => {
    if (!hasSelection) return;
    const category = window.prompt("请输入目标分类名称：", "前端基础");
    if (!category) return;

    const res = await handleApiCall({
      requestFn: () => moveDocumentCategory(selectedIds, category)
    });

    if (res && res.code === 200) {
      addToast({
        title: "批量移动成功",
        description: `已成功移动 ${selectedIds.length} 个文档至「${category}」。`,
        color: "success"
      });
      loadDocumentList();
      setSelectedIds([]);
    }
  };

  /**
   * 批量操作状态
   */
  const handleBatchStatusUpdate = async (status: "published" | "offline") => {
    if (!hasSelection) return;
    const actionName = status === "published" ? "上架" : "下架";
    const confirmed = window.confirm(`确认批量${actionName}选中的 ${selectedIds.length} 个文档吗？`);
    if (!confirmed) return;

    const res = await handleApiCall({
      requestFn: () => batchUpdateDocumentStatus({ ids: selectedIds, status })
    });

    if (res && res.code === 200) {
      addToast({
        title: `批量${actionName}成功`,
        description: `已成功${actionName} ${selectedIds.length} 个文档。`,
        color: "success"
      });
      loadDocumentList();
      setSelectedIds([]);
    }
  };

  /**
   * 切换置顶状态
   */
  const handleTogglePinned = async (id: string, currentPinned: boolean) => {
    const nextPinned = !currentPinned;
    const res = await handleApiCall({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      requestFn: () => updateDocument(id, { pinned: nextPinned } as any)
    });

    if (res && res.code === 200) {
      addToast({
        title: nextPinned ? "已设为置顶" : "已取消置顶",
        description: `操作成功。`,
        color: "success"
      });
      loadDocumentList();
    }
  };

  /**
   * 切换推荐状态
   */
  const handleToggleRecommended = async (id: string, currentRecommended: boolean) => {
    const nextRecommended = !currentRecommended;
    const res = await handleApiCall({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      requestFn: () => updateDocument(id, { recommended: nextRecommended } as any)
    });

    if (res && res.code === 200) {
      addToast({
        title: nextRecommended ? "已设为推荐" : "已取消推荐",
        description: `操作成功。`,
        color: "success"
      });
      loadDocumentList();
    }
  };

  /**
   * 打开侧边栏
   */
  const handleOpenSidebar = (id: string) => {
    setActiveDocumentId(id);
    setSidebarVisible(true);
  };

  /**
   * 关闭侧边栏
   */
  const handleCloseSidebar = () => {
    setSidebarVisible(false);
  };

  /**
   * 图表配置
   */
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

  // --- 生命周期 ---
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadDocumentList();
  }, [loadDocumentList]);

  return (
    <div className="space-y-4">
      {/* 头部区域 */}
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

      {/* 推荐位区域 */}
      <Card className="border border-[var(--border-color)] bg-[var(--bg-elevated)]/95">
        <div className="p-3 border-b border-[var(--border-color)]">
          <div className="flex items-center justify-between">
            <div className="text-xs font-medium">推荐位与置顶文档</div>
            <div className="text-[0.6875rem] text-[var(--text-color-secondary)]">
              顶部预留 3 个推荐位，便于在前台突出重要文档。
            </div>
          </div>
        </div>
        <div className="p-3">
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
                      <span>阅读量：{item.readCount.toLocaleString()}</span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </Card>

      {/* 列表/操作区域 */}
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

        <div className="p-3 space-y-4 text-xs">
          {/* 筛选区域第一层：搜索与分类 */}
          <div className="flex flex-wrap items-center gap-3">
            <AdminSearchInput
              className="w-64"
              placeholder="按标题 / ID 搜索文档"
              value={keyword}
              onValueChange={value => {
                setKeyword(value);
                setPage(1);
              }}
            />
            <AdminSelect
              aria-label="文档分类筛选"
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
                ...documentCategories.map(item => ({ label: item, value: item }))
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

          {/* 筛选区域第二层：状态筛选 */}
          <div className="flex flex-wrap items-center gap-3">
            <AdminTabs
              aria-label="文档状态筛选"
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
              <Tab key="pending" title="待审核" />
              <Tab key="approved" title="已通过" />
              <Tab key="rejected" title="已驳回" />
              <Tab key="offline" title="已下架" />
              <Tab key="scheduled" title="定时发布" />
            </AdminTabs>
          </div>

          {/* 操作区域：批量操作与视图切换 */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant="light"
                className="h-8 text-[0.6875rem]"
                isDisabled={!hasSelection}
                startContent={<FiCheckSquare className="text-xs" />}
                onPress={() => handleBatchStatusUpdate("published")}
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
                onPress={() => handleBatchStatusUpdate("offline")}
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
              <Button 
                isIconOnly 
                size="sm" 
                variant={viewMode === "list" ? "solid" : "light"} 
                onPress={() => setViewMode("list")}
              >
                <FiList />
              </Button>
              <Button 
                isIconOnly 
                size="sm" 
                variant={viewMode === "grid" ? "solid" : "light"} 
                onPress={() => setViewMode("grid")}
              >
                <FiGrid />
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[0.6875rem] text-[var(--text-color-secondary)]">
            <span>可根据业务需要扩展更多筛选条件，例如标签、难度、可见范围等。</span>
          </div>
        </div>

        {/* 内容展示区域 */}
        <div className="p-3 space-y-3">
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
                  <TableColumn className="px-3 py-2 text-left font-medium">封面</TableColumn>
                  <TableColumn className="px-3 py-2 text-left font-medium">标题</TableColumn>
                  <TableColumn className="px-3 py-2 text-left font-medium">分类</TableColumn>
                  <TableColumn className="px-3 py-2 text-left font-medium">标签</TableColumn>
                  <TableColumn className="px-3 py-2 text-left font-medium">状态</TableColumn>
                  <TableColumn className="px-3 py-2 text-right font-medium">阅读量</TableColumn>
                  <TableColumn className="px-3 py-2 text-right font-medium">点赞</TableColumn>
                  <TableColumn className="px-3 py-2 text-right font-medium">评论</TableColumn>
                  <TableColumn className="px-3 py-2 text-left font-medium">最近更新时间</TableColumn>
                  <TableColumn className="px-3 py-2 text-left font-medium">操作</TableColumn>
                </TableHeader>
                <TableBody
                  items={loading ? [] : pageItems}
                  emptyContent="暂未找到文档记录，可先在文档上传页面创建新内容。"
                  isLoading={loading}
                  loadingContent={<Loading height={200} text="获取文档列表数据中..." />}
                >
                  {item => (
                    <TableRow key={item.id}>
                      <TableCell className="px-3 py-2 align-top">
                        {item.cover ? (
                          <img
                            src={item.cover}
                            alt={item.title}
                            className="w-10 h-10 object-cover rounded border border-[var(--border-color)]"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-[var(--bg-content)] rounded border border-[var(--border-color)] flex items-center justify-center text-[var(--text-color-secondary)] text-[0.5rem]">
                            无封面
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="px-3 py-2 align-top">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium">{item.title}</span>
                            {item.pinned && (
                              <Chip size="sm" variant="flat" color="danger" className="text-[0.625rem]" radius="full">
                                置顶
                              </Chip>
                            )}
                            {item.recommended && (
                              <Chip size="sm" variant="flat" color="primary" className="text-[0.625rem]" radius="full">
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
                        <Chip size="sm" variant="flat" className="text-[0.625rem]" radius="full">
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
                        {item.readCount.toLocaleString()}
                      </TableCell>
                      <TableCell className="px-3 py-2 align-top text-right">
                        {item.likeCount.toLocaleString()}
                      </TableCell>
                      <TableCell className="px-3 py-2 align-top text-right">
                        {item.commentCount.toLocaleString()}
                      </TableCell>
                      <TableCell className="px-3 py-2 align-top">
                        {item.updatedAt}
                      </TableCell>
                      <TableCell className="px-3 py-2 align-top">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Button
                            size="sm"
                            variant="light"
                            color="success"
                            className="h-7 text-[0.625rem]"
                            startContent={<FiEdit2 className="text-[0.6875rem]" />}
                            onPress={() => navigate(`/admin/document/edit/${item.id}`)}
                          >
                            编辑
                          </Button>
                          <Button
                            size="sm"
                            variant="light"
                            color="primary"
                            className="h-7 text-[0.625rem]"
                            startContent={<FiEye className="text-[0.6875rem]" />}
                            onPress={() => handleOpenSidebar(item.id)}
                          >
                            详情
                          </Button>
                          <Button
                            size="sm"
                            variant="light"
                            className="h-7 text-[0.625rem]"
                            onPress={() => handleTogglePinned(item.id, !!item.pinned)}
                          >
                            {item.pinned ? "取消置顶" : "设为置顶"}
                          </Button>
                          <Button
                            size="sm"
                            variant="light"
                            className="h-7 text-[0.625rem]"
                            onPress={() => handleToggleRecommended(item.id, !!item.recommended)}
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
          ) : loading ? (
            <Loading height={400} text="获取文档数据中..." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {pageItems.map(item => (
                <Card key={item.id} className="p-4 hover:shadow-md transition-shadow border border-[var(--border-color)]">
                  <div className="flex justify-between items-start mb-3">
                    <Chip
                      size="sm"
                      color={getStatusColor(item.status)}
                      variant="flat"
                      className="text-[0.625rem]"
                      radius="full"
                    >
                      {getStatusLabel(item.status)}
                    </Chip>
                    <div className="flex gap-1">
                      <Button 
                        isIconOnly 
                        size="sm" 
                        variant="light" 
                        color="success" 
                        className="h-6 w-6 min-w-6" 
                        onPress={() => navigate(`/admin/document/edit/${item.id}`)}
                      >
                        <FiEdit2 className="text-xs" />
                      </Button>
                      <Button 
                        isIconOnly 
                        size="sm" 
                        variant="light" 
                        color="primary" 
                        className="h-6 w-6 min-w-6" 
                        onPress={() => handleOpenSidebar(item.id)}
                      >
                        <FiBarChart2 className="text-xs" />
                      </Button>
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
                      <div className="flex items-center gap-1">
                        <FiEye size={14} />
                        <span>{item.readCount}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FiBarChart2 size={14} />
                        <span>{item.likeCount}</span>
                      </div>
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

          {/* 分页控制 */}
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

      {/* 数据详情侧边栏 */}
      {sidebarVisible && activeDocument && (
        <div className="fixed inset-0 z-40 flex items-end md:items-stretch justify-end bg-black/40">
          <div className="w-full md:max-w-md h-[70vh] md:h-full bg-[var(--bg-elevated)] border-l border-[var(--border-color)] shadow-xl flex flex-col animate-in slide-in-from-right duration-300">
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
                      radius="full"
                    >
                      {getStatusLabel(activeDocument.status)}
                    </Chip>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[0.6875rem]">
                    <div className="space-y-0.5">
                      <div className="text-[var(--text-color-secondary)]">阅读量</div>
                      <div className="text-base font-semibold">
                        {activeDocument.readCount.toLocaleString()}
                      </div>
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-[var(--text-color-secondary)]">收藏数</div>
                      <div className="text-base font-semibold">1,204</div>
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-[var(--text-color-secondary)]">点赞</div>
                      <div className="text-base font-semibold">
                        {activeDocument.likeCount.toLocaleString()}
                      </div>
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-[var(--text-color-secondary)]">评论</div>
                      <div className="text-base font-semibold">
                        {activeDocument.commentCount.toLocaleString()}
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
                  <div className="text-sm font-medium">运营建议</div>
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

// ===== 9. 页面初始化与事件绑定 =====

// ===== 10. TODO任务管理区域 =====

// ===== 11. 导出区域 =====
export default DocumentListPage;
