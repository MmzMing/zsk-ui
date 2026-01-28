import React, { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent, useVelocity, AnimatePresence, useMotionValue, animate } from "framer-motion";
import type { MotionValue } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { routes } from "@/router/routes";
import { fetchHomeSlides, mockHomeSlides, type HomeSlide } from "@/api/front/home";
import { ArrowRight } from "lucide-react";

/**
 * DNA Capital 风格的横向滚动特性组件
 * 修复了滑动闪烁 BUG，并增强了展开动画的平滑度
 */
// 组件外触发数据加载并广播事件
async function fetchAndDispatchSlides() {
  const data = await fetchHomeSlides();
  const sourceData = data || mockHomeSlides;
  window.dispatchEvent(new CustomEvent("home:slides", { detail: sourceData }));
}
void fetchAndDispatchSlides();

export default function HomeFeatures() {
  const [slides, setSlides] = useState<HomeSlide[]>([]);
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement | null>(null);
  
  // 状态管理
  const [activeIndex, setActiveIndex] = useState(0);
  const [isExpanding, setIsExpanding] = useState(false);
  const stopTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 常量定义
  const SMALL_WIDTH = 18; // vw
  const LARGE_WIDTH = 60; // vw
  const GAP = 4; // vw
  const SPREAD_THRESHOLD = 0.2; // 前 20% 进度用于平铺动画

  // 订阅数据事件
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<HomeSlide[]>).detail;
      if (detail && Array.isArray(detail)) {
        setSlides(detail);
      }
    };
    window.addEventListener("home:slides", handler as EventListener);
    return () => window.removeEventListener("home:slides", handler as EventListener);
  }, []);

  // 滚动监听
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // 平铺进度：0 -> SPREAD_THRESHOLD 映射到 0 -> 1
  const spreadProgress = useTransform(scrollYProgress, [0, SPREAD_THRESHOLD], [0, 1]);
  // 滚动进度：SPREAD_THRESHOLD -> 1 映射到 0 -> 1
  const scrollProgress = useTransform(scrollYProgress, [SPREAD_THRESHOLD, 1], [0, 1]);

  // 使用滚动进度计算速度，用于判定展开状态
  const scrollVelocity = useVelocity(scrollProgress);

  // 计算当前激活索引和展开状态
  useMotionValueEvent(scrollProgress, "change", (latest) => {
    const velocity = Math.abs(scrollVelocity.get());
    
    // 只有在平铺完成后才触发展开逻辑
    if (scrollYProgress.get() < SPREAD_THRESHOLD) {
      if (isExpanding) setIsExpanding(false);
      setActiveIndex(0);
      return;
    }
    const MOVE_THRESHOLD = 0.004; 
    if (velocity > MOVE_THRESHOLD) {
      if (isExpanding) setIsExpanding(false);
      // 清除停止定时器
      if (stopTimeoutRef.current) {
        clearTimeout(stopTimeoutRef.current);
        stopTimeoutRef.current = null;
      }
    } else {
      // 2. 判定停止状态：速度低于停止阈值，且持续一段时间才展开
      const STOP_THRESHOLD = 0.001;
      if (velocity < STOP_THRESHOLD && !isExpanding && !stopTimeoutRef.current) {
        stopTimeoutRef.current = setTimeout(() => {
          setIsExpanding(true);
          stopTimeoutRef.current = null;
        }, 100); // 100ms 稳定期，防止微小波动导致的反复开关
      }
    }

    // 3. 计算当前应该处于中心的索引
    const index = Math.min(
      Math.max(0, Math.round(latest * (slides.length - 1))),
      slides.length - 1
    );

    if (index !== activeIndex) {
      setActiveIndex(index);
    }
  });

  // 组件卸载时清除定时器
  useEffect(() => {
    return () => {
      if (stopTimeoutRef.current) clearTimeout(stopTimeoutRef.current);
    };
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative w-full bg-transparent"
      style={{ height: `${Math.max(400, slides.length * 80)}vh` }}
    >
      <div className="sticky top-0 h-screen w-full flex items-center overflow-hidden">
        
        {/* 卡片轨道容器 */}
        <div className="relative w-full h-full flex items-center">
          {slides.map((slide, index) => {
            // 核心修复：不使用 layout 属性，改用数学计算位置
            // 我们通过计算当前进度下，该卡片相对于视口中心的位移
            return (
              <CardItem
                key={slide.id}
                slide={slide}
                index={index}
                activeIndex={activeIndex}
                isExpanding={isExpanding}
                spreadProgress={spreadProgress}
                scrollProgress={scrollProgress}
                total={slides.length}
                smallWidth={SMALL_WIDTH}
                largeWidth={LARGE_WIDTH}
                gap={GAP}
                navigate={navigate}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

/**
 * 单个卡片组件
 * 采用独立的 Transform 计算，支持堆叠到平铺的过渡
 */
type CardItemProps = {
  slide: HomeSlide;
  index: number;
  activeIndex: number;
  isExpanding: boolean;
  spreadProgress: MotionValue<number>;
  scrollProgress: MotionValue<number>;
  total: number;
  smallWidth: number;
  largeWidth: number;
  gap: number;
  navigate: (to: string) => void;
};

function CardItem({ 
  slide, index, activeIndex, isExpanding, spreadProgress, scrollProgress, total, 
  smallWidth, largeWidth, gap, navigate 
}: CardItemProps) {
  
  // ===== 3. 状态控制逻辑区域 =====
  // 增加布局延迟状态，确保收缩时文字先淡出，卡片后缩小
  const [shouldLayoutExpand, setShouldLayoutExpand] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldLayoutExpand(isExpanding);
    }, isExpanding ? 0 : 150);
    
    return () => clearTimeout(timer);
  }, [isExpanding]);

  // 1. 轨道基础位置：平铺完成后开始水平滚动
  const trackX = useTransform(
    scrollProgress,
    [0, 1],
    [
      50 - smallWidth / 2, // 初始位置：第一张居中
      50 - smallWidth / 2 - (total - 1) * (smallWidth + gap) // 结束位置：最后一张居中
    ]
  );

  // 2. 平铺位移：从中心 (0) 扩展到各自在轨道上的位置
  const itemSpreadOffset = useTransform(
    spreadProgress,
    [0, 1],
    [0, index * (smallWidth + gap)]
  );

  // 3. 堆叠样式：缩放、Y轴偏移、X轴微调偏移
  const stackScale = useTransform(spreadProgress, [0, 1], [1 - (index * 0.04), 1]);
  const stackY = useTransform(spreadProgress, [0, 1], [index * -25, 0]);
  const stackXOffset = useTransform(spreadProgress, [0, 1], [index * 4, 0]); // 后面的卡片向右侧偏移
  const stackOpacity = useTransform(spreadProgress, [0, 0.5, 1], [1 - (index * 0.15), 0.8, 1]);

  // 4. 展开位移的动画值（tween）
  const expansionMV = useMotionValue(0);
  useEffect(() => {
    const delta = (largeWidth - smallWidth) / 2;
    let target = 0;
    if (shouldLayoutExpand) {
      if (index < activeIndex) target = -delta;
      else if (index > activeIndex) target = delta;
      else target = 0;
    } else {
      target = 0;
    }
    const controls = animate(expansionMV, target, { duration: 0.45, ease: [0.22, 1, 0.36, 1] });
    return () => controls.stop();
  }, [shouldLayoutExpand, index, activeIndex, largeWidth, smallWidth, expansionMV]);

  // 最终 X 位置：轨道位置 + 自身平铺位移 + 堆叠时的 X 偏移 + 展开位移
  const x = useTransform(
    [trackX, itemSpreadOffset, stackXOffset, expansionMV] as unknown as [MotionValue<number>, MotionValue<number>, MotionValue<number>, MotionValue<number>],
    ([tX, sOffset, sXOff, expansion]) => {
      return `${(tX as number) + (sOffset as number) + (sXOff as number) + (expansion as number)}vw`;
    }
  );

  const isActive = index === activeIndex;
  const showDetail = isExpanding && isActive;

  return (
    <motion.div
      style={{ 
        x,
        y: stackY,
        scale: stackScale,
        opacity: stackOpacity,
        zIndex: isActive ? 50 : 20 - index, // 第一张 (index 0) 层级最高，在最前面
      }}
      animate={{
        width: isActive ? (shouldLayoutExpand ? `${largeWidth}vw` : `${smallWidth}vw`) : `${smallWidth}vw`,
        // 只有平铺完成后才应用展开状态的视觉效果
        filter: isActive && shouldLayoutExpand ? "blur(0px)" : (isExpanding ? "blur(8px)" : "blur(0px)"),
      }}
      transition={{
        type: "tween",
        duration: 0.45,
        ease: [0.22, 1, 0.36, 1]
      }}
      className={`
        absolute h-[50vh] md:h-[60vh] rounded-3xl overflow-hidden
        border border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl
        ${isActive && shouldLayoutExpand ? 'shadow-[0_0_100px_rgba(0,0,0,0.6)]' : ''}
      `}
    >
      {/* 始终居中的 Logo 视图 - 使用绝对定位脱离文档流，防止宽度变化导致布局重排 */}
      <motion.div
        initial={false}
        animate={{ 
          opacity: showDetail ? 0 : 1,
          scale: showDetail ? 0.8 : 1,
          y: showDetail ? -50 : 0
        }}
        transition={{
          duration: 0.3,
          delay: showDetail ? 0 : 0.2 // 收缩时延迟显示 Logo，确保文字先消失
        }}
        className="absolute inset-0 flex flex-col items-center justify-center gap-8 pointer-events-none"
      >
        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shadow-2xl shrink-0">
          <span className="text-3xl md:text-4xl font-bold text-white/90">{slide.title.charAt(0)}</span>
        </div>
        <span className="text-sm md:text-base font-bold text-white tracking-[0.4em] uppercase text-center px-6 whitespace-nowrap">
          {slide.title}
        </span>
      </motion.div>

      {/* 展开详情视图 */}
      <AnimatePresence mode="wait">
        {showDetail && (
          <motion.div
            key="detail-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ 
              opacity: 0, 
              scale: 0.95,
              transition: { duration: 0.15, ease: "easeIn" } 
            }}
            className="absolute inset-0 p-12 md:p-20 flex flex-col justify-between z-30"
          >
            <div className="flex flex-col items-start gap-12 h-full justify-center">
              {/* Layer 1: Tag & Icon - Delay 0.55s (0.45s expansion + 0.1s buffer) */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, duration: 0.5, ease: "easeOut" }}
                className="flex items-center gap-6"
              >
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
                  <span className="font-bold text-white text-xl">{slide.title.charAt(0)}</span>
                </div>
                <span className="text-xs uppercase tracking-[0.4em] text-[var(--primary-color)] font-black">{slide.tag}</span>
              </motion.div>

              <div className="max-w-2xl">
                {/* Layer 2: Title - Delay 0.65s */}
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.65, duration: 0.5, ease: "easeOut" }}
                  className="text-5xl md:text-8xl font-black text-white mb-10 leading-[0.9] tracking-tighter"
                >
                  {slide.title}
                </motion.h2>
                
                {/* Layer 3: Description - Delay 0.75s */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.75, duration: 0.5, ease: "easeOut" }}
                  className="text-xl md:text-2xl text-white leading-relaxed mb-16 font-medium"
                >
                  {slide.description}
                </motion.p>
                
                {/* Layer 4: Button - Delay 0.85s */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.85, duration: 0.5, ease: "easeOut" }}
                >
                  <button
                    onClick={() => navigate(routes.allSearch)}
                    className="group flex items-center gap-6 text-white"
                  >
                    <span className="text-sm font-black tracking-[0.4em] uppercase border-b-2 border-white/10 group-hover:border-[var(--primary-color)] pb-3 transition-colors">
                      Explore Project
                    </span>
                    <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                      <ArrowRight className="w-6 h-6" />
                    </div>
                  </button>
                </motion.div>
              </div>
            </div>

            {/* 背景装饰图形 - Fade in gently */}
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 0.6, duration: 0.8 }}
               className="absolute right-0 top-0 bottom-0 w-1/2 overflow-hidden pointer-events-none"
            >
              <div className="absolute top-1/2 right-[-10%] -translate-y-1/2 w-[600px] h-[600px] border border-white/5 rounded-full" />
              <div className="absolute top-1/2 right-[5%] -translate-y-1/2 w-[400px] h-[400px] border border-white/5 rounded-full" />
              <div className="absolute top-1/2 right-[20%] -translate-y-1/2 w-[200px] h-[200px] border border-white/5 rounded-full" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
