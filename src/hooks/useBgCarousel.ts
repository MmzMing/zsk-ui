/**
 * 背景图片轮播 Hook
 * @module hooks/useBgCarousel
 * @description 提供背景图片预加载和自动轮播功能
 */

import { useState, useEffect, useCallback, useRef } from "react";

/** Auth 页面默认背景图片列表 */
const DEFAULT_BG_IMAGES = [
  "/auth/auth-Polling-1.png",
  "/auth/auth-Polling-2.png",
  "/auth/auth-Polling-3.png"
];

/** 默认轮播间隔（毫秒） */
const DEFAULT_INTERVAL = 5000;

interface UseBgCarouselOptions {
  /** 背景图片列表 */
  images?: string[];
  /** 轮播间隔（毫秒） */
  interval?: number;
  /** 是否启用预加载 */
  preload?: boolean;
  /** 是否自动开始轮播 */
  autoPlay?: boolean;
}

interface UseBgCarouselReturn {
  /** 当前背景图片索引 */
  currentIndex: number;
  /** 当前背景图片 URL */
  currentImage: string;
  /** 是否已预加载完成 */
  isPreloaded: boolean;
  /** 预加载进度（0-100） */
  preloadProgress: number;
  /** 手动切换到下一张 */
  next: () => void;
  /** 手动切换到上一张 */
  prev: () => void;
  /** 跳转到指定索引 */
  goTo: (index: number) => void;
  /** 开始轮播 */
  play: () => void;
  /** 暂停轮播 */
  pause: () => void;
  /** 是否正在轮播 */
  isPlaying: boolean;
}

/**
 * 预加载单张图片
 * @param src 图片 URL
 * @returns Promise<boolean> 是否加载成功
 */
const preloadImage = (src: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = src;
  });
};

/**
 * 背景图片轮播 Hook
 * @param options 配置选项
 * @returns 轮播状态和控制方法
 */
export const useBgCarousel = (options: UseBgCarouselOptions = {}): UseBgCarouselReturn => {
  const {
    images = DEFAULT_BG_IMAGES,
    interval = DEFAULT_INTERVAL,
    preload = true,
    autoPlay = true
  } = options;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPreloaded, setIsPreloaded] = useState(false);
  const [preloadProgress, setPreloadProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /** 预加载所有图片 */
  const preloadImages = useCallback(async () => {
    if (!preload) {
      setIsPreloaded(true);
      setPreloadProgress(100);
      return;
    }

    let loadedCount = 0;
    const totalImages = images.length;

    const results = await Promise.all(
      images.map(async (src) => {
        const result = await preloadImage(src);
        loadedCount++;
        setPreloadProgress(Math.round((loadedCount / totalImages) * 100));
        return result;
      })
    );

    const allLoaded = results.every(Boolean);
    setIsPreloaded(allLoaded);
  }, [images, preload]);

  /** 开始轮播 */
  const startCarousel = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, interval);
    setIsPlaying(true);
  }, [images.length, interval]);

  /** 停止轮播 */
  const stopCarousel = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  /** 切换到下一张 */
  const next = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  /** 切换到上一张 */
  const prev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  /** 跳转到指定索引 */
  const goTo = useCallback((index: number) => {
    if (index >= 0 && index < images.length) {
      setCurrentIndex(index);
    }
  }, [images.length]);

  /** 初始化预加载 */
  useEffect(() => {
    preloadImages();
  }, [preloadImages]);

  /** 自动轮播控制 */
  useEffect(() => {
    if (autoPlay && isPreloaded) {
      startCarousel();
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [autoPlay, isPreloaded, startCarousel]);

  return {
    currentIndex,
    currentImage: images[currentIndex],
    isPreloaded,
    preloadProgress,
    next,
    prev,
    goTo,
    play: startCarousel,
    pause: stopCarousel,
    isPlaying
  };
};

export default useBgCarousel;
export type { UseBgCarouselOptions, UseBgCarouselReturn };
