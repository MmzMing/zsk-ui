import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@heroui/react";
import AnimatedContent from "../../../components/Motion/AnimatedContent";
import AnimatedList from "../../../components/Motion/AnimatedList";
import type { HomeArticle } from "../../../api/front/home";

const DEFAULT_COVER = "/DefaultImage/MyDefaultImage.jpg";

type Props = {
  articles: HomeArticle[];
  activeArticle: HomeArticle;
  onArticleChange: (id: string) => void;
  onArticleNavigate: (id: string) => void;
};

export default function ArticleRecommendSection({
  articles,
  activeArticle,
  onArticleChange,
  onArticleNavigate
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const leftContainerRef = useRef<HTMLDivElement | null>(null);
  const secondLastRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (
        !leftContainerRef.current ||
        !secondLastRef.current ||
        !containerRef.current
      ) {
        return;
      }

      // 仅在桌面端应用此逻辑 (md 也就是 768px 以上)
      if (window.innerWidth < 768) {
        // 移动端重置 top 样式，依靠 CSS 类控制
        leftContainerRef.current.style.top = "";
        return;
      }

      const leftRect = leftContainerRef.current.getBoundingClientRect();
      const sentinelRect = secondLastRef.current.getBoundingClientRect();

      // sticky 的基础顶部距离，对应 CSS 中的 md:top-24 (96px)
      const STICKY_TOP = 96;

      // 计算最大允许的 top 值
      // 逻辑：为了不让左侧底部覆盖到 sentinel，左侧的 visualBottom 必须 <= sentinelTop
      // visualBottom = visualTop + height
      // visualTop (即 sticky 的 top 属性) <= sentinelTop - height
      const maxTop = sentinelRect.top - leftRect.height;

      // 最终的 top 值取基础 sticky 高度和计算出的最大高度的较小值
      // 当 maxTop < 96 时，top 会变小（甚至负数），从而实现“跟随页面向上推走”的效果
      // 这种方式不需要切换 position: sticky 到 static，避免了布局抖动
      const finalTop = Math.min(STICKY_TOP, maxTop);

      leftContainerRef.current.style.top = `${finalTop}px`;
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [activeArticle, articles]);

  const trimmedSummary =
    activeArticle.summary.length > 100
      ? `${activeArticle.summary.slice(0, 100)}...`
      : activeArticle.summary;

  const secondLastIndex =
    articles.length >= 2 ? articles.length - 2 : articles.length - 1;

  return (
    <section className="space-y-4 px-[var(--content-padding)]">
      <div 
        ref={containerRef}
        className="max-w-6xl mx-auto w-full flex flex-col md:flex-row gap-6 md:gap-8"
      >
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
                onClick={() => onArticleNavigate(activeArticle.id)}
              >
                <img
                  src={activeArticle.cover || DEFAULT_COVER}
                  alt={activeArticle.title}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </motion.div>
            </div>
          </AnimatedContent>
        </div>
        <div className="md:basis-2/5">
          <AnimatedList className="space-y-3 md:space-y-4">
            {articles.map((item, index) => {
              const isActive = item.id === activeArticle.id;
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
                    onPress={() => onArticleChange(item.id)}
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
                        src={item.cover || DEFAULT_COVER}
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
