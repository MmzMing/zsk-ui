import React from "react";
import { motion } from "framer-motion";

type Props = {
  text: string;
  className?: string;
  delay?: number;
};

function TrueFocusText(props: Props) {
  return (
    <motion.span
      className={props.className}
      initial={{
        opacity: 0,
        filter: "blur(4px)",
        letterSpacing: "0.3em"
      }}
      animate={{
        opacity: 1,
        filter: "blur(0px)",
        letterSpacing: "0.1em"
      }}
      transition={{
        delay: props.delay ?? 0,
        duration: 0.6,
        ease: "easeOut"
      }}
    >
      {props.text}
    </motion.span>
  );
}

export default TrueFocusText;

