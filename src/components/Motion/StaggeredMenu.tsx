import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";

type StaggeredMenuItem = {
  label: string;
  onClick?: () => void;
  icon?: React.ReactNode;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  position?: "left" | "right";
  colors?: string[];
  items: StaggeredMenuItem[];
  menuButtonColor?: string;
  openMenuButtonColor?: string;
  accentColor?: string;
  className?: string;
  children?: React.ReactNode;
};

function StaggeredMenu({
  isOpen,
  onClose,
  position = "right",
  colors = ["#B19EEF", "#5227FF"],
  items,
  accentColor,
  className = "",
  children
}: Props) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkDark = () => {
      const isDarkMode = document.documentElement.classList.contains("dark");
      setIsDark(isDarkMode);
    };
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"]
    });
    return () => observer.disconnect();
  }, []);

  const handleItemClick = useCallback(
    (item: StaggeredMenuItem) => {
      if (item.onClick) {
        item.onClick();
      }
      onClose();
    },
    [onClose]
  );

  const layerVariants: Variants = {
    closed: (i: number) => ({
      x: position === "right" ? "100%" : "-100%",
      transition: {
        delay: (colors.length - 1 - i) * 0.1,
        duration: 0.35,
        ease: [0.76, 0, 0.24, 1]
      }
    }),
    open: (i: number) => ({
      x: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: [0.76, 0, 0.24, 1]
      }
    })
  };

  const contentVariants: Variants = {
    closed: {
      opacity: 0,
      x: position === "right" ? 60 : -60,
      transition: { duration: 0.3 }
    },
    open: {
      opacity: 1,
      x: 0,
      transition: {
        delay: colors.length * 0.1 + 0.15,
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  const itemVariants: Variants = {
    closed: { opacity: 0, y: 20 },
    open: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: colors.length * 0.1 + 0.2 + i * 0.08,
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    })
  };

  const bgColor = isDark ? "rgba(17, 17, 17, 0.98)" : "rgba(255, 255, 255, 0.98)";
  const textColor = isDark ? "#ffffff" : "#1a1a1a";
  const borderColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className={`fixed top-0 ${position === "right" ? "right-0" : "left-0"} h-full w-96 max-w-full z-50 ${className}`}
            initial={false}
            animate="open"
            exit="closed"
          >
            {colors.map((color, i) => (
              <motion.div
                key={color}
                custom={i}
                variants={layerVariants}
                initial="closed"
                animate="open"
                exit="closed"
                className="absolute top-0 h-full"
                style={{
                  width: `${100 - i * 12}%`,
                  [position]: 0,
                  backgroundColor: color,
                  opacity: 0.2 - i * 0.05
                }}
              />
            ))}

            <motion.div
              className="relative h-full p-6 overflow-y-auto pb-10 pr-1"
              variants={contentVariants}
              initial="closed"
              animate="open"
              exit="closed"
              style={{
                backgroundColor: bgColor,
                borderLeft: position === "right" ? `1px solid ${borderColor}` : undefined,
                borderRight: position === "left" ? `1px solid ${borderColor}` : undefined
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3
                  className="text-lg font-semibold"
                  style={{ color: textColor }}
                >
                  菜单
                </h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                  style={{ color: textColor }}
                  aria-label="关闭菜单"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              {items.length > 0 && (
                <nav className="mb-6">
                  <ul className="space-y-1">
                    {items.map((item, i) => (
                      <motion.li
                        key={item.label}
                        custom={i}
                        variants={itemVariants}
                        initial="closed"
                        animate="open"
                      >
                        <button
                          type="button"
                          onClick={() => handleItemClick(item)}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 group"
                          style={{
                            color: textColor,
                            backgroundColor: "transparent"
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = accentColor
                              ? `${accentColor}15`
                              : `${colors[0]}15`;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "transparent";
                          }}
                        >
                          {item.icon && (
                            <span
                              className="opacity-60 group-hover:opacity-100 transition-opacity"
                              style={{ color: accentColor || colors[0] }}
                            >
                              {item.icon}
                            </span>
                          )}
                          <span className="font-medium">{item.label}</span>
                        </button>
                      </motion.li>
                    ))}
                  </ul>
                </nav>
              )}

              {children && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: colors.length * 0.1 + items.length * 0.08 + 0.25, duration: 0.4 }}
                >
                  {children}
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default StaggeredMenu;
