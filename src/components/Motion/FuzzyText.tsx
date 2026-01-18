import React from "react";
import { motion } from "framer-motion";

type Props = {
  text: string;
  className?: string;
};

function FuzzyText(props: Props) {
  const characters = Array.from(props.text);

  return (
    <span className={props.className}>
      {characters.map((character, index) => (
        <motion.span
          key={`${character}-${index}`}
          className="inline-block"
          initial={{
            opacity: 0.7,
            x: 0,
            y: 0,
            filter: "blur(0.5px)"
          }}
          animate={{
            opacity: [0.7, 1, 0.8],
            x: [0, 0.6, -0.6, 0],
            y: [0, -0.6, 0.6, 0]
          }}
          transition={{
            duration: 1.2 + index * 0.03,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          }}
        >
          {character}
        </motion.span>
      ))}
    </span>
  );
}

export default FuzzyText;

