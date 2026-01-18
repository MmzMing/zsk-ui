import React from "react";
import { motion } from "framer-motion";

type Props = {
  text: string;
  className?: string;
};

function ScrollVelocityText(props: Props) {
  return (
    <div className={`overflow-hidden whitespace-nowrap w-full ${props.className || ""}`}>
      <motion.div
        className="inline-block"
        animate={{ x: ["0%", "-50%"] }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{ display: "flex" }}
      >
        <span className="mr-8">{props.text}</span>
        <span className="mr-8">{props.text}</span>
        <span className="mr-8">{props.text}</span>
        <span className="mr-8">{props.text}</span>
        <span className="mr-8">{props.text}</span>
        <span className="mr-8">{props.text}</span>
        <span className="mr-8">{props.text}</span>
        <span className="mr-8">{props.text}</span>
      </motion.div>
    </div>
  );
}

export default ScrollVelocityText;
