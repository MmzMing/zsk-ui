
export interface Chapter {
  time: number; // seconds
  title: string;
}

export interface VideoSource {
  src: string;
  type?: string;
  quality?: string; // e.g., '1080p', '720p'
}

export interface Subtitle {
  src: string;
  label: string;
  language: string;
  kind: 'subtitles' | 'captions';
  default?: boolean;
}

export interface VideoPlayerProps {
  url: string | VideoSource[];
  className?: string;
  autoPlay?: boolean;
  poster?: string;
  title?: string;
  chapters?: Chapter[];
  subtitles?: Subtitle[];
  initialTime?: number; // For playback memory
  onClose?: () => void;
  // Feature flags
  enableDanmaku?: boolean;
}
