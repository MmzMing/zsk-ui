import React from "react";
import { motion } from "framer-motion";

type Props = {
  children: React.ReactNode;
  className?: string;
};

function StickerPeel(props: Props) {
  return (
    <motion.div
      className={props.className}
      initial={{ rotate: -4, y: -2 }}
      animate={{ rotate: 0, y: 0 }}
      whileHover={{ rotate: 3, y: -2 }}
      transition={{
        type: "spring",
        stiffness: 220,
        damping: 18
      }}
    >
      {props.children}
    </motion.div>
  );
}

export default StickerPeel;

