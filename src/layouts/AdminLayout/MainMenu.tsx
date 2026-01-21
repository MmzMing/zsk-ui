import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@heroui/react";
import { FiSearch, FiChevronRight } from "react-icons/fi";
import { adminMenuTree } from "../../config/adminMenu";
import { cn } from "../../lib/utils";
import * as Icons from "react-icons/fi";

interface MainMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (path: string) => void;
}

const MainMenu = ({ isOpen, onClose, onSelect }: MainMenuProps) => {
  const [activeId, setActiveId] = useState<string>(adminMenuTree[0].id);
  const [searchQuery, setSearchQuery] = useState("");

  const activeItem = useMemo(() => 
    adminMenuTree.find((item) => item.id === activeId), 
  [activeId]);

  const filteredMenuItems = useMemo(() => {
    if (!searchQuery) return adminMenuTree;
    return adminMenuTree.filter(item => 
      item.name.includes(searchQuery) || 
      item.children?.some(child => child.name.includes(searchQuery))
    );
  }, [searchQuery]);

  // Helper to get icon component
  const getIcon = (iconName: string) => {
    // @ts-expect-error - iconName is a string but Icons is an object
    const Icon = Icons[iconName];
    return Icon ? Icon : Icons.FiList;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60"
            onClick={onClose}
          />
          
          {/* Menu Card */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-[800px] h-[540px] bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header / Search */}
            <div className="p-4 border-b border-[var(--border-color)]">
              <Input
                placeholder="搜索菜单..."
                startContent={<FiSearch className="text-[var(--text-color-secondary)]" />}
                value={searchQuery}
                onValueChange={setSearchQuery}
                isClearable
                classNames={{
                  inputWrapper: "bg-[var(--bg-color)]",
                }}
              />
            </div>

            {/* Content */}
            <div className="flex-1 flex overflow-hidden">
              {/* Left Column: Level 1 */}
              <div className="w-1/3 border-r border-[var(--border-color)] overflow-y-auto p-2 space-y-1 bg-[var(--bg-color)]">
                {filteredMenuItems.map((item) => {
                  const Icon = getIcon(item.iconName);
                  return (
                    <button
                      key={item.id}
                      onMouseEnter={() => setActiveId(item.id)}
                      onClick={() => setActiveId(item.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-colors",
                        activeId === item.id
                          ? "bg-[color-mix(in_srgb,var(--primary-color)_15%,transparent)] text-[var(--primary-color)] shadow-sm"
                          : "text-[var(--text-color)] hover:bg-[var(--bg-elevated)]"
                      )}
                    >
                      <Icon className="text-lg" />
                      <span className="font-medium flex-1 text-left">{item.name}</span>
                      {activeId === item.id && <FiChevronRight />}
                    </button>
                  );
                })}
                {filteredMenuItems.length === 0 && (
                  <div className="text-center py-4 text-[var(--text-color-secondary)] text-xs">
                    无匹配结果
                  </div>
                )}
              </div>

              {/* Right Column: Level 2 */}
              <div className="flex-1 overflow-y-auto p-4 bg-[var(--bg-elevated)]">
                <div className="text-xs font-semibold text-[var(--text-color-secondary)] mb-3 uppercase tracking-wider">
                  {activeItem?.name || "子菜单"}
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {activeItem?.children?.map((child) => (
                    <button
                      key={child.id}
                      onClick={() => {
                        onSelect(child.path);
                        onClose();
                      }}
                      className="flex items-center justify-between px-4 py-3 rounded-lg border border-[var(--border-color)] hover:border-[var(--primary-color)] hover:bg-[color-mix(in_srgb,var(--primary-color)_5%,transparent)] transition-all group"
                    >
                      <span className="text-sm text-[var(--text-color)] group-hover:text-[var(--primary-color)]">
                        {child.name}
                      </span>
                      <FiChevronRight className="opacity-0 group-hover:opacity-100 text-[var(--primary-color)] transition-opacity" />
                    </button>
                  ))}
                  {(!activeItem?.children || activeItem.children.length === 0) && (
                     <div className="text-center py-10 text-[var(--text-color-secondary)] text-sm">
                       暂无子菜单
                     </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MainMenu;
