
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
const STORAGE_KEY_RATE = 'video-player-rate';

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
  
  // Separate flags for granular control
  const timeRestored = useRef(false);

  // Controlled states for Volume, Muted, and Rate to ensure immediate restoration
  const [volume, setVolume] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_VOLUME);
      if (saved) {
        const parsed = JSON.parse(saved);
        return typeof parsed.volume === 'number' ? parsed.volume : 1;
      }
    } catch { /* ignore */ }
    return 1;
  });

  const [muted, setMuted] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_VOLUME);
      if (saved) {
        const parsed = JSON.parse(saved);
        return typeof parsed.muted === 'boolean' ? parsed.muted : false;
      }
    } catch { /* ignore */ }
    return false;
  });

  const [playbackRate, setPlaybackRate] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_RATE);
      if (saved) {
        const rate = parseFloat(saved);
        return !isNaN(rate) ? rate : 1;
      }
    } catch { /* ignore */ }
    return 1;
  });

  const [isPageFullscreen, setIsPageFullscreen] = useState(false);
  const [isHovering, setIsHovering] = useState(true);

  useEffect(() => {
    // Reset time flag on URL change
    timeRestored.current = false;
  }, [url]);

  const saveTime = useRef(
    throttle((time: number) => {
      if (url) {
        localStorage.setItem(STORAGE_KEY_TIME_PREFIX + url, String(time));
      }
    }, 1000)
  ).current;

  const onTimeUpdate = () => {
    if (player.current && timeRestored.current) {
      saveTime(player.current.currentTime);
    }
  };

  const onPause = () => {
    if (player.current && timeRestored.current) {
      // Force save time on pause to be accurate
      if (url) {
        localStorage.setItem(STORAGE_KEY_TIME_PREFIX + url, String(player.current.currentTime));
      }
    }
  };

  const onVolumeChange = () => {
    if (player.current) {
      const newVolume = player.current.volume;
      const newMuted = player.current.muted;
      
      // Only update if actually different to avoid loops
      setVolume(newVolume);
      setMuted(newMuted);
      
      const settings = {
        volume: newVolume,
        muted: newMuted
      };
      localStorage.setItem(STORAGE_KEY_VOLUME, JSON.stringify(settings));
    }
  };

  const onRateChange = () => {
    if (player.current) {
      const newRate = player.current.playbackRate;
      setPlaybackRate(newRate);
      localStorage.setItem(STORAGE_KEY_RATE, String(newRate));
    }
  };

  const onLoadedMetadata = () => {
    // Volume and Rate are now controlled via props, 
    // but we can still use this as a hook if needed.
  };

  const onCanPlay = () => {
    if (timeRestored.current || !player.current) return;
    
    const media = player.current;

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
        requestAnimationFrame(() => {
          media.currentTime = targetTime;
        });
      }
    }
    
    timeRestored.current = true;
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
      className={`relative w-full h-full bg-black video-player-container overflow-hidden ${isPageFullscreen ? '!fixed !inset-0 !z-[100]' : ''} ${!isHovering ? 'hide-controls' : ''} ${className}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      
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
          volume={volume}
          muted={muted}
          playbackRate={playbackRate}
          crossOrigin
          playsInline
          autoPlay={autoPlay}
          onTimeUpdate={onTimeUpdate}
          onPause={onPause}
          onVolumeChange={onVolumeChange}
          onRateChange={onRateChange}
          onLoadedMetadata={onLoadedMetadata}
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
