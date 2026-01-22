import React, { useMemo } from "react";
import { Textarea } from "@heroui/react";

export type AdminTextareaProps = React.ComponentProps<typeof Textarea>;

export const AdminTextarea = React.forwardRef<HTMLTextAreaElement, AdminTextareaProps>(
  (props, ref) => {
    const { classNames, ...otherProps } = props;

    const mergedClassNames = useMemo(() => ({
      ...classNames,
      inputWrapper: [
        "bg-transparent",
        "border",
        // Light mode default
        "border-[var(--border-color)]",
        // Dark mode border
        "dark:border-white/20",
        // Hover state: Theme color 80% opacity
        "hover:border-[var(--primary-color)]/80!",
        "dark:hover:border-[var(--primary-color)]/80!",
        // Focus state: Theme color
        "group-data-[focus=true]:border-[var(--primary-color)]!",
        "dark:group-data-[focus=true]:border-[var(--primary-color)]!",
        // Transition
        "transition-colors",
        "shadow-none",
        // Merge with user provided classes
        classNames?.inputWrapper
      ]
        .filter(Boolean)
        .join(" "),
      input: ["text-xs", classNames?.input].filter(Boolean).join(" ")
    }), [classNames]);

    return (
      <Textarea
        ref={ref}
        size="sm"
        variant="bordered"
        classNames={mergedClassNames}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        {...(otherProps as any)}
      />
    );
  }
);

AdminTextarea.displayName = "AdminTextarea";
