import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useOutlet } from 'react-router-dom';
import { useAppStore } from '../../store';
import AnimatedContent from './AnimatedContent';

type Props = {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
};

const PageTransitionWrapper: React.FC<Props> = ({ className, style, children }) => {
  const location = useLocation();
  const outlet = useOutlet();
  const { pageTransition } = useAppStore();

  const getVariants = () => {
    switch (pageTransition) {
      case 'fade':
        return {
          initial: { opacity: 0, filter: "blur(10px)", y: 10 },
          animate: { opacity: 1, filter: "blur(0px)", y: 0 },
          exit: { opacity: 0, filter: "blur(10px)", y: -10 },
          transition: { duration: 0.4, ease: "easeOut" } as const
        };
      case 'slide':
        return {
          initial: { opacity: 0, x: 20, scale: 1 },
          animate: { opacity: 1, x: 0, scale: 1 },
          exit: { opacity: 0, x: -20, scale: 1 },
          transition: { duration: 0.3, ease: "easeInOut" } as const
        };
      case 'scale':
        return {
          initial: { opacity: 0, x: 0, scale: 0.96 },
          animate: { opacity: 1, x: 0, scale: 1 },
          exit: { opacity: 0, x: 0, scale: 1.04 },
          transition: { duration: 0.3, ease: "easeOut" } as const
        };
      case 'layer':
        return {
          initial: { opacity: 0, y: 20, scale: 0.98 },
          animate: { opacity: 1, y: 0, scale: 1 },
          exit: { opacity: 0, scale: 0.98 },
          transition: { duration: 0.35, ease: "circOut" } as const
        };
      case 'none':
      default:
        return {
          initial: { opacity: 1 },
          animate: { opacity: 1 },
          exit: { opacity: 1 },
          transition: { duration: 0 } as const
        };
    }
  };

  if (pageTransition === 'slide') {
    return (
      <AnimatePresence mode="wait">
        <AnimatedContent
          key={location.pathname}
          activeKey={location.pathname}
          className={className}
          style={{ ...style, width: '100%', height: '100%', pointerEvents: 'auto' }}
          distance={100}
          direction="vertical"
          reverse={false}
          duration={0.8}
          ease="power3.out"
          initialOpacity={0}
          animateOpacity={false}
          scale={1}
          threshold={0.1}
        >
          {children || outlet}
        </AnimatedContent>
      </AnimatePresence>
    );
  }

  const variants = getVariants();
  const { transition, ...motionVariants } = variants;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        className={className}
        style={{ ...style, width: '100%', height: '100%', pointerEvents: 'auto' }}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={motionVariants}
        transition={transition}
      >
        {children || outlet}
      </motion.div>
    </AnimatePresence>
  );
};

export default PageTransitionWrapper;
