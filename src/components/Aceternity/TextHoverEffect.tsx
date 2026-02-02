// ===== 1. 依赖导入区域 =====
import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

// ===== 2. TODO待处理导入区域 =====

// ===== 3. 状态控制逻辑区域 =====

// ===== 4. 通用工具函数区域 =====

// ===== 5. 注释代码函数区 =====

// ===== 6. 错误处理函数区域 =====

// ===== 7. 数据处理函数区域 =====

// ===== 8. UI渲染逻辑区域 =====
/**
 * 文字悬停效果组件
 * 实现文字在鼠标悬停时的渐变发光跟随效果
 */
export default function TextHoverEffect({
  text,
  className,
  strokeWidth = 0.3,
}: {
  /** 显示文本 */
  text: string;
  /** 自定义类名 */
  className?: string;
  /** 描边宽度 */
  strokeWidth?: number;
}) {
  /** 容器引用 */
  const svgRef = useRef<SVGSVGElement>(null);
  /** 鼠标坐标状态 */
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  /** 悬停状态 */
  const [hovered, setHovered] = useState(false);
  /** 遮罩透明度 */
  const [maskAlpha, setMaskAlpha] = useState(0);

  /**
   * 根据文本长度计算 viewBox 宽度
   * 增加缓冲空间以防止水平截断
   */
  const viewBoxWidth = text.split('').reduce((acc, char) => {
    // 增加字符单位宽度：中文字符约 80，英文字符约 45
    return acc + (/[^\u0020-\u00ff]/.test(char) ? 80 : 45);
  }, 40); // 增加初始偏移量作为左右内边距

  /**
   * 鼠标移动处理
   */
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      // 计算相对于 SVG 坐标系的坐标
      const x = (e.clientX - rect.left) * (viewBoxWidth / rect.width);
      const y = (e.clientY - rect.top) * (100 / rect.height);
      setCursor({ x, y });
    }
  };

  /**
   * 动画循环处理
   */
  useEffect(() => {
    let animationFrameId: number;
    const animate = () => {
      setMaskAlpha((prev) => {
        const target = hovered ? 1 : 0;
        const diff = target - prev;
        if (Math.abs(diff) < 0.01) return target;
        return prev + diff * 0.1;
      });
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationFrameId);
  }, [hovered]);

  return (
    <div className={cn("relative flex items-center justify-center w-full h-full", className)}>
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox={`0 0 ${viewBoxWidth} 120`}
        xmlns="http://www.w3.org/2000/svg"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onMouseMove={handleMouseMove}
        className="select-none cursor-default"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* 径向渐变配置 */}
          <radialGradient
            id="textGradient"
            gradientUnits="userSpaceOnUse"
            cx="50%"
            cy="50%"
            r="25%"
          >
            {hovered && (
              <>
                <stop offset="0%" stopColor="var(--yellow-500)" />
                <stop offset="25%" stopColor="var(--red-500)" />
                <stop offset="50%" stopColor="var(--blue-500)" />
                <stop offset="75%" stopColor="var(--cyan-500)" />
                <stop offset="100%" stopColor="var(--violet-500)" />
              </>
            )}
          </radialGradient>

          {/* 径向渐变跟随效果 */}
          <motion.radialGradient
            id="revealMask"
            gradientUnits="userSpaceOnUse"
            r="20%"
            initial={{ cx: 0, cy: 0 }}
            animate={{
              cx: cursor.x ?? 0,
              cy: cursor.y ?? (120 / 2),
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <stop offset="0%" stopColor="white" stopOpacity={maskAlpha} />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </motion.radialGradient>

          {/* 遮罩定义 */}
          <mask id="textMask">
            <rect
              x="0"
              y="0"
              width="100%"
              height="100%"
              fill="url(#revealMask)"
            />
          </mask>
        </defs>

        {/* 底层描边文字 */}
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="middle"
          strokeWidth={strokeWidth}
          style={{ opacity: hovered ? 0.7 : 1 }}
          className="font-[helvetica] font-bold fill-transparent stroke-black/30 dark:stroke-white/30 text-[75px]"
        >
          {text}
        </text>

        {/* 悬停发光描边文字 */}
        <motion.text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="middle"
          strokeWidth={strokeWidth}
          className="font-[helvetica] font-bold fill-transparent stroke-cyan-500 text-[75px]"
          initial={{ strokeDasharray: 0, strokeDashoffset: 100 }}
          animate={{
            strokeDasharray: hovered ? "100 0" : "0 100",
            strokeDashoffset: hovered ? 0 : 100,
          }}
          transition={{ duration: 0.5 }}
        >
          {text}
        </motion.text>

        {/* 遮罩填充文字（彩色渐变层） */}
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="middle"
          stroke="url(#textGradient)"
          strokeWidth={strokeWidth}
          mask="url(#textMask)"
          className="font-[helvetica] font-bold fill-transparent text-[75px]"
        >
          {text}
        </text>
      </svg>
    </div>
  );
}

// ===== 9. 页面初始化与事件绑定 =====

// ===== 10. TODO任务管理区域 =====

// ===== 11. 导出区域 =====
