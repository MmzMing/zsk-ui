import React, { useState } from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  Button,
  ScrollShadow,
  cn,
} from "@heroui/react";
import { FiChevronDown, FiChevronRight, FiCheck } from "react-icons/fi";
import type { VideoCategory } from "@/api/admin/video";

interface CategoryCascaderProps {
  categories: VideoCategory[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  isDisabled?: boolean;
  "aria-label"?: string;
  id?: string;
}

export function CategoryCascader({
  categories,
  value,
  onChange,
  placeholder = "请选择分类",
  className,
  isDisabled,
  "aria-label": ariaLabel,
  id,
}: CategoryCascaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeParentId, setActiveParentId] = useState<string>("");

  // 查找当前选中的分类信息
  const selectedInfo = (() => {
    if (!value) return null;
    for (const parent of categories) {
      if (parent.id === value) {
        return { name: parent.name, parentId: parent.id };
      }
      const child = parent.children?.find((c) => c.id === value);
      if (child) {
        return {
          name: `${parent.name} / ${child.name}`,
          parentId: parent.id,
        };
      }
    }
    return null;
  })();

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      if (selectedInfo) {
        if (activeParentId !== selectedInfo.parentId) {
          setActiveParentId(selectedInfo.parentId);
        }
      } else if (categories.length > 0 && !activeParentId) {
        setActiveParentId(categories[0].id);
      }
    }
  };

  const activeParent = categories.find((c) => c.id === activeParentId);
  const activeChildren = activeParent?.children ?? [];

  const handleSelect = (id: string) => {
    onChange?.(id);
    setIsOpen(false);
  };

  return (
    <Popover
      isOpen={isOpen}
      onOpenChange={handleOpenChange}
      placement="bottom-start"
      classNames={{
        content: "p-0 bg-transparent shadow-none border-none",
      }}
    >
      <PopoverTrigger>
        <Button
          id={id}
          aria-label={ariaLabel || placeholder}
          variant="bordered"
          className={cn(
            "w-full justify-between min-h-10 h-auto px-3 py-2 text-small bg-transparent",
            "border border-[var(--border-color)] dark:border-white/20",
            "hover:border-[var(--primary-color)]/80 hover:bg-transparent",
            "data-[open=true]:border-[var(--primary-color)]",
            isDisabled && "opacity-50 cursor-not-allowed",
            className
          )}
          isDisabled={isDisabled}
          endContent={<FiChevronDown className="text-default-400 text-small" />}
        >
          <span
            className={cn(
              "truncate text-left flex-1",
              !selectedInfo && "text-default-500"
            )}
          >
            {selectedInfo ? selectedInfo.name : placeholder}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0 overflow-hidden bg-[var(--bg-elevated)] border border-[var(--border-color)] shadow-lg rounded-lg">
        <div className="flex h-[300px] w-full">
          {/* 左侧一级分类 */}
          <div className="w-1/2 border-r border-[var(--border-color)] bg-[var(--bg-content)]/50">
            <ScrollShadow className="h-full py-1">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className={cn(
                    "flex items-center justify-between px-4 py-2 cursor-pointer text-sm transition-colors",
                    activeParentId === cat.id
                      ? "text-[var(--primary-color)] bg-[var(--primary-color)]/10 font-medium"
                      : "hover:bg-[var(--bg-content)] hover:text-[var(--text-color)] text-[var(--text-color-secondary)]"
                  )}
                  onMouseEnter={() => setActiveParentId(cat.id)}
                  onClick={() => {
                     // 如果没有子分类，允许直接选择一级分类
                     if (!cat.children || cat.children.length === 0) {
                        handleSelect(cat.id);
                     }
                  }}
                >
                  <span className="truncate">{cat.name}</span>
                  {cat.children && cat.children.length > 0 && (
                    <FiChevronRight className="text-xs opacity-50" />
                  )}
                </div>
              ))}
            </ScrollShadow>
          </div>

          {/* 右侧二级分类 */}
          <div className="w-1/2 bg-[var(--bg-elevated)]">
            <ScrollShadow className="h-full py-1">
              {activeChildren.length > 0 ? (
                activeChildren.map((sub) => (
                  <div
                    key={sub.id}
                    className={cn(
                      "flex items-center justify-between px-4 py-2 cursor-pointer text-sm transition-colors",
                      value === sub.id
                        ? "text-[var(--primary-color)] font-medium"
                        : "hover:bg-[var(--primary-color)]/5 text-[var(--text-color)]"
                    )}
                    onClick={() => handleSelect(sub.id)}
                  >
                    <span className="truncate">{sub.name}</span>
                    {value === sub.id && <FiCheck className="text-small" />}
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-full text-[var(--text-color-secondary)] text-xs">
                  暂无子分类
                </div>
              )}
            </ScrollShadow>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
