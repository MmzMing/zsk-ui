/**
 * 异步列表加载 Hook
 * @module hooks/useAsyncList
 * @description 提供异步列表数据加载功能
 */

import { useState, useEffect, useCallback } from "react";

/**
 * 异步列表配置参数
 */
interface UseAsyncListOptions {
  /** 加载延迟（毫秒） */
  delay?: number;
  /** 是否立即加载 */
  immediate?: boolean;
}

/**
 * 异步列表返回值
 */
interface UseAsyncListReturn<T> {
  /** 列表数据 */
  list: T[];
  /** 是否正在加载 */
  loading: boolean;
  /** 错误信息 */
  error: Error | null;
  /** 刷新数据 */
  refresh: () => Promise<void>;
}

/**
 * 异步列表加载 Hook
 * @param fetchFn 数据获取函数
 * @param options 配置选项
 * @returns 列表状态与操作方法
 */
export function useAsyncList<T>(
  fetchFn: () => Promise<T[]>,
  options: UseAsyncListOptions = {}
): UseAsyncListReturn<T> {
  const { delay = 0, immediate = true } = options;

  const [list, setList] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadList = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      const data = await fetchFn();
      setList(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [fetchFn, delay]);

  useEffect(() => {
    if (immediate) {
      loadList();
    }
  }, [immediate, loadList]);

  return {
    list,
    loading,
    error,
    refresh: loadList
  };
}

export default useAsyncList;
