import React, { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { routes } from "@/router/routes";
import { fetchHomeSlides, mockHomeSlides, type HomeSlide } from "@/api/front/home";

// ===== 11. 导出区域 =====
export default function HomeFeatures() {
  const [slides, setSlides] = useState<HomeSlide[]>(() => mockHomeSlides);
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLDivElement | null>(null);

  /**
   * 加载幻灯片数据
   */
  const loadSlides = React.useCallback(async () => {
    const data = await fetchHomeSlides();
    if (data) {
      setSlides(data);
    }
  }, []);

  // 初始化加载
  useEffect(() => {
    const timer = setTimeout(() => {
      loadSlides();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadSlides]);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"]
  });

  const totalSlides = slides.length;
  const scrollHeight = 400; // 400vh
  const releaseProgress = 0.85;

  const slideWidth = 70; // 70vw
  const slideGap = 24; // 24vw
  const step = slideWidth + slideGap; // 每张卡片之间中心点的水平距离
  const totalTravel = (totalSlides - 1) * step;
  const halfTravel = totalTravel / 2;

  const firstPos = halfTravel; // 第一张在最右侧时居中
  const secondPos = 0; // 中间一张在居中时为 0（轨道中心）
  const thirdPos = -halfTravel; // 最后一张在最左侧时居中

  const segment = releaseProgress / 7;
  const s1 = segment;
  const s2 = segment * 2;
  const s3 = segment * 3;
  const s4 = segment * 4;
  const s5 = segment * 5;
  const s6 = segment * 6;
  const s7 = releaseProgress;

  const trackX = useTransform(scrollYProgress, [0, s2, s3, s5, s6, 1], [
    `${firstPos}vw`,
    `${firstPos}vw`,
    `${secondPos}vw`,
    `${secondPos}vw`,
    `${thirdPos}vw`,
    `${thirdPos}vw`
  ]);

  const baseScale = 0.85;
  const activeScale = 1.05;

  const slideScale0 = useTransform(scrollYProgress, [0, s1, s2], [
    baseScale,
    activeScale,
    baseScale
  ]);

  const slideScale1 = useTransform(scrollYProgress, [0, s3, s4, s5], [
    baseScale,
    baseScale,
    activeScale,
    baseScale
  ]);

  const slideScale2 = useTransform(scrollYProgress, [0, s6, s7, 1], [
    baseScale,
    baseScale,
    activeScale,
    activeScale
  ]);

  const slideScales = [slideScale0, slideScale1, slideScale2];

  return (
    <section
      ref={sectionRef}
      className="relative flex items-stretch overflow-visible"
      style={{ height: `${scrollHeight}vh` }}
    >
      <div className="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden pointer-events-none">
        <motion.div
          style={{ x: trackX }}
          className="flex h-[70vh] items-center gap-[24vw] pointer-events-auto"
        >
          {slides.map((slide, index) => {
            const mainFeature = slide.features[0];
            const secondaryFeature = slide.features[1];
            const featureList = slide.featureList;

            return (
              <motion.div
                key={slide.id}
                style={{ scale: slideScales[index], transformOrigin: "center center" }} // 强制中心缩放
                className="shrink-0 w-[70vw] flex items-center justify-center" // 限制宽度为 70vw，不再是 w-screen
              >
                <div className="relative w-full px-4 md:px-8">
                  <div className="grid gap-6 lg:gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] items-center">
                    <div className="space-y-6">
                      <div className="inline-flex items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--border-color)_70%,transparent)] bg-[color-mix(in_srgb,var(--bg-elevated)_94%,black_6%)] px-3 py-1 text-[10px] tracking-[0.18em] uppercase text-[var(--text-color-secondary)]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary-color)]" />
                        <span>{slide.tag}</span>
                      </div>
                      <div className="space-y-4">
                        <h3 className="text-xl md:text-2xl font-semibold leading-tight">
                          {slide.title}
                        </h3>
                        <p className="text-xs md:text-sm text-[var(--text-color-secondary)] leading-relaxed">
                          {slide.description}
                        </p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="rounded-[calc(var(--radius-base)_-_6px)] border border-[color-mix(in_srgb,var(--border-color)_80%,transparent)] bg-[color-mix(in_srgb,var(--bg-elevated)_96%,black_4%)] p-4 shadow-[0_16px_40px_rgba(15,23,42,0.55)] space-y-2">
                          <div className="inline-flex items-center gap-1 rounded-full bg-[color-mix(in_srgb,var(--primary-color)_10%,transparent)] text-[var(--primary-color)] text-[10px] px-2 py-1">
                            <span>{mainFeature.tag}</span>
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-sm font-semibold">
                              {mainFeature.title}
                            </h4>
                            <p className="text-[11px] leading-relaxed text-[var(--text-color-secondary)] line-clamp-3">
                              {mainFeature.description}
                            </p>
                          </div>
                        </div>
                        <div className="rounded-[calc(var(--radius-base)_-_6px)] border border-[color-mix(in_srgb,var(--border-color)_70%,transparent)] bg-[color-mix(in_srgb,var(--bg-elevated)_94%,black_6%)] p-4 space-y-2">
                          <div className="inline-flex items-center gap-1 rounded-full bg-[color-mix(in_srgb,var(--primary-color)_8%,transparent)] text-[var(--primary-color)] text-[10px] px-2 py-1">
                            <span>{secondaryFeature.tag}</span>
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-sm font-semibold">
                              {secondaryFeature.title}
                            </h4>
                            <p className="text-[11px] leading-relaxed text-[var(--text-color-secondary)] line-clamp-3">
                              {secondaryFeature.description}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            if (index === 2) {
                              navigate(routes.resume);
                            } else {
                              navigate(routes.allSearch);
                            }
                          }}
                          className="inline-flex items-center gap-1.5 rounded-full bg-[color-mix(in_srgb,var(--primary-color),transparent_85%)] px-4 py-2 text-xs font-medium text-[var(--primary-color)] transition-all duration-300 hover:bg-[var(--primary-color)] hover:text-black"
                        >
                          <span>立即体验</span>
                        </button>
                      </div>
                    </div>
                    <div className="relative h-[320px] md:h-[380px] lg:h-[420px]">
                      <div className="absolute -inset-10 rounded-[40px] bg-gradient-to-br from-sky-500/30 via-emerald-400/12 to-purple-500/35 opacity-60 blur-3xl" />
                      <motion.div
                        className="relative h-full w-full rounded-[32px] overflow-hidden"
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.4 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                      >
                        <div className="h-9 flex items-center justify-between bg-gradient-to-r from-white/6 via-white/10 to-white/6 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-[var(--text-color-secondary)]">
                            <span className="hidden md:inline-flex">
                              小破站 · {slide.title}
                            </span>
                            <span className="inline-flex rounded-full border border-white/10 bg-black/20 px-2 py-0.5 text-[9px] uppercase tracking-[0.2em]">
                              demo
                            </span>
                          </div>
                        </div>
                        {slide.previewType === "kanban" && (
                          <div className="flex h-full flex-col md:flex-row gap-4 md:gap-5 p-4 md:p-6 bg-black/20">
                            <div className="relative flex-1 rounded-2xl border border-[color-mix(in_srgb,var(--border-color)_80%,transparent)] bg-black/40 overflow-hidden p-3 md:p-4">
                              <div className="flex items-center justify-between text-[10px] text-white/70 mb-3">
                                <div className="inline-flex items-center gap-1">
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                  <span>知识库看板视图</span>
                                </div>
                                <span className="inline-flex items-center rounded-full bg-white/8 px-2 py-0.5 text-[9px]">
                                  实时预览
                                </span>
                              </div>
                              <div className="space-y-3">
                                <div className="h-9 rounded-xl bg-gradient-to-r from-emerald-400/25 via-sky-400/35 to-purple-500/25" />
                                <div className="grid grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] gap-2">
                                  <div className="space-y-1.5">
                                    {Array.from({ length: 4 }).map(
                                      (_, itemIndex) => (
                                        <div
                                          key={itemIndex}
                                          className="h-4 rounded-full bg-white/10"
                                        />
                                      )
                                    )}
                                  </div>
                                  <div className="space-y-1.5">
                                    {Array.from({ length: 4 }).map(
                                      (_, itemIndex) => (
                                        <div
                                          key={itemIndex}
                                          className="h-4 rounded-md bg-white/6"
                                        />
                                      )
                                    )}
                                  </div>
                                </div>
                                <div className="grid grid-cols-3 gap-2 pt-1">
                                  {Array.from({ length: 3 }).map(
                                    (_, itemIndex) => (
                                      <div
                                        key={itemIndex}
                                        className="h-10 rounded-xl bg-gradient-to-br from-white/10 via-white/5 to-transparent"
                                      />
                                    )
                                  )}
                                </div>
                              </div>
                              <motion.div
                                className="pointer-events-none absolute inset-x-6 bottom-3 h-10 rounded-xl bg-gradient-to-t from-black/60 via-black/0 to-transparent"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 1, delay: 0.3 }}
                              />
                            </div>
                            <div className="flex-1 space-y-3 md:space-y-4">
                              <div className="space-y-1">
                                <div className="inline-flex items-center gap-1 rounded-full bg-[color-mix(in_srgb,var(--primary-color)_12%,transparent)] px-2 py-0.5 text-[10px] text-[var(--primary-color)]">
                                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary-color)]" />
                                  <span>帮助你轻松搞定</span>
                                </div>
                                <p className="text-[11px] text-[var(--text-color-secondary)]">
                                  从内容收纳到输出发布，一块“预览图”解释整个能力闭环。
                                </p>
                              </div>
                              <div className="space-y-3">
                                {featureList.map((card, featureIndex) => (
                                  <div key={card.title} className="flex gap-3">
                                    <div className="mt-0.5 h-5 w-5 flex items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--primary-color)_10%,black_90%)] text-[10px] text-[var(--primary-color)]">
                                      {featureIndex + 1}
                                    </div>
                                    <div className="space-y-0.5">
                                      <div className="text-[11px] font-medium">
                                        {card.title}
                                      </div>
                                      <div className="text-[10px] text-[var(--text-color-secondary)] leading-relaxed line-clamp-2">
                                        {card.description}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <div className="flex items-center gap-2 text-[10px] text-[var(--text-color-secondary)]">
                                <span className="inline-flex h-6 items-center rounded-full border border-[color-mix(in_srgb,var(--border-color)_75%,transparent)] bg-[color-mix(in_srgb,var(--bg-elevated)_94%,black_6%)] px-2">
                                  支持主题切换 · 动效适配深浅色背景
                                </span>
                                <span className="hidden md:inline-flex">
                                  也可以在移动端获得近似体验
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                        {slide.previewType === "list" && (
                          <div className="flex h-full flex-col md:flex-row gap-4 md:gap-6 p-5 md:p-7 bg-gradient-to-br from-purple-800/40 via-slate-900/60 to-sky-700/40">
                            <div className="flex-1 space-y-3">
                              <div className="inline-flex items-center gap-1 rounded-full bg-white/6 px-2 py-0.5 text-[9px] uppercase tracking-[0.2em] text-white/70">
                                <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                                <span>STEP-BY-STEP</span>
                              </div>
                              <div className="space-y-2">
                                {featureList.map((card, indexStep) => (
                                  <div
                                    key={card.title}
                                    className="relative overflow-hidden rounded-2xl bg-black/40 border border-white/8 px-3.5 py-3"
                                  >
                                    <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-sky-400 via-violet-400 to-emerald-400" />
                                    <div className="pl-3.5 space-y-1">
                                      <div className="flex items-center justify-between">
                                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-[10px] text-white/80">
                                          {indexStep + 1}
                                        </span>
                                        <span className="text-[10px] text-white/40">
                                          教程节点
                                        </span>
                                      </div>
                                      <div className="text-[11px] font-medium text-white/90">
                                        {card.title}
                                      </div>
                                      <div className="text-[10px] text-white/60 leading-relaxed line-clamp-2">
                                        {card.description}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="flex-1 flex flex-col justify-between space-y-3">
                              <div className="rounded-3xl bg-black/40 border border-sky-500/40 px-4 py-3 space-y-2">
                                <div className="flex items-center justify-between text-[10px] text-sky-100/80">
                                  <span className="inline-flex items-center gap-1">
                                    <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                                    实时进度面板
                                  </span>
                                  <span className="rounded-full bg-sky-500/20 px-2 py-0.5 text-[9px]">
                                    新手友好
                                  </span>
                                </div>
                                <div className="space-y-2">
                                  <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                                    <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-sky-400 via-violet-400 to-fuchsia-400" />
                                  </div>
                                  <div className="flex justify-between text-[10px] text-white/60">
                                    <span>基础入门 · 已完成</span>
                                    <span>67%</span>
                                  </div>
                                </div>
                              </div>
                              <div className="rounded-3xl bg-white/5 border border-white/10 px-4 py-3 space-y-2">
                                <div className="flex items-center justify-between text-[10px] text-white/80">
                                  <span className="inline-flex items-center gap-1">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                    视频连播队列
                                  </span>
                                  <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[9px]">
                                    连续学习
                                  </span>
                                </div>
                                <div className="space-y-1.5">
                                  {Array.from({ length: 3 }).map(
                                    (_, videoIndex) => (
                                      <div
                                        key={videoIndex}
                                        className="flex items-center justify-between rounded-2xl bg-black/40 px-2.5 py-1.5"
                                      >
                                        <div className="flex items-center gap-2">
                                          <div className="h-6 w-9 rounded-lg bg-gradient-to-br from-purple-500/50 via-sky-500/40 to-emerald-400/40" />
                                          <div className="space-y-0.5">
                                            <div className="text-[10px] text-white/80">
                                              实战演示 {videoIndex + 1}
                                            </div>
                                            <div className="text-[9px] text-white/50">
                                              10:2{videoIndex}
                                            </div>
                                          </div>
                                        </div>
                                        <span className="text-[9px] text-emerald-400">
                                          ▶
                                        </span>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        {slide.previewType === "profile" && (
                          <div className="flex h-full flex-col md:flex-row gap-4 md:gap-6 p-5 md:p-7 bg-gradient-to-br from-slate-900/80 via-indigo-900/70 to-fuchsia-800/50">
                            <div className="flex-1 flex items-center justify-center">
                              <div className="relative w-full max-w-xs md:max-w-sm rounded-[28px] bg-black/60 border border-white/10 px-5 py-6 space-y-4">
                                <div className="absolute -inset-8 rounded-[32px] bg-gradient-to-br from-fuchsia-500/25 via-sky-500/12 to-emerald-400/24 blur-2xl" />
                                <div className="relative flex items-center gap-3">
                                  <div className="relative h-12 w-12 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-sky-400 flex items-center justify-center text-lg font-semibold">
                                    CV
                                    <div className="absolute -inset-1 rounded-2xl border border-white/20" />
                                  </div>
                                  <div className="space-y-0.5">
                                    <div className="text-[12px] font-semibold text-white">
                                      多模板 · 在线简历
                                    </div>
                                    <div className="text-[10px] text-white/60">
                                      一份配置，多端输出，随时一键更新。
                                    </div>
                                  </div>
                                </div>
                                <div className="relative space-y-2">
                                  <div className="flex items-center justify-between text-[10px] text-white/70">
                                    <span>目标岗位</span>
                                    <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5">
                                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                      前端工程师
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-3 gap-2 pt-1">
                                    <div className="h-16 rounded-2xl bg-gradient-to-br from-sky-500/40 via-sky-400/30 to-transparent px-3 py-2 text-[10px] text-white/90 space-y-1">
                                      <div className="text-[9px] uppercase tracking-[0.18em] text-white/70">
                                        SKILLS
                                      </div>
                                      <div>React · TypeScript</div>
                                    </div>
                                    <div className="h-16 rounded-2xl bg-gradient-to-br from-emerald-500/35 via-emerald-400/25 to-transparent px-3 py-2 text-[10px] text-white/90 space-y-1">
                                      <div className="text-[9px] uppercase tracking-[0.18em] text-white/70">
                                        PROJECTS
                                      </div>
                                      <div>3 个精选项目</div>
                                    </div>
                                    <div className="h-16 rounded-2xl bg-gradient-to-br from-fuchsia-500/35 via-fuchsia-400/25 to-transparent px-3 py-2 text-[10px] text-white/90 space-y-1">
                                      <div className="text-[9px] uppercase tracking-[0.18em] text-white/70">
                                        EXPORT
                                      </div>
                                      <div>PDF / PNG</div>
                                    </div>
                                  </div>
                                </div>
                                <div className="relative space-y-2">
                                  <div className="flex items-center justify-between text-[10px] text-white/70">
                                    <span>开源社区绑定</span>
                                    <span className="text-[9px] text-emerald-300">
                                      已关联 2 个仓库
                                    </span>
                                  </div>
                                  <div className="space-y-1.5">
                                    {slide.features.map((card) => (
                                      <div
                                        key={card.title}
                                        className="flex items-center justify-between rounded-2xl bg-white/5 px-3 py-2"
                                      >
                                        <div className="space-y-0.5">
                                          <div className="text-[10px] text-white/80">
                                            {card.title}
                                          </div>
                                          <div className="text-[9px] text-white/60 line-clamp-1">
                                            {card.description}
                                          </div>
                                        </div>
                                        <span className="text-[9px] text-fuchsia-300">
                                          详情
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex-1 flex flex-col justify-between space-y-3">
                              <div className="rounded-3xl bg-black/50 border border-white/10 px-4 py-3 space-y-2">
                                <div className="flex items-center justify-between text-[10px] text-white/80">
                                  <span className="inline-flex items-center gap-1">
                                    <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                                    多版本管理
                                  </span>
                                  <span className="rounded-full bg-sky-500/20 px-2 py-0.5 text-[9px]">
                                    草稿 · 投递版
                                  </span>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="h-16 rounded-2xl bg-gradient-to-br from-sky-500/25 via-sky-400/15 to-transparent px-3 py-2 space-y-1">
                                    <div className="text-[9px] text-white/70">
                                      当前版本
                                    </div>
                                    <div className="text-[10px] text-white/90">
                                      校招 JD 定制版
                                    </div>
                                  </div>
                                  <div className="h-16 rounded-2xl bg-gradient-to-br from-emerald-500/25 via-emerald-400/15 to-transparent px-3 py-2 space-y-1">
                                    <div className="text-[9px] text-white/70">
                                      上次投递
                                    </div>
                                    <div className="text-[10px] text-white/90">
                                      三天前更新
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="rounded-3xl bg-white/5 border border-white/10 px-4 py-3 space-y-2">
                                <div className="flex items-center justify-between text-[10px] text-white/80">
                                  <span className="inline-flex items-center gap-1">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                    一键导出
                                  </span>
                                  <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[9px]">
                                    无水印
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-white/70">
                                  <div className="flex-1 h-9 rounded-2xl bg-gradient-to-r from-fuchsia-400/40 via-sky-400/40 to-emerald-400/40 flex items-center justify-center">
                                    <span>导出为 PDF</span>
                                  </div>
                                  <div className="flex-1 h-9 rounded-2xl bg-white/10 flex items-center justify-center">
                                    <span>生成分享链接</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </motion.div>
                      <motion.div
                        className="pointer-events-none absolute -left-2 bottom-10 hidden md:block w-40 rounded-2xl border border-[color-mix(in_srgb,var(--border-color)_70%,transparent)] bg-[color-mix(in_srgb,var(--bg-elevated)_96%,black_4%)]/90 px-3 py-2 text-[10px] shadow-[0_14px_40px_rgba(15,23,42,0.75)]"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.4 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                      >
                        <div className="mb-1 flex items-center gap-1.5 text-[var(--primary-color)]">
                          <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary-color)]" />
                          <span>自动保存</span>
                        </div>
                        <div className="text-[10px] text-[var(--text-color-secondary)] leading-relaxed">
                          草稿实时同步，不怕浏览器崩溃或误刷新。
                        </div>
                      </motion.div>
                      <motion.div
                        className="pointer-events-none absolute -right-0 top-6 hidden md:block w-40 rounded-2xl border border-[color-mix(in_srgb,var(--border-color)_70%,transparent)] bg-[color-mix(in_srgb,var(--bg-elevated)_96%,black_4%)]/90 px-3 py-2 text-[10px] shadow-[0_14px_40px_rgba(15,23,42,0.75)]"
                        initial={{ opacity: 0, y: -10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.4 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                      >
                        <div className="mb-1 flex items-center gap-1.5 text-[var(--primary-color)]">
                          <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary-color)]" />
                          <span>一键输出</span>
                        </div>
                        <div className="text-[10px] text-[var(--text-color-secondary)] leading-relaxed">
                          支持导出为文档、图片或简历素材，方便复用。
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
