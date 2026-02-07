/** 切片配置类型 */
export type SliceConfig = {
  /** 切片数量 */
  sliceCount: number;
  /** 倾斜角度 (deg) */
  tiltAngle: number;
  /** 切片偏移 (px) */
  sliceOffset: number;
  /** 切片间隙 (px) */
  sliceGap: number;
  /** 图片缩放 */
  imageScale: number;
  /** 大小差异 (0-1) */
  sizeVariation: number;
  /** 间隙差异 (0-1) */
  gapVariation: number;
  /** 切角大小 (px) */
  cornerCutSize: number;
  /** 切角概率 (0-1) */
  cornerCutProbability: number;
  /** 随机种子 */
  randomSeed: number;
  /** 亮度 (0-2) */
  brightness: number;
  /** 对比度 (0-2) */
  contrast: number;
  /** 灰度 (0-1) */
  grayscale: number;
  /** 故障偏移强度 (px) */
  glitchOffset: number;
};

/** 默认切片配置 */
export const DEFAULT_SLICE_CONFIG: SliceConfig = {
  sliceCount: 6,
  tiltAngle: 60,
  sliceOffset: 25,
  sliceGap: 6,
  imageScale: 1.0,
  sizeVariation: 0.3,
  gapVariation: 0.2,
  cornerCutSize: 0,
  cornerCutProbability: 0,
  randomSeed: 123,
  brightness: 1.1,
  contrast: 1.1,
  grayscale: 1,
  glitchOffset: 15,
};
