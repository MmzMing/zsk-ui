import React from "react";
import { AnimatePresence, motion } from "framer-motion";

type Props = {
  words: string[];
  interval?: number;
  className?: string;
};

function WordRotate(props: Props) {
  const [index, setIndex] = React.useState(0);
  const current = props.words[index] ?? "";

  React.useEffect(() => {
    if (props.words.length <= 1) {
      return;
    }
    const id = window.setInterval(() => {
      setIndex(previous => (previous + 1) % props.words.length);
    }, props.interval ?? 2200);
    return () => {
      window.clearInterval(id);
    };
  }, [props.words, props.interval]);

  return (
    <div className={`relative ${props.className || ""}`}>
      <AnimatePresence mode="wait">
        <motion.span
          key={current}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.32, ease: "easeOut" }}
          className="inline-block"
        >
          {current}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

export default WordRotate;

