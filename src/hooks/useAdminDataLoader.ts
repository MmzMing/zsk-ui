import { useState, useCallback, useRef, useEffect } from 'react';
import { addToast } from '@heroui/react';

/**
 * 管理后台数据加载 Hook
 * 用于处理数据加载、错误处理和加载状态管理
 */
export function useAdminDataLoader<T = unknown>() {
  /** 加载状态 */
  const [loading, setLoading] = useState(false);
  /** 数据状态 */
  const [data, setData] = useState<T | null>(null);
  /** 错误状态 */
  const [error, setError] = useState<Error | null>(null);
  /** 取消令牌引用 */
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * 加载数据
   * @param requestFn 请求函数
   * @param options 选项
   */
  const loadData = useCallback(async (
    requestFn: () => Promise<T>,
    options: {
      onSuccess?: (data: T) => void;
      onError?: (error: Error) => void;
      showErrorToast?: boolean;
      errorMessage?: string;
    } = {}
  ) => {
    // 取消之前的请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // 创建新的取消令牌
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const result = await requestFn();
      setData(result);
      
      if (options.onSuccess) {
        options.onSuccess(result);
      }

      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('未知错误');
      setError(error);

      if (options.onError) {
        options.onError(error);
      }

      if (options.showErrorToast) {
        addToast({
          title: '操作失败',
          description: options.errorMessage || error.message,
          color: 'danger'
        });
      }

      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 加载多个数据
   * @param requestFns 请求函数数组
   * @param options 选项
   */
  const loadMultipleData = useCallback(async <T extends unknown[]>(
    requestFns: Array<() => Promise<unknown>>,
    options: {
      onSuccess?: (results: T) => void;
      onError?: (errors: Array<Error | null>) => void;
      showErrorToast?: boolean;
    } = {}
  ) => {
    setLoading(true);
    setError(null);

    try {
      const results = await Promise.allSettled(requestFns);
      
      const dataResults = results.map(result => 
        result.status === 'fulfilled' ? result.value : null
      ) as T;
      
      const errors = results.map(result => 
        result.status === 'rejected' ? (result.reason instanceof Error ? result.reason : new Error('未知错误')) : null
      );

      if (options.onSuccess) {
        options.onSuccess(dataResults);
      }

      if (options.onError && errors.some(err => err)) {
        options.onError(errors);
      }

      return dataResults;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('未知错误');
      setError(error);

      if (options.onError) {
        options.onError([error]);
      }

      if (options.showErrorToast) {
        addToast({
          title: '加载失败',
          description: error.message,
          color: 'danger'
        });
      }

      return [] as unknown as T;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 重置状态
   */
  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  /**
   * 清理函数
   */
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    loading,
    data,
    error,
    loadData,
    loadMultipleData,
    reset
  };
}
