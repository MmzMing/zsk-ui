// ===== 1. 依赖导入区域 =====
import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { routes } from "../../../router/routes";
import { ShinyButton } from "../../../components/MagicUI/ShinyButton";
import { ArrowRight, Box, Layers, Zap, type LucideProps } from "lucide-react";
import ParticleBanner from "../../../components/Three/ParticleBanner";
import ColourfulText from "../../../components/Aceternity/ColourfulText";

// ===== 2. TODO待处理导入区域 =====

// ===== 3. 状态控制逻辑区域 =====
/**
 * 首页英雄区数据类型
 */
interface HomeHero {
  titleLine1: string;
  titleLine2: string;
  buttonText: string;
  features: Array<{ label: string; iconName: string }>;
}

/**
 * 首页英雄区静态数据
 */
const HERO_DATA: HomeHero = {
  titleLine1: ">_让 知 识",
  titleLine2: "不再 散 落 无 章",
  buttonText: "开启我的知识整理之旅",
  features: [
    { label: "结构化", iconName: "Box" },
    { label: "多维度", iconName: "Layers" },
    { label: "高效能", iconName: "Zap" }
  ]
};

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
  const hero = HERO_DATA;

  // --- 导航钩子 ---
  const navigate = useNavigate();

  // --- 动画变体配置 ---
  const bannerAnimations = useMemo(() => ({
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
    actions: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { delay: 0.5, duration: 0.6 }
    },
    features: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { delay: 0.4, duration: 0.6 }
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

          {/* 特性亮点展示 - 移除背景和边框，悬停仅变色 */}
          <motion.div 
            {...bannerAnimations.features}
            className="flex items-center gap-6 max-w-fit"
          >
            {hero.features.map((item, idx) => {
              const IconComponent = ICON_MAP[item.iconName] || Box;
              return (
                <React.Fragment key={idx}>
                  <div className="flex items-center gap-2 text-[#475569] hover:text-[#537bf9] transition-colors cursor-default group">
                    <IconComponent className="w-4 h-4 text-inherit opacity-70 group-hover:opacity-100 transition-opacity" />
                    <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
                  </div>
                  {idx < hero.features.length - 1 && (
                    <div className="h-4 w-px bg-[#cbd5e1]" />
                  )}
                </React.Fragment>
              );
            })}
          </motion.div>

          {/* 操作按钮区域 - 移至下方 */}
          <motion.div 
            {...bannerAnimations.actions}
            className="flex flex-col gap-6"
          >
            <ShinyButton
              className="h-10 px-8 rounded-full text-base font-semibold shadow-lg hover:shadow-xl w-fit"
              onClick={() => navigate(routes.allSearch)}
            >
              <div className="flex items-center gap-2">
                <span>{hero.buttonText}</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </ShinyButton>
            
            <div className="flex items-center gap-4 text-sm text-[#475569] hover:text-[#537bf9] transition-colors cursor-default pl-4 group">
              <div className="h-px w-8 bg-[#cbd5e1] group-hover:bg-[#537bf9] transition-colors hidden sm:block opacity-50"></div>
              <span>或从下方推荐内容开始随便逛逛</span>
            </div>
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
