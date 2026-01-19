import { useEffect, useRef, useState, useCallback } from 'react';
import { useInView } from 'framer-motion';

interface ShuffleProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  shuffleDirection?: 'left' | 'right' | 'up' | 'down';
  duration?: number;
  maxDelay?: number;
  ease?: string;
  threshold?: number;
  rootMargin?: string;
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';
  textAlign?: React.CSSProperties['textAlign'];
  onShuffleComplete?: () => void;
  shuffleTimes?: number;
  animationMode?: 'evenodd' | 'random';
  loop?: boolean;
  loopDelay?: number;
  stagger?: number;
  scrambleCharset?: string;
  colorFrom?: string;
  colorTo?: string;
  triggerOnce?: boolean;
  respectReducedMotion?: boolean;
  triggerOnHover?: boolean;
}

const defaultCharset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';

const Shuffle = ({
  text,
  className = '',
  style = {},
  tag: Tag = 'p',
  duration = 0.35,
  threshold = 0.1,
  rootMargin = '-100px',
  textAlign = 'left',
  shuffleTimes = 3,
  scrambleCharset = defaultCharset,
  colorFrom,
  colorTo,
  triggerOnce = true,
  triggerOnHover = false,
  loop = false,
  loopDelay = 0,
  onShuffleComplete,
}: ShuffleProps) => {
  const [displayText, setDisplayText] = useState(text);
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef(null);
/* eslint-disable @typescript-eslint/no-explicit-any */
  const isInView = useInView(containerRef, {
    once: triggerOnce,
    amount: threshold,
    margin: rootMargin as any,
  });
/* eslint-enable @typescript-eslint/no-explicit-any */

  const shuffle = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);

    const characters = text.split('');
    let iteration = 0;
    const maxIterations = shuffleTimes;

    const interval = setInterval(() => {
      setDisplayText(() =>
        characters
          .map((char) => {
            if (char === ' ') return ' ';
            if (iteration >= maxIterations) return char;
            
            // Randomly decide if we show the original char or a scrambled one
            // based on the progress
            const progress = iteration / maxIterations;
            if (Math.random() < progress) return char;

            return scrambleCharset[Math.floor(Math.random() * scrambleCharset.length)];
          })
          .join('')
      );

      iteration += 1 / (duration * 20); // Adjust speed based on duration

      if (iteration >= maxIterations) {
        clearInterval(interval);
        setDisplayText(text);
        setIsAnimating(false);
        if (onShuffleComplete) onShuffleComplete();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [text, shuffleTimes, scrambleCharset, duration, isAnimating, onShuffleComplete]);

  useEffect(() => {
    if (isInView && !isAnimating) {
      // Use a small delay to avoid synchronous setState in effect warning
      let timeout: ReturnType<typeof setTimeout>;
      
      if (loop) {
        timeout = setTimeout(() => {
          shuffle();
        }, loopDelay);
      } else {
        // If not looping, we only run once when entering view (controlled by isInView)
        // However, if we want to run immediately on entry:
         timeout = setTimeout(() => {
          shuffle();
        }, 0);
      }
      
      return () => clearTimeout(timeout);
    }
  }, [isInView, isAnimating, shuffle, loop, loopDelay]);

  const handleMouseEnter = () => {
    if (triggerOnHover && !isAnimating) {
      shuffle();
    }
  };

  return (
    <Tag
      ref={containerRef}
      className={className}
      style={{ ...style, textAlign, color: isAnimating ? colorFrom : colorTo }}
      onMouseEnter={handleMouseEnter}
    >
      {displayText}
    </Tag>
  );
};

export default Shuffle;
