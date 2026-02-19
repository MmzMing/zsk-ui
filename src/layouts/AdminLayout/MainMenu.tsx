/**
 * 主菜单组件
 * 提供后台管理的菜单导航面板，支持搜索和分类浏览
 *
 * @module layouts/AdminLayout/MainMenu
 * @author wuhuaming
 * @date 2026-02-18
 * @version 1.0
 */

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@heroui/react";
import { FiSearch, FiChevronRight } from "react-icons/fi";
import { adminMenuTree } from "../../config/adminMenu";
import { cn } from "@/utils";
import * as Icons from "react-icons/fi";

/**
 * 主菜单组件属性
 */
interface MainMenuProps {
  /** 菜单是否打开 */
  isOpen: boolean;
  /** 关闭菜单的回调函数 */
  onClose: () => void;
  /** 选择菜单项的回调函数 */
  onSelect: (path: string) => void;
}

/**
 * 主菜单组件
 * 展示两级菜单结构，支持搜索过滤功能
 *
 * @param props 组件属性
 * @returns 主菜单组件
 */
const MainMenu = ({ isOpen, onClose, onSelect }: MainMenuProps) => {
  /** 当前激活的一级菜单ID */
  const [activeId, setActiveId] = useState<string>(adminMenuTree[0].id);
  /** 搜索关键词 */
  const [searchQuery, setSearchQuery] = useState("");

  /** 当前激活的一级菜单项 */
  const activeItem = useMemo(() => 
    adminMenuTree.find((item) => item.id === activeId), 
  [activeId]);

  /** 根据搜索关键词过滤后的菜单列表 */
  const filteredMenuItems = useMemo(() => {
    if (!searchQuery) return adminMenuTree;
    return adminMenuTree.filter(item => 
      item.name.includes(searchQuery) || 
      item.children?.some(child => child.name.includes(searchQuery))
    );
  }, [searchQuery]);

  /**
   * 根据图标名称获取图标组件
   * @param iconName 图标名称
   * @returns 图标组件
   */
  const getIcon = (iconName: string) => {
    // @ts-expect-error - iconName is a string but Icons is an object
    const Icon = Icons[iconName];
    return Icon ? Icon : Icons.FiList;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 背景遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60"
            onClick={onClose}
          />
          
          {/* 菜单卡片 */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-[800px] h-[540px] bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            style={{ fontSize: "var(--nav-font-size)" }}
          >
            {/* 头部搜索区域 */}
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

            {/* 内容区域 */}
            <div className="flex-1 flex overflow-hidden">
              {/* 左侧一级菜单列 */}
              <div className="w-1/3 border-r border-[var(--border-color)] overflow-y-auto p-2 space-y-1 bg-[var(--bg-color)]">
                {filteredMenuItems.map((item) => {
                  const Icon = getIcon(item.iconName);
                  return (
                    <button
                      key={item.id}
                      onMouseEnter={() => setActiveId(item.id)}
                      onClick={() => setActiveId(item.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-3 rounded-lg text-[1em] transition-colors",
                        activeId === item.id
                          ? "bg-[color-mix(in_srgb,var(--primary-color)_15%,transparent)] text-[var(--primary-color)] shadow-sm"
                          : "text-[var(--text-color)] hover:bg-[var(--bg-elevated)]"
                      )}
                    >
                      <Icon className="text-[1.2em]" />
                      <span className="font-medium flex-1 text-left">{item.name}</span>
                      {activeId === item.id && <FiChevronRight />}
                    </button>
                  );
                })}
                {filteredMenuItems.length === 0 && (
                  <div className="text-center py-4 text-[var(--text-color-secondary)] text-[0.85em]">
                    无匹配结果
                  </div>
                )}
              </div>

              {/* 右侧二级菜单列 */}
              <div className="flex-1 overflow-y-auto p-4 bg-[var(--bg-elevated)]">
                <div className="text-[0.85em] font-semibold text-[var(--text-color-secondary)] mb-3 uppercase tracking-wider">
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
                      <span className="text-[1em] text-[var(--text-color)] group-hover:text-[var(--primary-color)]">
                        {child.name}
                      </span>
                      <FiChevronRight className="opacity-0 group-hover:opacity-100 text-[var(--primary-color)] transition-opacity" />
                    </button>
                  ))}
                  {(!activeItem?.children || activeItem.children.length === 0) && (
                     <div className="text-center py-10 text-[var(--text-color-secondary)] text-[1em]">
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
