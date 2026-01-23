import React, { useState } from "react";
import { motion } from "framer-motion";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
  driftX: number;
}

export const ParticlesBackground = () => {
  const [particles] = useState<Particle[]>(() => {
    const particleCount = 30; // Number of particles
    return Array.from({ length: particleCount }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // 0-100% width
      y: Math.random() * 100, // 0-100% height
      size: Math.random() * 4 + 1, // 1-5px size
      duration: Math.random() * 15 + 10, // 10-25s float duration
      delay: Math.random() * 5, // 0-5s start delay
      opacity: Math.random() * 0.5 + 0.1, // 0.1-0.6 opacity
      driftX: Math.random() * 50 - 25, // -25 to 25px drift
    }));
  });

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-black">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute bg-white" // Force white particles for dark theme feel
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            opacity: particle.opacity,
          }}
          animate={{
            y: [0, -100], // Float up slightly relative to start
            x: [0, particle.driftX], // Drift horizontally
            opacity: [0, particle.opacity, 0], // Fade in/out
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "linear",
            repeatType: "reverse",
          }}
        />
      ))}
    </div>
  );
};
