/**
 * 表格筛选管理 Hook
 * @module hooks/useTableFilter
 * @description 提供表格筛选状态管理，支持关键词搜索、多条件筛选、重置等功能
 */

import { useState, useCallback } from "react";

/**
 * 筛选字段类型
 */
type FilterValue = string | number | boolean | undefined | null;

/**
 * 筛选状态类型
 */
type FilterState = Record<string, FilterValue>;

/**
 * 表格筛选配置参数
 */
interface UseTableFilterOptions<T extends FilterState> {
  /** 初始筛选状态 */
  initialFilters?: T;
  /** 筛选回调函数 */
  onFilterChange?: (filters: T) => void;
}

/**
 * 表格筛选返回值
 */
interface UseTableFilterReturn<T extends FilterState> {
  /** 当前筛选状态 */
  filters: T;
  /** 设置筛选状态 */
  setFilters: (filters: T | ((prev: T) => T)) => void;
  /** 设置单个筛选字段 */
  setFilter: <K extends keyof T>(key: K, value: T[K]) => void;
  /** 重置筛选条件 */
  resetFilters: () => void;
  /** 重置筛选并返回第一页 */
  resetFiltersAndPage: () => void;
  /** 关键词搜索值 */
  keyword: string;
  /** 设置关键词 */
  setKeyword: (keyword: string) => void;
  /**
   * 过滤数据
   * @param data 原始数据
   * @param filterFn 自定义过滤函数
   */
  filterData: <D>(data: D[], filterFn: (item: D, filters: T) => boolean) => D[];
}

/**
 * 表格筛选管理 Hook
 * @param options 筛选配置参数
 * @returns 筛选状态与操作方法
 * @example
 * ```tsx
 * type MyFilters = { status: string; category: string };
 * 
 * const { filters, setFilter, resetFilters, filterData } = useTableFilter<MyFilters>({
 *   initialFilters: { status: 'all', category: 'all' }
 * });
 * 
 * const filteredItems = filterData(items, (item, filters) => {
 *   if (filters.status !== 'all' && item.status !== filters.status) return false;
 *   return true;
 * });
 * ```
 */
function useTableFilter<T extends FilterState>(
  options: UseTableFilterOptions<T> = {}
): UseTableFilterReturn<T> {
  const { initialFilters, onFilterChange } = options;

  const [filters, setFiltersState] = useState<T>(initialFilters ?? ({} as T));
  const [keyword, setKeywordState] = useState("");

  const setFilters = useCallback(
    (newFilters: T | ((prev: T) => T)) => {
      setFiltersState((prev) => {
        const next = typeof newFilters === "function" ? newFilters(prev) : newFilters;
        onFilterChange?.(next);
        return next;
      });
    },
    [onFilterChange]
  );

  const setFilter = useCallback(
    <K extends keyof T>(key: K, value: T[K]) => {
      setFiltersState((prev) => {
        const next = { ...prev, [key]: value };
        onFilterChange?.(next);
        return next;
      });
    },
    [onFilterChange]
  );

  const resetFilters = useCallback(() => {
    const resetState = initialFilters ?? ({} as T);
    setFiltersState(resetState);
    setKeywordState("");
    onFilterChange?.(resetState);
  }, [initialFilters, onFilterChange]);

  const resetFiltersAndPage = useCallback(() => {
    resetFilters();
  }, [resetFilters]);

  const setKeyword = useCallback((value: string) => {
    setKeywordState(value);
  }, []);

  const filterData = useCallback(
    <D,>(data: D[], filterFn: (item: D, filters: T) => boolean): D[] => {
      return data.filter((item) => filterFn(item, filters));
    },
    [filters]
  );

  return {
    filters,
    setFilters,
    setFilter,
    resetFilters,
    resetFiltersAndPage,
    keyword,
    setKeyword,
    filterData,
  };
}

export default useTableFilter;
export type { UseTableFilterOptions, UseTableFilterReturn, FilterState, FilterValue };
