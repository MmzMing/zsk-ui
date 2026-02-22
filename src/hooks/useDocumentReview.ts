/**
 * 文档审核管理 Hook
 * @module hooks/useDocumentReview
 * @description 提供文档审核队列的数据加载、审核操作、日志管理等功能
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { addToast } from '@heroui/react';
import { PAGINATION } from '@/constants';
import {
  fetchDocumentReviewQueue,
  fetchDocumentReviewLogs,
  submitDocumentReview,
  type DocumentReviewLogItem,
  type DocumentReviewItem
} from '@/api/admin/document';
import { handleRequest } from '@/api/axios';

/** 审核状态类型 */
export type ReviewStatus = 'pending' | 'approved' | 'rejected';

/** 风险等级类型 */
export type RiskLevel = 'low' | 'medium' | 'high';

/** 审核状态映射 */
const REVIEW_STATUS_MAP: Record<ReviewStatus, { label: string; color: 'warning' | 'success' | 'danger' }> = {
  pending: { label: '待审核', color: 'warning' },
  approved: { label: '已通过', color: 'success' },
  rejected: { label: '已驳回', color: 'danger' }
};

/** 风险等级映射 */
const RISK_LEVEL_MAP: Record<RiskLevel, { label: string; color: 'default' | 'warning' | 'danger' }> = {
  low: { label: '低', color: 'default' },
  medium: { label: '中', color: 'warning' },
  high: { label: '高', color: 'danger' }
};

/**
 * 获取审核状态标签
 * @param status 审核状态
 * @returns 状态标签文本
 */
export function getReviewStatusLabel(status: ReviewStatus): string {
  return REVIEW_STATUS_MAP[status]?.label ?? '未知';
}

/**
 * 获取风险等级标签
 * @param level 风险等级
 * @returns 风险等级标签
 */
export function getRiskLevelLabel(level: RiskLevel): string {
  return RISK_LEVEL_MAP[level]?.label ?? '未知';
}

/**
 * 获取风险等级颜色
 * @param level 风险等级
 * @returns 风险等级颜色
 */
export function getRiskLevelColor(level: RiskLevel): 'default' | 'warning' | 'danger' {
  return RISK_LEVEL_MAP[level]?.color ?? 'default';
}

/** useDocumentReview 配置参数 */
interface UseDocumentReviewOptions {
  /** 每页条数 */
  pageSize?: number;
}

/** useDocumentReview 返回值 */
interface UseDocumentReviewReturn {
  /** 审核队列数据 */
  queue: DocumentReviewItem[];
  /** 加载状态 */
  loading: boolean;
  /** 总条数 */
  total: number;
  /** 当前页码 */
  page: number;
  /** 设置页码 */
  setPage: (page: number) => void;
  /** 总页数 */
  totalPages: number;
  /** 筛选条件 */
  filters: {
    status: string;
    keyword: string;
  };
  /** 设置筛选条件 */
  setFilters: (filters: Partial<{ status: string; keyword: string }>) => void;
  /** 加载审核队列 */
  loadQueue: () => Promise<void>;
  /** 更新审核状态 */
  updateStatus: (id: string, status: 'approved' | 'rejected') => Promise<boolean>;
  /** 批量通过 */
  batchApprove: (ids: string[]) => Promise<boolean>;
  /** 批量驳回 */
  batchReject: (ids: string[]) => Promise<boolean>;
  /** 审核日志 */
  logs: DocumentReviewLogItem[];
  /** 日志加载状态 */
  logsLoading: boolean;
  /** 加载日志 */
  loadLogs: (ids: string[]) => Promise<void>;
  /** 所有分类列表 */
  allCategories: string[];
  /** 工具函数 */
  getStatusLabel: (status: ReviewStatus) => string;
  getRiskLabel: (level: RiskLevel) => string;
  getRiskColor: (level: RiskLevel) => 'default' | 'warning' | 'danger';
}

/**
 * 文档审核管理 Hook
 * @param options 配置参数
 * @returns 审核状态与操作方法
 * @example
 * ```tsx
 * const { queue, loading, updateStatus, batchApprove } = useDocumentReview();
 * ```
 */
export function useDocumentReview(options: UseDocumentReviewOptions = {}): UseDocumentReviewReturn {
  const { pageSize = PAGINATION.DEFAULT_PAGE_SIZE } = options;

  const [queue, setQueue] = useState<DocumentReviewItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFiltersState] = useState({ status: 'all', keyword: '' });

  const [logs, setLogs] = useState<DocumentReviewLogItem[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  /** 总页数 */
  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

  /** 所有分类列表 */
  const allCategories = useMemo(
    () => Array.from(new Set(queue.map(item => item.category))),
    [queue]
  );

  /** 加载审核队列 */
  const loadQueue = useCallback(async () => {
    setLoading(true);

    const res = await handleRequest({
      requestFn: () => fetchDocumentReviewQueue({
        page,
        pageSize,
        status: filters.status === 'all' ? undefined : filters.status as ReviewStatus,
        keyword: filters.keyword.trim() || undefined
      }),
      setLoading
    });

    if (res && res.data) {
      setQueue(res.data.rows);
      setTotal(res.data.total);
    }
  }, [page, pageSize, filters.status, filters.keyword]);

  /** 加载日志 */
  const loadLogs = useCallback(async (ids: string[]) => {
    if (ids.length === 0) {
      setLogs([]);
      return;
    }

    setLogsLoading(true);

    const res = await handleRequest({
      requestFn: () => fetchDocumentReviewLogs({ docIds: ids }),
      setLoading: setLogsLoading
    });

    if (res && res.data) {
      setLogs(res.data);
    }
  }, []);

  /** 更新审核状态 */
  const updateStatus = useCallback(async (id: string, status: 'approved' | 'rejected'): Promise<boolean> => {
    const auditStatus = status === 'approved' ? 1 : 2;
    const res = await handleRequest({
      requestFn: () => submitDocumentReview({ reviewId: id, auditStatus })
    });

    if (res && res.code === 200) {
      addToast({
        title: '审核操作成功',
        description: `文档 [${id}] 已标记为 ${getReviewStatusLabel(status)}`,
        color: 'success'
      });

      setQueue(prev => prev.map(item =>
        item.id === id ? { ...item, status } : item
      ));

      return true;
    }

    return false;
  }, []);

  /** 批量通过 */
  const batchApprove = useCallback(async (ids: string[]): Promise<boolean> => {
    if (ids.length === 0) return false;

    const confirmed = window.confirm(`确定要批量通过选中的 ${ids.length} 个文档审核吗？`);
    if (!confirmed) return false;

    const results = await Promise.all(
      ids.map(id =>
        handleRequest({
          requestFn: () => submitDocumentReview({ reviewId: id, auditStatus: 1 })
        })
      )
    );

    const successCount = results.filter(res => res && res.code === 200).length;
    if (successCount > 0) {
      addToast({
        title: '批量审核成功',
        description: `成功通过 ${successCount} 个文档审核任务。`,
        color: 'success'
      });

      setQueue(prev => prev.map(item =>
        ids.includes(item.id) ? { ...item, status: 'approved' } : item
      ));

      loadLogs(ids);
      return true;
    }

    return false;
  }, [loadLogs]);

  /** 批量驳回 */
  const batchReject = useCallback(async (ids: string[]): Promise<boolean> => {
    if (ids.length === 0) return false;

    const confirmed = window.confirm(`确定要批量驳回选中的 ${ids.length} 个文档审核吗？`);
    if (!confirmed) return false;

    const results = await Promise.all(
      ids.map(id =>
        handleRequest({
          requestFn: () => submitDocumentReview({ reviewId: id, auditStatus: 2 })
        })
      )
    );

    const successCount = results.filter(res => res && res.code === 200).length;
    if (successCount > 0) {
      addToast({
        title: '批量审核成功',
        description: `成功驳回 ${successCount} 个文档审核任务。`,
        color: 'success'
      });

      setQueue(prev => prev.map(item =>
        ids.includes(item.id) ? { ...item, status: 'rejected' } : item
      ));

      loadLogs(ids);
      return true;
    }

    return false;
  }, [loadLogs]);

  /** 设置筛选条件 */
  const setFilters = useCallback((newFilters: Partial<{ status: string; keyword: string }>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
    setPage(1);
  }, []);

  /** 初始化加载 */
  useEffect(() => {
    const timer = setTimeout(() => {
      loadQueue();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadQueue]);

  return {
    queue,
    loading,
    total,
    page,
    setPage,
    totalPages,
    filters,
    setFilters,
    loadQueue,
    updateStatus,
    batchApprove,
    batchReject,
    logs,
    logsLoading,
    loadLogs,
    allCategories,
    getStatusLabel: getReviewStatusLabel,
    getRiskLabel: getRiskLevelLabel,
    getRiskColor: getRiskLevelColor
  };
}

export default useDocumentReview;
