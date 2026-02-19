/**
 * 后台管理布局组件
 * 提供后台管理系统的整体布局，支持多种布局模式（垂直、水平、混合、双栏、Dock）
 *
 * @module layouts/AdminLayout
 * @author wuhuaming
 * @date 2026-02-18
 * @version 1.0
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Avatar,
  Breadcrumbs,
  BreadcrumbItem,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Popover,
  PopoverTrigger,
  PopoverContent
} from "@heroui/react";
import {
  FiHome,
  FiBell,
  FiSettings,
  FiLogOut,
  FiUser,
  FiLayout,
  FiChevronDown,
  FiChevronRight,
  FiMaximize2,
  FiMinimize2
} from "react-icons/fi";
import * as Icons from "react-icons/fi";
import { routes } from "../../router/routes";
import SystemSettingsPanel from "../../components/SystemSettings/Panel";
import { logout } from "../../api/auth";
import { useAppStore } from "../../store";
import { useUserStore } from "../../store/modules/userStore";
import PageTransitionWrapper from "../../components/Motion/PageTransitionWrapper";
import { adminMenuTree } from "../../config/adminMenu";
import OperationBar from "./OperationBar";

/** 头部图标按钮样式类名 */
const headerIconButtonClass =
  "inline-flex items-center justify-center rounded-full w-8 h-8 text-[var(--text-color-secondary)] transition-colors transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-sm hover:bg-[color-mix(in_srgb,var(--primary-color)_10%,transparent)] hover:text-[var(--primary-color)]";

/** 头部导航按钮样式类名 */
const adminHeaderNavButtonClass =
  "inline-flex items-center gap-1 px-1 h-10 text-xs border-b-2 border-transparent text-[var(--text-color-secondary)] hover:text-[var(--primary-color)] transition-colors duration-150";

/**
 * 根据图标名称获取图标组件
 * @param iconName 图标名称
 * @returns 图标组件
 */
const getIcon = (iconName: string) => {
  // @ts-expect-error - iconName is a string but Icons is an object
  const Icon = Icons[iconName] || Icons.FiList;
  return Icon;
};

/**
 * 后台管理布局组件
 * 提供侧边栏导航、顶部导航、多标签页、面包屑等功能
 *
 * 支持的布局模式：
 * - vertical: 垂直布局，侧边栏包含完整菜单
 * - horizontal: 水平布局，顶部导航栏包含一级菜单
 * - mixed: 混合布局，顶部显示一级菜单，侧边栏显示二级菜单
 * - double: 双栏布局，侧边栏分为图标列和菜单列
 * - dock: Dock模式，底部显示操作栏
 *
 * @returns 后台管理布局组件
 */
function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { token, avatar, reset: resetUser } = useUserStore();
  const {
    layoutMode,
    boxBorderEnabled,
    boxShadowEnabled,
    multiTabEnabled,
    breadcrumbEnabled,
    sidebarAccordion,
    menuWidth,
    fontSize,
    showTopNav,
    isLoading,
    setIsLoading
  } = useAppStore();

  /**
   * 处理页面过渡动画
   * 登录流程中显示2秒过渡效果
   */
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isLoading, setIsLoading]);

  /**
   * 检查认证状态
   * 未登录时跳转到登录页
   */
  useEffect(() => {
    if (!token) {
      navigate(routes.login);
    }
  }, [token, navigate]);

  /**
   * 应用导航字体大小
   * 通过CSS变量设置导航字体大小
   */
  useEffect(() => {
    document.documentElement.style.setProperty("--nav-font-size", `${fontSize}px`);
  }, [fontSize]);

  /** 设置面板是否可见 */
  const [settingsVisible, setSettingsVisible] = useState(false);
  /** 是否全屏状态 */
  const [isFullscreen, setIsFullscreen] = useState(false);

  /**
   * 监听全屏状态变化
   */
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  /**
   * 切换全屏状态
   */
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  /** 侧边栏是否折叠 */
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => layoutMode === "horizontal"
  );
  /** 展开的菜单项ID列表 */
  const [openKeys, setOpenKeys] = useState<string[]>(["001"]);
  /** 多标签页列表 */
  const [tabs, setTabs] = useState<{ key: string; label: string; path: string }[]>(() => {
    const dashboard = adminMenuTree[0]?.children?.[0];
    return dashboard ? [{ key: dashboard.id, label: dashboard.name, path: dashboard.path }] : [];
  });
  
  /** 当前悬停的一级菜单ID（用于水平布局的下拉菜单） */
  const [hoverSectionKey, setHoverSectionKey] = useState<string | null>(null);
  /** 悬停延时定时器引用 */
  const hoverTimerRef = useRef<number | null>(null);

  /** 右键菜单状态 */
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    tabKey: string | null;
  }>({
    visible: false,
    x: 0,
    y: 0,
    tabKey: null
  });

  /**
   * 监听键盘快捷键
   * Alt+S 切换侧边栏折叠状态
   */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.altKey && (event.key === "s" || event.key === "S")) {
        event.preventDefault();
        setSidebarCollapsed(previous => !previous);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const currentPath = location.pathname;

  /** 当前激活的二级菜单项 */
  const activeChild = useMemo(() => {
    const found = adminMenuTree
      .flatMap(section => section.children || [])
      .find(child => child.path === currentPath);
    if (found) {
      return found;
    }

    if (currentPath.includes(`${routes.admin}/document/edit/`)) {
      return adminMenuTree
        .flatMap(section => section.children || [])
        .find(child => child.id === "006002") ?? null;
    }

    return adminMenuTree[0]?.children?.[0] ?? null;
  }, [currentPath]);

  const activeKey = activeChild?.id ?? "001001";

  /** 当前激活的一级菜单项 */
  const activeParent = useMemo(() => {
    if (!activeChild) {
      return adminMenuTree[0] ?? null;
    }
    const parent = adminMenuTree.find(section =>
      section.children?.some(child => child.id === activeKey)
    );
    return parent ?? adminMenuTree[0] ?? null;
  }, [activeChild, activeKey]);

  const activeSectionKey = activeParent?.id ?? "001";
  
  /** 手机端菜单分类选中状态 */
  const [mobileActiveSectionId, setMobileActiveSectionId] = useState<string>(activeSectionKey);
  /** 手机端菜单是否打开 */
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (activeSectionKey && mobileActiveSectionId !== activeSectionKey) {
    setMobileActiveSectionId(activeSectionKey);
  }

  /** 根据导航更新标签页列表 */
  if (activeChild) {
    const exists = tabs.some(tab => tab.key === activeChild.id);
    if (!exists) {
      const next = [...tabs, { key: activeChild.id, label: activeChild.name, path: activeChild.path }];
      setTabs(next.slice(-8));
    }
  }

  /**
   * 处理Logo点击
   * 跳转到首页
   */
  const handleLogoClick = () => {
    navigate(routes.home);
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

  /**
   * 处理一级菜单展开/折叠
   * @param sectionId 一级菜单ID
   */
  const handleSectionToggle = (sectionId: string) => {
    setOpenKeys(previous => {
      const isOpen = previous.includes(sectionId);
      if (sidebarAccordion) {
        if (isOpen) {
          return [];
        }
        return [sectionId];
      }
      return isOpen
        ? previous.filter(key => key !== sectionId)
        : [...previous, sectionId];
    });
  };

  /**
   * 处理菜单项点击
   * @param menuId 菜单项ID
   */
  const handleMenuItemClick = (menuId: string) => {
    const matched = adminMenuTree
      .flatMap(section => section.children || [])
      .find(child => child.id === menuId);
    if (!matched) {
      return;
    }
    navigate(matched.path);
  };

  /**
   * 处理一级菜单入口点击
   * @param sectionId 一级菜单ID
   */
  const handleSectionEntryClick = (sectionId: string) => {
    const section = adminMenuTree.find(item => item.id === sectionId);
    if (!section || !section.children?.length) {
      return;
    }
    const first = section.children[0];
    handleMenuItemClick(first.id);
  };

  /**
   * 处理标签页点击
   * @param key 标签页key
   */
  const handleTabClick = (key: string) => {
    const tab = tabs.find(item => item.key === key);
    if (tab) {
      navigate(tab.path);
    }
  };

  /**
   * 处理标签页关闭
   * @param key 标签页key
   */
  const handleTabClose = (key: string) => {
    setTabs(previous => {
      const filtered = previous.filter(item => item.key !== key);
      if (!filtered.length) {
        const dashboard = adminMenuTree[0]?.children?.[0];
        if (dashboard) {
          navigate(dashboard.path);
          return [{ key: dashboard.id, label: dashboard.name, path: dashboard.path }];
        }
        return [];
      }
      if (key === activeKey) {
        const nextTab = filtered[filtered.length - 1];
        navigate(nextTab.path);
      }
      return filtered;
    });
  };

  /**
   * 关闭其他标签页
   * @param key 保留的标签页key
   */
  const handleCloseOthers = (key: string) => {
    setTabs(previous => previous.filter(item => item.key === key));
    const current = tabs.find(item => item.key === key);
    if (current) navigate(current.path);
  };

  /**
   * 关闭所有标签页
   * 返回到仪表盘页面
   */
  const handleCloseAll = () => {
    const dashboard = adminMenuTree[0]?.children?.[0];
    if (dashboard) {
      setTabs([{ key: dashboard.id, label: dashboard.name, path: dashboard.path }]);
      navigate(dashboard.path);
    } else {
      setTabs([]);
    }
  };

  /** 面包屑数据 */
  const breadcrumb = useMemo(() => {
    if (!activeChild || !activeParent) {
      return null;
    }
    return {
      parentLabel: activeParent.name,
      childLabel: activeChild.name,
      parentKey: activeParent.id
    };
  }, [activeChild, activeParent]);

  /** 内容区域容器样式类名 */
  const containerClassName =
    layoutMode === "dock"
      ? "w-full h-full " +
        (boxBorderEnabled || boxShadowEnabled
          ? " bg-[var(--bg-elevated)] rounded-[var(--radius-base)] px-4 py-4"
          : "") +
        (boxBorderEnabled ? " border border-[var(--border-color)]" : "")
      : "w-full" +
        (boxBorderEnabled || boxShadowEnabled
          ? " bg-[var(--bg-elevated)] rounded-[var(--radius-base)] px-4 py-4"
          : "") +
        (boxBorderEnabled ? " border border-[var(--border-color)]" : "");

  /**
   * 渲染顶部导航（水平/混合布局）
   * @returns 顶部导航组件
   */
  const renderTopAdminNav = () => {
    if (layoutMode !== "horizontal" && layoutMode !== "mixed") {
      return null;
    }
    return (
      <div 
        className="hidden md:flex items-center gap-4"
        style={{ fontSize: "var(--nav-font-size)" }}
      >
        {adminMenuTree.map(section => {
          const isActive = section.id === activeSectionKey;
          const Icon = getIcon(section.iconName);
          if (layoutMode === "horizontal") {
            return (
              <div
                key={section.id}
                className="relative"
                onMouseEnter={() => {
                  if (hoverTimerRef.current !== null) {
                    window.clearTimeout(hoverTimerRef.current);
                    hoverTimerRef.current = null;
                  }
                  setHoverSectionKey(section.id);
                }}
                onMouseLeave={() => {
                  if (hoverTimerRef.current !== null) {
                    window.clearTimeout(hoverTimerRef.current);
                  }
                  hoverTimerRef.current = window.setTimeout(() => {
                    setHoverSectionKey(current =>
                      current === section.id ? null : current
                    );
                  }, 120);
                }}
              >
                <button
                  type="button"
                  className={
                    adminHeaderNavButtonClass +
                    " text-[0.9em] " +
                    (isActive
                      ? " font-semibold text-[var(--primary-color)] border-b-[var(--primary-color)]"
                      : "")
                  }
                  onClick={() => handleSectionEntryClick(section.id)}
                >
                  <Icon className="w-[1.1em] h-[1.1em]" />
                  <span>{section.name}</span>
                </button>
                {hoverSectionKey === section.id && (
                  <div
                    className="absolute left-0 top-full mt-1 min-w-[140px] rounded-md border border-[var(--border-color)] bg-[var(--bg-elevated)] shadow-sm py-1 z-30"
                    onMouseEnter={() => {
                      if (hoverTimerRef.current !== null) {
                        window.clearTimeout(hoverTimerRef.current);
                        hoverTimerRef.current = null;
                      }
                      setHoverSectionKey(section.id);
                    }}
                    onMouseLeave={() => {
                      if (hoverTimerRef.current !== null) {
                        window.clearTimeout(hoverTimerRef.current);
                      }
                      hoverTimerRef.current = window.setTimeout(() => {
                        setHoverSectionKey(current =>
                          current === section.id ? null : current
                        );
                      }, 120);
                    }}
                  >
                    {section.children?.map(child => (
                      <button
                        key={child.id}
                        type="button"
                        className="w-full px-3 py-1.5 text-left text-[0.85em] text-[var(--text-color-secondary)] hover:bg-[color-mix(in_srgb,var(--primary-color)_6%,transparent)] hover:text-[var(--text-color)]"
                        onClick={() => handleMenuItemClick(child.id)}
                      >
                        {child.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          }
          return (
            <button
              key={section.id}
              type="button"
              className={
                adminHeaderNavButtonClass +
                " text-[0.9em] " +
                (isActive
                  ? " font-semibold text-[var(--primary-color)] border-b-[var(--primary-color)]"
                  : "")
              }
              onClick={() => handleSectionEntryClick(section.id)}
            >
              <Icon className="w-[1.1em] h-[1.1em]" />
              <span>{section.name}</span>
            </button>
          );
        })}
      </div>
    );
  };

  /**
   * 渲染垂直布局侧边栏
   * @returns 垂直侧边栏组件
   */
  const renderVerticalSidebar = () => (
    <nav 
      className="flex-1 overflow-y-auto py-4 px-3 space-y-6"
      style={{ fontSize: "var(--nav-font-size)" }}
    >
      <div className="space-y-2">
        <div className="px-2 text-[0.8em] text-[var(--text-color-secondary)]">
          管理导航
        </div>
        {adminMenuTree.map(section => {
          const Icon = getIcon(section.iconName);
          const isOpen = openKeys.includes(section.id);
          const hasActiveChild = section.children?.some(child => child.id === activeKey);
          return (
            <div key={section.id} className="space-y-1">
              <button
                type="button"
                className={
                  "w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-[0.9em] transition-colors " +
                  (hasActiveChild
                    ? "bg-[color-mix(in_srgb,var(--primary-color)_10%,transparent)] text-[var(--primary-color)]"
                    : "text-[var(--text-color-secondary)] hover:bg-[color-mix(in_srgb,var(--primary-color)_6%,transparent)] hover:text-[var(--text-color)]")
                }
                onClick={() => handleSectionToggle(section.id)}
              >
                <span className="inline-flex items-center gap-2">
                  <Icon className="text-[1.1em]" />
                  {!sidebarCollapsed && <span>{section.name}</span>}
                </span>
                {!sidebarCollapsed && (
                  <span className="text-[0.7em] text-[var(--text-color-secondary)]">
                    {isOpen ? (
                      <FiChevronDown className="w-[1.1em] h-[1.1em]" />
                    ) : (
                      <FiChevronRight className="w-[1.1em] h-[1.1em]" />
                    )}
                  </span>
                )}
              </button>
              {isOpen && !sidebarCollapsed && (
                <div className="mt-1 space-y-1">
                  {section.children?.map(child => {
                    const active = child.id === activeKey;
                    return (
                      <button
                        key={child.id}
                        type="button"
                        className={
                          "w-full flex items-center justify-between gap-2 pl-6 pr-3 py-1.5 rounded-lg text-[0.85em] transition-colors border " +
                          (active
                            ? "border-[color-mix(in_srgb,var(--primary-color)_40%,transparent)] bg-[color-mix(in_srgb,var(--primary-color)_12%,transparent)] text-[var(--primary-color)]"
                            : "border-transparent text-[var(--text-color-secondary)] hover:bg-[color-mix(in_srgb,var(--primary-color)_6%,transparent)] hover:text-[var(--text-color)]")
                        }
                        onClick={() => handleMenuItemClick(child.id)}
                      >
                        <span>{child.name}</span>
                        {active && (
                          <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary-color)]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );

  /**
   * 渲染混合布局侧边栏
   * @returns 混合布局侧边栏组件
   */
  const renderMixedSidebar = () => {
    const currentSection =
      adminMenuTree.find(item => item.id === activeSectionKey) ?? adminMenuTree[0];
    if (!currentSection) {
      return null;
    }
    return (
      <nav 
        className="flex-1 overflow-y-auto py-4 px-3 space-y-3"
        style={{ fontSize: "var(--nav-font-size)" }}
      >
        <div className="px-2 text-[0.8em] text-[var(--text-color-secondary)]">
          {currentSection.name}
        </div>
        <div className="space-y-1">
          {currentSection.children?.map(child => {
            const active = child.id === activeKey;
            return (
              <button
                key={child.id}
                type="button"
                className={
                  "w-full flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg text-[0.85em] transition-colors border " +
                  (active
                    ? "border-[color-mix(in_srgb,var(--primary-color)_40%,transparent)] bg-[color-mix(in_srgb,var(--primary-color)_12%,transparent)] text-[var(--primary-color)]"
                    : "border-transparent text-[var(--text-color-secondary)] hover:bg-[color-mix(in_srgb,var(--primary-color)_6%,transparent)] hover:text-[var(--text-color)]")
                }
                onClick={() => handleMenuItemClick(child.id)}
              >
                <span>{child.name}</span>
                {active && (
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary-color)]" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    );
  };

  /**
   * 渲染双栏布局侧边栏
   * @returns 双栏布局侧边栏组件
   */
  const renderDoubleSidebar = () => {
    if (!adminMenuTree.length) {
      return null;
    }
    const currentSection =
      adminMenuTree.find(item => item.id === activeSectionKey) ?? adminMenuTree[0];
    if (sidebarCollapsed) {
      return (
        <nav 
          className="flex-1 flex flex-col items-center py-4 space-y-2"
          style={{ fontSize: "var(--nav-font-size)" }}
        >
          {adminMenuTree.map(section => {
            const Icon = getIcon(section.iconName);
            const isActive = section.id === activeSectionKey;
            return (
              <button
                key={section.id}
                type="button"
                className={
                  "w-10 h-10 rounded-xl flex items-center justify-center text-[0.85em] transition-colors " +
                  (isActive
                    ? "bg-[color-mix(in_srgb,var(--primary-color)_18%,transparent)] text-[var(--primary-color)]"
                    : "text-[var(--text-color-secondary)] hover:bg-[color-mix(in_srgb,var(--primary-color)_8%,transparent)] hover:text-[var(--text-color)]")
                }
                onClick={() => handleSectionEntryClick(section.id)}
              >
                <Icon className="text-[1.3em]" />
              </button>
            );
          })}
        </nav>
      );
    }
    return (
      <div 
        className="flex flex-1 overflow-hidden"
        style={{ fontSize: "var(--nav-font-size)" }}
      >
        <nav className="w-16 flex flex-col items-center py-4 border-r border-[var(--border-color)] space-y-2">
          {adminMenuTree.map(section => {
            const Icon = getIcon(section.iconName);
            const isActive = section.id === activeSectionKey;
            return (
              <button
                key={section.id}
                type="button"
                className={
                  "w-11 h-11 rounded-xl flex flex-col items-center justify-center text-[0.7em] transition-colors " +
                  (isActive
                    ? "bg-[color-mix(in_srgb,var(--primary-color)_18%,transparent)] text-[var(--primary-color)]"
                    : "text-[var(--text-color-secondary)] hover:bg-[color-mix(in_srgb,var(--primary-color)_8%,transparent)] hover:text-[var(--text-color)]")
                }
                onClick={() => handleSectionEntryClick(section.id)}
              >
                <Icon className="text-[1.3em]" />
                <span className="mt-0.5 truncate max-w-[2.5rem]">{section.name}</span>
              </button>
            );
          })}
        </nav>
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {currentSection && (
            <div className="space-y-1">
              {currentSection.children?.map(child => {
                const active = child.id === activeKey;
                return (
                  <button
                    key={child.id}
                    type="button"
                    className={
                      "w-full flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg text-[0.85em] transition-colors border " +
                      (active
                        ? "border-[color-mix(in_srgb,var(--primary-color)_40%,transparent)] bg-[color-mix(in_srgb,var(--primary-color)_12%,transparent)] text-[var(--primary-color)]"
                        : "border-transparent text-[var(--text-color-secondary)] hover:bg-[color-mix(in_srgb,var(--primary-color)_6%,transparent)] hover:text-[var(--text-color)]")
                    }
                    onClick={() => handleMenuItemClick(child.id)}
                  >
                    <span>{child.name}</span>
                    {active && (
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary-color)]" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </nav>
      </div>
    );
  };

  if (!token) {
    return null;
  }

  /** Dock模式渲染 */
  if (layoutMode === "dock") {
    return (
      <div
        className="h-screen w-full flex flex-col bg-[var(--bg-color)] text-[var(--text-color)] overflow-hidden"
        onClick={() => {
          if (contextMenu.visible) {
            setContextMenu({ visible: false, x: 0, y: 0, tabKey: null });
          }
        }}
      >
        <main className="flex-1 overflow-y-auto px-5 py-[var(--content-padding)] pb-32 scrollbar-hide">
          <PageTransitionWrapper className={containerClassName}>
            <Outlet />
          </PageTransitionWrapper>
        </main>

        {showTopNav && (
          <div className="fixed bottom-24 left-0 right-0 z-20 flex flex-col items-center justify-center gap-2 pointer-events-none">
            {breadcrumbEnabled && breadcrumb && (
              <div 
                className="pointer-events-auto bg-[var(--bg-elevated)]/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-[var(--border-color)] shadow-sm flex items-center gap-2"
                style={{ fontSize: "var(--nav-font-size)" }}
              >
                <span className="text-[0.85em] text-[var(--text-color-secondary)]">当前位置:</span>
                <Breadcrumbs
                  size="sm"
                  variant="light"
                  itemClasses={{
                    item: "text-[0.85em] text-[var(--text-color-secondary)] data-[current=true]:text-[var(--text-color)]",
                    separator: "text-[var(--text-color-secondary)] px-1"
                  }}
                >
                  <BreadcrumbItem>后台管理</BreadcrumbItem>
                  <BreadcrumbItem>{breadcrumb.parentLabel}</BreadcrumbItem>
                  <BreadcrumbItem>{breadcrumb.childLabel}</BreadcrumbItem>
                </Breadcrumbs>
              </div>
            )}

            {multiTabEnabled && tabs.length > 0 && (
              <div 
                className="pointer-events-auto max-w-[90vw] overflow-x-auto flex gap-1 p-1.5 bg-[var(--bg-elevated)]/80 backdrop-blur-md rounded-2xl border border-[var(--border-color)] shadow-sm scrollbar-hide"
                style={{ fontSize: "var(--nav-font-size)" }}
              >
                {tabs.map(item => (
                  <button
                    key={item.key}
                    type="button"
                    className={
                      "flex items-center gap-1 px-3 py-1 rounded-full text-[0.85em] transition-all border " +
                      (item.key === activeKey
                        ? "border-[var(--primary-color)] bg-[color-mix(in_srgb,var(--primary-color)_10%,transparent)] text-[var(--primary-color)] font-medium shadow-sm"
                        : "border-transparent text-[var(--text-color-secondary)] hover:bg-[var(--bg-color)] hover:text-[var(--text-color)]")
                    }
                    onClick={() => handleTabClick(item.key)}
                    onContextMenu={event => {
                      event.preventDefault();
                      event.stopPropagation();
                      setContextMenu({
                        visible: true,
                        x: event.clientX,
                        y: event.clientY,
                        tabKey: item.key
                      });
                    }}
                  >
                    <span>{item.label}</span>
                    {item.key !== "001001" && (
                      <span
                        className="ml-1 opacity-60 hover:opacity-100"
                        onClick={event => {
                          event.stopPropagation();
                          handleTabClose(item.key);
                        }}
                      >
                        ×
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <OperationBar 
          onOpenSettings={() => setSettingsVisible(true)} 
          isFullscreen={isFullscreen}
          toggleFullscreen={toggleFullscreen}
        />

        {contextMenu.visible && contextMenu.tabKey && (
          <div
            className="fixed z-50 bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-lg shadow-xl text-xs text-[var(--text-color)] min-w-[100px] overflow-hidden"
            style={{ top: contextMenu.y - 100, left: contextMenu.x }}
            onClick={event => event.stopPropagation()}
          >
            <div className="p-1">
              <button
                className="w-full text-left px-3 py-2 rounded hover:bg-[var(--primary-color)] hover:text-white transition-colors"
                onClick={() => {
                  handleTabClose(contextMenu.tabKey as string);
                  setContextMenu({ visible: false, x: 0, y: 0, tabKey: null });
                }}
              >
                关闭当前
              </button>
              <button
                className="w-full text-left px-3 py-2 rounded hover:bg-[var(--primary-color)] hover:text-white transition-colors"
                onClick={() => {
                  handleCloseOthers(contextMenu.tabKey as string);
                  setContextMenu({ visible: false, x: 0, y: 0, tabKey: null });
                }}
              >
                关闭其他
              </button>
              <button
                className="w-full text-left px-3 py-2 rounded hover:bg-[var(--primary-color)] hover:text-white transition-colors"
                onClick={() => {
                  handleCloseAll();
                  setContextMenu({ visible: false, x: 0, y: 0, tabKey: null });
                }}
              >
                关闭全部
              </button>
            </div>
          </div>
        )}

        <SystemSettingsPanel
          visible={settingsVisible}
          onClose={() => setSettingsVisible(false)}
        />
      </div>
    );
  }

  /** 经典布局模式渲染（垂直、水平、混合、双栏） */
  return (
    <div
      className="min-h-screen flex bg-[var(--bg-color)] text-[var(--text-color)] icon-rotate-global"
      onClick={() => {
        if (contextMenu.visible) {
          setContextMenu({
            visible: false,
            x: 0,
            y: 0,
            tabKey: null
          });
        }
      }}
    >
      {layoutMode !== "horizontal" && (
        <aside
          className={
            "hidden md:flex md:flex-col border-r border-[var(--border-color)] bg-[var(--bg-elevated)]"
          }
          style={{ width: sidebarCollapsed ? 64 : menuWidth }}
        >
        <div className="h-14 flex items-center justify-between px-5 border-b border-[var(--border-color)]">
          <button
            type="button"
            className="flex items-center gap-2"
            onClick={handleLogoClick}
          >
            <img
              src="/logo/MyLogoSvg.svg"
              alt="Logo"
              className="w-8 h-8 rounded-lg object-contain dark:invert"
            />
            <div className="flex flex-col items-start">
              <span className="text-sm font-semibold">知识库后台</span>
            </div>
          </button>
        </div>
        {layoutMode === "vertical" && renderVerticalSidebar()}
        {layoutMode === "mixed" && renderMixedSidebar()}
        {layoutMode === "double" && renderDoubleSidebar()}
      </aside>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 flex items-center justify-between border-b border-[var(--border-color)] bg-[var(--bg-elevated)] px-5 gap-4">
          <div className="flex items-center gap-3">
            <Popover 
              isOpen={isMobileMenuOpen} 
              onOpenChange={setIsMobileMenuOpen}
              placement="bottom-start"
              classNames={{
                content: "p-0 bg-[var(--bg-elevated)] border border-[var(--border-color)] shadow-xl overflow-hidden rounded-xl",
              }}
            >
              <PopoverTrigger>
                <Button
                  isIconOnly
                  size="sm"
                  radius="full"
                  variant="light"
                  className="inline-flex md:hidden"
                  aria-label="后台菜单"
                >
                  <FiLayout className="text-base" />
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <div className="flex w-[280px] h-[400px]">
                  <div className="w-[120px] bg-[color-mix(in_srgb,var(--primary-color)_3%,transparent)] border-r border-[var(--border-color)] overflow-y-auto py-2">
                    {adminMenuTree.map(section => {
                      const isActive = section.id === mobileActiveSectionId;
                      const Icon = getIcon(section.iconName);
                      return (
                        <button
                          key={section.id}
                          type="button"
                          className={`w-full flex items-center gap-2 px-3 py-3 text-left transition-colors ${
                            isActive 
                              ? "bg-[color-mix(in_srgb,var(--primary-color)_12%,transparent)] text-[var(--primary-color)] font-medium" 
                              : "text-[var(--text-color-secondary)] hover:text-[var(--text-color)]"
                          }`}
                          onClick={() => setMobileActiveSectionId(section.id)}
                        >
                          <Icon className="text-sm shrink-0" />
                          <span className="text-xs truncate">{section.name}</span>
                          {isActive && <FiChevronRight className="ml-auto text-[10px]" />}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex-1 bg-[var(--bg-elevated)] overflow-y-auto py-2">
                    {adminMenuTree
                      .find(s => s.id === mobileActiveSectionId)
                      ?.children?.map(child => (
                        <button
                          key={child.id}
                          type="button"
                          className="w-full flex items-center justify-between px-4 py-3 text-left text-[var(--text-color-secondary)] hover:text-[var(--primary-color)] hover:bg-[color-mix(in_srgb,var(--primary-color)_8%,transparent)] transition-colors"
                          onClick={() => {
                            handleMenuItemClick(child.id);
                            setIsMobileMenuOpen(false);
                          }}
                        >
                          <span className="text-xs">{child.name}</span>
                          {child.id === activeKey && (
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary-color)]" />
                          )}
                        </button>
                      ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            <div 
              className="hidden md:flex items-center gap-2 text-[var(--text-color-secondary)]"
              style={{ fontSize: "var(--nav-font-size)" }}
            >
              {breadcrumbEnabled && breadcrumb ? (
                <Breadcrumbs
                  size="sm"
                  variant="light"
                  itemClasses={{
                    item: "text-[0.85em] text-[var(--text-color-secondary)] data-[current=true]:text-[var(--text-color)]",
                    separator: "text-[var(--text-color-secondary)] px-1"
                  }}
                >
                  <BreadcrumbItem onPress={() => handleMenuItemClick("001001")}>
                    后台管理
                  </BreadcrumbItem>
                  <BreadcrumbItem>{breadcrumb.parentLabel}</BreadcrumbItem>
                  <BreadcrumbItem>{breadcrumb.childLabel}</BreadcrumbItem>
                </Breadcrumbs>
              ) : (
                <span>后台管理</span>
              )}
            </div>
          </div>

          {renderTopAdminNav()}

          <div className="flex items-center gap-2">
            <Button
              isIconOnly
              size="sm"
              radius="full"
              variant="light"
              className="inline-flex"
              onPress={toggleFullscreen}
              aria-label={isFullscreen ? "退出全屏" : "全屏切换"}
            >
              {isFullscreen ? (
                <FiMinimize2 className="text-base" />
              ) : (
                <FiMaximize2 className="text-base" />
              )}
            </Button>
            <Button
              isIconOnly
              size="sm"
              radius="full"
              variant="light"
              className="inline-flex"
              aria-label="消息中心"
            >
              <FiBell className="text-base" />
            </Button>
            <Button
              isIconOnly
              size="sm"
              radius="full"
              variant="light"
              className="inline-flex icon-settings-spin"
              onPress={() => setSettingsVisible(true)}
            >
              <FiSettings className="text-base" />
            </Button>
            {token ? (
              <Dropdown 
                 placement="bottom-end"
                 classNames={{
                   content: "bg-[var(--bg-elevated)]! border border-[var(--primary-color)]/20! shadow-2xl! rounded-xl min-w-[140px] p-1.5"
                 }}
               >
                <DropdownTrigger>
                  <button
                    type="button"
                    className={headerIconButtonClass}
                    aria-label="用户菜单"
                  >
                    <Avatar
                      size="sm"
                      src={avatar || undefined}
                      classNames={{
                        base:
                          "w-7 h-7 text-xs bg-[color-mix(in_srgb,var(--primary-color)_20%,transparent)] text-[var(--primary-color)]",
                        name: "text-xs"
                      }}
                      showFallback
                    />
                  </button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="用户菜单"
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
                  onAction={key => {
                    if (key === "home") {
                      navigate(routes.home);
                    } else if (key === "profile") {
                      navigate(routes.profile);
                    } else if (key === "logout") {
                      handleLogout();
                    }
                  }}
                >
                  <DropdownItem
                    key="home"
                    startContent={<FiHome className="w-4 h-4" />}
                  >
                    返回前台
                  </DropdownItem>
                  <DropdownItem
                    key="profile"
                    startContent={<FiUser className="w-4 h-4" />}
                  >
                    个人中心
                  </DropdownItem>
                  <DropdownItem
                    key="logout"
                    className="text-danger data-[hover=true]:bg-danger/15! data-[hover=true]:text-danger!"
                    startContent={<FiLogOut className="w-4 h-4" />}
                  >
                    退出登录
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            ) : (
              <Link
                to={routes.login}
                className="inline-flex items-center justify-center h-8 px-3 text-sm text-[var(--text-color-secondary)] hover:text-[var(--primary-color)] transition-colors duration-150"
                aria-label="登录"
              >
                <span>登录</span>
              </Link>
            )}
          </div>
        </header>

        {multiTabEnabled && (
          <div 
            className="h-11 flex items-center gap-2 px-5 border-b border-[var(--border-color)] bg-[var(--bg-elevated)] overflow-x-auto overflow-y-hidden whitespace-nowrap scrollbar-hide"
            style={{ fontSize: "var(--nav-font-size)" }}
          >
            {tabs.map(item => (
              <button
                key={item.key}
                type="button"
                className={
                  "flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-[0.85em] transition-colors border whitespace-nowrap " +
                  (item.key === activeKey
                    ? "border-[color-mix(in_srgb,var(--primary-color)_40%,transparent)] bg-[color-mix(in_srgb,var(--primary-color)_12%,transparent)] text-[var(--primary-color)] font-medium"
                    : "border-transparent text-[var(--text-color-secondary)] hover:bg-[color-mix(in_srgb,var(--text-color)_6%,transparent)] hover:text-[var(--text-color)]")
                }
                onClick={() => handleTabClick(item.key)}
                onDoubleClick={event => {
                  event.stopPropagation();
                  handleTabClick(item.key);
                }}
                onContextMenu={event => {
                  event.preventDefault();
                  event.stopPropagation();
                  setContextMenu({
                    visible: true,
                    x: event.clientX,
                    y: event.clientY,
                    tabKey: item.key
                  });
                }}
              >
                <span>{item.label}</span>
                {item.key !== "001001" && (
                  <span
                    className="ml-1 cursor-pointer"
                    onClick={event => {
                      event.stopPropagation();
                      handleTabClose(item.key);
                    }}
                  >
                    ×
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        <main className="flex-1 overflow-y-auto px-5 py-[var(--content-padding)]">
          <PageTransitionWrapper className={containerClassName}>
            <Outlet />
          </PageTransitionWrapper>
        </main>

        {contextMenu.visible && contextMenu.tabKey && (
          <div
            className="fixed z-40 bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-md shadow-sm text-xs text-[var(--text-color)]"
            style={{ top: contextMenu.y, left: contextMenu.x }}
            onClick={event => event.stopPropagation()}
          >
            <button
              type="button"
              className="block w-full text-left px-3 py-1 hover:bg-[color-mix(in_srgb,var(--primary-color)_8%,transparent)]"
              onClick={() => {
                handleTabClose(contextMenu.tabKey as string);
                setContextMenu({
                  visible: false,
                  x: 0,
                  y: 0,
                  tabKey: null
                });
              }}
            >
              关闭当前
            </button>
            <button
              type="button"
              className="block w-full text-left px-3 py-1 hover:bg-[color-mix(in_srgb,var(--primary-color)_8%,transparent)]"
              onClick={() => {
                handleCloseOthers(contextMenu.tabKey as string);
                setContextMenu({
                  visible: false,
                  x: 0,
                  y: 0,
                  tabKey: null
                });
              }}
            >
              关闭其他
            </button>
            <button
              type="button"
              className="block w-full text-left px-3 py-1 hover:bg-[color-mix(in_srgb,var(--primary-color)_8%,transparent)]"
              onClick={() => {
                handleCloseAll();
                setContextMenu({
                  visible: false,
                  x: 0,
                  y: 0,
                  tabKey: null
                });
              }}
            >
              关闭全部
            </button>
          </div>
        )}
      </div>

      <SystemSettingsPanel
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
      />
    </div>
  );
}

export default AdminLayout;
