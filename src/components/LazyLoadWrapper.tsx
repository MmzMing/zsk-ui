import React, { useState, useEffect, useRef, ReactNode } from "react";

interface LazyLoadWrapperProps {
  children: ReactNode;
  threshold?: number;
  rootMargin?: string;
  minHeight?: string | number;
  className?: string;
}

export const LazyLoadWrapper = ({
  children,
  threshold = 0.1,
  rootMargin = "200px",
  minHeight = "100px",
  className = ""
}: LazyLoadWrapperProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin]);

  return (
    <div 
      ref={ref} 
      className={`relative ${className}`}
      style={{ minHeight: isVisible ? undefined : minHeight }}
    >
      {isVisible ? children : null}
    </div>
  );
};
