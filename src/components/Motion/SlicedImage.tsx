import React, { useMemo } from 'react';
import { SliceConfig, DEFAULT_SLICE_CONFIG } from './SlicedImage.types';

/**
 * 伪随机数生成器 (基于种子)
 */
const getPseudoRandom = (seed: number) => {
  let value = seed;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
};

/**
 * 倾斜切片图片组件
 */
export const SlicedImage: React.FC<{
  src: string;
  config?: Partial<SliceConfig>;
  className?: string;
  showOverlayText?: boolean;
  overlayTag?: string;
}> = ({ 
  src, 
  config: customConfig, 
  className = "",
  showOverlayText = true,
  overlayTag = "Core Feature"
}) => {
  const config = useMemo(() => ({ ...DEFAULT_SLICE_CONFIG, ...customConfig }), [customConfig]);

  const layouts = useMemo(() => {
    const random = getPseudoRandom(config.randomSeed);
    const result = [];
    let currentPos = 0;
    const baseWidth = 100 / config.sliceCount;

    for (let i = 0; i < config.sliceCount; i++) {
      const widthVariation = (random() - 0.5) * 2 * config.sizeVariation;
      const sliceWidth = baseWidth * (1 + widthVariation);
      const gapVariation = (random() - 0.5) * 2 * config.gapVariation;
      const currentGap = config.sliceGap * (1 + gapVariation);
      const offset = (random() - 0.5) * 2 * config.sliceOffset;
      const glitchX = (random() - 0.5) * 2 * config.glitchOffset;
      const hasTopCut = random() < config.cornerCutProbability;
      const hasBottomCut = random() < config.cornerCutProbability;

      result.push({
        id: i,
        width: sliceWidth,
        left: currentPos,
        offset,
        glitchX,
        gap: currentGap,
        hasTopCut,
        hasBottomCut,
      });

      currentPos += sliceWidth;
    }
    return result;
  }, [config]);

  return (
    <div 
      className={`relative w-full h-full overflow-hidden ${className}`}
    >
      {/* 切片容器：整体倾斜 */}
      <div 
        className="absolute inset-[-15%] flex items-center justify-center pointer-events-none"
        style={{ transform: `rotate(${config.tiltAngle}deg)` }}
      >
        <div className="flex items-center h-[130%] gap-0 w-full max-w-none">
          {layouts.map((slice) => {
            let clipPath = "none";
            if (slice.hasTopCut || slice.hasBottomCut) {
              const top = slice.hasTopCut ? config.cornerCutSize : 0;
              const bottom = slice.hasBottomCut ? config.cornerCutSize : 0;
              clipPath = `polygon(0 ${top}px, 100% 0, 100% calc(100% - ${bottom}px), 0 100%)`;
            }

            // 计算图片在切片内部的反向偏移和缩放
            const imgWidthPercent = (100 / slice.width) * 100;
            const imgLeftPercent = -(slice.left / slice.width) * 100;

            return (
              <div
                key={slice.id}
                className="relative overflow-hidden h-full transition-all duration-500"
                style={{
                  width: `${slice.width}%`,
                  marginRight: `${slice.gap}px`,
                  transform: `translateY(${slice.offset}px)`,
                  clipPath,
                }}
              >
                {/* 内部图片包装器：反向倾斜 */}
                <div 
                  className="absolute inset-0 w-full h-full flex items-center justify-center"
                  style={{ 
                    transform: `rotate(${-config.tiltAngle}deg) scale(${config.imageScale}) translateX(${slice.glitchX}px)`,
                  }}
                >
                  <img
                    src={src}
                    alt=""
                    className="absolute h-full max-w-none object-cover"
                    style={{
                      width: `${imgWidthPercent}%`,
                      left: `${imgLeftPercent}%`,
                      filter: `brightness(${config.brightness}) contrast(${config.contrast}) grayscale(${config.grayscale})`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 文字包裹装饰层 */}
      {showOverlayText && (
        <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-1">
              <div className="bg-foreground text-background text-[10px] font-black px-2 py-0.5 tracking-widest uppercase">
                {overlayTag}
              </div>
              <div className="text-[8px] text-muted-foreground/40 font-mono tracking-tighter uppercase leading-none mt-2">
                System.Arch.01<br />
                Node.Index.99
              </div>
            </div>
            <div className="w-px h-12 bg-foreground/20" />
          </div>

          <div className="flex justify-between items-end">
            <div className="text-[10px] text-muted-foreground/60 font-bold vertical-text tracking-[0.5em] [writing-mode:vertical-lr]">
              KNOWLEDGE BASE
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="w-8 h-8 border border-foreground/20 flex items-center justify-center">
                <div className="w-1 h-1 bg-foreground" />
              </div>
              <div className="text-[8px] text-muted-foreground/40 font-mono uppercase">
                EST. 2026
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SlicedImage;
