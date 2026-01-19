import { useCallback, useRef } from "react";
import { Moon, Sun } from "lucide-react";
import { useAppStore } from "../../store";
import { Button } from "@heroui/react";
import { flushSync } from "react-dom";

export function ThemeToggler() {
  const { themeMode, setThemeMode } = useAppStore();
  const buttonRef = useRef<HTMLButtonElement>(null);

  const toggleTheme = useCallback(async () => {
    // Determine the next theme based on current state (light -> dark -> system -> light)
    // For this animation demo, we'll simplify to binary toggle if system mode is not strictly required by the animation logic,
    // but preserving your original 3-state logic is also possible.
    // However, the View Transition example is best with binary (light/dark) or calculating the resolved state.
    // Let's keep the 3-state logic but animate the transition.
    
    // Toggle between light and dark only
    const newTheme: "light" | "dark" = themeMode === "dark" ? "light" : "dark";

    // If browser doesn't support startViewTransition, just update state
    if (
      !document.startViewTransition ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setThemeMode(newTheme);
      return;
    }

    await document.startViewTransition(() => {
      flushSync(() => {
        setThemeMode(newTheme);
      });
    }).ready;

    // Animation logic
    if (buttonRef.current) {
      const { top, left, width, height } = buttonRef.current.getBoundingClientRect();
      const x = left + width / 2;
      const y = top + height / 2;
      const right = window.innerWidth - left;
      const bottom = window.innerHeight - top;
      const maxRadius = Math.hypot(
        Math.max(left, right),
        Math.max(top, bottom)
      );

      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${maxRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 400,
          easing: "ease-in-out",
          pseudoElement: "::view-transition-new(root)",
        }
      );
    }
  }, [themeMode, setThemeMode]);

  return (
    <Button
      ref={buttonRef}
      variant="light"
      isIconOnly
      className="inline-flex items-center justify-center rounded-full w-8 h-8 text-[var(--text-color-secondary)] transition-colors transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-sm hover:bg-[color-mix(in_srgb,var(--primary-color)_10%,transparent)] hover:text-[var(--primary-color)]"
      onPress={toggleTheme}
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
