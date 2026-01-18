import React from "react";
import clsx from "clsx";
import { FaArrowRight } from "react-icons/fa6";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement>;

function InteractiveHoverButton(props: Props) {
  const { children, className, ...rest } = props;

  return (
    <button
      {...rest}
      className={clsx(
        "group relative inline-flex h-9 cursor-pointer items-center justify-center overflow-hidden rounded-full border px-6 text-[13px] font-medium transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-60",
        "border-[var(--border-color)] bg-[var(--bg-elevated)] text-[var(--text-color)] hover:border-[var(--primary-color)]",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-full">
        <div className="h-full w-full origin-left scale-x-0 bg-[var(--primary-color)] transition-transform duration-300 group-hover:scale-x-100" />
      </div>

      <div className="relative z-10 flex items-center gap-2">
        <span className="transition-colors duration-300 group-hover:text-[var(--bg-elevated)]">
          {children}
        </span>
        <FaArrowRight className="h-3.5 w-3.5 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
      </div>
    </button>
  );
}

export default InteractiveHoverButton;

