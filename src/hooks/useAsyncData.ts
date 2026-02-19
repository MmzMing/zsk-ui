/**
 * 异步数据加载 Hook
 * @module hooks/useAsyncData
 * @description 提供异步数据加载状态管理，支持加载状态、错误处理、数据刷新等功能
 */

import { useState, useCallback, useEffect, useRef } from "react";

/**
 * 异步数据配置参数
 */
interface UseAsyncDataOptions<T> {
  /** 数据获取函数 */
  fetchFn: () => Promise<{ data: T; total?: number }>;
  /** 是否立即执行，默认为 true */
  immediate?: boolean;
  /** 初始数据 */
  initialData?: T;
  /** 初始总数 */
  initialTotal?: number;
  /** 成功回调 */
  onSuccess?: (data: T, total?: number) => void;
  /** 错误回调 */
  onError?: (error: Error) => void;
}

/**
 * 异步数据返回值
 */
interface UseAsyncDataReturn<T> {
  /** 数据 */
  data: T;
  /** 设置数据 */
  setData: (data: T | ((prev: T) => T)) => void;
  /** 总数 */
  total: number;
  /** 设置总数 */
  setTotal: (total: number) => void;
  /** 是否正在加载 */
  isLoading: boolean;
  /** 设置加载状态 */
  setIsLoading: (loading: boolean) => void;
  /** 错误信息 */
  error: Error | null;
  /** 刷新数据 */
  refresh: () => Promise<void>;
  /** 重置状态 */
  reset: () => void;
}

/**
 * 异步数据加载 Hook
 * @param options 异步数据配置参数
 * @returns 异步数据状态与操作方法
 * @example
 * ```tsx
 * const { data, isLoading, refresh } = useAsyncData<User[]>({
 *   fetchFn: () => fetchUserList({ page: 1, pageSize: 10 }),
 *   immediate: true,
 *   onSuccess: (data) => console.log('加载成功', data)
 * });
 * ```
 */
function useAsyncData<T>(
  options: UseAsyncDataOptions<T>
): UseAsyncDataReturn<T> {
  const {
    fetchFn,
    immediate = true,
    initialData,
    initialTotal = 0,
    onSuccess,
    onError,
  } = options;

  const [data, setDataState] = useState<T>(initialData as T);
  const [total, setTotal] = useState(initialTotal);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mountedRef = useRef(true);

  const setData = useCallback((newData: T | ((prev: T) => T)) => {
    setDataState((prev) => {
      const next = typeof newData === "function" ? (newData as (prev: T) => T)(prev) : newData;
      return next;
    });
  }, []);

  const refresh = useCallback(async () => {
    if (!mountedRef.current) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchFn();
      if (!mountedRef.current) return;

      setDataState(result.data);
      if (result.total !== undefined) {
        setTotal(result.total);
      }
      onSuccess?.(result.data, result.total);
    } catch (err) {
      if (!mountedRef.current) return;

      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      onError?.(error);
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [fetchFn, onSuccess, onError]);

  const reset = useCallback(() => {
    setDataState(initialData as T);
    setTotal(initialTotal);
    setError(null);
    setIsLoading(false);
  }, [initialData, initialTotal]);

  useEffect(() => {
    mountedRef.current = true;

    if (immediate) {
      const timer = setTimeout(() => {
        refresh();
      }, 0);
      return () => {
        clearTimeout(timer);
      };
    }

    return () => {
      mountedRef.current = false;
    };
  }, [immediate, refresh]);

  return {
    data,
    setData,
    total,
    setTotal,
    isLoading,
    setIsLoading,
    error,
    refresh,
    reset,
  };
}

export default useAsyncData;
export type { UseAsyncDataOptions, UseAsyncDataReturn };
