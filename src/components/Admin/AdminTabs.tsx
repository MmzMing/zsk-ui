import { Tabs, TabsProps } from "@heroui/react";

/**
 * Universal Admin Tabs Component
 * Standardizes the look and feel for all Admin pages.
 * Style: radius="full", color="primary", theme-controlled.
 */
export const AdminTabs = ({ classNames, ...props }: TabsProps) => {
  return (
    <Tabs
      radius="full"
      variant="light"
      size="sm"
      color="primary"
      classNames={{
        ...classNames,
        tabList: `p-0 gap-1 ${classNames?.tabList || ""}`,
        tab: `text-[0.6875rem] ${classNames?.tab || ""}`,
        cursor: `bg-[color-mix(in_srgb,var(--primary-color)_12%,transparent)] border border-[color-mix(in_srgb,var(--primary-color)_40%,transparent)] shadow-none ${classNames?.cursor || ""}`,
        tabContent: `group-data-[selected=true]:text-[var(--primary-color)] group-data-[selected=true]:font-medium text-[var(--text-color-secondary)] ${classNames?.tabContent || ""}`,
      }}
      {...props}
    />
  );
};
