/**
 * 分页状态管理 Hook
 * @module hooks/usePageState
 * @description 提供分页状态管理与计算逻辑，支持页码切换、总页数计算等功能
 */

import { useState, useMemo, useCallback } from "react";
import { PAGINATION } from "@/constants";

/**
 * 分页配置参数
 */
interface UsePageStateOptions {
  /** 初始页码，默认为 1 */
  initialPage?: number;
  /** 每页条数，默认为 10 */
  pageSize?: number;
}

/**
 * 分页返回值
 */
interface UsePageStateReturn {
  /** 当前页码 */
  page: number;
  /** 每页条数 */
  pageSize: number;
  /** 设置当前页码 */
  setPage: (page: number) => void;
  /** 设置每页条数 */
  setPageSize: (size: number) => void;
  /** 总条数 */
  total: number;
  /** 设置总条数 */
  setTotal: (total: number) => void;
  /** 总页数 */
  totalPages: number;
  /** 重置到第一页 */
  resetPage: () => void;
  /**
   * 处理页码变更
   * @param next 目标页码
   */
  handlePageChange: (next: number) => void;
  /**
   * 计算分页数据切片
   * @param data 原始数据数组
   * @returns 当前页的数据切片
   */
  getPaginatedData: <T>(data: T[]) => T[];
}

/**
 * 分页状态管理 Hook
 * @param options 分页配置参数
 * @returns 分页状态与操作方法
 * @example
 * ```tsx
 * const { page, pageSize, totalPages, handlePageChange, getPaginatedData } = usePageState();
 * const pageItems = getPaginatedData(filteredItems);
 * ```
 */
function usePageState(options: UsePageStateOptions = {}): UsePageStateReturn {
  const { initialPage = PAGINATION.DEFAULT_PAGE, pageSize: defaultPageSize = PAGINATION.DEFAULT_PAGE_SIZE } = options;

  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [total, setTotal] = useState(0);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

  const handlePageChange = useCallback(
    (next: number) => {
      if (next < 1 || next > totalPages) return;
      setPage(next);
    },
    [totalPages]
  );

  const resetPage = useCallback(() => {
    setPage(1);
  }, []);

  const getPaginatedData = useCallback(
    <T,>(data: T[]): T[] => {
      const startIndex = (page - 1) * pageSize;
      return data.slice(startIndex, startIndex + pageSize);
    },
    [page, pageSize]
  );

  return {
    page,
    pageSize,
    setPage,
    setPageSize,
    total,
    setTotal,
    totalPages,
    resetPage,
    handlePageChange,
    getPaginatedData,
  };
}

export default usePageState;
export type { UsePageStateOptions, UsePageStateReturn };
