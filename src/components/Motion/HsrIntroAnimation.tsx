import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Code, FileText, Database, Layers } from "lucide-react";
import { useLocation } from "react-router-dom";

interface HsrIntroAnimationProps {
  onComplete?: () => void;
}

const HsrIntroAnimation: React.FC<HsrIntroAnimationProps> = ({ onComplete }) => {
  const location = useLocation();
  
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window === "undefined") return false;

    // 0. If coming from Auth pages, ALWAYS show animation (ignoring other checks)
    const fromAuth = (location.state as { fromAuth?: boolean })?.fromAuth;
    if (fromAuth) {
      // Clear the state to prevent loop if user refreshes? 
      // Actually state is preserved on refresh in some browsers, but usually okay.
      // We might want to clear the sessionStorage key too if we want to force it.
      sessionStorage.removeItem("hasSeenHsrIntro");
      return true;
    }

    // 1. Check if user is already logged in (Skip intro for logged-in users)
    try {
      const authSession = localStorage.getItem("auth_session");
      if (authSession) {
        const { token } = JSON.parse(authSession);
        if (token) return false;
      }
    } catch {
      // Ignore parse error
    }

    // 2. Check if animation has been seen in this session
    // We use sessionStorage to ensure it plays once per session for non-logged-in users,
    // but the login check above prevents re-triggering when returning from login.
    const hasSeenIntro = sessionStorage.getItem("hasSeenHsrIntro");
    return !hasSeenIntro;
  });

  useEffect(() => {
    if (!isVisible) {
        onComplete?.();
        return;
    }

    // Mark as seen immediately
    sessionStorage.setItem("hasSeenHsrIntro", "true");

    // Sequence timing
    // 3.5s animation + 1s fade out = 4.5s total
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 4000); // Start fade out around 4s

    const completeTimer = setTimeout(() => {
        onComplete?.();
    }, 5000); // Fully complete after fade out

    return () => {
      clearTimeout(timer);
      clearTimeout(completeTimer);
    };
  }, [isVisible, onComplete]);

  // Icons for the "Knowledge Orbs"
  const icons = [
    { Icon: Code, color: "#38bdf8" }, // Blue
    { Icon: FileText, color: "#fbbf24" }, // Amber
    { Icon: Database, color: "#f87171" }, // Red
    { Icon: Layers, color: "#4ade80" }, // Green
  ];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
        >
          {/* Background Elements - Subtle noise/grain could be added here */}
          
          <div className="relative w-full h-full flex flex-col items-center justify-center">
            
            {/* --- The Skewer Animation Sequence --- */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {/* 1. Orbs Toss Up & Fall */}
                {icons.map((item, index) => (
                    <motion.div
                        key={index}
                        className="absolute flex items-center justify-center w-24 h-24 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.2)] z-0"
                        style={{ 
                            // Initial random spread x positions
                            left: `calc(50% + ${(index - 1.5) * 90}px)`, 
                        }}
                        initial={{ y: "110vh", opacity: 1, scale: 2.5 }}
                        animate={{ 
                            y: [
                                "110vh", // Start below screen (Lowest position)
                                "-200px", // Toss Up (Peak)
                                "70px"     // Fall to final position
                            ],
                            opacity: [1, 1, 1, 0], // Stay visible until swap, then vanish
                            scale: [2.5, 1.2, 0.6, 0.6], // Big -> Small process
                            rotate: [0, 180, 360, 360]
                        }}
                        transition={{
                            duration: 2.2, // Total duration
                            delay: index * 0.15, // Sequential Toss
                            times: [0, 0.45, 0.8, 1], // 0->0.45(Up), 0.45->0.8(Down), 0.8->1(Vanish)
                            ease: ["circOut", "circIn", "linear"] // Physical feel
                        }}
                    >
                        <item.Icon size={48} color={item.color} />
                    </motion.div>
                ))}

                {/* 2. The Skewer (Stick/Ray) - Strikes when orbs fall */}
                <motion.div
                    className="absolute h-2 bg-gradient-to-r from-transparent via-white to-transparent shadow-[0_0_20px_white] z-10"
                    style={{ 
                        top: "calc(50% + 20px)", // Align with falling orbs
                        width: "150%",
                        left: "-25%",
                        transform: "rotate(-5deg)" // Slight diagonal
                    }}
                    initial={{ scaleX: 0, opacity: 0, x: "-100%" }}
                    animate={{ scaleX: 1, opacity: [0, 1, 0], x: "100%" }}
                    transition={{ 
                        duration: 0.5, 
                        delay: 2.0, // Wait for the sequence to mostly finish (0.15*3 + ~1.7s)
                        ease: "linear" 
                    }}
                />

                {/* 3. Impact Flash at center */}
                <motion.div 
                    className="absolute bg-white rounded-full z-30"
                    style={{ width: 400, height: 400 }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: [0, 0.8, 0], scale: [0, 1.5, 2] }}
                    transition={{ duration: 0.3, delay: 2.1 }} // Sync with Skewer passing center
                />
            </div>

            {/* --- Main Logo Container --- */}
            <div className="relative z-20 flex flex-col items-center">
              
              {/* "知识库" - Top small text */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.4, 
                  delay: 2.3, // Reveal after impact
                  ease: "easeOut"
                }}
                className="mb-2 text-2xl md:text-3xl font-bold text-white tracking-[0.2em] italic opacity-80"
                style={{ textShadow: "0 0 10px rgba(255,255,255,0.3)" }}
              >
                知识库
              </motion.div>

              {/* "小破站" - Main Impact Text */}
              <div className="relative">
                {/* Glitch Layers */}
                <motion.div
                   initial={{ opacity: 0 }}
                   animate={{ 
                     opacity: [0, 0.5, 0, 0.2, 0], 
                     x: [-5, 5, -2, 2, 0]
                   }}
                   transition={{ duration: 0.4, delay: 2.3 }}
                   className="absolute inset-0 flex items-center justify-center text-6xl md:text-8xl font-black text-cyan-400 select-none blur-[1px]"
                >
                  小破站
                </motion.div>

                <motion.div
                   initial={{ opacity: 0 }}
                   animate={{ 
                     opacity: [0, 0.5, 0, 0.2, 0], 
                     x: [5, -5, 2, -2, 0]
                   }}
                   transition={{ duration: 0.4, delay: 2.3 }}
                   className="absolute inset-0 flex items-center justify-center text-6xl md:text-8xl font-black text-red-500 select-none blur-[1px]"
                >
                  小破站
                </motion.div>

                {/* Main Text */}
                <motion.h1
                  initial={{ opacity: 0, scale: 1.5, filter: "blur(10px)" }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  transition={{ 
                    duration: 0.3, 
                    delay: 2.2, // Immediate impact reveal
                    type: "spring", 
                    stiffness: 300, 
                    damping: 20 
                  }}
                  className="text-6xl md:text-8xl font-black text-white italic tracking-tighter relative z-10"
                  style={{ 
                    textShadow: "0 0 30px rgba(255,255,255,0.5)",
                    transform: "skewX(-10deg)"
                  }}
                >
                  小破站
                </motion.h1>
              </div>

              {/* Background Line (The "Skewered" result) */}
              <motion.div
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 2.5, ease: "circOut" }}
                className="w-[140%] h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent mt-6 relative"
              >
                 {/* Icons settled on the line (Background Decoration) */}
                 <div className="absolute inset-0 flex justify-between items-center px-4 opacity-30">
                    {icons.map((item, index) => (
                        <motion.div 
                            key={`bg-${index}`}
                            initial={{ scale: 0 }}
                            animate={{ scale: 0.6 }}
                            transition={{ delay: 2.6 + index * 0.1 }}
                        >
                            <item.Icon size={24} color={item.color} />
                        </motion.div>
                    ))}
                 </div>
              </motion.div>
              
              {/* Decorative Arrow/Symbol */}
               <motion.div
                initial={{ opacity: 0, scale: 0, rotate: -45 }}
                animate={{ opacity: 0.8, scale: 1, rotate: 12 }}
                transition={{ duration: 0.6, delay: 2.7 }}
                className="absolute -right-16 -bottom-10 text-yellow-400 text-5xl"
              >
                ✦
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default HsrIntroAnimation;
