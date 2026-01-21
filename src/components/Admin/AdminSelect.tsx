import React, { useMemo } from "react";
import { Select, SelectProps } from "@heroui/react";

export type AdminSelectProps<T extends object = object> = SelectProps<T>;

export const AdminSelect = React.forwardRef(<T extends object>(
  props: AdminSelectProps<T>,
  ref: React.Ref<HTMLSelectElement>
) => {
  const { classNames, listboxProps, ...otherProps } = props;

  const mergedClassNames = useMemo(() => ({
    ...classNames,
    trigger: [
      "h-8 min-h-8",
      "bg-transparent",
      "border border-[var(--border-color)]",
      "dark:border-white/20",
      "data-[hover=true]:border-[var(--primary-color)]/80!",
      "data-[hover=true]:bg-transparent!",
      "data-[open=true]:border-[var(--primary-color)]!",
      "data-[open=true]:bg-transparent!",
      "data-[focus=true]:border-[var(--primary-color)]!",
      "data-[focus=true]:bg-transparent!",
      "transition-colors",
      "shadow-none",
      classNames?.trigger
    ].filter(Boolean).join(" "),
    popoverContent: [
      "bg-[var(--bg-elevated)]",
      "border border-[var(--primary-color)]/20",
      classNames?.popoverContent
    ].filter(Boolean).join(" "),
    value: [
      "text-xs",
      "group-data-[has-value=true]:text-foreground",
      classNames?.value
    ].filter(Boolean).join(" ")
  }), [classNames]);

  const mergedListboxProps = useMemo(() => ({
    ...listboxProps,
    itemClasses: {
      ...listboxProps?.itemClasses,
      base: [
        "text-xs transition-colors",
        "data-[hover=true]:bg-[var(--primary-color)]/10 data-[hover=true]:text-[var(--primary-color)]",
        "data-[selectable=true]:focus:bg-[var(--primary-color)]/10 data-[selectable=true]:focus:text-[var(--primary-color)]",
        "data-[selected=true]:bg-[var(--primary-color)]/20 data-[selected=true]:text-[var(--primary-color)]",
        listboxProps?.itemClasses?.base
      ].filter(Boolean).join(" ")
    }
  }), [listboxProps]);

  return (
    <Select
      ref={ref}
      size="sm"
      classNames={mergedClassNames}
      listboxProps={mergedListboxProps}
      {...otherProps}
    />
  );
}) as <T extends object>(
  props: AdminSelectProps<T> & { ref?: React.Ref<HTMLSelectElement> }
) => React.ReactElement;
