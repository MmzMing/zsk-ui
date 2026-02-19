/**
 * 错误处理工具函数
 */
import { addToast } from '@heroui/react';

/**
 * 错误类型
 */
export type AppError = {
  message: string;
  code?: string;
  details?: unknown;
};

/**
 * 处理错误
 * @param error 错误对象
 * @param options 选项
 * @returns 标准化的错误对象
 */
export function handleError(
  error: unknown,
  options: {
    showToast?: boolean;
    errorMessage?: string;
    onError?: (error: AppError) => void;
  } = {}
): AppError {
  let appError: AppError;

  if (error instanceof Error) {
    appError = {
      message: error.message,
      details: error.stack
    };
  } else if (typeof error === 'string') {
    appError = {
      message: error
    };
  } else if (error && typeof error === 'object' && 'message' in error) {
    appError = {
      message: String(error.message),
      code: 'code' in error ? String(error.code) : undefined,
      details: error
    };
  } else {
    appError = {
      message: '未知错误'
    };
  }

  // 显示错误提示
  if (options.showToast) {
    addToast({
      title: '操作失败',
      description: options.errorMessage || appError.message,
      color: 'danger'
    });
  }

  // 回调处理
  if (options.onError) {
    options.onError(appError);
  }

  return appError;
}

/**
 * 处理API错误
 * @param error API错误
 * @param defaultMessage 默认错误消息
 * @returns 错误消息
 */
export function handleApiError(error: unknown, defaultMessage: string = '请求失败'): string {
  const errorObj = error as Record<string, unknown>;
  
  if (errorObj?.response && typeof errorObj.response === 'object') {
    const response = errorObj.response as Record<string, unknown>;
    if (response?.data && typeof response.data === 'object') {
      const data = response.data as Record<string, unknown>;
      if (typeof data.message === 'string') {
        return data.message;
      }
    }
  }
  
  if (typeof errorObj?.message === 'string') {
    return errorObj.message;
  }
  
  if (typeof errorObj?.code === 'string' || typeof errorObj?.code === 'number') {
    return `错误码: ${errorObj.code}`;
  }
  
  return defaultMessage;
}

/**
 * 捕获并处理错误
 * @param fn 要执行的函数
 * @param options 选项
 * @returns 执行结果
 */
export async function catchError<T>(
  fn: () => Promise<T>,
  options: {
    showToast?: boolean;
    errorMessage?: string;
    onError?: (error: AppError) => void;
    fallback?: T;
  } = {}
): Promise<T | undefined> {
  try {
    return await fn();
  } catch (error) {
    handleError(error, options);
    return options.fallback;
  }
}

/**
 * 重试函数
 * @param fn 要执行的函数
 * @param options 选项
 * @returns 执行结果
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    delay?: number;
    onRetry?: (attempt: number) => void;
    onError?: (error: AppError) => void;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    delay = 1000,
    onRetry,
    onError
  } = options;

  let lastError: Error = new Error('未知错误');

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 1 && onRetry) {
        onRetry(attempt);
      }
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('未知错误');
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  if (onError) {
    onError({
      message: lastError.message,
      details: lastError.stack
    });
  }

  throw lastError;
}
