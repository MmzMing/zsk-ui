/**
 * 操作栏组件
 * 提供Dock模式的底部操作栏，包含快捷菜单、设置、用户操作等
 *
 * @module layouts/AdminLayout/OperationBar
 * @author wuhuaming
 * @date 2026-02-18
 * @version 1.0
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tooltip, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Avatar } from "@heroui/react";
import { FiGrid, FiBell, FiSettings, FiHome, FiUser, FiLogOut, FiEye, FiEyeOff, FiMaximize2, FiMinimize2 } from "react-icons/fi";
import { Dock, DockIcon } from "../../components/MagicUI/Dock";
import MainMenu from "./MainMenu";
import { useAppStore } from "../../store";
import { logout } from "../../api/auth";
import { useUserStore } from "../../store/modules/userStore";
import { routes } from "../../router/routes";

/**
 * 操作栏组件属性
 */
interface OperationBarProps {
  /** 打开设置面板的回调函数 */
  onOpenSettings: () => void;
  /** 是否全屏状态 */
  isFullscreen?: boolean;
  /** 切换全屏状态的回调函数 */
  toggleFullscreen?: () => void;
}

/**
 * 时钟组件
 * 实时显示当前时间
 *
 * @returns 时钟组件
 */
const Clock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="font-mono text-xs font-medium tabular-nums text-[var(--text-color)] whitespace-nowrap">
      {time.toLocaleTimeString()}
    </div>
  );
};

/**
 * 操作栏组件
 * 在Dock布局模式下显示底部操作栏，提供快捷操作入口
 *
 * @param props 组件属性
 * @returns 操作栏组件
 */
const OperationBar = ({ onOpenSettings, isFullscreen, toggleFullscreen }: OperationBarProps) => {
  const navigate = useNavigate();
  /** 主菜单是否打开 */
  const [menuOpen, setMenuOpen] = useState(false);
  const { showTopNav, setShowTopNav } = useAppStore();
  const { avatar, reset: resetUser } = useUserStore();

  /**
   * 处理菜单选择
   * @param path 菜单路径
   */
  const handleMenuSelect = (path: string) => {
    navigate(path);
    setMenuOpen(false);
  };

  /**
   * 处理用户登出
   * 清除用户状态并跳转到首页
   */
  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // ignore
    }
    try {
      window.localStorage.removeItem("permissions");
      window.localStorage.removeItem("userInfo");
    } catch {
      // ignore
    }
    resetUser();
    navigate(routes.home);
  };

  return (
    <>
      <div className="fixed bottom-6 left-0 right-0 z-30 flex justify-center items-center pointer-events-none">
        {/* Dock区域 */}
        <div className="pointer-events-auto relative">
           <Dock magnification={60} distance={100} className="px-4 bg-[var(--bg-elevated)]/80 backdrop-blur-xl border border-[var(--border-color)] shadow-xl">
            {/* 主菜单按钮 */}
            <DockIcon onClick={() => setMenuOpen(!menuOpen)}>
              <Tooltip content="主菜单">
                <div className="w-full h-full flex items-center justify-center text-[var(--text-color)] hover:text-[var(--primary-color)] transition-colors">
                  <FiGrid className="text-xl" />
                </div>
              </Tooltip>
            </DockIcon>

            {/* 消息通知按钮 */}
            <DockIcon onClick={() => {}}>
              <Tooltip content="消息通知">
                <div className="w-full h-full flex items-center justify-center text-[var(--text-color)] hover:text-[var(--primary-color)] transition-colors">
                  <FiBell className="text-xl" />
                </div>
              </Tooltip>
            </DockIcon>

            {/* 显示/隐藏导航按钮 */}
            <DockIcon onClick={() => setShowTopNav(!showTopNav)}>
              <Tooltip content={showTopNav ? "隐藏导航" : "显示导航"}>
                <div className="w-full h-full flex items-center justify-center text-[var(--text-color)] hover:text-[var(--primary-color)] transition-colors">
                  {showTopNav ? <FiEyeOff className="text-xl" /> : <FiEye className="text-xl" />}
                </div>
              </Tooltip>
            </DockIcon>

            {/* 全屏切换按钮 */}
            <DockIcon onClick={toggleFullscreen}>
              <Tooltip content={isFullscreen ? "退出全屏" : "全屏模式"}>
                <div className="w-full h-full flex items-center justify-center text-[var(--text-color)] hover:text-[var(--primary-color)] transition-colors">
                  {isFullscreen ? <FiMinimize2 className="text-xl" /> : <FiMaximize2 className="text-xl" />}
                </div>
              </Tooltip>
            </DockIcon>

            {/* 系统设置按钮 */}
            <DockIcon onClick={onOpenSettings}>
              <Tooltip content="系统设置">
                <div className="w-full h-full flex items-center justify-center text-[var(--text-color)] hover:text-[var(--primary-color)] transition-colors">
                  <FiSettings className="text-xl" />
                </div>
              </Tooltip>
            </DockIcon>

            {/* 用户菜单 */}
            <DockIcon>
               <Dropdown 
                 placement="top"
                 classNames={{
                   content: "bg-[var(--bg-elevated)]! border border-[var(--primary-color)]/20! shadow-2xl! rounded-xl min-w-[140px] p-1.5"
                 }}
               >
                <DropdownTrigger>
                  <div className="w-full h-full flex items-center justify-center outline-none cursor-pointer">
                    <Avatar
                      size="sm"
                      src={avatar || undefined}
                      classNames={{
                        base: "w-8 h-8 text-xs bg-[color-mix(in_srgb,var(--primary-color)_20%,transparent)] text-[var(--primary-color)] transform transition-transform hover:scale-110 active:scale-95 shadow-lg",
                        name: "text-xs font-bold"
                      }}
                      showFallback
                    />
                  </div>
                </DropdownTrigger>
                <DropdownMenu 
                  aria-label="User Actions"
                  itemClasses={{
                    base: [
                      "rounded-lg",
                      "text-gray-400",
                      "gap-3",
                      "px-3 py-2",
                      "transition-colors",
                      "data-[hover=true]:bg-[var(--primary-color)]/15!",
                      "data-[hover=true]:text-[var(--primary-color)]!",
                    ].join(" "),
                    title: "text-sm font-medium"
                  }}
                >
                  <DropdownItem key="home" startContent={<FiHome className="text-lg" />} onPress={() => navigate(routes.home)}>
                    返回前台
                  </DropdownItem>
                  <DropdownItem key="profile" startContent={<FiUser className="text-lg" />} onPress={() => navigate(routes.profile)}>
                    个人中心
                  </DropdownItem>
                  <DropdownItem 
                    key="logout" 
                    className="text-danger data-[hover=true]:bg-danger/15! data-[hover=true]:text-danger!" 
                    startContent={<FiLogOut className="text-lg" />} 
                    onPress={handleLogout}
                  >
                    退出登录
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </DockIcon>

            {/* 时钟 */}
             <DockIcon className="!w-auto !aspect-auto px-2">
                <div className="h-full flex items-center justify-center">
                   <Clock />
                </div>
            </DockIcon>
          </Dock>
        </div>
      </div>

      {/* 主菜单弹窗 */}
      <MainMenu 
        isOpen={menuOpen} 
        onClose={() => setMenuOpen(false)} 
        onSelect={handleMenuSelect} 
      />
    </>
  );
};

export default OperationBar;
