import React from "react";
import { motion } from "framer-motion";
import { Tooltip } from "@heroui/react";

type LogoItem = {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
};

type Props = {
  items: LogoItem[];
  direction?: "left" | "right";
  speed?: number; // duration in seconds
  className?: string;
};

function LogoLoop({ items, direction = "left", speed = 20, className }: Props) {
  const [isHovered, setIsHovered] = React.useState(false);

  // Duplicate items to create seamless loop
  const duplicatedItems = [...items, ...items, ...items];

  return (
    <div
      className={`relative overflow-hidden w-full ${className || ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[var(--bg-color)] to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[var(--bg-color)] to-transparent z-10" />
      
      <motion.div
        className="flex items-center gap-12 py-4"
        animate={{
          x: direction === "left" ? ["0%", "-33.33%"] : ["-33.33%", "0%"]
        }}
        transition={{
          duration: speed,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop"
        }}
        style={{
          width: "fit-content",
          animationPlayState: isHovered ? "paused" : "running" 
        }}
      >
        {duplicatedItems.map((item, index) => (
          <Tooltip
            key={`${item.id}-${index}`}
            content={
              <div className="px-1 py-2">
                <div className="text-small font-bold">{item.name}</div>
                <div className="text-tiny">{item.description}</div>
              </div>
            }
          >
            <div className="flex flex-col items-center justify-center gap-2 cursor-pointer grayscale hover:grayscale-0 transition-all duration-300 hover:scale-110">
              <div className="w-12 h-12 flex items-center justify-center text-3xl">
                {item.icon}
              </div>
            </div>
          </Tooltip>
        ))}
      </motion.div>
    </div>
  );
}

export default LogoLoop;
