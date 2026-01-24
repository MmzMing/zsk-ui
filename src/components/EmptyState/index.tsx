import React from "react";
import { FiInbox } from "react-icons/fi";
import { cn } from "@heroui/react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title = "暂无数据",
  description = "未能查询到相关内容",
  icon,
  className
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-24 text-[var(--text-color-secondary)]", className)}>
      <div className="mb-6 rounded-full bg-[var(--bg-elevated)] p-8 shadow-inner border border-[var(--border-color)]/50">
        {icon || <FiInbox className="h-12 w-12 opacity-30" />}
      </div>
      <h3 className="mb-2 text-xl font-medium text-[var(--text-color)]">{title}</h3>
      <p className="text-sm opacity-60">{description}</p>
    </div>
  );
}
