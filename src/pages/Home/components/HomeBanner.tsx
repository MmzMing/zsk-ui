// ===== 1. 依赖导入区域 =====
import React, { useMemo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@heroui/react";
import { useNavigate } from "react-router-dom";
import { routes } from "../../../router/routes";
import { ArrowRight, Box, Layers, Zap, type LucideProps } from "lucide-react";
import ParticleBanner from "../../../components/Three/ParticleBanner";
import { fetchHomeHero, mockHomeHero, type HomeHero } from "../../../api/front/home";
import ColourfulText from "../../../components/Aceternity/ColourfulText";

// ===== 2. TODO待处理导入区域 =====

// ===== 3. 状态控制逻辑区域 =====
/**
 * 图标映射配置
 */
const ICON_MAP: Record<string, React.ForwardRefExoticComponent<LucideProps & React.RefAttributes<SVGSVGElement>>> = {
  Box: Box,
  Layers: Layers,
  Zap: Zap,
};

// ===== 4. 通用工具函数区域 =====

// ===== 5. 注释代码函数区 =====

// ===== 6. 错误处理函数区域 =====

// ===== 7. 数据处理函数区域 =====

// ===== 8. UI渲染逻辑区域 =====
/**
 * 首页英雄区组件
 * 展示核心口号、描述及操作入口
 */
export default function HomeBanner() {
  // --- 状态控制 ---
  const [hero, setHero] = useState<HomeHero>(() => mockHomeHero);

  // --- 导航钩子 ---
  const navigate = useNavigate();

  // --- 数据获取 ---
  /**
   * 加载英雄区数据
   */
  const loadHero = React.useCallback(async () => {
    const data = await fetchHomeHero();
    if (data) {
      setHero(data);
    }
  }, []);

  // 初始化加载
  useEffect(() => {
    const timer = setTimeout(() => {
      loadHero();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadHero]);

  // --- 动画变体配置 ---
  const bannerAnimations = useMemo(() => ({
    badge: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { delay: 0.1, duration: 0.5 }
    },
    title1: {
      initial: { opacity: 0, x: -20 },
      animate: { opacity: 1, x: 0 },
      transition: { delay: 0.2, duration: 0.5 }
    },
    title2: {
      initial: { opacity: 0, x: -20 },
      animate: { opacity: 1, x: 0 },
      transition: { delay: 0.3, duration: 0.5 }
    },
    description: {
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0 },
      transition: { delay: 0.4, duration: 0.5 }
    },
    actions: {
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0 },
      transition: { delay: 0.5, duration: 0.5 }
    },
    features: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { delay: 0.7, duration: 0.8 }
    }
  }), []);

  return (
    <section className="min-h-screen flex items-center px-[var(--content-padding)] relative overflow-hidden">
      {/* 背景粒子层 - 仅在桌面端显示 */}
      <div className="hidden lg:block absolute inset-0 z-0 pointer-events-none">
        <ParticleBanner />
      </div>

      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center z-10 relative">
        <div className="space-y-8">
          {/* 主标题区域 */}
          <div className="space-y-6">
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1]">
              <motion.div 
                {...bannerAnimations.title1}
                className="block text-white"
              >
                <ColourfulText text={hero.titleLine1} />
              </motion.div>
              <motion.div 
                {...bannerAnimations.title2}
                className="block"
              >
                <ColourfulText text={hero.titleLine2} />
              </motion.div>
            </h2>
          </div>

          {/* 操作按钮区域 */}
          <motion.div 
            {...bannerAnimations.actions}
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
              {hero.buttonText}
            </Button>
            
            <div className="flex items-center gap-4 text-sm text-default-400">
              <div className="h-px w-8 bg-default-300 hidden sm:block"></div>
              <span>或从下方推荐内容开始随便逛逛</span>
            </div>
          </motion.div>

          {/* 特性亮点展示 */}
          <motion.div 
            {...bannerAnimations.features}
            className="pt-8 grid grid-cols-3 gap-6 max-w-md border-t border-default-100"
          >
            {hero.features.map((item, idx) => {
              const IconComponent = ICON_MAP[item.iconName] || Box;
              return (
                <div key={idx} className="flex items-center gap-2 text-default-600">
                  <IconComponent className="w-4 h-4 text-[var(--primary-color)]/80" />
                  <span className="text-xs font-medium">{item.label}</span>
                </div>
              );
            })}
          </motion.div>
        </div>

        {/* 右侧占位，保持 Grid 布局平衡，但内容交给背景层渲染 */}
        <div className="hidden lg:block h-[600px] w-full" />
      </div>
    </section>
  );
}

// ===== 9. 页面初始化与事件绑定 =====

// ===== 10. TODO任务管理区域 =====

// ===== 11. 导出区域 =====
