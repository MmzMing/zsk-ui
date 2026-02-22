/**
 * 数据请求 Hook
 * 提供数据请求的状态管理、自动请求、分页请求等功能
 *
 * @module hooks/useRequest
 * @author wuhuaming
 * @date 2026-02-18
 * @version 1.0
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { logger } from "@/utils/logger";
import { PAGINATION } from "@/constants";

/**
 * useRequest 配置选项接口
 * 定义请求行为的配置参数
 */
export interface UseRequestOptions<T> {
  /** 是否立即执行请求，默认为false */
  immediate?: boolean;
  /** 初始数据 */
  initialData?: T;
  /** 请求成功回调 */
  onSuccess?: (data: T) => void;
  /** 请求失败回调 */
  onError?: (error: Error) => void;
  /** 依赖项数组，变化时重新执行请求 */
  deps?: unknown[];
}

/**
 * useRequest Hook 返回值接口
 * 提供请求状态和操作方法
 */
export interface UseRequestReturn<T, P extends unknown[] = unknown[]> {
  /** 请求返回的数据 */
  data: T | undefined;
  /** 当前加载状态 */
  loading: boolean;
  /** 错误信息 */
  error: Error | null;
  /** 手动执行请求 */
  run: (...args: P) => Promise<T | undefined>;
  /** 刷新请求（使用上次的参数重新执行） */
  refresh: () => Promise<T | undefined>;
  /** 手动修改数据 */
  mutate: (data: T | ((prev: T | undefined) => T)) => void;
  /** 重置状态 */
  reset: () => void;
}

/**
 * 数据请求 Hook
 * 封装数据请求的加载状态、错误处理和缓存管理
 *
 * @param service 请求函数，返回Promise
 * @param options 配置选项
 * @returns 请求状态和操作方法
 * @example
 * const { data, loading, error, run } = useRequest(
 *   (id: string) => fetchUserInfo(id),
 *   { immediate: true }
 * );
 */
export const useRequest = <T, P extends unknown[] = []>(
  service: (...args: P) => Promise<T>,
  options: UseRequestOptions<T> = {}
): UseRequestReturn<T, P> => {
  const {
    immediate = false,
    initialData,
    onSuccess,
    onError,
    deps = [],
  } = options;

  const [data, setData] = useState<T | undefined>(initialData);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState<Error | null>(null);

  /** 使用ref存储最新的回调函数，避免闭包问题 */
  const serviceRef = useRef(service);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    serviceRef.current = service;
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
  });

  /**
   * 执行请求
   * 自动管理加载状态、错误处理和回调触发
   *
   * @param args 请求参数
   * @returns 请求结果
   */
  const run = useCallback(
    async (...args: P): Promise<T | undefined> => {
      setLoading(true);
      setError(null);

      try {
        const result = await serviceRef.current(...args);
        setData(result);
        onSuccessRef.current?.(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        onErrorRef.current?.(error);
        logger.error("请求失败:", error.message);
        return undefined;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * 刷新请求
   * 使用空参数重新执行请求
   *
   * @returns 请求结果
   */
  const refresh = useCallback(async (): Promise<T | undefined> => {
    return run(...([] as unknown as P));
  }, [run]);

  /**
   * 手动修改数据
   * 支持直接设置新值或通过函数计算新值
   *
   * @param newData 新数据或计算函数
   */
  const mutate = useCallback(
    (newData: T | ((prev: T | undefined) => T)) => {
      if (typeof newData === "function") {
        setData((prev) => (newData as (prev: T | undefined) => T)(prev));
      } else {
        setData(newData);
      }
    },
    []
  );

  /** 重置所有状态为初始值 */
  const reset = useCallback(() => {
    setData(initialData);
    setLoading(false);
    setError(null);
  }, [initialData]);

  useEffect(() => {
    if (immediate) {
      run(...([] as unknown as P));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [immediate, run, ...deps]);

  return {
    data,
    loading,
    error,
    run,
    refresh,
    mutate,
    reset,
  };
};

/**
 * usePagination 配置选项接口
 * 定义分页请求行为的配置参数
 */
export interface UsePaginationOptions<T> {
  /** 每页数据条数，默认使用 PAGINATION.DEFAULT_PAGE_SIZE */
  pageSize?: number;
  /** 是否立即执行请求，默认为false */
  immediate?: boolean;
  /** 初始数据 */
  initialData?: T[];
  /** 请求成功回调 */
  onSuccess?: (data: T[], total: number) => void;
  /** 请求失败回调 */
  onError?: (error: Error) => void;
}

/**
 * usePagination Hook 返回值接口
 * 提供分页请求状态和操作方法
 */
export interface UsePaginationReturn<T, P = Record<string, unknown>> {
  /** 分页数据列表 */
  data: T[];
  /** 当前加载状态 */
  loading: boolean;
  /** 错误信息 */
  error: Error | null;
  /** 当前页码 */
  page: number;
  /** 每页数据条数 */
  pageSize: number;
  /** 数据总条数 */
  total: number;
  /** 执行分页请求 */
  run: (params?: P) => Promise<void>;
  /** 刷新请求（重置到第一页） */
  refresh: () => Promise<void>;
  /** 设置当前页码 */
  setPage: (page: number) => void;
  /** 设置每页数据条数 */
  setPageSize: (size: number) => void;
  /** 重置状态 */
  reset: () => void;
  /** 是否还有更多数据 */
  hasMore: boolean;
}

/**
 * 分页请求 Hook
 * 封装分页数据请求的状态管理和分页操作
 *
 * @param service 分页请求函数，接收页码、每页条数和额外参数
 * @param options 配置选项
 * @returns 分页请求状态和操作方法
 * @example
 * const { data, loading, page, total, setPage, run } = usePagination(
 *   (page, pageSize, params) => fetchUserList(page, pageSize, params),
 *   { pageSize: 10, immediate: true }
 * );
 */
export const usePagination = <T, P = Record<string, unknown>>(
  service: (page: number, pageSize: number, params?: P) => Promise<{ list: T[]; total: number }>,
  options: UsePaginationOptions<T> = {}
): UsePaginationReturn<T, P> => {
  const { pageSize: defaultPageSize = PAGINATION.DEFAULT_PAGE_SIZE, immediate = false, initialData = [], onSuccess, onError } = options;

  const [data, setData] = useState<T[]>(initialData);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [total, setTotal] = useState(0);

  /** 使用ref存储最新的回调函数，避免闭包问题 */
  const serviceRef = useRef(service);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    serviceRef.current = service;
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
  });

  /**
   * 执行分页请求
   * 自动管理加载状态和错误处理
   *
   * @param params 额外的请求参数
   */
  const run = useCallback(
    async (params?: P) => {
      setLoading(true);
      setError(null);

      try {
        const result = await serviceRef.current(page, pageSize, params);
        setData(result.list);
        setTotal(result.total);
        onSuccessRef.current?.(result.list, result.total);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        onErrorRef.current?.(error);
        logger.error("分页请求失败:", error.message);
      } finally {
        setLoading(false);
      }
    },
    [page, pageSize]
  );

  /**
   * 刷新请求
   * 重置到第一页并重新请求数据
   */
  const refresh = useCallback(async () => {
    setPage(1);
  }, []);

  useEffect(() => {
    if (immediate || page > 1) {
      run();
    }
  }, [page, pageSize, immediate, run]);

  /** 重置所有状态为初始值 */
  const reset = useCallback(() => {
    setData(initialData);
    setLoading(false);
    setError(null);
    setPage(1);
    setTotal(0);
  }, [initialData]);

  /** 计算是否还有更多数据 */
  const hasMore = data.length < total;

  return {
    data,
    loading,
    error,
    page,
    pageSize,
    total,
    run,
    refresh,
    setPage,
    setPageSize,
    reset,
    hasMore,
  };
};

export default useRequest;
