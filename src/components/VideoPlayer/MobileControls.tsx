import React, { useState, useEffect } from 'react';
import { MediaPlayerInstance, useMediaState, useMediaRemote, VolumeSlider } from '@vidstack/react';
import { FaVolumeUp, FaVolumeMute, FaCompress, FaExpand } from 'react-icons/fa';
import { RiFullscreenLine } from 'react-icons/ri';
import { handleDebugOutput } from '@/utils';

interface MobileControlsProps {
  playerRef: React.RefObject<MediaPlayerInstance | null>;
}

export const MobileControls: React.FC<MobileControlsProps> = ({ 
  playerRef, 
}) => {
  const remote = useMediaRemote();
  const isFullscreen = useMediaState('fullscreen');
  const isMuted = useMediaState('muted');
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  useEffect(() => {
    // When exiting fullscreen, unlock orientation
    const orientation = (window.screen as unknown as { orientation?: { unlock?: () => void } }).orientation;
    if (!isFullscreen && orientation && orientation.unlock) {
      try {
        orientation.unlock();
      } catch {
        // Ignore unlock errors
      }
    }
  }, [isFullscreen]);

  const handleHorizontalFullscreen = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFullscreen) {
      remote.exitFullscreen();
    } else {
      try {
        if (playerRef.current) {
          await playerRef.current.enterFullscreen();
          // Attempt to lock orientation to landscape for horizontal play
          const orientation = (window.screen as unknown as { orientation?: { lock?: (o: "landscape" | "portrait") => Promise<void> } }).orientation;
          if (orientation && orientation.lock) {
            await orientation.lock('landscape').catch(() => {
              // Ignore lock errors
            });
          }
        }
      } catch (err) {
        handleDebugOutput({
          debugLevel: "error",
          debugMessage: "Failed to enter horizontal fullscreen:",
          debugDetail: err,
        });
      }
    }
  };

  const handleFullscreenClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFullscreen) {
      remote.exitFullscreen();
    } else {
      // Try both methods for mobile compatibility
      if (playerRef.current?.enterFullscreen) {
        playerRef.current.enterFullscreen();
      } else {
        remote.enterFullscreen();
      }
    }
  };

  return (
    <div className="flex items-center gap-2 relative">
      {/* Volume Control */}
      <div className="relative flex items-center">
        {showVolumeSlider && (
          <div 
            className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 bg-black/90 px-3 py-2 rounded-lg w-32 flex items-center justify-center shadow-lg border border-white/10 animate-in fade-in slide-in-from-bottom-2 z-50" 
            onClick={(e) => e.stopPropagation()}
          >
            <VolumeSlider.Root className="vds-slider w-full h-10 group relative flex items-center select-none touch-none">
              <VolumeSlider.Track className="vds-slider-track relative w-full h-[5px] rounded-sm bg-white/30 group-data-[active]:bg-white/40">
                <VolumeSlider.TrackFill className="vds-slider-track-fill absolute h-full rounded-sm bg-white will-change-[width]" />
              </VolumeSlider.Track>
              <VolumeSlider.Thumb className="vds-slider-thumb absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white opacity-0 group-data-[active]:opacity-100 group-data-[dragging]:opacity-100 transition-opacity will-change-[left]" />
            </VolumeSlider.Root>
          </div>
        )}
        <button 
          className="vds-button w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 active:scale-95 transition-all" 
          onClick={(e) => {
            e.stopPropagation();
            setShowVolumeSlider(!showVolumeSlider);
          }}
          aria-label="音量"
        >
          {isMuted ? <FaVolumeMute size={20} /> : <FaVolumeUp size={20} />}
        </button>
      </div>

      {/* Horizontal Fullscreen Button */}
      <button
        className="vds-button w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 active:scale-95 transition-all"
        onClick={handleHorizontalFullscreen}
        aria-label="横向全屏"
      >
        <RiFullscreenLine size={24} />
      </button>

      {/* Fullscreen Button */}
      <button
        className="vds-button w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 active:scale-95 transition-all"
        onClick={handleFullscreenClick}
        aria-label={isFullscreen ? '退出全屏' : '全屏'}
      >
        {isFullscreen ? <FaCompress size={20} /> : <FaExpand size={20} />}
      </button>
    </div>
  );
};
