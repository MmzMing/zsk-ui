import React, { Suspense } from "react";
import { motion } from "framer-motion";
import { Button } from "@heroui/react";
import { useNavigate } from "react-router-dom";
import { routes } from "../../../router/routes";

const ParticleBanner = React.lazy(() => import("../../../components/Three/ParticleBanner"));

export default function HomeBanner() {
  const navigate = useNavigate();

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="min-h-screen flex items-center px-[var(--content-padding)] relative overflow-hidden"
    >
      {/* 背景粒子层 - 仅在桌面端显示 */}
      <div className="hidden lg:block absolute inset-0 z-0 pointer-events-none">
        <Suspense fallback={null}>
          <ParticleBanner />
        </Suspense>
      </div>

      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center z-10 relative">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--primary-color)_20%,transparent)] bg-[color-mix(in_srgb,var(--primary-color)_6%,transparent)] px-3 py-1 text-xs text-[var(--primary-color)]">
            <span>开放探索 · 主动学习 · 趣味成长</span>
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight">
              让知识<br/>不再散落角落
            </h2>
            <p className="text-base md:text-lg text-[var(--text-color-secondary)] leading-relaxed max-w-xl">
              打造属于开发者的轻量化知识库与成长记录空间，代码片段、学习笔记、
              视频素材与灵感草稿都能被温柔地收纳、组织与回顾。
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <Button
              type="button"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--primary-color)] px-6 py-3 text-[var(--bg-elevated)] text-sm font-semibold shadow-lg hover:shadow-xl hover:bg-[color-mix(in_srgb,var(--primary-color)_90%,black_10%)] transition-all duration-200 transform hover:-translate-y-0.5"
              onPress={() => navigate(routes.allSearch)}
            >
              立即整理我的知识库
            </Button>
            <span className="text-[var(--text-color-secondary)] text-xs md:text-sm">
              或从下方推荐内容开始随便逛逛
            </span>
          </div>
        </div>

        {/* 右侧占位，保持 Grid 布局平衡，但内容交给背景层渲染 */}
        <div className="hidden lg:block h-[600px] w-full" />
      </div>
    </motion.section>
  );
}

