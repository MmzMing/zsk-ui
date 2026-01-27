import React, { useState } from 'react';
import { MediaPlayerInstance, useMediaState, useMediaRemote, VolumeSlider } from '@vidstack/react';
import { FaVolumeUp, FaVolumeMute, FaCompress, FaExpand } from 'react-icons/fa';
import { RiSettings3Line, RiAspectRatioLine } from 'react-icons/ri';

interface MobileControlsProps {
  playerRef: React.RefObject<MediaPlayerInstance | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  isPageFullscreen: boolean;
  onTogglePageFullscreen: () => void;
}

export const MobileControls: React.FC<MobileControlsProps> = ({ 
  playerRef, 
  containerRef,
  isPageFullscreen,
  onTogglePageFullscreen
}) => {
  const remote = useMediaRemote();
  const isFullscreen = useMediaState('fullscreen');
  const isMuted = useMediaState('muted');
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  const handleSettingsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Try to find the settings button within the container
    // Now that we used opacity: 0 instead of display: none, it should be findable
    const settingsButton = containerRef.current?.querySelector('button[data-testid="settings-menu-button"], .vds-settings-menu-button, .vds-settings-button, .vds-menu-button') as HTMLButtonElement;
    
    if (settingsButton) {
      settingsButton.click();
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

      {/* Settings Button */}
      <button 
        className="vds-button w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 active:scale-95 transition-all"
        onClick={handleSettingsClick}
        aria-label="设置"
      >
        <RiSettings3Line size={20} />
      </button>

      {/* Page Fullscreen (Landscape) Button */}
      <button
        className={`vds-button w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 active:scale-95 transition-all ${isPageFullscreen ? 'text-primary' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          onTogglePageFullscreen();
        }}
        aria-label="网页全屏"
      >
        <RiAspectRatioLine size={20} />
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
