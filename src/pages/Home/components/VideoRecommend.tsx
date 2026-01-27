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
              <div className="group scroll-stack-card relative flex flex-col md:flex-row items-stretch gap-0 md:gap-6 rounded-[40px] border border-[var(--border-color)] bg-[var(--bg-elevated)]/60 backdrop-blur-xl p-0 text-[var(--text-color)] shadow-[0_32px_80px_rgba(0,0,0,0.1)] dark:shadow-[0_32px_80px_rgba(0,0,0,0.4)] overflow-hidden h-[420px] md:h-[320px]">
                {/* Left Info Area (35%) */}
                <div
                  className="flex-1 md:flex-[35] flex flex-col justify-between p-2 md:p-8 cursor-pointer w-full md:w-auto"
                  onClick={() =>
                    navigate(routes.videoDetail.replace(":id", item.id))
                  }
                >
                  <div className="space-y-4">
                    <h4 className="text-lg md:text-2xl font-semibold tracking-tight line-clamp-2 md:line-clamp-3">
                      {item.title}
                    </h4>
                    <div className="flex flex-col gap-2 text-[11px] md:text-xs text-[var(--text-color-secondary)]">
                      <span className="inline-flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        <span>播放量 {item.views}</span>
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--text-color-secondary)]/50" />
                        <span>{item.date}</span>
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-[var(--primary-color)] font-medium">
                    点击查看详情 &rarr;
                  </div>
                </div>

                {/* Right Video Area (65%) */}
                <div className="flex-1 md:flex-[65] relative bg-[var(--bg-elevated)]/30 border-t md:border-l md:border-t-0 border-[var(--border-color)] w-full md:w-auto">
                  <img
                    src={item.cover || DEFAULT_COVER}
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div
                    className="absolute inset-0 flex items-center justify-center cursor-pointer group-hover:bg-black/5 dark:group-hover:bg-white/5 transition-colors z-10"
                    onClick={(e) => handleVideoClick(e, item.id)}
                  >
                    <div className="w-16 h-16 rounded-full bg-[var(--bg-elevated)]/40 backdrop-blur-md flex items-center justify-center border border-[var(--border-color)] transition-transform duration-300 group-hover:scale-110">
                      <FiPlay className="w-6 h-6 ml-1 text-[var(--primary-color)]" />
                    </div>
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
