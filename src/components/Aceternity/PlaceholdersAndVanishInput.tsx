// ===== 1. 依赖导入区域 =====
import React, { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/utils";

// ===== 2. TODO待处理导入区域 =====

// ===== 3. 状态控制逻辑区域 =====

/**
 * PlaceholdersAndVanishInput 组件的属性定义
 */
interface PlaceholdersAndVanishInputProps {
  /** 占位符数组 */
  placeholders: string[];
  /** 值改变时的回调 */
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** 表单提交时的回调 */
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

/** 粒子项接口 */
interface PixelData {
  x: number;
  y: number;
  r: number;
  color: string;
}

/**
 * PlaceholdersAndVanishInput 组件
 * 实现占位符切换和文字消失效果
 * @param props 组件属性
 * @returns 渲染的组件
 */
export function PlaceholdersAndVanishInput({
  placeholders,
  onChange,
  onSubmit,
}: PlaceholdersAndVanishInputProps) {
  /** 当前占位符索引 */
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);
  /** 输入框引用 */
  const inputRef = useRef<HTMLInputElement>(null);
  /** 画布引用 */
  const canvasRef = useRef<HTMLCanvasElement>(null);
  /** 粒子数据引用 */
  const newDataRef = useRef<PixelData[]>([]);
  /** 输入值状态 */
  const [value, setValue] = useState("");
  /** 是否正在执行动画 */
  const [animating, setAnimating] = useState(false);

  // ===== 4. 通用工具函数区域 =====

  /**
   * 绘制文字到画布并提取像素数据
   */
  const draw = useCallback(() => {
    if (!inputRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = inputRef.current.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    ctx.clearRect(0, 0, rect.width, rect.height);
    const computedStyles = getComputedStyle(inputRef.current);

    const fontSize = parseFloat(computedStyles.getPropertyValue("font-size"));
    ctx.font = `${fontSize}px ${computedStyles.getPropertyValue("font-family")}`;
    ctx.fillStyle = "#FFF";
    
    // 获取水平内边距
    const paddingLeft = parseFloat(computedStyles.getPropertyValue("padding-left"));
    // 垂直居中计算 (12rem = 48px, 字体基准线通常在底部)
    ctx.fillText(value, paddingLeft, rect.height / 2 + fontSize / 3);

    const imageData = ctx.getImageData(0, 0, rect.width, rect.height);
    const pixelData = imageData.data;
    const newData: { x: number; y: number; color: number[] }[] = [];

    for (let t = 0; t < rect.height; t++) {
      const i = 4 * t * rect.width;
      for (let n = 0; n < rect.width; n++) {
        const e = i + 4 * n;
        if (
          pixelData[e] !== 0 &&
          pixelData[e + 1] !== 0 &&
          pixelData[e + 2] !== 0
        ) {
          newData.push({
            x: n,
            y: t,
            color: [
              pixelData[e],
              pixelData[e + 1],
              pixelData[e + 2],
              pixelData[e + 3],
            ],
          });
        }
      }
    }

    newDataRef.current = newData.map(({ x, y, color }) => ({
      x,
      y,
      r: 1,
      color: `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3]})`,
    }));
  }, [value]);

  /**
   * 执行粒子动画
   */
  const animate = (start: number) => {
    const animateFrame = (pos: number = 0) => {
      requestAnimationFrame(() => {
        const newArr = [];
        for (let i = 0; i < newDataRef.current.length; i++) {
          const current = newDataRef.current[i];
          if (current.x < pos) {
            newArr.push(current);
          } else {
            if (current.r <= 0) continue;
            current.x += Math.random() > 0.5 ? 1 : -1;
            current.y += Math.random() > 0.5 ? 1 : -1;
            current.r -= 0.05 * Math.random();
            newArr.push(current);
          }
        }
        newDataRef.current = newArr;
        const ctx = canvasRef.current?.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, 2000, 2000); // 清除足够大的区域
          newDataRef.current.forEach((t) => {
            const { x: n, y: i, r: s, color: color } = t;
            if (n > pos) {
              ctx.beginPath();
              ctx.rect(n, i, s, s);
              ctx.fillStyle = color;
              ctx.fill();
            }
          });
        }
        if (newDataRef.current.length > 0) {
          animateFrame(pos - 8);
        } else {
          setValue("");
          setAnimating(false);
        }
      });
    };
    animateFrame(start);
  };

  // ===== 5. 注释代码函数区 =====

  // ===== 6. 错误处理函数区域 =====

  // ===== 7. 数据处理函数区域 =====

  /**
   * 处理输入框变化
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !animating) {
      vanishAndSubmit();
    }
  };

  /**
   * 文字消失并提交
   */
  const vanishAndSubmit = () => {
    setAnimating(true);
    draw();

    const value = inputRef.current?.value || "";
    if (value) {
      setAnimating(true);
      animate(45);
      if (onSubmit) {
        onSubmit({} as React.FormEvent<HTMLFormElement>);
      }
    }
  };

  /**
   * 处理表单提交
   */
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    vanishAndSubmit();
    if (onSubmit) {
      onSubmit(e);
    }
  };

  // ===== 8. UI渲染逻辑区域 =====

  useEffect(() => {
    /** 切换占位符的定时器 */
    const interval = setInterval(() => {
      setCurrentPlaceholder((prev) => (prev + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [placeholders.length]);

  // ===== 9. 页面初始化与事件绑定 =====

  return (
    <form
      className={cn(
        "w-full relative bg-[var(--bg-elevated)] h-12 rounded-full overflow-hidden shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),_0px_1px_0px_0px_rgba(25,28,33,0.02),_0px_0px_0px_1px_rgba(25,28,33,0.08)] transition duration-200",
        value && "bg-[var(--bg-elevated)]"
      )}
      onSubmit={handleSubmit}
    >
      <canvas
        className={cn(
          "absolute pointer-events-none text-base top-0 left-0 origin-top-left filter invert dark:invert-0",
          !animating ? "opacity-0" : "opacity-100"
        )}
        ref={canvasRef}
      />
      <input
        onChange={(e) => {
          if (!animating) {
            setValue(e.target.value);
            if (onChange) {
              onChange(e);
            }
          }
        }}
        onKeyDown={handleKeyDown}
        ref={inputRef}
        value={value}
        type="text"
        className={cn(
          "w-full relative text-sm sm:text-base z-50 border-none dark:text-white bg-transparent text-black h-full rounded-full focus:outline-none focus:ring-0 pl-4 sm:pl-10 pr-20",
          animating && "text-transparent dark:text-transparent"
        )}
      />

      <button
        disabled={!value}
        type="submit"
        className="absolute right-2 top-1/2 z-50 -translate-y-1/2 h-8 w-8 rounded-full disabled:bg-gray-100 bg-black dark:bg-zinc-900 dark:disabled:bg-zinc-800 transition duration-200 flex items-center justify-center"
      >
        <motion.svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-gray-300 h-4 w-4"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <motion.path
            d="M5 12l14 0"
            initial={{
              strokeDasharray: "50%",
              strokeDashoffset: "50%",
            }}
            animate={{
              strokeDashoffset: value ? 0 : "50%",
            }}
            transition={{
              duration: 0.3,
              ease: "linear",
            }}
          />
          <path d="M13 18l6 -6" />
          <path d="M13 6l6 6" />
        </motion.svg>
      </button>

      <div className="absolute inset-0 flex items-center rounded-full pointer-events-none">
        <AnimatePresence mode="wait">
          {!value && (
            <motion.p
              initial={{
                y: 5,
                opacity: 0,
              }}
              key={`placeholder-${currentPlaceholder}`}
              animate={{
                y: 0,
                opacity: 1,
              }}
              exit={{
                y: -15,
                opacity: 0,
              }}
              transition={{
                duration: 0.3,
                ease: "linear",
              }}
              className="dark:text-zinc-500 text-sm sm:text-base font-normal text-neutral-500 pl-4 sm:pl-12 text-left w-[calc(100%-2rem)] truncate"
            >
              {placeholders[currentPlaceholder]}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </form>
  );
}

// ===== 10. TODO任务管理区域 =====

// ===== 11. 导出区域 =====
