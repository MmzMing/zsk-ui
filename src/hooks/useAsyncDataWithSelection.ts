/**
 * 带选择的异步数据加载 Hook
 * @module hooks/useAsyncDataWithSelection
 * @description 结合异步数据加载和选择功能
 */

import { useState, useEffect, useCallback, useMemo } from "react";

/**
 * 带选择的异步数据配置参数
 */
interface UseAsyncDataWithSelectionOptions {
  /** 加载延迟 */
  delay?: number;
  /** 是否立即加载 */
  immediate?: boolean;
  /** 初始选中项ID */
  initialSelectedId?: string;
}

/**
 * 带选择的异步数据返回值
 */
interface UseAsyncDataWithSelectionReturn<T> {
  /** 数据列表 */
  list: T[];
  /** 当前选中项 */
  selected: T | null;
  /** 是否正在加载 */
  loading: boolean;
  /** 错误信息 */
  error: Error | null;
  /** 选中指定项 */
  select: (id: string) => void;
  /** 刷新数据 */
  refresh: () => Promise<void>;
}

/**
 * 带选择的异步数据加载 Hook
 * @param fetchFn 数据获取函数
 * @param options 配置选项
 * @returns 数据状态与操作方法
 */
export function useAsyncDataWithSelection<T extends { id: string }>(
  fetchFn: () => Promise<T[]>,
  options: UseAsyncDataWithSelectionOptions = {}
): UseAsyncDataWithSelectionReturn<T> {
  const { delay = 0, immediate = true, initialSelectedId } = options;

  const [list, setList] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedId ?? null);

  const selected = useMemo<T | null>(() => {
    if (!selectedId) return list[0] ?? null;
    return list.find(item => item.id === selectedId) ?? list[0] ?? null;
  }, [list, selectedId]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      const result = await fetchFn();
      setList(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [fetchFn, delay]);

  useEffect(() => {
    if (immediate) {
      loadData();
    }
  }, [immediate, loadData]);

  const select = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  return {
    list,
    selected,
    loading,
    error,
    select,
    refresh: loadData
  };
}

export default useAsyncDataWithSelection;
