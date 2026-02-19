/**
 * 文档审核页面
 * @module pages/Admin/Document/Review
 * @description 提供文档审核队列管理、审核操作、日志查看等功能
 */

import React, { useState, useCallback } from 'react';
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
  ModalFooter,
  useDisclosure,
  Divider
} from '@heroui/react';
import {
  FiCheck,
  FiFilter,
  FiRotateCcw,
  FiX,
  FiActivity,
  FiSearch
} from 'react-icons/fi';

import { AdminSearchInput } from '@/components/Admin/AdminSearchInput';
import { AdminSelect } from '@/components/Admin/AdminSelect';
import { AdminTabs } from '@/components/Admin/AdminTabs';
import { Loading } from '@/components/Loading';
import { useSelection, useDocumentReview } from '@/hooks';
import type { DocumentReviewItem } from '@/api/admin/document';

/** 审核子模块类型 */
type AuditModule = 'document' | 'comment' | 'violation' | 'rules';

/** 审核模块导航配置 */
const AUDIT_MODULE_CONFIG = [
  { key: 'document' as AuditModule, label: '文档审核', description: '管理文档内容的审核流程。' },
  { key: 'comment' as AuditModule, label: '评论审核', description: '对文档下的评论进行判定。' },
  { key: 'violation' as AuditModule, label: '违规库', description: '集中管理已判定违规的样本。' },
  { key: 'rules' as AuditModule, label: '规则配置', description: '配置审核规则与通知策略。' }
];

/**
 * 文档审核页面组件
 * @returns 页面 JSX 元素
 */
function DocumentReviewPage() {
  const {
    queue,
    loading,
    total,
    page,
    setPage,
    totalPages,
    filters,
    setFilters,
    updateStatus,
    batchApprove,
    batchReject,
    logs,
    logsLoading,
    loadLogs,
    allCategories,
    getStatusLabel,
    getRiskLabel,
    getRiskColor
  } = useDocumentReview({ pageSize: 8 });

  const { selectedIds, setSelectedIds, hasSelection, handleTableSelectionChange } = useSelection();

  const [activeModule, setActiveModule] = useState<AuditModule>('document');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [uploaderFilter, setUploaderFilter] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [dateRange, setDateRange] = useState<any>(null);

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [auditingDoc, setAuditingDoc] = useState<DocumentReviewItem | null>(null);

  /** 重置筛选条件 */
  const handleResetFilter = useCallback(() => {
    setFilters({ status: 'all', keyword: '' });
    setCategoryFilter('all');
    setUploaderFilter('');
    setDateRange(null);
    setSelectedIds([]);
  }, [setFilters, setSelectedIds]);

  /** 处理审核点击 */
  const handleAuditClick = useCallback((item: DocumentReviewItem) => {
    setAuditingDoc(item);
    onOpen();
  }, [onOpen]);

  /** 更新审核状态 */
  const handleUpdateStatus = useCallback(async (id: string, status: 'approved' | 'rejected') => {
    await updateStatus(id, status);
  }, [updateStatus]);

  /** 批量通过 */
  const handleBatchApprove = useCallback(async () => {
    if (!hasSelection) return;
    const success = await batchApprove(selectedIds);
    if (success) {
      loadLogs(selectedIds);
    }
  }, [hasSelection, selectedIds, batchApprove, loadLogs]);

  /** 批量驳回 */
  const handleBatchReject = useCallback(async () => {
    if (!hasSelection) return;
    const success = await batchReject(selectedIds);
    if (success) {
      loadLogs(selectedIds);
    }
  }, [hasSelection, selectedIds, batchReject, loadLogs]);

  /** 表格选择变更 */
  const handleSelectionChange = useCallback((keys: 'all' | Set<React.Key>) => {
    handleTableSelectionChange(keys);
    if (keys !== 'all') {
      const ids = Array.from(keys).map(String);
      if (ids.length > 0) {
        loadLogs(ids);
      }
    }
  }, [handleTableSelectionChange, loadLogs]);

  /** 渲染审核详情弹窗 */
  const renderAuditModal = useCallback((onClose: () => void) => {
    if (!auditingDoc) return null;

    return (
      <>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-zinc-100">文档审核详情</span>
            <Chip size="sm" variant="flat" className="bg-primary/10 text-primary border-0">
              ID: {auditingDoc.id}
            </Chip>
          </div>
        </ModalHeader>
        <ModalBody className="py-6">
          <div className="space-y-6 text-zinc-300">
            {/* 基本信息 */}
            <section>
              <h4 className="text-zinc-100 font-medium mb-3 flex items-center gap-2">
                <div className="w-1 h-4 bg-primary rounded-full" />
                基本信息
              </h4>
              <div className="grid grid-cols-2 gap-4 bg-zinc-800/30 p-4 rounded-xl border border-zinc-800">
                <div>
                  <p className="text-zinc-500 text-xs mb-1">文档标题</p>
                  <p className="text-zinc-200 font-medium">{auditingDoc.title}</p>
                </div>
                <div>
                  <p className="text-zinc-500 text-xs mb-1">上传人</p>
                  <p className="text-zinc-200 font-medium">{auditingDoc.uploader}</p>
                </div>
                <div>
                  <p className="text-zinc-500 text-xs mb-1">分类</p>
                  <Chip size="sm" variant="flat" className="bg-zinc-800 text-zinc-400">
                    {auditingDoc.category}
                  </Chip>
                </div>
                <div>
                  <p className="text-zinc-500 text-xs mb-1">提交时间</p>
                  <p className="text-zinc-200">{auditingDoc.createdAt}</p>
                </div>
              </div>
            </section>

            <Divider className="bg-zinc-800" />

            {/* AI 预审核信息 */}
            <section>
              <h4 className="text-zinc-100 font-medium mb-3 flex items-center gap-2">
                <FiActivity className="text-primary" />
                AI 预测风险信息
              </h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-zinc-800/30 p-4 rounded-xl border border-zinc-800">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-zinc-500 text-xs mb-1">风险等级</p>
                      <Chip
                        size="sm"
                        variant="flat"
                        className={
                          auditingDoc.riskLevel === 'high'
                            ? 'bg-danger/10 text-danger border-0'
                            : auditingDoc.riskLevel === 'medium'
                            ? 'bg-warning/10 text-warning border-0'
                            : 'bg-success/10 text-success border-0'
                        }
                      >
                        {auditingDoc.riskLevel === 'high' ? '高风险' : auditingDoc.riskLevel === 'medium' ? '中风险' : '低风险'}
                      </Chip>
                    </div>
                    <Divider orientation="vertical" className="h-8 bg-zinc-800" />
                    <div>
                      <p className="text-zinc-500 text-xs mb-1">AI 预审状态</p>
                      <Chip size="sm" variant="flat" className="bg-zinc-800 text-zinc-400">
                        {auditingDoc.isAiChecked ? '已完成 AI 扫描' : '待 AI 扫描'}
                      </Chip>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-zinc-500 text-xs mb-1">AI 评分</p>
                    <p className={`text-xl font-bold ${
                      auditingDoc.riskLevel === 'high' ? 'text-danger' : auditingDoc.riskLevel === 'medium' ? 'text-warning' : 'text-success'
                    }`}>
                      {auditingDoc.riskLevel === 'high' ? '85' : auditingDoc.riskLevel === 'medium' ? '45' : '12'}
                    </p>
                  </div>
                </div>

                {/* 风险点预测 */}
                <div className="bg-zinc-800/30 p-4 rounded-xl border border-zinc-800">
                  <p className="text-zinc-400 text-sm mb-3">AI 风险预测报告：</p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-danger mt-1.5" />
                      <span className="text-zinc-300">检测到敏感词汇，可能涉及违反平台内容发布规范。</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-warning mt-1.5" />
                      <span className="text-zinc-300">部分段落引用未注明出处，存在潜在版权争议。</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-success mt-1.5" />
                      <span className="text-zinc-300">文档结构完整，内容排版符合标准。</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 文档内容预览 */}
            <section>
              <h4 className="text-zinc-100 font-medium mb-3 flex items-center gap-2">
                <div className="w-1 h-4 bg-primary rounded-full" />
                文档内容预览
              </h4>
              <div className="bg-zinc-800/30 p-4 rounded-xl border border-zinc-800 min-h-[100px] text-sm leading-relaxed">
                这是文档内容预览区域。在实际应用中，这里可以展示文档的摘要、全文或者是 PDF 预览组件。
                当前正在审核的文档是《{auditingDoc.title}》，由 {auditingDoc.uploader} 上传。
              </div>
            </section>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose} className="text-zinc-400">取消</Button>
          <Button
            color="danger"
            variant="flat"
            onPress={() => {
              handleUpdateStatus(auditingDoc.id, 'rejected');
              onClose();
            }}
          >
            驳回
          </Button>
          <Button
            color="success"
            onPress={() => {
              handleUpdateStatus(auditingDoc.id, 'approved');
              onClose();
            }}
          >
            通过
          </Button>
        </ModalFooter>
      </>
    );
  }, [auditingDoc, handleUpdateStatus]);

  return (
    <div className="space-y-4">
      {/* 标题区域 */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 rounded-full bg-[color-mix(in_srgb,var(--primary-color)_10%,transparent)] px-3 py-1 text-xs text-[var(--primary-color)]">
          <span>文档管理 · 审核管理</span>
        </div>
        <h1 className="text-lg md:text-xl font-semibold tracking-tight">文档审核队列</h1>
        <p className="text-[var(--text-color-secondary)] max-w-2xl">
          支持文档预览、审核判定与操作日志记录，确保平台内容的合规性。
        </p>
      </div>

      <Card className="border border-[var(--border-color)] bg-[var(--bg-elevated)]/95">
        <div className="p-3 space-y-3 border-b border-[var(--border-color)]">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-[color-mix(in_srgb,var(--primary-color)_8%,transparent)] px-3 py-1 text-sm text-[var(--primary-color)]">
                <FiFilter />
                <span>左侧在不同审核子模块之间切换，右侧展示对应内容。</span>
              </span>
            </div>
          </div>
        </div>

        <div className="p-3 grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,3fr)]">
          {/* 左侧导航 */}
          <Card className="border border-[var(--border-color)] bg-[var(--bg-elevated)]/95">
            <div className="p-3 space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">审核功能导航</div>
                </div>
                <Chip size="sm" variant="flat">审核中心</Chip>
              </div>
              <div className="mt-2 space-y-1">
                {AUDIT_MODULE_CONFIG.map(item => {
                  const active = activeModule === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      className={
                        'w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-left border transition-colors ' +
                        (active
                          ? 'border-[var(--primary-color)] bg-[color-mix(in_srgb,var(--primary-color)_12%,transparent)] text-[var(--primary-color)]'
                          : 'border-transparent text-[var(--text-color-secondary)] hover:bg-[color-mix(in_srgb,var(--primary-color)_6%,transparent)] hover:text-[var(--text-color)]')
                      }
                      onClick={() => setActiveModule(item.key)}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[10px]">
                            {item.key.charAt(0).toUpperCase()}
                          </span>
                          <span className="font-medium">{item.label}</span>
                        </div>
                      </div>
                      {active && <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary-color)]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </Card>

          {/* 右侧内容 */}
          <div className="space-y-3 min-w-0">
            {activeModule === 'document' && (
              <>
                <Card className="border border-[var(--border-color)] bg-[var(--bg-elevated)]/95">
                  <div className="p-4 space-y-4 border-b border-[var(--border-color)]">
                    {/* 搜索与筛选 */}
                    <div className="flex flex-wrap items-center gap-3">
                      <AdminSearchInput
                        className="w-64"
                        placeholder="按标题 / ID 搜索文档"
                        value={filters.keyword}
                        onValueChange={value => setFilters({ keyword: value })}
                      />
                      <AdminSearchInput
                        className="w-40"
                        placeholder="按上传人筛选"
                        value={uploaderFilter}
                        onValueChange={value => setUploaderFilter(value)}
                      />
                      <AdminSelect
                        aria-label="文档分类筛选"
                        size="sm"
                        className="w-40"
                        selectedKeys={[categoryFilter]}
                        onSelectionChange={keys => {
                          const key = Array.from(keys)[0];
                          setCategoryFilter(key ? String(key) : 'all');
                        }}
                        items={[
                          { label: '全部分类', value: 'all' },
                          ...allCategories.map(item => ({ label: item, value: item }))
                        ]}
                        isClearable
                      >
                        {(item: { label: string; value: string }) => (
                          <SelectItem key={item.value}>{item.label}</SelectItem>
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
                            'h-8',
                            'bg-transparent',
                            'border border-[var(--border-color)]',
                            'dark:border-white/20',
                            'hover:border-[var(--primary-color)]/80!',
                            'group-data-[focus=true]:border-[var(--primary-color)]!',
                            'transition-colors',
                            'shadow-none'
                          ].join(' '),
                          selectorButton: 'text-[var(--text-color-secondary)] hover:text-[var(--primary-color)] transition-colors'
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
                      <span className="text-[var(--text-color-secondary)]">状态：</span>
                      <AdminTabs
                        aria-label="审核状态筛选"
                        size="sm"
                        selectedKey={filters.status}
                        onSelectionChange={key => setFilters({ status: String(key) })}
                      >
                        <Tab key="all" title="全部" />
                        <Tab key="pending" title="待审核" />
                        <Tab key="approved" title="已通过" />
                        <Tab key="rejected" title="已驳回" />
                      </AdminTabs>
                    </div>
                  </div>

                  {/* 队列展示 */}
                  <div className="p-3 space-y-3">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div className="flex flex-wrap items-center gap-2 text-[var(--text-color-secondary)]">
                        <span>当前展示需要人工审核的文档队列。</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          size="sm"
                          variant="light"
                          color="success"
                          className="h-8 text-success hover:bg-success/10"
                          isDisabled={!hasSelection || loading}
                          startContent={<FiCheck />}
                          onPress={handleBatchApprove}
                        >
                          批量通过
                        </Button>
                        <Button
                          size="sm"
                          variant="light"
                          color="danger"
                          className="h-8 text-danger hover:bg-danger/10"
                          isDisabled={!hasSelection || loading}
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
                          aria-label="文档审核队列表格"
                          className="min-w-full text-xs"
                          selectionMode="multiple"
                          selectedKeys={selectedIds.length === queue.length && queue.length > 0 ? 'all' : new Set(selectedIds)}
                          onSelectionChange={handleSelectionChange}
                          removeWrapper
                          classNames={{ th: 'whitespace-nowrap', td: 'whitespace-nowrap' }}
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
                            emptyContent="暂无审核任务"
                            isLoading={loading}
                            loadingContent={<Loading height={200} text="加载审核队列中..." />}
                          >
                            {queue.map(item => (
                              <TableRow key={item.id}>
                                <TableCell className="px-3 py-2 align-top">
                                  <div className="flex flex-col gap-1">
                                    <span className="font-medium text-[var(--text-color)]">{item.title}</span>
                                    <span className="text-[10px] text-[var(--text-color-secondary)] font-mono">ID: {item.id}</span>
                                  </div>
                                </TableCell>
                                <TableCell className="px-3 py-2 align-top">
                                  <span className="text-[var(--text-color-secondary)]">{item.uploader}</span>
                                </TableCell>
                                <TableCell className="px-3 py-2 align-top">
                                  <Chip size="sm" variant="flat" className="text-[0.625rem]" radius="full">{item.category}</Chip>
                                </TableCell>
                                <TableCell className="px-3 py-2 align-top">
                                  <Chip size="sm" variant="flat" color={getRiskColor(item.riskLevel)} className="text-[0.625rem]" radius="full">
                                    {getRiskLabel(item.riskLevel)}风险
                                  </Chip>
                                </TableCell>
                                <TableCell className="px-3 py-2 align-top">
                                  <Chip size="sm" variant="flat" className="text-[0.625rem]" radius="full">
                                    {item.isAiChecked ? 'AI 已审' : '待 AI'}
                                  </Chip>
                                </TableCell>
                                <TableCell className="px-3 py-2 align-top">
                                  <Chip
                                    size="sm"
                                    variant="flat"
                                    className="text-[0.625rem]"
                                    radius="full"
                                    color={item.status === 'pending' ? 'warning' : item.status === 'approved' ? 'success' : 'danger'}
                                  >
                                    {getStatusLabel(item.status)}
                                  </Chip>
                                </TableCell>
                                <TableCell className="px-3 py-2 align-top">
                                  <span className="text-[var(--text-color-secondary)] text-[10px]">{item.createdAt}</span>
                                </TableCell>
                                <TableCell className="px-3 py-2 align-top">
                                  <div className="flex items-center justify-center gap-1">
                                    <Tooltip content="审核">
                                      <Button
                                        isIconOnly
                                        size="sm"
                                        variant="light"
                                        className="h-7 w-7 text-[var(--primary-color)] hover:bg-[var(--primary-color)]/10"
                                        onClick={() => handleAuditClick(item)}
                                      >
                                        <FiSearch className="text-sm" />
                                      </Button>
                                    </Tooltip>
                                    <Tooltip content="通过">
                                      <Button
                                        isIconOnly
                                        size="sm"
                                        variant="light"
                                        className="h-7 w-7 text-success hover:bg-success/10"
                                        onClick={() => handleUpdateStatus(item.id, 'approved')}
                                      >
                                        <FiCheck className="text-sm" />
                                      </Button>
                                    </Tooltip>
                                    <Tooltip content="驳回">
                                      <Button
                                        isIconOnly
                                        size="sm"
                                        variant="light"
                                        className="h-7 w-7 text-danger hover:bg-danger/10"
                                        onClick={() => handleUpdateStatus(item.id, 'rejected')}
                                      >
                                        <FiX className="text-sm" />
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

                    <div className="flex items-center justify-between px-2 py-4 border-t border-zinc-800/50">
                      <div className="text-xs text-zinc-400">
                        共 {total} 条记录，当前第 {page} / {totalPages} 页
                      </div>
                      <Pagination
                        total={totalPages}
                        page={page}
                        onChange={setPage}
                        size="sm"
                        radius="lg"
                        classNames={{
                          wrapper: 'gap-2',
                          item: 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 data-[active=true]:bg-zinc-100 data-[active=true]:text-zinc-900',
                          prev: 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700',
                          next: 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                        }}
                        showControls
                      />
                    </div>

                    {/* 审核详情 Modal */}
                    <Modal
                      isOpen={isOpen}
                      onOpenChange={onOpenChange}
                      size="3xl"
                      scrollBehavior="inside"
                      backdrop="blur"
                      classNames={{
                        base: 'bg-zinc-900 border border-zinc-800',
                        header: 'border-b border-zinc-800',
                        footer: 'border-t border-zinc-800',
                        closeButton: 'hover:bg-zinc-800 active:bg-zinc-700'
                      }}
                    >
                      <ModalContent>{renderAuditModal}</ModalContent>
                    </Modal>
                  </div>
                </Card>

                {/* 系统日志区域 */}
                <Card className="border border-[var(--border-color)] bg-[var(--bg-elevated)]/95">
                  <div className="p-3 border-b border-[var(--border-color)] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FiActivity className="text-[var(--primary-color)]" />
                      <span className="font-medium">系统审核日志</span>
                    </div>
                    <Chip size="sm" variant="flat">
                      {hasSelection ? `已选 ${selectedIds.length} 项` : '请选择表格数据查看日志'}
                    </Chip>
                  </div>
                  <div className="p-3">
                    <div className="overflow-x-auto border border-[var(--border-color)] rounded-lg bg-[var(--bg-elevated)]/50 w-full">
                      <div className="min-w-[800px] w-full">
                        <Table
                          aria-label="审核日志表格"
                          className="min-w-full text-xs"
                          removeWrapper
                          classNames={{ th: 'whitespace-nowrap', td: 'whitespace-nowrap' }}
                        >
                          <TableHeader className="bg-[var(--bg-elevated)]/80">
                            <TableColumn className="px-3 py-2 text-left font-medium">日志 ID</TableColumn>
                            <TableColumn className="px-3 py-2 text-left font-medium">文档 ID</TableColumn>
                            <TableColumn className="px-3 py-2 text-left font-medium">审核人</TableColumn>
                            <TableColumn className="px-3 py-2 text-left font-medium">审核结果</TableColumn>
                            <TableColumn className="px-3 py-2 text-left font-medium">备注</TableColumn>
                            <TableColumn className="px-3 py-2 text-left font-medium">审核时间</TableColumn>
                          </TableHeader>
                          <TableBody
                            emptyContent={hasSelection ? '选中项暂无日志' : '请在上方表格选择文档以查看日志'}
                            isLoading={logsLoading}
                            loadingContent={<Loading height={100} text="获取审核日志中..." />}
                          >
                            {logs.map(log => (
                              <TableRow key={log.id}>
                                <TableCell className="px-3 py-2 align-top">
                                  <span className="font-mono text-[var(--text-color-secondary)] text-[10px]">{log.id}</span>
                                </TableCell>
                                <TableCell className="px-3 py-2 align-top">
                                  <span className="font-mono text-[var(--text-color-secondary)] text-[10px]">{log.docId}</span>
                                </TableCell>
                                <TableCell className="px-3 py-2 align-top">
                                  <span className="text-[var(--text-color)]">{log.reviewer}</span>
                                </TableCell>
                                <TableCell className="px-3 py-2 align-top">
                                  <Chip
                                    size="sm"
                                    variant="flat"
                                    className="text-[0.625rem]"
                                    radius="full"
                                    color={log.result === 'approved' ? 'success' : log.result === 'rejected' ? 'danger' : 'default'}
                                  >
                                    {log.result === 'approved' ? '已通过' : log.result === 'rejected' ? '已驳回' : '待审核'}
                                  </Chip>
                                </TableCell>
                                <TableCell className="px-3 py-2 align-top">
                                  <span className="text-[var(--text-color-secondary)] line-clamp-1 max-w-[200px]" title={log.remark}>
                                    {log.remark || '-'}
                                  </span>
                                </TableCell>
                                <TableCell className="px-3 py-2 align-top">
                                  <span className="text-[var(--text-color-secondary)] text-[10px]">{log.reviewedAt}</span>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </div>
                </Card>
              </>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

export default DocumentReviewPage;
