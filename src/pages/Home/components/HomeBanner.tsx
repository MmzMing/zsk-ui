import React from "react";
import { motion } from "framer-motion";
import { Button } from "@heroui/react";
import { useNavigate } from "react-router-dom";
import { routes } from "../../../router/routes";
import { ArrowRight, Box, Layers, Zap } from "lucide-react";

import ParticleBanner from "../../../components/Three/ParticleBanner";

export default function HomeBanner() {
  const navigate = useNavigate();

  return (
    <section
      className="min-h-screen flex items-center px-[var(--content-padding)] relative overflow-hidden"
    >
      {/* 背景粒子层 - 仅在桌面端显示 */}
      <div className="hidden lg:block absolute inset-0 z-0 pointer-events-none">
        <ParticleBanner />
      </div>

      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center z-10 relative">
        <div className="space-y-8">
          {/* Badge */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="inline-flex items-center gap-3 rounded-full border border-[var(--primary-color)]/40 bg-[var(--primary-color)]/10 px-4 py-2 backdrop-blur-md shadow-[0_0_15px_rgba(var(--primary-rgb,126,13,245),0.1)]"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--primary-color)] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--primary-color)]"></span>
            </span>
            <span className="text-sm font-semibold text-[var(--primary-color)] tracking-widest uppercase">
              开放探索 · 主动学习 · 趣味成长
            </span>
          </motion.div>

          {/* Headline */}
          <div className="space-y-6">
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1]">
              <motion.span 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="block text-white"
              >
                让知识
              </motion.span>
              <motion.span 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="block text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600"
              >
                不再散落角落
              </motion.span>
            </h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-base md:text-lg text-gray-400 leading-relaxed max-w-xl"
            >
              打造属于开发者的轻量化知识库与成长记录空间。
              <span className="block mt-2">
                无论是<span className="text-white font-medium">代码片段</span>、
                <span className="text-white font-medium">学习笔记</span>，
                还是<span className="text-white font-medium">灵感草稿</span>，
                都能在这里被温柔地收纳、组织与回顾。
              </span>
            </motion.p>
          </div>

          {/* Action Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-6"
          >
            <Button
              size="lg"
              color="primary"
              variant="shadow"
              className="font-semibold px-8 h-12 rounded-full"
              endContent={<ArrowRight className="w-4 h-4" />}
              onPress={() => navigate(routes.allSearch)}
            >
              立即整理我的知识库
            </Button>
            
            <div className="flex items-center gap-4 text-sm text-default-400">
              <div className="h-px w-8 bg-default-300 hidden sm:block"></div>
              <span>或从下方推荐内容开始随便逛逛</span>
            </div>
          </motion.div>

          {/* Feature Highlights (Mini) */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="pt-8 grid grid-cols-3 gap-6 max-w-md border-t border-default-100"
          >
            {[
              { icon: Box, label: "结构化" },
              { icon: Layers, label: "多维度" },
              { icon: Zap, label: "高效能" }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-default-600">
                <item.icon className="w-4 h-4 text-[var(--primary-color)]/80" />
                <span className="text-xs font-medium">{item.label}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* 右侧占位，保持 Grid 布局平衡，但内容交给背景层渲染 */}
        <div className="hidden lg:block h-[600px] w-full" />
      </div>
    </section>
  );
}

