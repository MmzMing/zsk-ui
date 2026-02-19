/**
 * 文档列表数据管理 Hook
 * @module hooks/useDocumentList
 * @description 提供文档列表的数据加载、筛选、分页等功能
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  fetchDocumentList,
  batchUpdateDocumentStatus,
  deleteDocument,
  updateDocument,
  fetchDocumentComments,
  deleteDocumentComment,
  type DocumentItem,
  type DocCommentItem
} from '@/api/admin/document';
import { handleRequest } from '@/api/axios';
import { addToast } from '@heroui/react';

/** 筛选条件类型 */
export interface DocumentFilterState {
  keyword: string;
  category: string;
  status: string;
}

/** useDocumentList 配置参数 */
interface UseDocumentListOptions {
  /** 每页条数 */
  pageSize?: number;
  /** 初始筛选条件 */
  initialFilters?: DocumentFilterState;
}

/** useDocumentList 返回值 */
interface UseDocumentListReturn {
  /** 文档列表数据 */
  documents: DocumentItem[];
  /** 加载状态 */
  loading: boolean;
  /** 总条数 */
  total: number;
  /** 筛选条件 */
  filters: DocumentFilterState;
  /** 设置筛选条件 */
  setFilters: (filters: Partial<DocumentFilterState>) => void;
  /** 重置筛选条件 */
  resetFilters: () => void;
  /** 加载文档列表 */
  loadDocuments: () => Promise<void>;
  /** 批量更新状态 */
  batchUpdateStatus: (ids: string[], status: 'published' | 'offline') => Promise<boolean>;
  /** 删除文档 */
  removeDocument: (ids: string[]) => Promise<boolean>;
  /** 切换置顶状态 */
  togglePinned: (id: string, currentPinned: boolean) => Promise<boolean>;
  /** 切换推荐状态 */
  toggleRecommended: (id: string, currentRecommended: boolean) => Promise<boolean>;
  /** 置顶文档列表 */
  pinnedDocuments: DocumentItem[];
  /** 推荐文档列表 */
  recommendedDocuments: DocumentItem[];
  /** 评论相关 */
  comments: DocCommentItem[];
  commentsLoading: boolean;
  loadComments: (docId: string) => Promise<void>;
  removeComment: (commentId: string) => Promise<boolean>;
}

/** 默认筛选条件 */
const DEFAULT_FILTERS: DocumentFilterState = {
  keyword: '',
  category: 'all',
  status: 'all'
};

/**
 * 文档列表数据管理 Hook
 * @param options 配置参数
 * @returns 列表状态与操作方法
 * @example
 * ```tsx
 * const { documents, loading, filters, setFilters, loadDocuments } = useDocumentList();
 * ```
 */
export function useDocumentList(options: UseDocumentListOptions = {}): UseDocumentListReturn {
  const { pageSize = 100 } = options;

  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [filters, setFiltersState] = useState<DocumentFilterState>(DEFAULT_FILTERS);

  const [comments, setComments] = useState<DocCommentItem[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);

  /** 加载文档列表 */
  const loadDocuments = useCallback(async () => {
    setLoading(true);

    const res = await handleRequest({
      requestFn: () => fetchDocumentList({
        page: 1,
        pageSize,
        status: 'all',
        category: undefined,
        keyword: undefined
      })
    });

    if (res && res.data) {
      setDocuments(res.data.list);
      setTotal(res.data.list.length);
    }

    setLoading(false);
  }, [pageSize]);

  /** 设置筛选条件 */
  const setFilters = useCallback((newFilters: Partial<DocumentFilterState>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  }, []);

  /** 重置筛选条件 */
  const resetFilters = useCallback(() => {
    setFiltersState(DEFAULT_FILTERS);
  }, []);

  /** 批量更新状态 */
  const batchUpdateStatus = useCallback(async (ids: string[], status: 'published' | 'offline'): Promise<boolean> => {
    const actionName = status === 'published' ? '上架' : '下架';
    const confirmed = window.confirm(`确认批量${actionName}选中的 ${ids.length} 个文档吗？`);
    if (!confirmed) return false;

    const res = await handleRequest({
      requestFn: () => batchUpdateDocumentStatus({ ids, status })
    });

    if (res && res.code === 200) {
      addToast({
        title: `批量${actionName}成功`,
        description: `已成功${actionName} ${ids.length} 个文档。`,
        color: 'success'
      });
      loadDocuments();
      return true;
    }

    return false;
  }, [loadDocuments]);

  /** 删除文档 */
  const removeDocument = useCallback(async (ids: string[]): Promise<boolean> => {
    const confirmed = window.confirm(`确定要删除选中的 ${ids.length} 个文档吗？此操作不可恢复。`);
    if (!confirmed) return false;

    const res = await handleRequest({
      requestFn: () => deleteDocument(ids)
    });

    if (res && res.code === 200) {
      addToast({
        title: '批量删除成功',
        description: `已成功删除 ${ids.length} 个文档。`,
        color: 'success'
      });
      loadDocuments();
      return true;
    }

    return false;
  }, [loadDocuments]);

  /** 切换置顶状态 */
  const togglePinned = useCallback(async (id: string, currentPinned: boolean): Promise<boolean> => {
    const nextPinned = !currentPinned;

    const res = await handleRequest({
      requestFn: () => updateDocument(id, { pinned: nextPinned })
    });

    if (res && res.code === 200) {
      addToast({
        title: nextPinned ? '已设为置顶' : '已取消置顶',
        description: '操作成功。',
        color: 'success'
      });
      loadDocuments();
      return true;
    }

    return false;
  }, [loadDocuments]);

  /** 切换推荐状态 */
  const toggleRecommended = useCallback(async (id: string, currentRecommended: boolean): Promise<boolean> => {
    const nextRecommended = !currentRecommended;

    const res = await handleRequest({
      requestFn: () => updateDocument(id, { recommended: nextRecommended })
    });

    if (res && res.code === 200) {
      addToast({
        title: nextRecommended ? '已设为推荐' : '已取消推荐',
        description: '操作成功。',
        color: 'success'
      });
      loadDocuments();
      return true;
    }

    return false;
  }, [loadDocuments]);

  /** 加载评论 */
  const loadComments = useCallback(async (docId: string) => {
    setCommentsLoading(true);
    try {
      const res = await fetchDocumentComments(docId);
      if (res && res.code === 200) {
        setComments(res.data);
      }
    } finally {
      setCommentsLoading(false);
    }
  }, []);

  /** 删除评论 */
  const removeComment = useCallback(async (commentId: string): Promise<boolean> => {
    if (!window.confirm('确定要删除这条评论吗？')) return false;

    const res = await deleteDocumentComment(commentId);
    if (res && res.code === 200) {
      addToast({ title: '删除成功', description: '该评论已被移除', color: 'success' });
      return true;
    }

    return false;
  }, []);

  /** 置顶文档列表 */
  const pinnedDocuments = useMemo(
    () => documents.filter(item => item.pinned),
    [documents]
  );

  /** 推荐文档列表 */
  const recommendedDocuments = useMemo(
    () => documents.filter(item => item.recommended),
    [documents]
  );

  /** 初始化加载 */
  useEffect(() => {
    const timer = setTimeout(() => {
      loadDocuments();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadDocuments]);

  return {
    documents,
    loading,
    total,
    filters,
    setFilters,
    resetFilters,
    loadDocuments,
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
  };
}

export default useDocumentList;
