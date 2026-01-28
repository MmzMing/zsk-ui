// ===== 1. 依赖导入区域 =====
import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { FiPlay } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import {
  fetchHomeVideos,
  mockHomeVideos,
  type HomeVideo as VideoItem,
  type VideoSource,
} from "../../../api/front/home";
import ScrollFloat from "../../../components/Motion/ScrollFloat";
import ScrollStack from "../../../components/Motion/ScrollStack";
import VideoPlayer from "../../../components/VideoPlayer";
import { routes } from "../../../router/routes";

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
  const navigate = useNavigate();
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
    <section className="min-h-screen flex flex-col pt-24 pb-12 space-y-8 px-2 md:px-[var(--content-padding)]">
      <div className="max-w-6xl mx-auto w-full flex flex-col items-center space-y-4 py-4">
        <ScrollFloat
          containerClassName="text-lg md:text-xl font-semibold py-2"
          textClassName="tracking-tight"
        >
          视频推荐
        </ScrollFloat>
        <ScrollFloat
          containerClassName="text-[11px] md:text-xs text-[var(--text-color-secondary)] py-1"
          textClassName="tracking-wide"
        >
          精选技术视频与实战教程
        </ScrollFloat>
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
                  
                  {/* Video Badge */}
                  <div className="absolute top-3 left-3 z-20 px-2 py-1 rounded bg-black/60 backdrop-blur-md text-[10px] text-white font-medium border border-white/10">
                    视频
                  </div>

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
