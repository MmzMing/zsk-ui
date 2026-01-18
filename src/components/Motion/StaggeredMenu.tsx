import React, { ReactNode } from "react";
import { motion } from "framer-motion";

type Props = {
  children: ReactNode;
};

function StaggeredMenu(props: Props) {
  const items = React.Children.toArray(props.children);

  return (
    <>
      {items.map((item, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.06 * index,
            duration: 0.28,
            ease: "easeOut"
          }}
        >
          {item}
        </motion.div>
      ))}
    </>
  );
}

export default StaggeredMenu;
