import React, { useMemo } from "react";
import { Input } from "@heroui/react";

export type AdminInputProps = React.ComponentProps<typeof Input>;

export const AdminInput = React.forwardRef<HTMLInputElement, AdminInputProps>(
  (props, ref) => {
    const { classNames, ...otherProps } = props;

    const mergedClassNames = useMemo(() => ({
      ...classNames,
      inputWrapper: [
        "h-8",
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
      <Input
        // @ts-expect-error TS2590: Union type too complex
        ref={ref}
        size="sm"
        variant="bordered"
        classNames={mergedClassNames}
        {...otherProps}
      />
    );
  }
);

AdminInput.displayName = "AdminInput";
