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
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Switch,
  useDisclosure,
  addToast
} from "@heroui/react";
import { AdminSearchInput } from "@/components/Admin/AdminSearchInput";
import { AdminSelect } from "@/components/Admin/AdminSelect";
import { AdminTabs } from "@/components/Admin/AdminTabs";
import {
  FiEdit2,
  FiEye,
  FiTrash2,
  FiPlus,
  FiRotateCcw,
  FiMessageSquare
} from "react-icons/fi";

import {
  fetchDocumentList,
  batchUpdateDocumentStatus,
  deleteDocument,
  updateDocument,
  fetchDocumentComments,
  deleteDocumentComment,
  type DocumentItem,
  type DocumentStatus,
  type DocCommentItem
} from "../../../api/admin/document";
import { useAppStore } from "../../../store";
import { handleRequest } from "../../../api/axios";
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
  /** 当前选中的文档 ID (用于侧边栏或弹窗) */
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);
  /** 评论列表 */
  const [comments, setComments] = useState<DocCommentItem[]>([]);
  /** 评论加载状态 */
  const [isCommentsLoading, setIsCommentsLoading] = useState(false);

  const { isOpen: isCommentOpen, onOpen: onCommentOpen, onClose: onCommentClose } = useDisclosure();
  const { isOpen: isPreviewOpen, onOpen: onPreviewOpen, onClose: onPreviewClose } = useDisclosure();

  const navigate = useNavigate();
  const { fontSize } = useAppStore();

  /** 每页显示条数 */
  const pageSize = 8;

  // --- 计算属性 ---

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

  // --- 事件处理 ---

  /**
   * 加载文档列表
   */
  const loadDocumentList = useCallback(async () => {
    setLoading(true);
    const res = await handleRequest({
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

    const res = await handleRequest({
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
   * 批量操作状态
   */
  const handleBatchStatusUpdate = async (status: "published" | "offline") => {
    if (!hasSelection) return;
    const actionName = status === "published" ? "上架" : "下架";
    const confirmed = window.confirm(`确认批量${actionName}选中的 ${selectedIds.length} 个文档吗？`);
    if (!confirmed) return;

    const res = await handleRequest({
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
    const res = await handleRequest({
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
    const res = await handleRequest({
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
   * 加载文档评论
   * @param docId 文档ID
   */
  const loadComments = async (docId: string) => {
    setActiveDocumentId(docId);
    onCommentOpen();
    setIsCommentsLoading(true);
    try {
      const res = await fetchDocumentComments(docId);
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
    const res = await deleteDocumentComment(commentId);
    if (res && res.code === 200) {
      addToast({
        title: "删除成功",
        description: "该评论已被移除",
        color: "success"
      });
      if (activeDocumentId) {
        const resList = await fetchDocumentComments(activeDocumentId);
        if (resList && resList.code === 200) {
          setComments(resList.data);
        }
      }
    }
  };

  /**
   * 打开预览
   */
  const handleOpenPreview = (id: string) => {
    setActiveDocumentId(id);
    onPreviewOpen();
  };

  // --- 生命周期 ---
  useEffect(() => {
    const timer = setTimeout(() => {
      loadDocumentList();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadDocumentList]);

  return (
    <div className="space-y-4" style={{ fontFamily: "ArkPixel-12px", fontSize: `${fontSize}px` }}>
      {/* 头部区域 */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 rounded-full bg-[color-mix(in_srgb,var(--primary-color)_10%,transparent)] px-3 py-1 text-[var(--primary-color)]">
          <span>文档管理 · 文档列表</span>
        </div>
        <h1 className="text-lg md:text-xl font-semibold tracking-tight" style={{ fontFamily: "inherit" }}>
          统一管理知识库文档的状态与核心指标
        </h1>
        <p className="text-xs text-[var(--text-color-secondary)] max-w-2xl">
          支持按分类、状态与关键字筛选文档列表，对接内容中心接口，实现上架、下架与数据分析。
        </p>
      </div>

      {/* 推荐位区域 */}
      <Card className="border border-[var(--border-color)] bg-[var(--bg-elevated)]/95">
        <div className="p-3 border-b border-[var(--border-color)]">
          <div className="flex items-center justify-between">
            <div className="text-xs font-medium">推荐位与置顶文档</div>
            <div className="text-[var(--text-color-secondary)]">
              顶部预留 4 个推荐位，对应前台页面的文档推荐区。
            </div>
          </div>
        </div>
        <div className="p-3">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            {[0, 1, 2, 3].map(index => {
              const item = [...pinnedDocuments, ...recommendedDocuments.filter(r => !r.pinned)][index] ?? null;
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
                  key={`recommend-${item.id}`}
                  className="border border-[var(--border-color)] bg-[var(--bg-elevated)]/90"
                >
                  <div className="p-3 flex flex-col gap-2">
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

      {/* 筛选与操作区域 */}
      <Card className="border border-[var(--border-color)] bg-[var(--bg-elevated)]/95">
        <div className="p-3 space-y-3 border-b border-[var(--border-color)]">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                className="h-8"
                startContent={<FiPlus />}
                onPress={() => navigate("/admin/document/edit/new")}
              >
                新建文档
              </Button>
              <Button
                size="sm"
                variant="flat"
                className="h-8"
                isDisabled={!hasSelection}
                onPress={() => handleBatchStatusUpdate("published")}
              >
                批量上架
              </Button>
              <Button
                size="sm"
                variant="flat"
                className="h-8"
                isDisabled={!hasSelection}
                onPress={() => handleBatchStatusUpdate("offline")}
              >
                批量下架
              </Button>
              <Button
                size="sm"
                color="danger"
                variant="flat"
                className="h-8"
                isDisabled={!hasSelection}
                startContent={<FiTrash2 />}
                onPress={handleBatchDelete}
              >
                批量删除
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[var(--text-color-secondary)]">
              <span>当前操作将同步更新后台数据与前台展示。</span>
            </div>
          </div>
        </div>

        <div className="p-3 space-y-4">
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
              <Tab key="published" title="已发布" />
            </AdminTabs>
          </div>

          {/* 表格区域 */}
          <div className="rounded-xl border border-[var(--border-color)] overflow-x-auto bg-[var(--bg-elevated)]/50">
            <div className="min-w-[800px]">
              <Table
                aria-label="文档列表表格"
                removeWrapper
                selectionMode="multiple"
                selectedKeys={new Set(selectedIds)}
                onSelectionChange={handleTableSelectionChange}
                classNames={{
                  th: "bg-[var(--bg-elevated)] text-[var(--text-color-secondary)] font-medium h-10 border-b border-[var(--border-color)]",
                  td: "py-3 border-b border-[var(--border-color)]/50",
                }}
              >
              <TableHeader>
                <TableColumn width={300}>文档信息</TableColumn>
                <TableColumn>分类与标签</TableColumn>
                <TableColumn>状态</TableColumn>
                <TableColumn>核心指标</TableColumn>
                <TableColumn>置顶/推荐</TableColumn>
                <TableColumn>更新时间</TableColumn>
                <TableColumn align="center" width={150}>操作</TableColumn>
              </TableHeader>
              <TableBody
                loadingContent={<Loading />}
                isLoading={loading}
                emptyContent={!loading && "暂无文档数据"}
              >
                {pageItems.map((item) => (
                  <TableRow key={item.id} className="group hover:bg-[var(--primary-color)]/5 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-8 rounded bg-[var(--bg-elevated)] border border-[var(--border-color)] overflow-hidden flex-shrink-0">
                          {item.cover ? (
                            <img src={item.cover} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[0.625rem] text-[var(--text-color-secondary)]">
                              Doc
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div 
                            className="font-medium text-[var(--text-color)] truncate mb-0.5 text-[14px] cursor-pointer hover:text-[var(--primary-color)] transition-colors"
                            onClick={() => handleOpenPreview(item.id)}
                          >
                            {item.title}
                          </div>
                          <div className="text-[var(--text-color-secondary)] flex items-center gap-2">
                            <span>ID: {item.id}</span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1.5">
                        <div className="text-[var(--text-color)]">{item.category}</div>
                        <div className="flex flex-wrap gap-1">
                          {item.tags?.map(tag => (
                            <Chip key={tag} size="sm" variant="flat" radius="sm" className="h-4 px-1 bg-[var(--bg-elevated)]">
                              {tag}
                            </Chip>
                          ))}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="sm"
                        variant="dot"
                        color={getStatusColor(item.status)}
                        className="border-none bg-transparent"
                      >
                        {getStatusLabel(item.status)}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-[var(--text-color-secondary)]">
                        <div className="flex items-center gap-1">
                          <span>阅读量:</span>
                          <span className="text-[var(--text-color)] font-medium">{item.readCount.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>点赞量:</span>
                          <span className="text-[var(--text-color)] font-medium">{item.likeCount.toLocaleString()}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Switch
                            size="sm"
                            isSelected={item.pinned}
                            onValueChange={() => handleTogglePinned(item.id, !!item.pinned)}
                            classNames={{ wrapper: "h-4 w-8", thumb: "w-3 h-3 group-data-[selected=true]:ml-4" }}
                          />
                          <span className="text-[var(--text-color-secondary)]">置顶</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            size="sm"
                            isSelected={item.recommended}
                            onValueChange={() => handleToggleRecommended(item.id, !!item.recommended)}
                            classNames={{ wrapper: "h-4 w-8", thumb: "w-3 h-3 group-data-[selected=true]:ml-4" }}
                          />
                          <span className="text-[var(--text-color-secondary)]">推荐</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-[var(--text-color-secondary)] leading-tight">
                        {item.updatedAt.split(" ")[0]}
                        <br />
                        <span className="opacity-60">{item.updatedAt.split(" ")[1]}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Tooltip content="编辑详情">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            className="h-7 w-7"
                            onPress={() => navigate(`/admin/document/edit/${item.id}`)}
                          >
                            <FiEdit2 className="text-sm" />
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
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* 分页区域 */}
          <div className="flex items-center justify-between px-2 pt-2">
            <div className="text-[var(--text-color-secondary)]">
              共找到 <span className="text-[var(--primary-color)] font-medium mx-1">{total}</span> 个文档
            </div>
            <Pagination
              total={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              size="sm"
              radius="full"
              classNames={{
                wrapper: "gap-1",
                item: "bg-[var(--bg-elevated)] text-[var(--text-color-secondary)] hover:bg-[var(--primary-color)]/10 min-w-8 h-8",
                cursor: "bg-[var(--primary-color)] text-white font-medium",
              }}
              showControls
            />
          </div>
        </div>
      </Card>

      {/* 评论管理弹窗 */}
      <Modal
        isOpen={isCommentOpen}
        onOpenChange={onCommentClose}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          {() => {
            const doc = documents.find(d => d.id === activeDocumentId);
            return (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  <span className="text-sm font-semibold">文档评论管理</span>
                  {doc && (
                    <span className="text-[0.625rem] text-[var(--text-color-secondary)] font-normal">
                      正在查看文档「{doc.title}」的评论
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
                            className="h-7 w-7"
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
                      <span className="text-xs">该文档目前没有评论</span>
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

      {/* 预览弹窗 */}
      <Modal
        isOpen={isPreviewOpen}
        onOpenChange={onPreviewClose}
        size="4xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          {() => {
            const doc = documents.find(d => d.id === activeDocumentId);
            return (
              <>
                <ModalHeader className="border-b border-[var(--border-color)]">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-semibold">{doc?.title || "文档预览"}</span>
                    <span className="text-[0.625rem] text-[var(--text-color-secondary)] font-normal">
                      ID: {doc?.id} · 分类: {doc?.category}
                    </span>
                  </div>
                </ModalHeader>
                <ModalBody className="p-0">
                  <div className="flex h-[600px]">
                    {/* 左侧详情 */}
                    <div className="w-80 border-r border-[var(--border-color)] bg-[var(--bg-elevated)]/30 p-4 space-y-6 overflow-y-auto">
                      <div className="space-y-4">
                        <div className="aspect-video rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-color)] overflow-hidden">
                          {doc?.cover ? (
                            <img src={doc.cover} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[var(--text-color-secondary)]">
                              暂无封面
                            </div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium">核心指标</h3>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="p-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-color)]">
                              <div className="text-[0.625rem] text-[var(--text-color-secondary)]">阅读量</div>
                              <div className="text-sm font-semibold">{doc?.readCount.toLocaleString()}</div>
                            </div>
                            <div className="p-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-color)]">
                              <div className="text-[0.625rem] text-[var(--text-color-secondary)]">点赞量</div>
                              <div className="text-sm font-semibold">{doc?.likeCount.toLocaleString()}</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">基本信息</h3>
                        <div className="space-y-2 text-[0.6875rem]">
                          <div className="flex justify-between">
                            <span className="text-[var(--text-color-secondary)]">当前状态</span>
                            <Chip size="sm" variant="flat" color={getStatusColor(doc?.status || "offline")} className="h-5">
                              {getStatusLabel(doc?.status || "offline")}
                            </Chip>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[var(--text-color-secondary)]">文档分类</span>
                            <span>{doc?.category}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[var(--text-color-secondary)]">最后更新</span>
                            <span>{doc?.updatedAt}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">标签集合</h3>
                        <div className="flex flex-wrap gap-1">
                          {doc?.tags?.map(tag => (
                            <Chip key={tag} size="sm" variant="flat" className="h-5">
                              {tag}
                            </Chip>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* 右侧内容预览 */}
                    <div className="flex-1 flex flex-col bg-[var(--bg-elevated)]/10">
                      <div className="p-4 border-b border-[var(--border-color)] bg-[var(--bg-elevated)]/50 flex items-center justify-between">
                        <div className="text-xs font-medium flex items-center gap-2">
                          <FiEye className="text-[var(--primary-color)]" />
                          内容预览
                        </div>
                      </div>
                      <div className="flex-1 p-6 overflow-y-auto">
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <div className="flex flex-col items-center justify-center h-full py-20 text-[var(--text-color-secondary)] gap-4">
                            <div className="w-16 h-16 rounded-full bg-[var(--bg-elevated)] border border-dashed border-[var(--border-color)] flex items-center justify-center">
                              <FiEdit2 className="text-xl opacity-20" />
                            </div>
                            <div className="text-center space-y-1">
                              <p className="text-sm font-medium">文档内容渲染区域</p>
                              <p className="text-xs opacity-60">预览模式下仅展示核心元数据，完整内容请点击「去编辑」查看</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </ModalBody>
                <ModalFooter className="border-t border-[var(--border-color)]">
                  <Button variant="light" size="sm" onPress={onPreviewClose}>关闭</Button>
                  <Button 
                    color="primary" 
                    size="sm" 
                    onPress={() => {
                      onPreviewClose();
                      navigate(`/admin/document/edit/${doc?.id}`);
                    }}
                  >
                    去编辑
                  </Button>
                </ModalFooter>
              </>
            );
          }}
        </ModalContent>
      </Modal>
    </div>
  );
}

// ===== 9. 页面初始化与事件绑定 =====

// ===== 10. TODO任务管理区域 =====

// ===== 11. 导出区域 =====
export default DocumentListPage;
