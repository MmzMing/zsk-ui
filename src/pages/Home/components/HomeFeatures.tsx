// ===== 1. 依赖导入区域 =====
import React, { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent, useVelocity, AnimatePresence, useMotionValue, animate } from "framer-motion";
import type { MotionValue } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { routes } from "@/router/routes";
import { ArrowRight } from "lucide-react";

// ===== 2. TODO待处理导入区域 =====

// ===== 3. 状态控制逻辑区域 =====
/**
 * 首页特性卡片静态数据
 */
const HOME_FEATURES_DATA = [
  {
    id: "301",
    tag: "核心能力",
    title: "轻量化知识库管理",
    description: "为开发者打造的一站式知识沉淀平台，支持双模式编辑、版本回溯与多维标签管理。",
  },
  {
    id: "302",
    tag: "学习资源",
    title: "多形式教程指南",
    description: "配套视频教程与图文文档，从基础操作到高阶定制全覆盖，新手也能快速上手。",
  },
  {
    id: "303",
    tag: "成长连接",
    title: "简历与开源社区",
    description: "在线编写简历，一键导出无水印。加入开源社区，与开发者共同完善工具生态。",
  },
  {
    id: "304",
    tag: "社区共建",
    title: "开源生态",
    description: "汇聚全球开发者智慧，共同打造开放、透明、持续进化的技术生态系统。",
  },
  {
    id: "305",
    tag: "多端协作",
    title: "云端同步",
    description: "笔记与代码片段实时同步至云端，无论在何处，都能无缝延续你的灵感与工作进度。",
  },
  {
    id: "306",
    tag: "AI赋能",
    title: "智能检索",
    description: "深度融合 AI 语义理解，支持自然语言提问与关联内容推荐，让海量知识触手可及。",
  }
];

/** 小卡片宽度 (vw) */
const SMALL_WIDTH = 18;
/** 大卡片展开宽度 (vw) */
const LARGE_WIDTH = 60;
/** 卡片间距 (vw) */
const GAP = 4;
/** 平铺动画阈值 */
const SPREAD_THRESHOLD = 0.2;

// ===== 4. 通用工具函数区域 =====

// ===== 5. 注释代码函数区 =====

// ===== 6. 错误处理函数区域 =====

// ===== 7. 数据处理函数区域 =====

// ===== 8. UI渲染逻辑区域 =====

/**
 * 单个卡片组件
 * 采用独立的 Transform 计算，支持堆叠到平铺的过渡
 */
type CardItemProps = {
  /** 滑块数据 */
  slide: typeof HOME_FEATURES_DATA[0];
  /** 当前索引 */
  index: number;
  /** 激活索引 */
  activeIndex: number;
  /** 是否正在展开 */
  isExpanding: boolean;
  /** 平铺进度 */
  spreadProgress: MotionValue<number>;
  /** 滚动进度 */
  scrollProgress: MotionValue<number>;
  /** 总数 */
  total: number;
  /** 小宽度 */
  smallWidth: number;
  /** 大宽度 */
  largeWidth: number;
  /** 间距 */
  gap: number;
  /** 导航函数 */
  navigate: (to: string) => void;
};

function CardItem({ 
  slide, index, activeIndex, isExpanding, spreadProgress, scrollProgress, total, 
  smallWidth, largeWidth, gap, navigate 
}: CardItemProps) {
  
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

  /** 是否激活状态 */
  const isActive = index === activeIndex;
  /** 是否显示详情 */
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
            className="absolute inset-0 p-8 md:p-14 flex flex-col justify-between z-30"
          >
            <div className="flex flex-col items-start gap-8 h-full justify-center">
              {/* Layer 1: Tag & Icon - Delay 0.55s (0.45s expansion + 0.1s buffer) */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, duration: 0.5, ease: "easeOut" }}
                className="flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
                  <span className="font-bold text-white text-lg">{slide.title.charAt(0)}</span>
                </div>
                <span className="text-[10px] md:text-xs uppercase tracking-[0.4em] text-[var(--primary-color)] font-black">{slide.tag}</span>
              </motion.div>

              <div className="max-w-xl">
                {/* Layer 2: Title - Delay 0.65s */}
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.65, duration: 0.5, ease: "easeOut" }}
                  className="text-3xl md:text-6xl font-black text-white mb-6 leading-[1.1] tracking-tighter"
                >
                  {slide.title}
                </motion.h2>
                
                {/* Layer 3: Description - Delay 0.75s */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.75, duration: 0.5, ease: "easeOut" }}
                  className="text-base md:text-lg text-white/80 leading-relaxed mb-10 font-medium"
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
                    className="group flex items-center gap-4 text-white"
                  >
                    <span className="text-[10px] md:text-xs font-black tracking-[0.4em] uppercase border-b-2 border-white/10 group-hover:border-[var(--primary-color)] pb-2 transition-colors">
                      Explore Project
                    </span>
                    <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                      <ArrowRight className="w-5 h-5" />
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

/**
 * DNA Capital 风格的横向滚动特性组件
 * 修复了滑动闪烁 BUG，并增强了展开动画的平滑度
 */
export default function HomeFeatures() {
  /** 导航钩子 */
  const navigate = useNavigate();
  /** 容器引用 */
  const containerRef = useRef<HTMLDivElement | null>(null);
  /** 激活卡片索引 */
  const [activeIndex, setActiveIndex] = useState(0);
  /** 是否正在展开详情 */
  const [isExpanding, setIsExpanding] = useState(false);
  /** 停止判定定时器 */
  const stopTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 滚动监听
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  /** 平铺进度：0 -> SPREAD_THRESHOLD 映射到 0 -> 1 */
  const spreadProgress = useTransform(scrollYProgress, [0, SPREAD_THRESHOLD], [0, 1]);
  /** 滚动进度：SPREAD_THRESHOLD -> 1 映射到 0 -> 1 */
  const scrollProgress = useTransform(scrollYProgress, [SPREAD_THRESHOLD, 1], [0, 1]);

  /** 使用滚动进度计算速度，用于判定展开状态 */
  const scrollVelocity = useVelocity(scrollProgress);

  // 计算当前激活索引和展开状态
  useMotionValueEvent(scrollProgress, "change", (latest) => {
    /** 当前滚动速度 */
    const velocity = Math.abs(scrollVelocity.get());
    
    // 只有在平铺完成后才触发展开逻辑
    if (scrollYProgress.get() < SPREAD_THRESHOLD) {
      if (isExpanding) setIsExpanding(false);
      setActiveIndex(0);
      return;
    }
    /** 移动速度阈值 */
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
      /** 停止速度阈值 */
      const STOP_THRESHOLD = 0.001;
      if (velocity < STOP_THRESHOLD && !isExpanding && !stopTimeoutRef.current) {
        stopTimeoutRef.current = setTimeout(() => {
          setIsExpanding(true);
          stopTimeoutRef.current = null;
        }, 100); // 100ms 稳定期，防止微小波动导致的反复开关
      }
    }

    // 3. 计算当前应该处于中心的索引
    /** 计算得到的当前索引 */
    const index = Math.min(
      Math.max(0, Math.round(latest * (HOME_FEATURES_DATA.length - 1))),
      HOME_FEATURES_DATA.length - 1
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
      style={{ height: `${Math.max(400, HOME_FEATURES_DATA.length * 80)}vh` }}
    >
      <div className="sticky top-0 h-screen w-full flex items-center overflow-hidden">
        
        {/* 卡片轨道容器 */}
        <div className="relative w-full h-full flex items-center">
          {HOME_FEATURES_DATA.map((slide, index) => {
            return (
              <CardItem
                key={slide.id}
                slide={slide}
                index={index}
                activeIndex={activeIndex}
                isExpanding={isExpanding}
                spreadProgress={spreadProgress}
                scrollProgress={scrollProgress}
                total={HOME_FEATURES_DATA.length}
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

// ===== 9. 页面初始化与事件绑定 =====

// ===== 10. TODO任务管理区域 =====

// ===== 11. 导出区域 =====
