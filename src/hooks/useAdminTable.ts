import { useState, useCallback, useMemo } from 'react';
import { addToast } from '@heroui/react';

/**
 * 管理后台表格 Hook
 * 用于处理表格数据、分页、搜索、筛选和选择操作
 */
export function useAdminTable<T extends { id: string | number }>({
  initialPageSize = 10,
  initialPage = 1
} = {}) {
  /** 表格数据 */
  const [data, setData] = useState<T[]>([]);
  /** 加载状态 */
  const [loading, setLoading] = useState(false);
  /** 分页状态 */
  const [page, setPage] = useState(initialPage);
  /** 每页大小 */
  const [pageSize, setPageSize] = useState(initialPageSize);
  /** 搜索关键词 */
  const [keyword, setKeyword] = useState('');
  /** 选中的行 */
  const [selectedKeys, setSelectedKeys] = useState<Set<string | number>>(new Set());
  /** 筛选条件 */
  const [filters, setFilters] = useState<Record<string, unknown>>({});

  /**
   * 总数据量
   */
  const total = useMemo(() => data.length, [data]);

  /**
   * 总页数
   */
  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(total / pageSize));
  }, [total, pageSize]);

  /**
   * 当前页数据
   */
  const currentPageData = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return data.slice(startIndex, endIndex);
  }, [data, page, pageSize]);

  /**
   * 是否有选中项
   */
  const hasSelection = useMemo(() => {
    return selectedKeys.size > 0;
  }, [selectedKeys]);

  /**
   * 选中的项数量
   */
  const selectionCount = useMemo(() => {
    return selectedKeys.size;
  }, [selectedKeys]);

  /**
   * 处理搜索
   * @param value 搜索关键词
   */
  const handleSearch = useCallback((value: string) => {
    setKeyword(value);
    setPage(1);
    setSelectedKeys(new Set());
  }, []);

  /**
   * 处理筛选
   * @param newFilters 新的筛选条件
   */
  const handleFilter = useCallback((newFilters: Record<string, unknown>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPage(1);
    setSelectedKeys(new Set());
  }, []);

  /**
   * 重置筛选
   */
  const resetFilters = useCallback(() => {
    setFilters({});
    setKeyword('');
    setPage(1);
    setSelectedKeys(new Set());
  }, []);

  /**
   * 处理分页变化
   * @param newPage 新页码
   */
  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
    setSelectedKeys(new Set());
  }, []);

  /**
   * 处理每页大小变化
   * @param newPageSize 新的每页大小
   */
  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1);
    setSelectedKeys(new Set());
  }, []);

  /**
   * 处理选择变化
   * @param keys 选中的键
   */
  const handleSelectionChange = useCallback((keys: 'all' | Set<string | number>) => {
    if (keys === 'all') {
      setSelectedKeys(new Set(data.map(item => item.id)));
    } else {
      setSelectedKeys(keys);
    }
  }, [data]);

  /**
   * 清除选择
   */
  const clearSelection = useCallback(() => {
    setSelectedKeys(new Set());
  }, []);

  /**
   * 获取选中的项
   */
  const getSelectedItems = useCallback(() => {
    return data.filter(item => selectedKeys.has(item.id));
  }, [data, selectedKeys]);

  /**
   * 获取选中的 ID 列表
   */
  const getSelectedIds = useCallback(() => {
    return Array.from(selectedKeys);
  }, [selectedKeys]);

  /**
   * 加载数据
   * @param fetchFn 获取数据的函数
   */
  const loadData = useCallback(async (
    fetchFn: () => Promise<T[]>
  ) => {
    setLoading(true);
    try {
      const result = await fetchFn();
      setData(result);
      setPage(1);
      setSelectedKeys(new Set());
      return result;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('加载数据失败');
      addToast({
        title: '加载失败',
        description: err.message,
        color: 'danger'
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 刷新数据
   * @param fetchFn 获取数据的函数
   */
  const refreshData = useCallback((fetchFn: () => Promise<T[]>) => {
    return loadData(fetchFn);
  }, [loadData]);

  return {
    // 数据状态
    data,
    loading,
    page,
    pageSize,
    keyword,
    filters,
    selectedKeys,
    
    // 计算属性
    total,
    totalPages,
    currentPageData,
    hasSelection,
    selectionCount,
    
    // 操作方法
    setData,
    setLoading,
    setKeyword,
    setFilters,
    handleSearch,
    handleFilter,
    resetFilters,
    handlePageChange,
    handlePageSizeChange,
    handleSelectionChange,
    clearSelection,
    getSelectedItems,
    getSelectedIds,
    loadData,
    refreshData
  };
}
