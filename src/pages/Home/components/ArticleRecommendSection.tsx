// ===== 1. 依赖导入区域 =====
import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@heroui/react";
import { useNavigate } from "react-router-dom";
import { routes } from "../../../router/routes";
import AnimatedContent from "../../../components/Motion/AnimatedContent";
import AnimatedList from "../../../components/Motion/AnimatedList";
import { fetchHomeArticles, mockHomeArticles, type HomeArticle, DEFAULT_ARTICLE_COVER } from "../../../api/front/home";

// ===== 2. TODO待处理导入区域 =====

// ===== 3. 状态控制逻辑区域 =====

// ===== 4. 通用工具函数区域 =====

// ===== 5. 注释代码函数区 =====

// ===== 6. 错误处理函数区域 =====

// ===== 7. 数据处理函数区域 =====
/**
 * 格式化文章摘要，超出长度显示省略号
 * @param summary 文章摘要
 * @param maxLength 最大长度
 * @returns 格式化后的摘要
 */
const formatSummary = (summary: string, maxLength: number = 100): string => {
  if (!summary) return "";
  return summary.length > maxLength
    ? `${summary.slice(0, maxLength)}...`
    : summary;
};

// ===== 8. UI渲染逻辑区域 =====

// ===== 9. 页面初始化与事件绑定 =====
/**
 * 首页文章推荐区域组件
 */
export default function ArticleRecommendSection() {
  // --- 导航钩子 ---
  const navigate = useNavigate();

  // --- 状态与引用 ---
  /** 文章列表状态 */
  const [articles, setArticles] = useState<HomeArticle[]>(() => mockHomeArticles);
  /** 当前选中的文章ID */
  const [activeArticleId, setActiveArticleId] = useState<string | undefined>(() => mockHomeArticles[0]?.id);
  /** 容器 DOM 引用 */
  const containerRef = useRef<HTMLDivElement | null>(null);
  /** 左侧容器 DOM 引用 */
  const leftContainerRef = useRef<HTMLDivElement | null>(null);
  /** 倒数第二个元素的引用，用于滚动计算哨兵 */
  const secondLastRef = useRef<HTMLDivElement | null>(null);

  // --- 数据获取 ---
  /**
   * 加载文章列表数据
   */
  const loadArticles = React.useCallback(async () => {
    const data = await fetchHomeArticles();
    if (data) {
      setArticles(data);
      // 使用函数式更新，避免依赖 activeArticleId
      setActiveArticleId(prevId => {
        if (!prevId && data.length > 0) {
          return data[0].id;
        }
        return prevId;
      });
    }
  }, []);

  // 初始化加载
  useEffect(() => {
    const timer = setTimeout(() => {
      loadArticles();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadArticles]); // 仅在挂载时获取一次，移除 activeArticleId 依赖以避免点击切换时重复请求

  // --- 数据计算 ---
  /** 当前激活的文章对象 */
  const activeArticle = useMemo(() => {
    return articles.find(item => item.id === activeArticleId) || articles[0];
  }, [articles, activeArticleId]);

  /** 格式化后的文章摘要 */
  const trimmedSummary = useMemo(() => 
    activeArticle ? formatSummary(activeArticle.summary) : ""
  , [activeArticle]);

  /** 列表中倒数第二个文章的索引，用于设置滚动哨兵 */
  const secondLastIndex = useMemo(() => 
    articles.length >= 2 ? articles.length - 2 : articles.length - 1
  , [articles]);

  // --- 事件处理 ---
  /**
   * 处理滚动逻辑，实现左侧 sticky 效果在接近底部时自动上推
   */
  const handleScroll = useCallback(() => {
    if (!leftContainerRef.current || !secondLastRef.current || !containerRef.current) {
      return;
    }

    // 仅在桌面端应用此逻辑 (md 也就是 768px 以上)
    if (window.innerWidth < 768) {
      leftContainerRef.current.style.top = "";
      return;
    }

    /** 左侧容器的位置信息 */
    const leftRect = leftContainerRef.current.getBoundingClientRect();
    /** 哨兵元素的位置信息 */
    const sentinelRect = secondLastRef.current.getBoundingClientRect();
    /** 基础顶部悬停距离 (对应 CSS 中的 md:top-24 = 96px) */
    const STICKY_TOP = 96;
    /** 最大允许的 top 值，计算逻辑：visualTop <= sentinelTop - height */
    const maxTop = sentinelRect.top - leftRect.height;
    /** 最终应用到元素的 top 值 */
    const finalTop = Math.min(STICKY_TOP, maxTop);

    leftContainerRef.current.style.top = `${finalTop}px`;
  }, []);

  /**
   * 处理文章选择事件
   * @param id 文章ID
   */
  const handleArticleSelect = (id: string) => {
    setActiveArticleId(id);
  };

  /**
   * 处理文章跳转详情页事件
   * @param id 文章ID
   */
  const handleArticleJump = (id: string) => {
    window.open(routes.docDetail.replace(":id", id), "_blank");
  };

  /**
   * 跳转到搜索页
   */
  const handleJumpToSearch = () => {
    navigate(routes.allSearch);
  };

  // --- 生命周期与监听 ---
  /**
   * 绑定滚动和窗口调整事件，实现动态 Sticky 效果
   */
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [handleScroll]);

  // --- 渲染逻辑 ---
  if (!activeArticle) return null;

  return (
    <section className="relative space-y-8 px-[var(--content-padding)] pb-12">
      {/* ===== 8.1 背景装饰区域 (Endfield Style - Right Side) ===== */}
      <div className="absolute right-0 top-0 bottom-[-15rem] w-48 hidden xl:flex flex-row-reverse pointer-events-none z-0 select-none overflow-hidden">
        {/* 背景色块 - 延伸至底部以覆盖父容器的 pb-40 */}
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-[var(--primary-color)]/5 border-l border-[var(--primary-color)]/10" />
        
        {/* 内容容器 */}
        <div className="relative w-16 flex flex-col items-center pt-24 pb-40 gap-12 h-full">
          {/* 顶部线条装饰 */}
          <div className="w-[3px] h-32 bg-gradient-to-b from-transparent via-[var(--primary-color)]/20 to-[var(--primary-color)]/60 rounded-full flex-none" />
          
          {/* 垂直文字容器 */}
          <div className="relative flex flex-col items-center gap-6 flex-none">
            {/* 辅助小字 */}
            <div 
              className="text-[10px] uppercase tracking-[0.3em] font-mono text-white/80"
              style={{ writingMode: 'vertical-rl' }}
            >
              Recommended Reading
            </div>
            
            {/* 主标题文字 */}
            <div 
              className="text-4xl font-black tracking-[0.2em] whitespace-nowrap"
              style={{ 
                writingMode: 'vertical-rl',
                color: 'var(--primary-color)',
                textShadow: '0 0 20px var(--primary-color)'
              }}
            >
              精选文章推荐
            </div>
          </div>

          {/* 白色装饰线条 */}
          <div className="w-[1.5px] h-64 bg-gradient-to-b from-white/5 via-white/20 to-white/5 relative flex-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white/40 blur-[1px]" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white/40 blur-[1px]" />
          </div>

          {/* 底部填充渐变线 - 延长渐变以自然消失 */}
          <div className="flex-1 w-[2px] bg-gradient-to-b from-white/10 via-[var(--primary-color)]/10 to-transparent w-[1px] mb-20" />
        </div>
        
        {/* 次级平行装饰线 - 镜像排列 */}
        <div className="mr-4 h-full w-[1px] bg-gradient-to-b from-transparent via-[var(--border-color)]/40 to-transparent opacity-30" />
        <div className="mr-2 h-full w-[0.5px] bg-gradient-to-b from-transparent via-[var(--border-color)]/20 to-transparent opacity-20" />
      </div>

      <div className="max-w-6xl mx-auto w-full relative z-20 flex justify-end mb-4">
        <Button
          size="sm"
          variant="bordered"
          className="rounded-full border-[var(--border-color)] text-[var(--text-color-secondary)] hover:bg-[var(--primary-color)] hover:text-white hover:border-[var(--primary-color)] transition-all px-6"
          onPress={handleJumpToSearch}
        >
          View news
        </Button>
      </div>

      <div 
        ref={containerRef}
        className="max-w-6xl mx-auto w-full flex flex-col md:flex-row gap-6 md:gap-8 relative z-10"
      >
        {/* 左侧详情展示区 */}
        <div
          ref={leftContainerRef}
          className="md:basis-3/5 space-y-4 self-start md:sticky md:top-24"
        >
          <AnimatedContent activeKey={activeArticle.id} className="h-full">
            <motion.div 
              className="space-y-3"
              initial="hidden"
              animate="visible"
              key={activeArticle.id}
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1,
                    delayChildren: 0.2
                  }
                }
              }}
            >
              <motion.div 
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0 }
                }}
                className="inline-flex items-center gap-2 rounded-full bg-[color-mix(in_srgb,var(--primary-color)_8%,transparent)] text-[var(--primary-color)] text-[11px] px-3 py-1"
              >
                <span>{activeArticle.category}</span>
              </motion.div>
              
              <motion.h4 
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0 }
                }}
                className="text-base md:text-lg font-semibold"
              >
                {activeArticle.title}
              </motion.h4>

              <motion.div 
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0 }
                }}
                className="text-[10px] md:text-xs text-[var(--text-color-secondary)] flex items-center gap-2"
              >
                <span>{activeArticle.author ?? "站长"}</span>
                <span>·</span>
                <span>{activeArticle.date}</span>
              </motion.div>

              <motion.div 
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0 }
                }}
                className="text-[10px] md:text-xs text-[var(--text-color-secondary)]"
              >
                {activeArticle.views} 阅读
              </motion.div>

              <motion.p 
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0 }
                }}
                className="text-xs md:text-sm leading-relaxed text-[var(--text-color-secondary)]"
              >
                {trimmedSummary}
              </motion.p>

              <motion.div
                variants={{
                  hidden: { opacity: 0, scale: 0.96, y: 15 },
                  visible: { opacity: 1, scale: 1, y: 0 }
                }}
                transition={{ duration: 0.5, ease: [0.2, 0.7, 0.3, 1] }}
                className="mt-2 aspect-video w-full rounded-[var(--radius-base)] border border-[var(--border-color)] bg-slate-900 overflow-hidden relative cursor-pointer"
                onClick={() => handleArticleJump(activeArticle.id)}
              >
                <img
                  src={activeArticle.cover || DEFAULT_ARTICLE_COVER}
                  alt={activeArticle.title}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </motion.div>
            </motion.div>
          </AnimatedContent>
        </div>

        {/* 右侧列表选择区 */}
        <div className="md:basis-2/5">
          <AnimatedList className="space-y-0">
            {articles.map((item, index) => {
              /** 当前项是否被选中 */
              const isActive = item.id === activeArticle.id;
              /** 是否为倒数第二项（哨兵节点） */
              const isSecondLast = index === secondLastIndex;
              return (
                <div
                  key={item.id}
                  ref={isSecondLast ? secondLastRef : undefined}
                  className="py-6 first:pt-0"
                >
                  <Button
                    type="button"
                    disableRipple
                    disableAnimation
                    className="group w-full flex items-center gap-3 md:gap-4 px-0 h-auto text-left text-xs md:text-sm bg-transparent border-none shadow-none !rounded-none min-h-[8rem] data-[hover=true]:bg-transparent hover:bg-transparent active:bg-transparent focus:bg-transparent"
                    variant="light"
                    onPress={() => handleArticleSelect(item.id)}
                  >
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className={`text-base md:text-lg font-semibold line-clamp-2 transition-colors duration-200 ${isActive ? 'text-[var(--primary-color)]' : 'group-hover:text-[var(--primary-color)]'}`}>
                        {item.title}
                      </div>
                      <div className="text-[10px] md:text-xs text-[var(--text-color-secondary)] flex items-center gap-2">
                        <span>{item.date}</span>
                        <span>{item.category}</span>
                        <span className="flex items-center gap-1">
                          Learn more <span className="text-xs">›</span>
                        </span>
                      </div>
                    </div>
                    <div className="relative w-24 h-24 md:w-32 md:h-32 shrink-0 rounded-2xl overflow-hidden bg-slate-900 shadow-sm">
                      <img
                        src={item.cover || DEFAULT_ARTICLE_COVER}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 group-hover:opacity-90"
                      />
                    </div>
                  </Button>
                </div>
              );
            })}
          </AnimatedList>
        </div>
      </div>
    </section>
  );
}

// ===== 10. TODO任务管理区域 =====

// ===== 11. 导出区域 =====
