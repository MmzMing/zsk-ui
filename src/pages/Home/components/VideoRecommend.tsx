// ===== 1. 依赖导入区域 =====
import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { FiPlay } from "react-icons/fi";
import {
  fetchHomeVideos,
  mockHomeVideos,
  type HomeVideo as VideoItem,
  type VideoSource,
} from "../../../api/front/home";
import ScrollStack from "../../../components/Motion/ScrollStack";
import VideoPlayer from "../../../components/VideoPlayer";
import { routes } from "../../../router/routes";
import TextHoverEffect from "../../../components/Aceternity/TextHoverEffect";

// ===== 2. TODO待处理导入区域 =====

// ===== 3. 状态控制逻辑区域 =====
const DEFAULT_COVER = "/DefaultImage/MyDefaultHomeVodie.png";

// ===== 4. 通用工具函数区域 =====

// ===== 5. 注释代码函数区 =====

// ===== 6. 错误处理函数区域 =====

// ===== 7. 数据处理函数区域 =====

// ===== 8. UI渲染逻辑区域 =====

// ===== 9. 页面初始化与事件绑定 =====

// ===== 10. TODO任务管理区域 =====

// ===== 11. 导出区域 =====
export default function VideoRecommend() {
  // ===== 3. 状态控制逻辑区域 =====
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [videoList, setVideoList] = useState<VideoItem[]>(() => mockHomeVideos);

  const activeItem = activeVideoId
    ? videoList.find((i) => i.id === activeVideoId)
    : undefined;

  // ===== 9. 页面初始化与事件绑定 =====
  /**
   * 加载视频列表数据
   */
  const loadVideos = React.useCallback(async () => {
    const data = await fetchHomeVideos();
    if (data) {
      setVideoList(data);
    }
  }, []);

  // 初始化加载
  useEffect(() => {
    const timer = setTimeout(() => {
      loadVideos();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadVideos]);

  const handleVideoClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setActiveVideoId(id);
  };

  const handleCloseVideo = () => {
    setActiveVideoId(null);
  };

  // ===== 7. 数据处理函数区域 =====
  const defaultSources: VideoSource[] = [
    {
      src: "/videoTest/【鸣潮_千咲】_Luna - Unveil feat.ねんね.mp4",
      type: "video/mp4",
    },
  ];

  const resolvedSources: VideoSource[] = (() => {
    if (!activeItem || !activeItem.sources) {
      return defaultSources;
    }

    if (typeof activeItem.sources === "string") {
      const trimmed = activeItem.sources.trim();
      if (!trimmed) {
        return defaultSources;
      }
      return [
        {
          src: trimmed,
          type: "video/mp4",
        },
      ];
    }

    return activeItem.sources;
  })();

  // ===== 8. UI渲染逻辑区域 =====
  return (
    <section className="relative min-h-screen flex flex-col pt-12 pb-12 space-y-8 px-2 md:px-[var(--content-padding)]">
      {/* ===== 8.1 背景装饰区域 (Endfield Style) ===== */}
      <div className="absolute left-0 top-[-10rem] bottom-0 w-48 hidden xl:flex pointer-events-none z-0 select-none overflow-hidden">
        {/* 背景色块 - 向上延伸以覆盖父容器的 pt-40 */}
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-[var(--primary-color)]/5 border-r border-[var(--primary-color)]/10" />
        
        {/* 内容容器 */}
        <div className="relative w-16 flex flex-col items-center pt-56 gap-12 h-full">
          {/* 顶部线条 - 增加高度并调整渐变 */}
          <div className="w-[3px] h-48 bg-gradient-to-b from-transparent via-[var(--primary-color)]/20 to-[var(--primary-color)]/60 rounded-full flex-none" />
          
          {/* 垂直文字容器 */}
          <div className="relative flex flex-col items-center gap-6 flex-none">
            {/* 辅助小字 */}
            <div 
              className="text-[10px] uppercase tracking-[0.3em] font-mono text-white/80"
              style={{ writingMode: 'vertical-rl' }}
            >
              Featured Content
            </div>
            
            {/* 主标题文字 */}
            <div 
              className="text-4xl font-black tracking-[0.2em] whitespace-nowrap"
              style={{ 
                writingMode: 'vertical-rl',
                color: 'var(--primary-color)',
                textShadow: '0 0 20px var(--primary-color)'
              }}
            >
              热门视频推荐
            </div>
          </div>

          {/* 白色装饰线条 */}
          <div className="w-[1.5px] h-64 bg-gradient-to-b from-white/5 via-white/20 to-white/5 relative flex-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white/40 blur-[1px]" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white/40 blur-[1px]" />
          </div>

          {/* 底部填充线 */}
          <div className="flex-1 w-[2px] bg-gradient-to-b from-white/10 via-[var(--primary-color)]/10 to-transparent w-[1px]" />
        </div>
        
        {/* 次级平行装饰线 */}
        <div className="ml-4 h-full w-[1px] bg-gradient-to-b from-transparent via-[var(--border-color)]/40 to-transparent opacity-30" />
        <div className="ml-2 h-full w-[0.5px] bg-gradient-to-b from-transparent via-[var(--border-color)]/20 to-transparent opacity-20" />
      </div>

      <div className="w-full flex flex-col items-center py-2 relative z-10 px-4">
        <div className="w-full h-24 md:h-32 flex items-center justify-center">
          <TextHoverEffect text="视频推荐" />
        </div>
        <div className="w-full h-24 md:h-32 flex items-center justify-center -mt-8">
          <TextHoverEffect 
            text="精选技术视频与实战教程" 
            strokeWidth={0.3}
          />
        </div>
      </div>
      <div className="max-w-6xl mx-auto w-full">
        <ScrollStack
          itemDistance={window.innerWidth < 768 ? 100 : 200}
          itemStackDistance={window.innerWidth < 768 ? 40 : 80}
          itemScale={0.035}
          stackPosition={window.innerWidth < 768 ? "25%" : "36%"}
          scaleEndPosition="8%"
          baseScale={window.innerWidth < 768 ? 0.95 : 0.9}
          rotationAmount={0}
          blurAmount={0}
          useWindowScroll
        >
          {videoList.map((item) => (
            <div key={item.id} className="w-full flex justify-center">
              <div className="group scroll-stack-card relative flex flex-col md:flex-row items-stretch gap-0 md:gap-6 rounded-[24px] md:rounded-[40px] border border-[var(--border-color)] bg-[var(--bg-elevated)]/60 backdrop-blur-xl p-0 text-[var(--text-color)] shadow-[0_32px_80px_rgba(0,0,0,0.1)] dark:shadow-[0_32px_80px_rgba(0,0,0,0.4)] overflow-hidden h-auto md:h-[320px]">
                
                {/* Image Area (Top on Mobile, Right on Desktop) */}
                <div className="order-1 md:order-2 flex-none md:flex-[65] relative bg-[var(--bg-elevated)]/30 border-b md:border-b-0 md:border-l border-[var(--border-color)] w-full aspect-video md:aspect-auto md:h-auto overflow-hidden">
                  <img
                    src={item.cover || DEFAULT_COVER}
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                

                  {/* Play Button Overlay */}
                  <div
                    className="absolute inset-0 flex items-center justify-center cursor-pointer group-hover:bg-black/5 dark:group-hover:bg-white/5 transition-colors z-10"
                    onClick={(e) => handleVideoClick(e, item.id)}
                  >
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 transition-all duration-300 group-hover:scale-110 group-hover:bg-white/30">
                      <FiPlay className="w-5 h-5 md:w-6 md:h-6 ml-1 text-white" />
                    </div>
                  </div>

                  {/* Bottom Stats Overlay (Mobile style reference) */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between text-white/90 text-[10px] md:hidden">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <FiPlay size={10} /> {item.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                        850
                      </span>
                    </div>
                    <span>45:20</span>
                  </div>
                </div>

                {/* Info Area (Bottom on Mobile, Left on Desktop) */}
                <div
                  className="order-2 md:order-1 flex-1 md:flex-[35] flex flex-col justify-between p-4 md:p-8 cursor-pointer w-full"
                  onClick={() =>
                    window.open(routes.videoDetail.replace(":id", item.id), "_blank")
                  }
                >
                  <div className="space-y-3 md:space-y-4">
                    <h4 className="text-base md:text-2xl font-semibold tracking-tight line-clamp-1 md:line-clamp-3 group-hover:text-[var(--primary-color)] transition-colors">
                      {item.title}
                    </h4>
                    
                    {/* Author & Meta */}
                    <div className="flex items-center justify-between md:flex-col md:items-start md:gap-2 text-[11px] md:text-xs text-[var(--text-color-secondary)]">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-[var(--primary-color)]/20 flex items-center justify-center overflow-hidden border border-[var(--primary-color)]/10">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--primary-color)]"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        </div>
                        <span className="font-medium text-[var(--text-color)]">TechMaster</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="md:hidden">{item.date.split('-')[0]}</span>
                        <div className="hidden md:flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          <span>播放量 {item.views}</span>
                        </div>
                        <div className="hidden md:flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-[var(--text-color-secondary)]/50" />
                          <span>{item.date}</span>
                        </div>
                      </div>
                    </div>

                    {/* Tag */}
                    <div className="inline-flex px-2 py-0.5 rounded bg-[var(--bg-elevated)] border border-[var(--border-color)] text-[10px] text-[var(--text-color-secondary)]">
                      React
                    </div>
                  </div>
                  
                  <div className="hidden md:block text-xs text-[var(--primary-color)] font-medium mt-4">
                    点击查看详情 &rarr;
                  </div>
                </div>

              </div>
            </div>
          ))}
        </ScrollStack>
      </div>

      {/* Expanded Video Overlay */}
      <AnimatePresence>
        {activeVideoId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={handleCloseVideo}
          >
            <motion.div
              layoutId={`video-${activeVideoId}`}
              className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <VideoPlayer
                url={resolvedSources}
                autoPlay
                onClose={handleCloseVideo}
                title={activeItem?.title}
                poster={activeItem?.cover || DEFAULT_COVER}
                subtitles={activeItem?.subtitles?.map((s) => ({
                  src: s.src,
                  label: s.label,
                  language: s.lang,
                  kind: "subtitles",
                  default: s.default,
                }))}
                chapters={[
                  { time: 0, title: "Intro" },
                  { time: 60, title: "Highlight" },
                  { time: 120, title: "Ending" },
                ]}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
