import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ScrollStack from "../../../components/Motion/ScrollStack";
import ScrollFloat from "../../../components/Motion/ScrollFloat";
import { useNavigate } from "react-router-dom";
import { routes } from "../../../router/routes";
import { FiPlay } from "react-icons/fi";
import VideoPlayer from "../../../components/VideoPlayer";
import { VideoSource, Subtitle } from "../../../components/VideoPlayer/types";

export type VideoItem = {
  id: string;
  title: string;
  description?: string;
  views: string;
  likes?: number;
  comments?: number;
  date: string;
  cover?: string;
  sources?: string | VideoSource[];
  subtitles?: Subtitle[];
};

type Props = {
  items: VideoItem[];
};

export default function VideoRecommend({ items }: Props) {
  const navigate = useNavigate();
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

  const activeItem = activeVideoId
    ? items.find(i => i.id === activeVideoId)
    : undefined;

  const defaultSources: VideoSource[] = [
    {
      src: "https://v16.toutiao50.com/cb6f9ab562e3a0f382ac50aed1aa67a8/696e0ef1/video/tos/alisg/tos-alisg-v-0051c001-sg/o4BEgE2gNWUEpAhf3raNc4ZHDjjDDBFcQFxBme/",
      type: "video/mp4"
    }
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
          type: "video/mp4"
        }
      ];
    }

    return activeItem.sources;
  })();

  const handleVideoClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setActiveVideoId(id);
  };

  const handleCloseVideo = () => {
    setActiveVideoId(null);
  };

  return (
    <section className="min-h-screen flex flex-col justify-center space-y-4 px-[var(--content-padding)]">
      <div className="max-w-6xl mx-auto w-full flex flex-col items-center space-y-1">
        <ScrollFloat
          containerClassName="text-lg md:text-xl font-semibold"
          textClassName="tracking-tight"
        >
          视频推荐
        </ScrollFloat>
        <ScrollFloat
          containerClassName="text-[11px] md:text-xs text-[var(--text-color-secondary)]"
          textClassName="tracking-wide"
        >
          精选技术视频与实战教程
        </ScrollFloat>
      </div>
      <div className="max-w-6xl mx-auto w-full">
        <ScrollStack
          itemDistance={200}
          itemStackDistance={80}
          itemScale={0.035}
          stackPosition="36%"
          scaleEndPosition="8%"
          baseScale={0.9}
          rotationAmount={0}
          blurAmount={0}
          useWindowScroll
        >
          {items.map(item => (
            <div
              key={item.id}
              className="w-full flex justify-center"
            >
            <div className="group scroll-stack-card relative flex items-stretch gap-6 rounded-[40px] border border-white/10 bg-gradient-to-br from-[#4c2aff] via-[#7b3fff] to-[#ff4da6] p-0 text-white shadow-[0_32px_80px_rgba(15,23,42,0.75)] overflow-hidden h-[320px]">
              {/* Left Info Area (35%) */}
              <div 
                className="flex-[35] flex flex-col justify-between p-8 cursor-pointer"
                onClick={() => navigate(routes.videoDetail.replace(":id", item.id))}
              >
                <div className="space-y-4">
                  <h4 className="text-lg md:text-2xl font-semibold tracking-tight line-clamp-3">
                    {item.title}
                  </h4>
                  <div className="flex flex-col gap-2 text-[11px] md:text-xs text-white/80">
                    <span className="inline-flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                      <span>播放量 {item.views}</span>
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-white/50" />
                      <span>{item.date}</span>
                    </span>
                  </div>
                </div>
                <div className="text-xs text-white/60 font-medium">
                  点击查看详情 &rarr;
                </div>
              </div>

              {/* Right Video Area (65%) */}
              <div className="flex-[65] relative bg-black/20 border-l border-white/10">
                <div 
                  className="absolute inset-0 flex items-center justify-center cursor-pointer group-hover:bg-black/10 transition-colors"
                  onClick={(e) => handleVideoClick(e, item.id)}
                >
                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 transition-transform duration-300 group-hover:scale-110">
                    <FiPlay className="w-6 h-6 ml-1 text-white" />
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
              onClick={e => e.stopPropagation()}
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
                poster={activeItem?.cover}
                subtitles={activeItem?.subtitles}
                chapters={[
                  { time: 0, title: "Intro" },
                  { time: 60, title: "Highlight" },
                  { time: 120, title: "Ending" }
                ]}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
