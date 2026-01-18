
import React, { useRef, useEffect } from 'react';
import {
  MediaPlayer,
  MediaProvider,
  useMediaState,
  Track
} from '@vidstack/react';
import type { MediaPlayerInstance } from '@vidstack/react';
import {
  DefaultVideoLayout,
  defaultLayoutIcons
} from '@vidstack/react/player/layouts/default';
import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';
import { VideoPlayerProps } from './types';
import { FaArrowLeft } from 'react-icons/fa';
import { motion } from 'framer-motion';
import type { DefaultLayoutTranslations } from '@vidstack/react/player/layouts/default';

const zhCNTranslations: Partial<DefaultLayoutTranslations> = {
  Playback: '播放',
  Accessibility: '辅助功能',
  Audio: '音频',
  Captions: '字幕',
  Chapters: '章节',
  Settings: '设置',
  Quality: '画质',
  Speed: '倍速',
  Mute: '静音',
  Unmute: '取消静音',
  Play: '播放',
  Pause: '暂停',
  Replay: '重播',
  LIVE: '直播',
  'Skip To Live': '跳到直播',
  'Seek Backward': '快退',
  'Seek Forward': '快进',
  Volume: '音量',
  Fullscreen: '全屏',
  'Enter Fullscreen': '进入全屏',
  'Exit Fullscreen': '退出全屏',
  Download: '下载',
  'Closed-Captions On': '开启隐藏字幕',
  'Closed-Captions Off': '关闭隐藏字幕',
  'Caption Styles': '字幕样式',
  'Captions look like this': '字幕预览',
  Default: '默认',
  Normal: '正常',
  Auto: '自动',
  Loop: '循环',
  'Text Background': '文字背景',
  Shadow: '阴影',
  Color: '颜色',
  Opacity: '不透明度',
  Size: '大小'
};

export const VideoPlayer: React.FC<VideoPlayerProps> = (props) => {
  const {
    url,
    className = '',
    autoPlay = false,
    poster,
    title,
    chapters = [],
    subtitles = [],
    initialTime = 0,
    onClose,
    enableDanmaku = true
  } = props;

  const player = useRef<MediaPlayerInstance | null>(null);

  useEffect(() => {
    if (player.current && initialTime > 0) {
      player.current.currentTime = initialTime;
    }
  }, [initialTime]);

  // Handle chapters as TextTracks
  const chapterTrack = chapters.length > 0 ? (
    <Track
      src={`data:text/vtt;charset=utf-8,${encodeURIComponent(
        `WEBVTT\n\n${chapters.map((c, i) => {
          const nextTime = chapters[i+1]?.time || (c.time + 60);
          const format = (t: number) => new Date(t * 1000).toISOString().substr(11, 8);
          return `${format(c.time)} --> ${format(nextTime)}\n${c.title}\n`;
        }).join('\n')}`
      )}`}
      kind="chapters"
      label="章节"
      lang="zh-CN"
      default
    />
  ) : null;

  const DanmakuOverlay = () => {
    const paused = useMediaState('paused', player);
    
    if (!enableDanmaku) return null;
    
    return (
      <div className="vds-danmaku-layer absolute inset-0 overflow-hidden pointer-events-none z-10 opacity-80">
         {!paused && (
          <>
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: '-100%' }} 
              transition={{ repeat: Infinity, duration: 8, ease: "linear", delay: 1 }}
              className="absolute top-[10%] text-white text-lg font-bold drop-shadow-md whitespace-nowrap"
            >
              高能预警！
            </motion.div>
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: '-100%' }} 
              transition={{ repeat: Infinity, duration: 12, ease: "linear", delay: 3 }}
              className="absolute top-[30%] text-white text-base drop-shadow-md whitespace-nowrap"
            >
              这个特效满分
            </motion.div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className={`relative w-full h-full bg-black ${className}`}>
      {onClose && (
        <div className="absolute top-4 left-4 z-50">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors backdrop-blur-sm"
          >
            <FaArrowLeft size={20} />
          </button>
        </div>
      )}

      <MediaPlayer 
        ref={player}
        title={title || '视频播放器'}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        src={url as any}
        autoPlay={autoPlay}
        poster={poster}
        className="w-full h-full"
        aspectRatio="16/9"
        load="eager"
      >
        <MediaProvider>
           <DanmakuOverlay />
           {chapterTrack}
           {subtitles.map((track, i) => (
             <Track
               key={String(i)}
               src={track.src}
               kind={track.kind}
               label={track.label}
               lang={track.language}
               default={track.default}
             />
           ))}
        </MediaProvider>
        
        {/* Default Layout with all controls */}
        <DefaultVideoLayout 
          icons={defaultLayoutIcons} 
          thumbnails="https://files.vidstack.io/sprite-fight/thumbnails.vtt" // Placeholder thumbnails
          translations={zhCNTranslations}
        />
      </MediaPlayer>
    </div>
  );
};

export default VideoPlayer;
