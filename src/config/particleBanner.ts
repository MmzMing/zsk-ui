export interface TextConfig {
  content: string;      // 显示的文本内容
  canvasWidth: number;  // 采样使用的 Canvas 宽度（越大采样越精细）
  canvasHeight: number; // 采样使用的 Canvas 高度
  scale: number;        // 粒子坐标的缩放倍数（用于调整文本在场景中的实际显示大小）
}

export interface ParticleBannerConfig {
  particleCount: number;  // 粒子总数
  fontSize: number;       // 采样文字时的字体大小（px）
  particleSize: number;   // 渲染时的粒子大小
  sphereRadius: number;   // 初始球体的半径
  texts: TextConfig[];    // 文本配置列表
  animation: {
    morphDuration: number; // 形状变换动画的持续时间（秒）
    stayDuration: number;  // 形状变换完成后停留展示的时间（秒）
  };
}

export const particleBannerConfig: ParticleBannerConfig = {
  particleCount: 6000,    // 设置粒子总数为 6000 个 (优化性能，减少 WebGL Context Lost 风险)
  fontSize: 172,          // 文字采样字体大小设为 172px
  particleSize: 0.04,     // 粒子渲染尺寸设为 0.04
  sphereRadius: 3,        // 球体半径设为 3
  texts: [                // 轮播展示的文本列表
    {
      content: '知识库',
      canvasWidth: 1200,             // 采样宽度
      canvasHeight: 600,             // 采样高度
      scale: 0.014                   // 较大的缩放比例，让短文本更清晰
    },
    {
      content: '小破站',
      canvasWidth: 1200,             // 采样宽度
      canvasHeight: 600,             // 采样高度
      scale: 0.014                   // 较大的缩放比例，让短文本更清晰
    },{
      content: 'Ciallo～(∠・ω< )⌒☆',
      canvasWidth: 3200,             // 针对长文本使用更大的采样宽度
      canvasHeight: 500,             // 采样高度
      scale: 0.006                   // 较小的缩放比例以防止长文本超出屏幕
    }
  ],
  animation: {
    morphDuration: 2,                // 变换过程耗时 2 秒
    stayDuration: 3                  // 展示停留 3 秒
  }
};
