import React from "react";
import { AnimatePresence, motion } from "framer-motion";

type Props = {
  children: React.ReactNode;
  activeKey: React.Key;
  className?: string;
};

function AnimatedContent(props: Props) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={props.activeKey}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -24 }}
        transition={{
          duration: 0.35,
          ease: [0.17, 0.67, 0.3, 1.33]
        }}
        className={props.className}
      >
        {props.children}
      </motion.div>
    </AnimatePresence>
  );
}

export default AnimatedContent;

