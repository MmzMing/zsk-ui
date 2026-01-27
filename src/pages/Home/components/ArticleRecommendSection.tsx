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
    navigate(routes.docDetail.replace(":id", id));
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
    <section className="space-y-8 px-[var(--content-padding)] pb-12">
      <div 
        ref={containerRef}
        className="max-w-6xl mx-auto w-full flex flex-col md:flex-row gap-6 md:gap-8"
      >
        {/* 左侧详情展示区 */}
        <div
          ref={leftContainerRef}
          className="md:basis-3/5 space-y-4 self-start md:sticky md:top-24"
        >
          <AnimatedContent activeKey={activeArticle.id} className="h-full">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-[color-mix(in_srgb,var(--primary-color)_8%,transparent)] text-[var(--primary-color)] text-[11px] px-3 py-1">
                <span>{activeArticle.category}</span>
              </div>
              <h4 className="text-base md:text-lg font-semibold">
                {activeArticle.title}
              </h4>
              <div className="text-[10px] md:text-xs text-[var(--text-color-secondary)] flex items-center gap-2">
                <span>{activeArticle.author ?? "站长"}</span>
                <span>·</span>
                <span>{activeArticle.date}</span>
              </div>
              <div className="text-[10px] md:text-xs text-[var(--text-color-secondary)]">
                {activeArticle.views} 阅读
              </div>
              <p className="text-xs md:text-sm leading-relaxed text-[var(--text-color-secondary)]">
                {trimmedSummary}
              </p>
              <motion.div
                className="mt-2 aspect-video w-full rounded-[var(--radius-base)] border border-[var(--border-color)] bg-slate-900 overflow-hidden relative cursor-pointer"
                initial={{ opacity: 0, scale: 0.96, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.2, 0.7, 0.3, 1] }}
                onClick={() => handleArticleJump(activeArticle.id)}
              >
                <img
                  src={activeArticle.cover || DEFAULT_ARTICLE_COVER}
                  alt={activeArticle.title}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </motion.div>
            </div>
          </AnimatedContent>
        </div>

        {/* 右侧列表选择区 */}
        <div className="md:basis-2/5">
          <AnimatedList className="space-y-3 md:space-y-4">
            {articles.map((item, index) => {
              /** 当前项是否被选中 */
              const isActive = item.id === activeArticle.id;
              /** 是否为倒数第二项（哨兵节点） */
              const isSecondLast = index === secondLastIndex;
              return (
                <div
                  key={item.id}
                  ref={isSecondLast ? secondLastRef : undefined}
                >
                  <Button
                    type="button"
                    className={
                      "group w-full flex items-center gap-3 md:gap-4 rounded-[var(--radius-base)] border px-4 md:px-6 h-32 md:h-36 text-left text-xs md:text-sm transition-colors transition-transform duration-150 transform-gpu " +
                      (isActive
                        ? "border-[color-mix(in_srgb,var(--primary-color)_70%,transparent)] bg-[color-mix(in_srgb,var(--primary-color)_10%,transparent)]"
                        : "bg-[color-mix(in_srgb,var(--bg-elevated)_96%,black_4%)] border-[color-mix(in_srgb,var(--border-color)_80%,transparent)] hover:border-[color-mix(in_srgb,var(--primary-color)_45%,transparent)] hover:-translate-y-0.5")
                    }
                    variant="light"
                    onPress={() => handleArticleSelect(item.id)}
                  >
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="truncate font-medium">
                        {item.title}
                      </div>
                      <div className="text-[10px] text-[var(--text-color-secondary)]">
                        {item.author ?? "站长"} · {item.date}
                      </div>
                      <div className="inline-flex items-center gap-2 rounded-full bg-[color-mix(in_srgb,var(--primary-color)_8%,transparent)] text-[var(--primary-color)] text-[10px] px-2 py-0.5 w-fit">
                        <span>{item.category}</span>
                      </div>
                    </div>
                    <div className="relative w-24 h-12 md:w-28 md:h-14 shrink-0 rounded-[calc(var(--radius-base)_-_2px)] overflow-hidden bg-slate-900">
                      <img
                        src={item.cover || DEFAULT_ARTICLE_COVER}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/10" />
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
