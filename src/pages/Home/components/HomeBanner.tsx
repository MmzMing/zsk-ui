import React from "react";
import { motion } from "framer-motion";
import { Button } from "@heroui/react";
import { useNavigate } from "react-router-dom";
import { routes } from "../../../router/routes";

export default function HomeBanner() {
  const navigate = useNavigate();

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="min-h-screen flex items-center px-[var(--content-padding)]"
    >
      <div className="w-full max-w-6xl mx-auto space-y-5">
        <div className="max-w-3xl space-y-5">
        <div className="inline-flex items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--primary-color)_20%,transparent)] bg-[color-mix(in_srgb,var(--primary-color)_6%,transparent)] px-3 py-1 text-xs text-[var(--primary-color)]">
          <span>开放探索 · 主动学习 · 趣味成长</span>
        </div>
        <div className="space-y-3">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            让知识不再散落角落
          </h2>
          <p className="text-sm md:text-base text-[var(--text-color-secondary)] leading-relaxed">
            打造属于开发者的轻量化知识库与成长记录空间，代码片段、学习笔记、
            视频素材与灵感想法都能被温柔地收纳、组织与回顾。
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm">
          <Button
            type="button"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--primary-color)] px-4 py-2 text-[var(--bg-elevated)] text-xs md:text-sm font-medium shadow-sm hover:shadow-md hover:bg-[color-mix(in_srgb,var(--primary-color)_90%,black_10%)] transition-colors transition-shadow duration-150"
            onPress={() => navigate(routes.allSearch)}
          >
            立即整理我的知识库
          </Button>
          <span className="text-[var(--text-color-secondary)]">
            或从下方推荐内容开始随便逛逛
          </span>
        </div>
        </div>
      </div>
    </motion.section>
  );
}

