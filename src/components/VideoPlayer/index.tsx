
import React, { useRef, useEffect, useState } from 'react';
import {
  MediaPlayer,
  MediaProvider,
  useMediaState,
  useMediaRemote,
  Track,
  Tooltip,
} from '@vidstack/react';
import type { MediaPlayerInstance } from '@vidstack/react';
import {
  DefaultVideoLayout,
  defaultLayoutIcons,
} from '@vidstack/react/player/layouts/default';
import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';
import { VideoPlayerProps } from './types';
import { FaArrowLeft, FaExpand, FaCompress } from 'react-icons/fa';
import { RiAspectRatioLine } from 'react-icons/ri';
// import { motion } from 'framer-motion';
import type { DefaultLayoutTranslations } from '@vidstack/react/player/layouts/default';
import { throttle } from 'lodash';
import { MobileControls } from './MobileControls';

const STORAGE_KEY_VOLUME = 'video-player-volume';
const STORAGE_KEY_TIME_PREFIX = 'video-player-time-';

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
};

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
  Size: '大小',
  Announcements: '通知',
  'Keyboard Animations': '键盘动画',
  'Enter PiP': '进入画中画',
  'Exit PiP': '退出画中画',
};

const FullscreenGroup = ({ 
  isPageFullscreen, 
  onTogglePageFullscreen,
  playerRef,
  containerRef
}: { 
  isPageFullscreen: boolean; 
    onTogglePageFullscreen: () => void;
    playerRef: React.RefObject<MediaPlayerInstance | null>;
    containerRef: React.RefObject<HTMLDivElement | null>;
  }) => {
  const remote = useMediaRemote();
  const isFullscreen = useMediaState('fullscreen');
  const isMobile = useIsMobile();
  
  return (
    <div className="flex items-center gap-1 relative">
      {isMobile && (
            <MobileControls 
              playerRef={playerRef} 
              containerRef={containerRef}
              isPageFullscreen={isPageFullscreen}
              onTogglePageFullscreen={onTogglePageFullscreen}
            />
          )}

      {!isMobile && (
        <>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <button
                className="vds-button"
                onClick={onTogglePageFullscreen}
                aria-label={isPageFullscreen ? '退出网页全屏' : '网页全屏'}
              >
                <RiAspectRatioLine size={24} />
              </button>
            </Tooltip.Trigger>
            <Tooltip.Content className="vds-tooltip-content">
              {isPageFullscreen ? '退出网页全屏' : '网页全屏'}
            </Tooltip.Content>
          </Tooltip.Root>

          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <button
                className="vds-button"
                onClick={() => {
                  if (isFullscreen) {
                    remote.exitFullscreen();
                  } else {
                    if (playerRef.current) {
                      playerRef.current.enterFullscreen();
                    } else {
                      remote.enterFullscreen();
                    }
                  }
                }}
                aria-label={isFullscreen ? '退出全屏' : '全屏'}
              >
                {isFullscreen ? <FaCompress size={20} /> : <FaExpand size={20} />}
              </button>
            </Tooltip.Trigger>
            <Tooltip.Content className="vds-tooltip-content">
              {isFullscreen ? '退出全屏' : '全屏'}
            </Tooltip.Content>
          </Tooltip.Root>
        </>
      )}
    </div>
  );
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
    thumbnails,
    initialTime = 0,
    onClose,
  } = props;

  const player = useRef<MediaPlayerInstance | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasRestored = useRef(false);
  const [isPageFullscreen, setIsPageFullscreen] = useState(false);
  const [isHovering, setIsHovering] = useState(true);

  useEffect(() => {
    hasRestored.current = false;
    
    // Proactively restore volume on mount/url change
    if (player.current) {
      const savedVolume = localStorage.getItem(STORAGE_KEY_VOLUME);
      if (savedVolume) {
        try {
          const { volume, muted } = JSON.parse(savedVolume);
          if (typeof volume === 'number') player.current.volume = volume;
          if (typeof muted === 'boolean') player.current.muted = muted;
        } catch { /* ignore */ }
      }
    }
  }, [url]);

  const saveTime = useRef(
    throttle((time: number) => {
      if (url) {
        localStorage.setItem(STORAGE_KEY_TIME_PREFIX + url, String(time));
      }
    }, 1000)
  ).current;

  const onTimeUpdate = () => {
    if (player.current) {
      saveTime(player.current.currentTime);
    }
  };

  const onVolumeChange = () => {
    if (player.current) {
      const settings = {
        volume: player.current.volume,
        muted: player.current.muted
      };
      localStorage.setItem(STORAGE_KEY_VOLUME, JSON.stringify(settings));
    }
  };

  const onCanPlay = () => {
    if (hasRestored.current || !player.current) return;
    
    const media = player.current;

    // Restore volume
    const savedVolume = localStorage.getItem(STORAGE_KEY_VOLUME);
    if (savedVolume) {
      try {
        const { volume, muted } = JSON.parse(savedVolume);
        if (typeof volume === 'number') media.volume = volume;
        if (typeof muted === 'boolean') media.muted = muted;
      } catch { /* ignore */ }
    }

    // Restore time
    if (url) {
      const savedTime = localStorage.getItem(STORAGE_KEY_TIME_PREFIX + url);
      let targetTime = 0;
      
      if (initialTime > 0) {
        targetTime = initialTime;
      } else if (savedTime) {
        const time = parseFloat(savedTime);
        if (!isNaN(time) && time > 0) {
          targetTime = time;
        }
      }
      
      if (targetTime > 0) {
        // Use multiple ways to set time to ensure it works
        media.currentTime = targetTime;
      }
    }
    
    hasRestored.current = true;
  };

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

  const togglePageFullscreen = () => {
    setIsPageFullscreen(!isPageFullscreen);
  };

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-full bg-black video-player-container ${isPageFullscreen ? '!fixed !inset-0 !z-[100]' : ''} ${!isHovering ? 'hide-controls' : ''} ${className}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <style>{`
        .video-player-container .vds-controls {
          transition: opacity 0.3s ease;
        }
        .video-player-container.hide-controls .vds-controls {
          opacity: 0 !important;
          pointer-events: none;
        }
        /* Gradient Shadow for Controls */
        .vds-controls-group:last-child::before {
          content: "";
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 120px;
          background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
          z-index: -1;
          pointer-events: none;
        }
        /* Hide Google Cast */
        .vds-google-cast-button {
          display: none !important;
        }
        @media (max-width: 768px) {
          /* Center Play Button */
          .vds-play-button {
             position: absolute !important;
             top: 50% !important;
             left: 50% !important;
             transform: translate(-50%, -50%) !important;
             margin: 0 !important;
             pointer-events: auto !important;
             z-index: 10 !important;
          }
          /* Hide the entire top-right group which contains default buttons, BUT keep them in DOM for programmatic access */
          .vds-controls-group[data-group="top-right"],
          .vds-controls-group.vds-controls-group--top-right,
          .vds-menu-button {
            opacity: 0 !important;
            pointer-events: none !important;
            position: absolute !important;
            width: 0 !important;
            height: 0 !important;
            overflow: hidden !important;
          }
          /* Ensure our injected buttons in bottom-right are visible and styled */
          .vds-controls-group[data-group="bottom-right"] {
            display: flex !important;
            align-items: center !important;
            gap: 2px !important;
          }
          /* Adjust Fullscreen button position */
          .vds-controls-group[data-group="bottom-right"] {
            margin-left: 0 !important;
          }
          /* Hide title on mobile to save space */
          .vds-title {
            display: none !important;
          }
          /* Smaller icons for mobile if needed */
          .vds-button {
            width: 36px !important;
            height: 36px !important;
          }
        }
      `}</style>
      
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
          title={title}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          src={url as any}
          poster={poster}
          crossOrigin
          playsInline
          autoPlay={autoPlay}
          onTimeUpdate={onTimeUpdate}
          onVolumeChange={onVolumeChange}
          onCanPlay={onCanPlay}
          className="w-full h-full"
        >
        <MediaProvider>
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
            thumbnails={thumbnails} 
            translations={zhCNTranslations} 
            slots={{
            googleCastButton: null,
            fullscreenButton: (
              <FullscreenGroup 
                isPageFullscreen={isPageFullscreen} 
                onTogglePageFullscreen={togglePageFullscreen} 
                playerRef={player}
                containerRef={containerRef}
              />
            )
          }}
        />
      </MediaPlayer>
    </div>
  );
};

export default VideoPlayer;
