/**
 * 验证码倒计时 Hook
 * @module hooks/useCountdown
 * @description 提供验证码发送后的倒计时功能
 */

import { useState, useEffect, useCallback, useRef } from "react";

/** 默认倒计时时长（秒） */
const DEFAULT_DURATION = 60;

interface UseCountdownOptions {
  /** 倒计时时长（秒） */
  duration?: number;
  /** 倒计时开始时的回调 */
  onStart?: () => void;
  /** 倒计时结束时的回调 */
  onEnd?: () => void;
}

interface UseCountdownReturn {
  /** 当前倒计时值（秒） */
  countdown: number;
  /** 是否正在倒计时 */
  isCounting: boolean;
  /** 开始倒计时 */
  start: () => void;
  /** 停止倒计时 */
  stop: () => void;
  /** 重置倒计时 */
  reset: () => void;
  /** 格式化的倒计时文本（如 "60s 后可重发"） */
  formattedText: string;
}

/**
 * 验证码倒计时 Hook
 * @param options 配置选项
 * @returns 倒计时状态和控制方法
 */
export const useCountdown = (options: UseCountdownOptions = {}): UseCountdownReturn => {
  const { duration = DEFAULT_DURATION, onStart, onEnd } = options;

  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onEndRef = useRef(onEnd);

  /** 更新回调引用 */
  useEffect(() => {
    onEndRef.current = onEnd;
  }, [onEnd]);

  /** 清理定时器 */
  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  /** 开始倒计时 */
  const start = useCallback(() => {
    clearTimer();
    setCountdown(duration);
    onStart?.();

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearTimer();
          onEndRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [duration, onStart, clearTimer]);

  /** 停止倒计时 */
  const stop = useCallback(() => {
    clearTimer();
    setCountdown(0);
  }, [clearTimer]);

  /** 重置倒计时 */
  const reset = useCallback(() => {
    clearTimer();
    setCountdown(duration);
  }, [duration, clearTimer]);

  /** 组件卸载时清理 */
  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  /** 格式化倒计时文本 */
  const formattedText = countdown > 0 ? `${countdown}s 后可重发` : "发送验证码";

  return {
    countdown,
    isCounting: countdown > 0,
    start,
    stop,
    reset,
    formattedText
  };
};

export default useCountdown;
export type { UseCountdownOptions, UseCountdownReturn };
