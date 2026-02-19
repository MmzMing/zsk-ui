/**
 * 文档管理列表页面
 * @module pages/Admin/Document/List
 * @description 文档内容管理，支持列表展示、筛选、编辑、状态切换等功能
 */

import React, { useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
  useDisclosure
} from '@heroui/react';
import { AdminSearchInput } from '@/components/Admin/AdminSearchInput';
import { AdminSelect } from '@/components/Admin/AdminSelect';
import { AdminTabs } from '@/components/Admin/AdminTabs';
import { Loading } from '@/components/Loading';
import {
  FiEdit2,
  FiEye,
  FiTrash2,
  FiPlus,
  FiRotateCcw,
  FiMessageSquare
} from 'react-icons/fi';
import { useAppStore } from '@/store';
import { usePageState, useSelection, useDocumentList } from '@/hooks';
import {
  PAGE_SIZE,
  DOCUMENT_CATEGORIES,
  getDocumentStatusLabel,
  getDocumentStatusColor,
  type DocumentStatus
} from '@/hooks/documentConstants';

/** 状态筛选类型 */
type StatusFilter = 'all' | DocumentStatus;

/**
 * 文档管理列表页面组件
 * @returns 页面 JSX 元素
 */
function DocumentListPage() {
  const navigate = useNavigate();
  const { fontSize } = useAppStore();

  const {
    documents,
    loading,
    resetFilters,
    batchUpdateStatus,
    removeDocument,
    togglePinned,
    toggleRecommended,
    pinnedDocuments,
    recommendedDocuments,
    comments,
    commentsLoading,
    loadComments,
    removeComment
  } = useDocumentList({ pageSize: 100 });

  const { page, setPage, totalPages, handlePageChange, getPaginatedData } = usePageState({ pageSize: PAGE_SIZE });

  const { selectedIds, setSelectedIds, hasSelection, handleTableSelectionChange } = useSelection();

  const [keyword, setKeyword] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);

  const { isOpen: isCommentOpen, onOpen: onCommentOpen, onClose: onCommentClose } = useDisclosure();
  const { isOpen: isPreviewOpen, onOpen: onPreviewOpen, onClose: onPreviewClose } = useDisclosure();

  /** 过滤后的文档列表 */
  const filteredDocuments = useMemo(() => {
    const trimmed = keyword.trim().toLowerCase();
    return documents.filter(item => {
      if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      if (trimmed) {
        const content = `${item.title} ${item.category} ${item.id}`.toLowerCase();
        if (!content.includes(trimmed)) return false;
      }
      return true;
    });
  }, [documents, keyword, categoryFilter, statusFilter]);

  /** 分页数据 */
  const pageItems = getPaginatedData(filteredDocuments);
  const currentPage = Math.min(page, Math.max(1, Math.ceil(filteredDocuments.length / PAGE_SIZE)));

  /** 重置筛选条件 */
  const handleResetFilter = useCallback(() => {
    setKeyword('');
    setCategoryFilter('all');
    setStatusFilter('all');
    setPage(1);
    resetFilters();
  }, [resetFilters, setPage]);

  /** 批量删除文档 */
  const handleBatchDelete = useCallback(async () => {
    if (!hasSelection) return;
    const success = await removeDocument(selectedIds);
    if (success) {
      setSelectedIds([]);
    }
  }, [hasSelection, selectedIds, removeDocument, setSelectedIds]);

  /** 批量更新文档状态 */
  const handleBatchStatusUpdate = useCallback(async (status: 'published' | 'offline') => {
    if (!hasSelection) return;
    const success = await batchUpdateStatus(selectedIds, status);
    if (success) {
      setSelectedIds([]);
    }
  }, [hasSelection, selectedIds, batchUpdateStatus, setSelectedIds]);

  /** 切换置顶状态 */
  const handleTogglePinned = useCallback((id: string, currentPinned: boolean) => {
    togglePinned(id, currentPinned);
  }, [togglePinned]);

  /** 切换推荐状态 */
  const handleToggleRecommended = useCallback((id: string, currentRecommended: boolean) => {
    toggleRecommended(id, currentRecommended);
  }, [toggleRecommended]);

  /** 加载文档评论 */
  const handleLoadComments = useCallback(async (docId: string) => {
    setActiveDocumentId(docId);
    onCommentOpen();
    await loadComments(docId);
  }, [loadComments, onCommentOpen]);

  /** 删除评论 */
  const handleDeleteComment = useCallback(async (commentId: string) => {
    const success = await removeComment(commentId);
    if (success && activeDocumentId) {
      await loadComments(activeDocumentId);
    }
  }, [removeComment, activeDocumentId, loadComments]);

  /** 打开预览弹窗 */
  const handleOpenPreview = useCallback((id: string) => {
    setActiveDocumentId(id);
    onPreviewOpen();
  }, [onPreviewOpen]);

  /** 当前预览的文档 */
  const previewDoc = useMemo(() => {
    return documents.find(d => d.id === activeDocumentId);
  }, [documents, activeDocumentId]);

  return (
    <div className="space-y-4" style={{ fontFamily: 'ArkPixel-12px', fontSize: `${fontSize}px` }}>
      {/* 头部区域 */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 rounded-full bg-[color-mix(in_srgb,var(--primary-color)_10%,transparent)] px-3 py-1 text-[var(--primary-color)]">
          <span>文档管理 · 文档列表</span>
        </div>
        <h1 className="text-lg md:text-xl font-semibold tracking-tight" style={{ fontFamily: 'inherit' }}>
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
                        <div className="text-xs font-medium line-clamp-2">{item.title}</div>
                        <div className="text-[var(--text-color-secondary)]">文档 ID：{item.id}</div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
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
                onPress={() => navigate('/admin/document/edit/new')}
              >
                新建文档
              </Button>
              <Button
                size="sm"
                variant="flat"
                className="h-8"
                isDisabled={!hasSelection}
                onPress={() => handleBatchStatusUpdate('published')}
              >
                批量上架
              </Button>
              <Button
                size="sm"
                variant="flat"
                className="h-8"
                isDisabled={!hasSelection}
                onPress={() => handleBatchStatusUpdate('offline')}
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
                setCategoryFilter(key ? String(key) : 'all');
                setPage(1);
              }}
              items={[
                { label: '全部分类', value: 'all' },
                ...DOCUMENT_CATEGORIES.map(item => ({ label: item, value: item }))
              ]}
              isClearable
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

          {/* 筛选区域第二层：状态筛选 */}
          <div className="flex flex-wrap items-center gap-3">
            <AdminTabs
              aria-label="文档状态筛选"
              size="sm"
              radius="full"
              color="primary"
              selectedKey={statusFilter}
              onSelectionChange={key => {
                setStatusFilter(key as StatusFilter);
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
                  th: 'bg-[var(--bg-elevated)] text-[var(--text-color-secondary)] font-medium h-10 border-b border-[var(--border-color)]',
                  td: 'py-3 border-b border-[var(--border-color)]/50'
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
                  emptyContent={!loading && '暂无文档数据'}
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
                          color={getDocumentStatusColor(item.status)}
                          className="border-none bg-transparent"
                        >
                          {getDocumentStatusLabel(item.status)}
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
                              classNames={{ wrapper: 'h-4 w-8', thumb: 'w-3 h-3 group-data-[selected=true]:ml-4' }}
                            />
                            <span className="text-[var(--text-color-secondary)]">置顶</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              size="sm"
                              isSelected={item.recommended}
                              onValueChange={() => handleToggleRecommended(item.id, !!item.recommended)}
                              classNames={{ wrapper: 'h-4 w-8', thumb: 'w-3 h-3 group-data-[selected=true]:ml-4' }}
                            />
                            <span className="text-[var(--text-color-secondary)]">推荐</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-[var(--text-color-secondary)] leading-tight">
                          {item.updatedAt.split(' ')[0]}
                          <br />
                          <span className="opacity-60">{item.updatedAt.split(' ')[1]}</span>
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
                              onPress={() => handleLoadComments(item.id)}
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
        </div>

        {/* 分页区域 */}
        <div className="flex items-center justify-between px-2 pt-2">
          <div className="text-[var(--text-color-secondary)]">
            共找到 <span className="text-[var(--primary-color)] font-medium mx-1">{filteredDocuments.length}</span> 个文档
          </div>
          <Pagination
            total={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            size="sm"
            radius="full"
            classNames={{
              wrapper: 'gap-1',
              item: 'bg-[var(--bg-elevated)] text-[var(--text-color-secondary)] hover:bg-[var(--primary-color)]/10 min-w-8 h-8',
              cursor: 'bg-[var(--primary-color)] text-white font-medium'
            }}
            showControls
          />
        </div>
      </Card>

      {/* 评论管理弹窗 */}
      <Modal isOpen={isCommentOpen} onOpenChange={onCommentClose} size="2xl" scrollBehavior="inside">
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
                  {commentsLoading ? (
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
      <Modal isOpen={isPreviewOpen} onOpenChange={onPreviewClose} size="4xl" scrollBehavior="inside">
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="border-b border-[var(--border-color)]">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-semibold">{previewDoc?.title || '文档预览'}</span>
                  <span className="text-[0.625rem] text-[var(--text-color-secondary)] font-normal">
                    ID: {previewDoc?.id} · 分类: {previewDoc?.category}
                  </span>
                </div>
              </ModalHeader>
              <ModalBody className="p-0">
                <div className="flex h-[600px]">
                  {/* 左侧详情 */}
                  <div className="w-80 border-r border-[var(--border-color)] bg-[var(--bg-elevated)]/30 p-4 space-y-6 overflow-y-auto">
                    <div className="space-y-4">
                      <div className="aspect-video rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-color)] overflow-hidden">
                        {previewDoc?.cover ? (
                          <img src={previewDoc.cover} alt="" className="w-full h-full object-cover" />
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
                            <div className="text-sm font-semibold">{previewDoc?.readCount.toLocaleString()}</div>
                          </div>
                          <div className="p-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-color)]">
                            <div className="text-[0.625rem] text-[var(--text-color-secondary)]">点赞量</div>
                            <div className="text-sm font-semibold">{previewDoc?.likeCount.toLocaleString()}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">基本信息</h3>
                      <div className="space-y-2 text-[0.6875rem]">
                        <div className="flex justify-between">
                          <span className="text-[var(--text-color-secondary)]">当前状态</span>
                          <Chip size="sm" variant="flat" color={getDocumentStatusColor(previewDoc?.status || 'offline')} className="h-5">
                            {getDocumentStatusLabel(previewDoc?.status || 'offline')}
                          </Chip>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[var(--text-color-secondary)]">文档分类</span>
                          <span>{previewDoc?.category}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[var(--text-color-secondary)]">最后更新</span>
                          <span>{previewDoc?.updatedAt}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">标签集合</h3>
                      <div className="flex flex-wrap gap-1">
                        {previewDoc?.tags?.map(tag => (
                          <Chip key={tag} size="sm" variant="flat" className="h-5">{tag}</Chip>
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
                    navigate(`/admin/document/edit/${previewDoc?.id}`);
                  }}
                >
                  去编辑
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}

export default DocumentListPage;
