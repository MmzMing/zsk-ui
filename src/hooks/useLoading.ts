/**
 * 加载状态管理 Hook
 * 提供加载状态的管理和异步操作包装功能
 *
 * @module hooks/useLoading
 * @author wuhuaming
 * @date 2026-02-18
 * @version 1.0
 */

import { useState, useCallback } from "react";

/**
 * useLoading Hook 返回值接口
 * 提供加载状态和操作方法
 */
export interface UseLoadingReturn {
  /** 当前加载状态 */
  loading: boolean;
  /** 设置加载状态 */
  setLoading: (value: boolean) => void;
  /** 开始加载（设置loading为true） */
  startLoading: () => void;
  /** 停止加载（设置loading为false） */
  stopLoading: () => void;
  /**
   * 包装异步函数，自动管理加载状态
   * @param fn 需要执行的异步函数
   * @returns 异步函数的执行结果
   */
  withLoading: <T>(fn: () => Promise<T>) => Promise<T>;
}

/**
 * 加载状态管理 Hook
 * 用于管理组件中的加载状态，支持手动控制和自动包装异步操作
 *
 * @param initialState 初始加载状态，默认为false
 * @returns 加载状态和操作方法
 * @example
 * const { loading, startLoading, stopLoading, withLoading } = useLoading();
 *
 * // 手动控制
 * startLoading();
 * await fetchData();
 * stopLoading();
 *
 * // 自动包装
 * await withLoading(async () => {
 *   await fetchData();
 * });
 */
export const useLoading = (initialState: boolean = false): UseLoadingReturn => {
  const [loading, setLoading] = useState(initialState);

  /** 开始加载，设置loading为true */
  const startLoading = useCallback(() => setLoading(true), []);
  /** 停止加载，设置loading为false */
  const stopLoading = useCallback(() => setLoading(false), []);

  /**
   * 包装异步函数
   * 自动在执行前开始加载，执行后停止加载
   *
   * @param fn 需要执行的异步函数
   * @returns 异步函数的执行结果
   */
  const withLoading = useCallback(
    async <T>(fn: () => Promise<T>): Promise<T> => {
      setLoading(true);
      try {
        return await fn();
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    setLoading,
    startLoading,
    stopLoading,
    withLoading,
  };
};

/**
 * useAsyncLoading Hook 返回值接口
 * 提供异步数据加载的状态和方法
 */
export interface UseAsyncLoadingReturn<T> {
  /** 异步操作返回的数据 */
  data: T | null;
  /** 当前加载状态 */
  loading: boolean;
  /** 错误信息 */
  error: Error | null;
  /** 执行异步操作 */
  execute: () => Promise<void>;
  /** 重置状态 */
  reset: () => void;
}

/**
 * 异步加载 Hook
 * 封装异步操作的加载状态、数据和错误管理
 *
 * @param asyncFn 需要执行的异步函数
 * @param immediate 是否立即执行，默认为false
 * @returns 异步加载状态和操作方法
 * @example
 * const { data, loading, error, execute } = useAsyncLoading(
 *   () => fetchUserInfo(userId),
 *   true // 立即执行
 * );
 */
export const useAsyncLoading = <T>(
  asyncFn: () => Promise<T>,
  immediate: boolean = false
): UseAsyncLoadingReturn<T> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState<Error | null>(null);

  /**
   * 执行异步操作
   * 自动管理加载状态和错误处理
   */
  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await asyncFn();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [asyncFn]);

  /** 重置所有状态为初始值 */
  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset,
  };
};

export default useLoading;
