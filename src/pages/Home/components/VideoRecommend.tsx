// ===== 1. 依赖导入区域 =====
import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { FiPlay, FiClock, FiEye } from "react-icons/fi";
import {
  fetchHomeVideos,
  mockHomeVideos,
  type HomeVideo as VideoItem,
} from "../../../api/front/home";
import VideoPlayer from "../../../components/VideoPlayer";
import { routes } from "../../../router/routes";
import TextHoverEffect from "../../../components/Aceternity/TextHoverEffect";

// ===== 3. 状态控制逻辑区域 =====
const DEFAULT_COVER = "/DefaultImage/MyDefaultHomeVodie.png";

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

  // ===== 8. UI渲染逻辑区域 =====

  /**
   * 处理视频点击
   */
  const handleVideoClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setActiveVideoId(id);
  };

  /**
   * 关闭视频播放
   */
  const handleCloseVideo = () => {
    setActiveVideoId(null);
  };

  /**
   * 跳转详情页
   */
  const handleNavigate = (id: string) => {
    window.open(routes.videoDetail.replace(":id", id), "_blank");
  };

  // 限制展示数量，避免页面过长
  const displayList = videoList.slice(0, 5);

  return (
    <section className="relative w-full bg-[var(--bg-elevated)] text-[var(--text-color)]">
      {/* 
        Sticky Stacking Implementation:
        The container is relative.
        Each child (Title Block + Video Blocks) is sticky top-0 h-screen.
        They naturally stack on top of each other as you scroll down.
      */}

      {/* 1. Title Block */}
      <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center bg-[var(--bg-elevated)] z-0 overflow-hidden">
        <div className="relative z-10 flex flex-col items-center w-full px-10">
           {/* Vertical Text Label */}
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.6 }}
             className="text-[12px] uppercase tracking-[0.8em] font-medium text-[var(--text-color-secondary)] mb-6"
           >
              Featured Content
           </motion.div>

           {/* Main Title Effect */}
           <div className="h-48 md:h-72 flex items-center justify-center w-full max-w-7xl">
             <TextHoverEffect text="VIDEOS" />
           </div>
           
           <motion.div 
             initial={{ opacity: 0 }}
             whileInView={{ opacity: 1 }}
             transition={{ duration: 0.8, delay: 0.4 }}
             className="text-2xl md:text-3xl font-extralight tracking-[0.3em] text-[var(--text-color)] mt-4 opacity-80"
           >
             热门视频推荐
           </motion.div>

           {/* Scroll Down Indicator */}
           <motion.div 
             animate={{ y: [0, 10, 0] }}
             transition={{ duration: 2, repeat: Infinity }}
             className="flex flex-col items-center gap-4 mt-20"
           >
             <span className="text-[10px] uppercase tracking-widest text-[var(--text-color-secondary)]">Scroll to explore</span>
           </motion.div>
        </div>
      </div>

      {/* 2. Video Blocks */}
      {displayList.map((item, index) => (
        <div 
          key={item.id} 
          className="sticky top-0 h-screen w-full flex items-center justify-center bg-[var(--bg-elevated)] overflow-hidden border-t border-[var(--border-color)]"
          style={{ zIndex: index + 1 }}
        >
          {/* Main Content Wrapper */}
          <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 flex flex-col gap-8 md:gap-12">
            
            {/* Top Header: Title & Info */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[var(--border-color)]/20 pb-8">
              <div className="space-y-2">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  className="text-[10px] uppercase tracking-[0.4em] text-[var(--primary-color)] font-bold"
                >
                  Series {index + 1}
                </motion.div>
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-4xl md:text-7xl font-light tracking-tight cursor-pointer hover:text-[var(--primary-color)] transition-colors text-[var(--text-color)] leading-[1.1]"
                  onClick={() => handleNavigate(item.id)}
                >
                  {item.title}
                </motion.h2>
              </div>
              
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-8 text-[var(--text-color-secondary)] font-light tracking-widest text-sm"
              >
                <div className="flex items-baseline gap-3 whitespace-nowrap">
                  <span className="text-[10px] opacity-50 uppercase">Category</span>
                  <span className="text-[var(--text-color)]">{item.category}</span>
                </div>
                <div className="flex items-baseline gap-3 whitespace-nowrap">
                  <span className="text-[10px] opacity-50 uppercase">Released</span>
                  <span className="text-[var(--text-color)]">{item.date}</span>
                </div>
              </motion.div>
            </div>

            {/* Content Body: Image Card & Info Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20 items-center">
              
              {/* Left: Image Card */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="relative aspect-square md:aspect-[16/10] rounded-3xl overflow-hidden group cursor-pointer border border-[var(--border-color)]/20 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] bg-[var(--bg-color)]"
                onClick={(e) => handleVideoClick(e, item.id)}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10 opacity-60 group-hover:opacity-40 transition-opacity" />
                <img 
                  src={item.cover || DEFAULT_COVER} 
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                
                {/* Play Button Overlay */}
                <div className="absolute inset-0 z-20 flex items-center justify-center">
                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/20 shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-500"
                  >
                    <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center">
                      <FiPlay className="w-6 h-6 text-black ml-1" />
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              {/* Right: Info Card */}
              <motion.div 
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="flex flex-col justify-center gap-10"
              >
                <div className="space-y-8">
                  <p className="text-[var(--text-color-secondary)] text-xl md:text-2xl leading-relaxed font-extralight italic">
                    "{item.description || "探索最新的技术动态与深度解析，本视频将带您深入了解核心概念与实战应用。"}"
                  </p>

                  <div className="flex gap-12">
                    <div className="space-y-1">
                      <div className="text-[var(--text-color-secondary)]/40 text-[10px] uppercase tracking-[0.2em] font-bold">Metrics</div>
                      <div className="flex items-center gap-2">
                        <FiEye className="text-[var(--primary-color)]" />
                        <span className="text-2xl font-light text-[var(--text-color)]">{item.views}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[var(--text-color-secondary)]/40 text-[10px] uppercase tracking-[0.2em] font-bold">Length</div>
                      <div className="flex items-center gap-2">
                        <FiClock className="text-[var(--primary-color)]" />
                        <span className="text-2xl font-light text-[var(--text-color)]">{item.duration}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <span className="px-4 py-1.5 rounded-full bg-[var(--bg-color)] border border-[var(--border-color)]/20 text-[10px] uppercase tracking-widest text-[var(--text-color-secondary)] hover:border-[var(--primary-color)] transition-colors">
                      {item.category}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={(e) => handleVideoClick(e, item.id)}
                    className="flex-1 md:flex-none flex items-center justify-center gap-4 px-12 py-5 bg-[var(--text-color)] text-[var(--bg-color)] rounded-full font-bold hover:bg-[var(--primary-color)] hover:text-white transition-all duration-500 shadow-2xl group"
                  >
                    <span className="uppercase tracking-widest">Start Experience</span>
                    <FiPlay className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                  
                  <motion.button 
                    whileHover={{ scale: 1.1, rotate: 45 }}
                    onClick={() => handleNavigate(item.id)}
                    className="p-5 border border-[var(--border-color)]/20 rounded-full text-[var(--text-color-secondary)] hover:bg-[var(--bg-color)] hover:text-[var(--text-color)] transition-all"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17l9.2-9.2M17 17V7H7"/></svg>
                  </motion.button>
                </div>
              </motion.div>

            </div>
          </div>
        </div>
      ))}

      {/* Expanded Video Overlay */}
      <AnimatePresence>
        {activeVideoId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-lg p-4"
            onClick={handleCloseVideo}
          >
            <motion.div
              layoutId={`video-${activeVideoId}`}
              className="relative w-full max-w-6xl aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-white/10"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <VideoPlayer
                url={activeItem?.sources || []}
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
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
