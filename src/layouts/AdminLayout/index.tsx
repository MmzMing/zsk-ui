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
  DropdownItem
} from "@heroui/react";
import {
  FiHome,
  FiLayout,
  FiPieChart,
  FiVideo,
  FiFileText,
  FiUsers,
  FiSettings,
  FiBell,
  FiLogOut,
  FiUser,
  FiChevronDown,
  FiChevronRight
} from "react-icons/fi";
import { routes } from "../../router/routes";
import SystemSettingsPanel from "../../components/SystemSettings/Panel";
import { useAppStore } from "../../store";
import { useUserStore } from "../../store/modules/userStore";

type AdminMenuChild = {
  key: string;
  label: string;
  path: string;
};

type AdminMenuItem = {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  children: AdminMenuChild[];
};

const adminMenuItems: AdminMenuItem[] = [
  {
    key: "dashboard",
    label: "仪表盘",
    icon: FiPieChart,
    children: [
      { key: "dashboard-workbench", label: "工作台", path: routes.admin },
      { key: "dashboard-analysis", label: "分析页", path: `${routes.admin}/analysis` }
    ]
  },
  {
    key: "ops",
    label: "系统运维",
    icon: FiLayout,
    children: [
      { key: "ops-api-doc", label: "接口文档", path: `${routes.admin}/ops/api-doc` },
      { key: "ops-system-monitor", label: "系统监控", path: `${routes.admin}/ops/system-monitor` },
      { key: "ops-cache-monitor", label: "缓存监控", path: `${routes.admin}/ops/cache-monitor` },
      { key: "ops-cache-list", label: "缓存列表", path: `${routes.admin}/ops/cache-list` },
      { key: "ops-system-log", label: "系统日志", path: `${routes.admin}/ops/system-log` },
      { key: "ops-user-behavior", label: "用户行为", path: `${routes.admin}/ops/user-behavior` }
    ]
  },
  {
    key: "personnel",
    label: "人员管理",
    icon: FiUsers,
    children: [
      { key: "personnel-user", label: "用户管理", path: `${routes.admin}/personnel/user` },
      { key: "personnel-menu", label: "菜单管理", path: `${routes.admin}/personnel/menu` },
      { key: "personnel-role", label: "角色管理", path: `${routes.admin}/personnel/role` }
    ]
  },
  {
    key: "system",
    label: "系统管理",
    icon: FiSettings,
    children: [
      { key: "system-dict", label: "字典管理", path: `${routes.admin}/system/dict` },
      { key: "system-token", label: "令牌管理", path: `${routes.admin}/system/token` },
      { key: "system-param", label: "参数管理", path: `${routes.admin}/system/param` },
      { key: "system-permission", label: "权限管理", path: `${routes.admin}/system/permission` }
    ]
  },
  {
    key: "video",
    label: "视频管理",
    icon: FiVideo,
    children: [
      { key: "video-upload", label: "视频上传", path: `${routes.admin}/video/upload` },
      { key: "video-list", label: "视频列表", path: `${routes.admin}/video/list` },
      { key: "video-review", label: "审核管理", path: `${routes.admin}/video/review` }
    ]
  },
  {
    key: "document",
    label: "文档管理",
    icon: FiFileText,
    children: [
      { key: "document-upload", label: "文档上传", path: `${routes.admin}/document/upload` },
      { key: "document-list", label: "文档列表", path: `${routes.admin}/document/list` },
      { key: "document-review", label: "审核管理", path: `${routes.admin}/document/review` }
    ]
  },
  {
    key: "bot",
    label: "BOT控制台",
    icon: FiBell,
    children: [
      { key: "bot-napcat", label: "NapCat", path: `${routes.admin}/bot/napcat` },
      { key: "bot-qq", label: "QQBot", path: `${routes.admin}/bot/qq` },
      { key: "bot-wechat", label: "WeChatBot", path: `${routes.admin}/bot/wechat` },
      { key: "bot-dingtalk", label: "DingTalkBot", path: `${routes.admin}/bot/dingtalk` }
    ]
  }
];

const headerIconButtonClass =
  "inline-flex items-center justify-center rounded-full w-8 h-8 text-[var(--text-color-secondary)] transition-colors transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-sm hover:bg-[color-mix(in_srgb,var(--primary-color)_10%,transparent)] hover:text-[var(--primary-color)]";

function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { token, reset: resetUser } = useUserStore();
  const {
    layoutMode,
    boxBorderEnabled,
    boxShadowEnabled,
    multiTabEnabled,
    breadcrumbEnabled,
    sidebarAccordion,
    menuWidth,
    fontSize
  } = useAppStore();

  // Apply global font size to root element
  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}px`;
    // Reset to default when unmounting or leaving admin layout could be considered,
    // but usually app-wide settings should persist. 
    // If needed to isolate: return () => { document.documentElement.style.fontSize = ''; };
  }, [fontSize]);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => layoutMode === "horizontal"
  );
  const [openKeys, setOpenKeys] = useState<string[]>(["dashboard"]);
  const [tabs, setTabs] = useState<{ key: string; label: string; path: string }[]>(() => {
    const dashboard = adminMenuItems[0]?.children[0];
    return dashboard ? [{ key: dashboard.key, label: dashboard.label, path: dashboard.path }] : [];
  });
  const [hoverSectionKey, setHoverSectionKey] = useState<string | null>(null);
  const hoverTimerRef = useRef<number | null>(null);
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

  const activeChild = useMemo(() => {
    const found = adminMenuItems
      .flatMap(section => section.children)
      .find(child => child.path === currentPath);
    if (found) {
      return found;
    }
    return adminMenuItems[0]?.children[0] ?? null;
  }, [currentPath]);

  const activeKey = activeChild?.key ?? "dashboard-workbench";

  const activeParent = useMemo(() => {
    if (!activeChild) {
      return adminMenuItems[0] ?? null;
    }
    const parent = adminMenuItems.find(section =>
      section.children.some(child => child.key === activeKey)
    );
    return parent ?? adminMenuItems[0] ?? null;
  }, [activeChild, activeKey]);

  const activeSectionKey = activeParent?.key ?? "dashboard";

  const handleLogoClick = () => {
    navigate(routes.home);
  };

  const handleLogout = () => {
    try {
      window.localStorage.removeItem("token");
      window.localStorage.removeItem("permissions");
      window.localStorage.removeItem("userInfo");
    } catch {
      // ignore
    }
    resetUser();
    navigate(routes.home);
  };

  const handleSectionToggle = (sectionKey: string) => {
    setOpenKeys(previous => {
      const isOpen = previous.includes(sectionKey);
      if (sidebarAccordion) {
        if (isOpen) {
          return [];
        }
        return [sectionKey];
      }
      return isOpen
        ? previous.filter(key => key !== sectionKey)
        : [...previous, sectionKey];
    });
  };

  const handleMenuItemClick = (menuKey: string) => {
    const matched = adminMenuItems
      .flatMap(section => section.children)
      .find(child => child.key === menuKey);
    if (!matched) {
      return;
    }
    setTabs(previous => {
      const exists = previous.some(tab => tab.key === matched.key);
      if (exists) {
        return previous;
      }
      const next = [...previous, { key: matched.key, label: matched.label, path: matched.path }];
      if (next.length > 8) {
        return next.slice(next.length - 8);
      }
      return next;
    });
    navigate(matched.path);
  };

  const handleSectionEntryClick = (sectionKey: string) => {
    const section = adminMenuItems.find(item => item.key === sectionKey);
    if (!section || !section.children.length) {
      return;
    }
    const first = section.children[0];
    handleMenuItemClick(first.key);
  };

  const handleTabClick = (key: string) => {
    const tab = tabs.find(item => item.key === key);
    if (!tab) {
      return;
    }
    navigate(tab.path);
  };

  const handleTabClose = (key: string) => {
    setTabs(previous => {
      const filtered = previous.filter(item => item.key !== key);
      if (!filtered.length) {
        const dashboard = adminMenuItems[0]?.children[0];
        if (dashboard) {
          navigate(dashboard.path);
          return [{ key: dashboard.key, label: dashboard.label, path: dashboard.path }];
        }
        return [];
      }
      const isClosingActive = key === activeKey;
      if (isClosingActive) {
        const nextTab = filtered[filtered.length - 1];
        navigate(nextTab.path);
      }
      return filtered;
    });
  };

  const handleCloseOthers = (key: string) => {
    setTabs(previous => previous.filter(item => item.key === key));
    const current = tabs.find(item => item.key === key);
    if (current) {
      navigate(current.path);
    }
  };

  const handleCloseAll = () => {
    const dashboard = adminMenuItems[0]?.children[0];
    if (dashboard) {
      setTabs([{ key: dashboard.key, label: dashboard.label, path: dashboard.path }]);
      navigate(dashboard.path);
    } else {
      setTabs([]);
    }
  };

  const breadcrumb = useMemo(() => {
    if (!activeChild || !activeParent) {
      return null;
    }
    return {
      parentLabel: activeParent.label,
      childLabel: activeChild.label,
      parentKey: activeParent.key
    };
  }, [activeChild, activeParent]);

  const containerClassName =
    "w-full" +
    (boxBorderEnabled || boxShadowEnabled
      ? " bg-[var(--bg-elevated)] rounded-[var(--radius-base)] px-4 py-4"
      : "") +
    (boxBorderEnabled ? " border border-[var(--border-color)]" : "");

const adminHeaderNavButtonClass =
  "inline-flex items-center gap-1 px-1 h-10 text-xs border-b-2 border-transparent text-[var(--text-color-secondary)] hover:text-[var(--primary-color)] transition-colors duration-150";

  const renderTopAdminNav = () => {
    if (layoutMode !== "horizontal" && layoutMode !== "mixed") {
      return null;
    }
    return (
      <div className="hidden md:flex items-center gap-4 text-xs">
        {adminMenuItems.map(section => {
          const isActive = section.key === activeSectionKey;
          if (layoutMode === "horizontal") {
            return (
              <div
                key={section.key}
                className="relative"
                onMouseEnter={() => {
                  if (hoverTimerRef.current !== null) {
                    window.clearTimeout(hoverTimerRef.current);
                    hoverTimerRef.current = null;
                  }
                  setHoverSectionKey(section.key);
                }}
                onMouseLeave={() => {
                  if (hoverTimerRef.current !== null) {
                    window.clearTimeout(hoverTimerRef.current);
                  }
                  hoverTimerRef.current = window.setTimeout(() => {
                    setHoverSectionKey(current =>
                      current === section.key ? null : current
                    );
                  }, 120);
                }}
              >
                <button
                  type="button"
                  className={
                    adminHeaderNavButtonClass +
                    (isActive
                      ? " font-semibold text-[var(--primary-color)] border-b-[var(--primary-color)]"
                      : "")
                  }
                  onClick={() => handleSectionEntryClick(section.key)}
                >
                  {(() => {
                    const Icon = section.icon;
                    return <Icon className="w-4 h-4" />;
                  })()}
                  <span>{section.label}</span>
                </button>
                {hoverSectionKey === section.key && (
                  <div
                    className="absolute left-0 top-full mt-1 min-w-[140px] rounded-md border border-[var(--border-color)] bg-[var(--bg-elevated)] shadow-sm py-1 z-30"
                    onMouseEnter={() => {
                      if (hoverTimerRef.current !== null) {
                        window.clearTimeout(hoverTimerRef.current);
                        hoverTimerRef.current = null;
                      }
                      setHoverSectionKey(section.key);
                    }}
                    onMouseLeave={() => {
                      if (hoverTimerRef.current !== null) {
                        window.clearTimeout(hoverTimerRef.current);
                      }
                      hoverTimerRef.current = window.setTimeout(() => {
                        setHoverSectionKey(current =>
                          current === section.key ? null : current
                        );
                      }, 120);
                    }}
                  >
                    {section.children.map(child => (
                      <button
                        key={child.key}
                        type="button"
                        className="w-full px-3 py-1.5 text-left text-xs text-[var(--text-color-secondary)] hover:bg-[color-mix(in_srgb,var(--primary-color)_6%,transparent)] hover:text-[var(--text-color)]"
                        onClick={() => handleMenuItemClick(child.key)}
                      >
                        {child.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          }
          return (
            <button
              key={section.key}
              type="button"
              className={
                adminHeaderNavButtonClass +
                (isActive
                  ? " font-semibold text-[var(--primary-color)] border-b-[var(--primary-color)]"
                  : "")
              }
              onClick={() => handleSectionEntryClick(section.key)}
            >
              {(() => {
                const Icon = section.icon;
                return <Icon className="w-4 h-4" />;
              })()}
              <span>{section.label}</span>
            </button>
          );
        })}
      </div>
    );
  };

  const renderVerticalSidebar = () => (
    <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
      <div className="space-y-2">
        <div className="px-2 text-[11px] text-[var(--text-color-secondary)]">
          管理导航
        </div>
        {adminMenuItems.map(section => {
          const Icon = section.icon;
          const isOpen = openKeys.includes(section.key);
          const hasActiveChild = section.children.some(child => child.key === activeKey);
          return (
            <div key={section.key} className="space-y-1">
              <button
                type="button"
                className={
                  "w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-xs transition-colors " +
                  (hasActiveChild
                    ? "bg-[color-mix(in_srgb,var(--primary-color)_10%,transparent)] text-[var(--primary-color)]"
                    : "text-[var(--text-color-secondary)] hover:bg-[color-mix(in_srgb,var(--primary-color)_6%,transparent)] hover:text-[var(--text-color)]")
                }
                onClick={() => handleSectionToggle(section.key)}
              >
                <span className="inline-flex items-center gap-2">
                  <Icon className="text-sm" />
                  {!sidebarCollapsed && <span>{section.label}</span>}
                </span>
                {!sidebarCollapsed && (
                  <span className="text-[10px] text-[var(--text-color-secondary)]">
                    {isOpen ? (
                      <FiChevronDown className="w-3 h-3" />
                    ) : (
                      <FiChevronRight className="w-3 h-3" />
                    )}
                  </span>
                )}
              </button>
              {isOpen && !sidebarCollapsed && (
                <div className="mt-1 space-y-1">
                  {section.children.map(child => {
                    const active = child.key === activeKey;
                    return (
                      <button
                        key={child.key}
                        type="button"
                        className={
                          "w-full flex items-center justify-between gap-2 pl-6 pr-3 py-1.5 rounded-lg text-[11px] transition-colors border " +
                          (active
                            ? "border-[color-mix(in_srgb,var(--primary-color)_40%,transparent)] bg-[color-mix(in_srgb,var(--primary-color)_12%,transparent)] text-[var(--primary-color)]"
                            : "border-transparent text-[var(--text-color-secondary)] hover:bg-[color-mix(in_srgb,var(--primary-color)_6%,transparent)] hover:text-[var(--text-color)]")
                        }
                        onClick={() => handleMenuItemClick(child.key)}
                      >
                        <span>{child.label}</span>
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

  const renderMixedSidebar = () => {
    const currentSection =
      adminMenuItems.find(item => item.key === activeSectionKey) ?? adminMenuItems[0];
    if (!currentSection) {
      return null;
    }
    return (
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-3">
        <div className="px-2 text-[11px] text-[var(--text-color-secondary)]">
          {currentSection.label}
        </div>
        <div className="space-y-1">
          {currentSection.children.map(child => {
            const active = child.key === activeKey;
            return (
              <button
                key={child.key}
                type="button"
                className={
                  "w-full flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg text-[11px] transition-colors border " +
                  (active
                    ? "border-[color-mix(in_srgb,var(--primary-color)_40%,transparent)] bg-[color-mix(in_srgb,var(--primary-color)_12%,transparent)] text-[var(--primary-color)]"
                    : "border-transparent text-[var(--text-color-secondary)] hover:bg-[color-mix(in_srgb,var(--primary-color)_6%,transparent)] hover:text-[var(--text-color)]")
                }
                onClick={() => handleMenuItemClick(child.key)}
              >
                <span>{child.label}</span>
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

  const renderDoubleSidebar = () => {
    if (!adminMenuItems.length) {
      return null;
    }
    const currentSection =
      adminMenuItems.find(item => item.key === activeSectionKey) ?? adminMenuItems[0];
    if (sidebarCollapsed) {
      return (
        <nav className="flex-1 flex flex-col items-center py-4 space-y-2">
          {adminMenuItems.map(section => {
            const Icon = section.icon;
            const isActive = section.key === activeSectionKey;
            return (
              <button
                key={section.key}
                type="button"
                className={
                  "w-10 h-10 rounded-xl flex items-center justify-center text-xs transition-colors " +
                  (isActive
                    ? "bg-[color-mix(in_srgb,var(--primary-color)_18%,transparent)] text-[var(--primary-color)]"
                    : "text-[var(--text-color-secondary)] hover:bg-[color-mix(in_srgb,var(--primary-color)_8%,transparent)] hover:text-[var(--text-color)]")
                }
                onClick={() => handleSectionEntryClick(section.key)}
              >
                <Icon className="text-base" />
              </button>
            );
          })}
        </nav>
      );
    }
    return (
      <div className="flex flex-1 overflow-hidden">
        <nav className="w-16 flex flex-col items-center py-4 border-r border-[var(--border-color)] space-y-2">
          {adminMenuItems.map(section => {
            const Icon = section.icon;
            const isActive = section.key === activeSectionKey;
            return (
              <button
                key={section.key}
                type="button"
                className={
                  "w-11 h-11 rounded-xl flex flex-col items-center justify-center text-[10px] transition-colors " +
                  (isActive
                    ? "bg-[color-mix(in_srgb,var(--primary-color)_18%,transparent)] text-[var(--primary-color)]"
                    : "text-[var(--text-color-secondary)] hover:bg-[color-mix(in_srgb,var(--primary-color)_8%,transparent)] hover:text-[var(--text-color)]")
                }
                onClick={() => handleSectionEntryClick(section.key)}
              >
                <Icon className="text-base" />
                <span className="mt-0.5 truncate max-w-[2.5rem]">{section.label}</span>
              </button>
            );
          })}
        </nav>
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {currentSection && (
            <div className="space-y-1">
              {currentSection.children.map(child => {
                const active = child.key === activeKey;
                return (
                  <button
                    key={child.key}
                    type="button"
                    className={
                      "w-full flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg text-[11px] transition-colors border " +
                      (active
                        ? "border-[color-mix(in_srgb,var(--primary-color)_40%,transparent)] bg-[color-mix(in_srgb,var(--primary-color)_12%,transparent)] text-[var(--primary-color)]"
                        : "border-transparent text-[var(--text-color-secondary)] hover:bg-[color-mix(in_srgb,var(--primary-color)_6%,transparent)] hover:text-[var(--text-color)]")
                    }
                    onClick={() => handleMenuItemClick(child.key)}
                  >
                    <span>{child.label}</span>
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
            <div className="h-9 w-9 rounded-xl bg-[var(--primary-color)] flex items-center justify-center text-[var(--bg-elevated)] text-sm font-semibold">
              管
            </div>
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
        <header className="h-14 flex items-center justify-between border-b border-[var(--border-color)] bg-[var(--bg-elevated)] px-4 md:px-6 gap-4">
          <div className="flex items-center gap-3">
            <Dropdown>
              <DropdownTrigger>
                <button
                  type="button"
                  className="inline-flex md:hidden items-center gap-2 px-2 py-1 rounded-lg border border-[var(--border-color)] text-xs"
                >
                  <FiLayout className="text-sm" />
                  <span>后台菜单</span>
                </button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="后台菜单"
                onAction={key => {
                  handleMenuItemClick(String(key));
                }}
              >
                {adminMenuItems.flatMap(section =>
                  section.children.map(child => (
                    <DropdownItem key={child.key}>
                      {child.label}
                    </DropdownItem>
                  ))
                )}
              </DropdownMenu>
            </Dropdown>
            <div className="hidden md:flex items-center gap-2 text-xs text-[var(--text-color-secondary)]">
              {breadcrumbEnabled && breadcrumb ? (
                <Breadcrumbs
                  size="sm"
                  variant="light"
                  itemClasses={{
                    item: "text-xs text-[var(--text-color-secondary)] data-[current=true]:text-[var(--text-color)]",
                    separator: "text-[var(--text-color-secondary)] px-1"
                  }}
                >
                  <BreadcrumbItem onPress={() => handleMenuItemClick("dashboard-workbench")}>
                    后台管理
                  </BreadcrumbItem>
                  <BreadcrumbItem>{breadcrumb.parentLabel}</BreadcrumbItem>
                  <BreadcrumbItem>{breadcrumb.childLabel}</BreadcrumbItem>
                </Breadcrumbs>
              ) : (
                <span>后台管理</span>
              )}
              <span className="px-2 py-0.5 rounded-full bg-[color-mix(in_srgb,var(--primary-color)_10%,transparent)] text-[10px] text-[var(--primary-color)]">
                单独后台布局
              </span>
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
              <Dropdown placement="bottom-end">
                <DropdownTrigger>
                  <button
                    type="button"
                    className={headerIconButtonClass}
                    aria-label="用户菜单"
                  >
                    <Avatar
                      size="sm"
                      name="管理员"
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
                    color="danger"
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
          <div className="h-9 flex items-center gap-2 px-6 border-b border-[var(--border-color)] bg-[var(--bg-elevated)]">
            {tabs.map(item => (
              <button
                key={item.key}
                type="button"
                className={
                  "flex items-center gap-1 px-3 py-1 rounded-full text-xs transition-colors border " +
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
                {item.key !== "dashboard-workbench" && (
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

        <main className="flex-1 overflow-y-auto px-[var(--content-padding)] py-[var(--content-padding)]">
          <div className={containerClassName}>
            <Outlet />
          </div>
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
