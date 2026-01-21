import React, { useMemo } from "react";
import { Input } from "@heroui/react";
import { FiSearch } from "react-icons/fi";

export type AdminSearchInputProps = React.ComponentProps<typeof Input>;

export const AdminSearchInput = React.forwardRef<HTMLInputElement, AdminSearchInputProps>(
  (props, ref) => {
    const { classNames, startContent, ...otherProps } = props;

    const mergedClassNames = useMemo(() => ({
      ...classNames,
      inputWrapper: [
        "h-8",
        "bg-transparent",
        "border",
        // Light mode default
        "border-[var(--border-color)]",
        // Dark mode border - Reference Figure 1 (Subtle white border)
        "dark:border-white/20",
        // Hover state: Theme color 80% opacity
        "hover:border-[var(--primary-color)]/80!",
        "dark:hover:border-[var(--primary-color)]/80!",
        // Focus state: Theme color
        "group-data-[focus=true]:border-[var(--primary-color)]!",
        "dark:group-data-[focus=true]:border-[var(--primary-color)]!",
        // Transition
        "transition-colors",
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
        startContent={
          startContent || (
            <FiSearch className="text-xs text-[var(--text-color-secondary)]" />
          )
        }
        classNames={mergedClassNames}
        {...otherProps}
      />
    );
  }
);

AdminSearchInput.displayName = "AdminSearchInput";
