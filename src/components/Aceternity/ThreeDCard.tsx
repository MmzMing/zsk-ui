// ===== 1. 依赖导入区域 =====
import React, {
  createContext,
  useState,
  useContext,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { cn } from "../../lib/utils";

// ===== 2. TODO待处理导入区域 =====

// ===== 3. 状态控制逻辑区域 =====
/**
 * 鼠标进入状态上下文接口
 */
interface MouseEnterContextProps {
  /** 是否鼠标进入 */
  isMouseEntered: boolean;
  /** 设置鼠标进入状态 */
  setIsMouseEntered: (entered: boolean) => void;
}

/**
 * 鼠标进入状态上下文
 */
const MouseEnterContext = createContext<MouseEnterContextProps | undefined>(
  undefined
);

// ===== 4. 通用工具函数区域 =====

// ===== 5. 注释代码函数区 =====

// ===== 6. 错误处理函数区域 =====

// ===== 7. 数据处理函数区域 =====

// ===== 8. UI渲染逻辑区域 =====
/**
 * 3D 卡片容器组件
 */
export const CardContainer = ({
  children,
  className,
  containerClassName,
}: {
  /** 子组件 */
  children?: React.ReactNode;
  /** 类名 */
  className?: string;
  /** 外部容器类名 */
  containerClassName?: string;
}) => {
  /** 容器引用 */
  const containerRef = useRef<HTMLDivElement>(null);
  /** 鼠标进入状态 */
  const [isMouseEntered, setIsMouseEntered] = useState(false);

  /**
   * 处理鼠标移动事件，计算旋转角度
   * @param e 鼠标移动事件
   */
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const { left, top, width, height } =
      containerRef.current.getBoundingClientRect();
    const x = (e.clientX - left - width / 2) / 25;
    const y = (e.clientY - top - height / 2) / 25;
    containerRef.current.style.transform = `rotateY(${x}deg) rotateX(${-y}deg)`;
  };

  /**
   * 处理鼠标进入事件
   */
  const handleMouseEnter = () => {
    setIsMouseEntered(true);
  };

  /**
   * 处理鼠标离开事件
   */
  const handleMouseLeave = () => {
    if (!containerRef.current) return;
    setIsMouseEntered(false);
    containerRef.current.style.transform = `rotateY(0deg) rotateX(0deg)`;
  };

  return (
    <MouseEnterContext.Provider value={{ isMouseEntered, setIsMouseEntered }}>
      <div
        className={cn(
          "flex items-center justify-center",
          containerClassName
        )}
        style={{
          perspective: "1000px",
        }}
      >
        <div
          ref={containerRef}
          onMouseEnter={handleMouseEnter}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className={cn(
            "flex items-center justify-center relative transition-all duration-200 ease-linear",
            className
          )}
          style={{
            transformStyle: "preserve-3d",
          }}
        >
          {children}
        </div>
      </div>
    </MouseEnterContext.Provider>
  );
};

/**
 * 3D 卡片主体组件
 */
export const CardBody = ({
  children,
  className,
}: {
  /** 子组件 */
  children: React.ReactNode;
  /** 类名 */
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "[transform-style:preserve-3d]  [&>*]:[transform-style:preserve-3d]",
        className
      )}
    >
      {children}
    </div>
  );
};

/**
 * 3D 卡片子项组件，处理具体的 3D 偏移
 */
export const CardItem = ({
  as: Tag = "div",
  children,
  className,
  translateX = 0,
  translateY = 0,
  translateZ = 0,
  rotateX = 0,
  rotateY = 0,
  rotateZ = 0,
  ...rest
}: {
  /** 渲染标签 */
  as?: React.ElementType;
  /** 子组件 */
  children: React.ReactNode;
  /** 类名 */
  className?: string;
  /** X 轴位移 */
  translateX?: number | string;
  /** Y 轴位移 */
  translateY?: number | string;
  /** Z 轴位移 */
  translateZ?: number | string;
  /** X 轴旋转 */
  rotateX?: number | string;
  /** Y 轴旋转 */
  rotateY?: number | string;
  /** Z 轴旋转 */
  rotateZ?: number | string;
} & React.HTMLAttributes<HTMLElement>) => {
  /** 引用 */
  const ref = useRef<HTMLDivElement>(null);
  /** 获取上下文状态 */
  const context = useContext(MouseEnterContext);

  /**
   * 处理 3D 变换
   */
  const handleAnimations = useCallback(() => {
    if (!ref.current) return;
    if (context?.isMouseEntered) {
      ref.current.style.transform = `translateX(${translateX}px) translateY(${translateY}px) translateZ(${translateZ}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`;
    } else {
      ref.current.style.transform = `translateX(0px) translateY(0px) translateZ(0px) rotateX(0deg) rotateY(0deg) rotateZ(0deg)`;
    }
  }, [
    context?.isMouseEntered,
    translateX,
    translateY,
    translateZ,
    rotateX,
    rotateY,
    rotateZ,
  ]);

  useEffect(() => {
    handleAnimations();
  }, [handleAnimations]);

  const TagElement = Tag as "div";

  return (
    <TagElement
      ref={ref}
      className={cn("transition duration-200 ease-linear", className)}
      {...rest}
    >
      {children}
    </TagElement>
  );
};

// ===== 9. 页面初始化与事件绑定 =====

// ===== 10. TODO任务管理区域 =====

// ===== 11. 导出区域 =====
