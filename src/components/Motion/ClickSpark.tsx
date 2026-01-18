import React, { useRef, useEffect, useCallback } from "react";

type Easing = "linear" | "ease-in" | "ease-out" | "ease-in-out";

type Props = {
  sparkColor?: string;
  sparkSize?: number;
  sparkRadius?: number;
  sparkCount?: number;
  duration?: number;
  easing?: Easing;
  extraScale?: number;
};

type Spark = {
  x: number;
  y: number;
  angle: number;
  startTime: number;
};

function ClickSpark(props: Props) {
  const {
    sparkColor = "var(--primary-color)",
    sparkSize = 10,
    sparkRadius = 15,
    sparkCount = 8,
    duration = 400,
    easing = "ease-out",
    extraScale = 1
  } = props;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sparksRef = useRef<Spark[]>([]);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const resizeCanvas = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  const easeFunc = useCallback(
    (value: number) => {
      const t = Math.min(Math.max(value, 0), 1);
      if (easing === "linear") {
        return t;
      }
      if (easing === "ease-in") {
        return t * t;
      }
      if (easing === "ease-in-out") {
        if (t < 0.5) {
          return 2 * t * t;
        }
        return -1 + (4 - 2 * t) * t;
      }
      return t * (2 - t);
    },
    [easing]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    // Get color from CSS variable if it's a variable reference
    const getActualColor = () => {
      if (sparkColor.startsWith("var(")) {
        const varName = sparkColor.match(/var\(([^)]+)\)/)?.[1];
        if (varName) {
          return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
        }
      }
      return sparkColor;
    };

    let animationId: number;
    const draw = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }
      context.clearRect(0, 0, canvas.width, canvas.height);
      const actualColor = getActualColor();
      
      sparksRef.current = sparksRef.current.filter(spark => {
        const elapsed = timestamp - spark.startTime;
        if (elapsed >= duration) {
          return false;
        }
        const progress = elapsed / duration;
        const eased = easeFunc(progress);
        const distance = eased * sparkRadius * extraScale;
        const lineLength = sparkSize * (1 - eased);
        const x1 = spark.x + distance * Math.cos(spark.angle);
        const y1 = spark.y + distance * Math.sin(spark.angle);
        const x2 = spark.x + (distance + lineLength) * Math.cos(spark.angle);
        const y2 = spark.y + (distance + lineLength) * Math.sin(spark.angle);
        context.strokeStyle = actualColor;
        context.lineWidth = 2;
        context.beginPath();
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);
        context.stroke();
        return true;
      });
      animationId = window.requestAnimationFrame(draw);
    };
    animationId = window.requestAnimationFrame(draw);
    return () => {
      window.cancelAnimationFrame(animationId);
    };
  }, [sparkColor, sparkSize, sparkRadius, sparkCount, duration, easeFunc, extraScale]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const handleClick = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const now = window.performance.now();
      const count = sparkCount > 0 ? sparkCount : 1;
      const newSparks: Spark[] = Array.from({ length: count }).map((_, index) => ({
        x,
        y,
        angle: (2 * Math.PI * index) / count,
        startTime: now
      }));
      sparksRef.current.push(...newSparks);
    };
    window.addEventListener("click", handleClick);
    return () => {
      window.removeEventListener("click", handleClick);
    };
  }, [sparkCount]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: "100%",
        height: "100%",
        display: "block",
        userSelect: "none",
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 9999
      }}
    />
  );
}

export default ClickSpark;

