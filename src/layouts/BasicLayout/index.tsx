import React, { useEffect, useMemo, useState, useRef } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import type { IconType } from "react-icons";
import {
  Avatar,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem
} from "@heroui/react";
import { routes } from "../../router/routes";
import SystemSettingsPanel from "../../components/SystemSettings/Panel";
import { useAppStore } from "../../store";
import { useUserStore } from "../../store/modules/userStore";
import PageTransitionWrapper from "../../components/Motion/PageTransitionWrapper";
import StickerPeel from "../../components/Motion/StickerPeel";
import WordRotate from "../../components/Motion/WordRotate";
import { ThemeToggler } from "../../components/MagicUI/ThemeToggler";
import {
  FiHelpCircle,
  FiMail,
  FiMessageSquare,
  FiClock,
  FiGithub,
  FiTwitter,
  FiShield,
  FiFileText,
  FiBox,
  FiHome,
  FiBookOpen,
  FiUser,
  FiLogOut,
  FiGlobe
} from "react-icons/fi";

const launchedAt = new Date("2026-01-01T00:00:00Z").getTime();
const initialRunDays = Math.max(
  0,
  Math.floor((Date.now() - launchedAt) / (1000 * 60 * 60 * 24))
);

const headerNavButtonClass =
  "inline-flex items-center gap-1 px-1 h-10 text-sm border-b-2 border-transparent transition-colors duration-150";

const headerIconButtonClass =
  "inline-flex items-center justify-center rounded-full w-8 h-8 text-[var(--text-color-secondary)] transition-colors transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-sm hover:bg-[color-mix(in_srgb,var(--primary-color)_10%,transparent)] hover:text-[var(--primary-color)]";

type NavItem = {
  path: string;
  label: string;
  icon: IconType;
};

type TabItem = {
  path: string;
  label: string;
};

function BasicLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [settingsVisible, setSettingsVisible] = useState(false);
  const { token, reset: resetUser } = useUserStore();
  const {
    boxBorderEnabled,
    boxShadowEnabled,
    layoutMode,
    menuWidth,
    multiTabEnabled,
    breadcrumbEnabled,
    // themeMode,
    // setThemeMode,
    language,
    setLanguage,
    primaryColor,
    setPrimaryColor
  } = useAppStore();

  const navItems: NavItem[] = useMemo(
    () => [
      { path: routes.home, label: "首页", icon: FiHome },
      { path: routes.allSearch, label: "知识库", icon: FiBookOpen },
      { path: routes.resume, label: "制作简历", icon: FiFileText },
      { path: routes.craziness, label: "发癫区", icon: FiMessageSquare },
      { path: routes.tools, label: "百宝袋", icon: FiBox },
      { path: routes.about, label: "关于博主", icon: FiUser }
    ],
    []
  );

  const [tabs, setTabs] = useState<TabItem[]>(() => [
    { path: routes.home, label: "首页" }
  ]);

  const [hideHeader, setHideHeader] = useState(false);
  const lastScrollYRef = useRef(0);
  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY;
      const last = lastScrollYRef.current;
      if (current > last + 4 && current > 40) {
        setHideHeader(true);
      } else if (current < last - 4) {
        setHideHeader(false);
      }
      lastScrollYRef.current = current;
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const activePath = location.pathname;
  const isAdmin = activePath.startsWith(routes.admin);
  const effectiveLayoutMode = isAdmin ? layoutMode : "horizontal";
  const effectiveBoxBorderEnabled = isAdmin ? boxBorderEnabled : false;
  const effectiveBoxShadowEnabled = isAdmin ? boxShadowEnabled : false;
  const effectiveMultiTabEnabled = isAdmin ? multiTabEnabled : false;
  const effectiveBreadcrumbEnabled = isAdmin ? breadcrumbEnabled : false;

  const containerClassName =
    "w-full" +
    (effectiveBoxBorderEnabled || effectiveBoxShadowEnabled
      ? " bg-[var(--bg-elevated)] rounded-[var(--radius-base)] px-4 py-4"
      : "") +
    (effectiveBoxBorderEnabled ? " border border-[var(--border-color)]" : "");

  const handleNavClick = (path: string) => {
    if (path === activePath) {
      return;
    }
    navigate(path);
    setTabs(previous => {
      const exists = previous.some(item => item.path === path);
      if (exists) {
        return previous;
      }
      const item =
        navItems.find(nav => nav.path === path) ??
        (path === routes.home
          ? { path: routes.home, label: "首页" }
          : { path, label: "页面" });
      return [...previous, item];
    });
  };

  const handleTabClose = (path: string) => {
    setTabs(previous => {
      const filtered = previous.filter(item => item.path !== path);
      if (!filtered.length) {
        navigate(routes.home);
        return [{ path: routes.home, label: "首页" }];
      }
      if (path === activePath) {
        navigate(filtered[filtered.length - 1].path);
      }
      return filtered;
    });
  };

  const renderTopNav = (className: string) => (
    <nav className={className}>
      {navItems.map(item => {
        const isActive = activePath === item.path;
        return (
          <button
            key={item.path}
            type="button"
            className={
              headerNavButtonClass +
              (isActive
                ? " font-semibold text-[var(--primary-color)] border-b-[var(--primary-color)]"
                : " text-[var(--text-color-secondary)] hover:text-[var(--primary-color)]")
            }
            onClick={() => handleNavClick(item.path)}
          >
            <item.icon className="w-4 h-4" />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );

  const renderTopNavMobile = (className: string) => (
    <nav className={className}>
      {navItems.map(item => {
        const isActive = activePath === item.path;
        return (
          <button
            key={item.path}
            type="button"
            className={
              "inline-flex items-center justify-center w-8 h-8 rounded-full transition-colors duration-150 " +
              (isActive
                ? "text-[var(--primary-color)] bg-[color-mix(in_srgb,var(--primary-color)_12%,transparent)]"
                : "text-[var(--text-color-secondary)] hover:text-[var(--primary-color)] hover:bg-[color-mix(in_srgb,var(--primary-color)_8%,transparent)]")
            }
            onClick={() => handleNavClick(item.path)}
            aria-label={item.label}
          >
            <item.icon className="w-4 h-4" />
          </button>
        );
      })}
    </nav>
  );

  const renderSidebarNav = () => (
    <nav className="flex flex-col gap-2 text-sm">
      {navItems.map(item => (
        <button
          key={item.path}
          type="button"
          className={
            "text-left rounded px-3 py-2 transition-colors " +
            (activePath === item.path
              ? "bg-[var(--primary-color)] text-white"
              : "hover:bg-black/5 dark:hover:bg-white/5")
          }
          onClick={() => handleNavClick(item.path)}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-color)] text-[var(--text-color)] icon-rotate-global relative">
      <motion.header
        className="h-14 flex flex-col border-b border-[var(--border-color)] bg-[var(--bg-elevated)] sticky top-0 z-30"
        animate={hideHeader ? { y: -80 } : { y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center h-14 px-6">
          <div className="flex items-center gap-4 shrink-0">
            <button
              type="button"
              className="flex items-center gap-2 text-base font-bold rounded-full px-3 py-1 transition-colors transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-sm hover:bg-[color-mix(in_srgb,var(--primary-color)_10%,transparent)]"
              onClick={() => handleNavClick(routes.home)}
            >
              <StickerPeel className="w-7 h-7 rounded bg-[var(--primary-color)] text-white flex items-center justify-center text-xs">
                <span>KB</span>
              </StickerPeel>
              <WordRotate
                className="hidden sm:inline-block"
                words={["知识库小破站", "欢迎您的到来"]}
              />
            </button>
          </div>
          <div className="flex-1 flex justify-center">
            {(effectiveLayoutMode === "horizontal" ||
              effectiveLayoutMode === "mixed" ||
              effectiveLayoutMode === "vertical" ||
              effectiveLayoutMode === "double") && (
              <>
                {renderTopNav("hidden md:flex items-center gap-4")}
                {renderTopNavMobile("flex md:hidden items-center gap-3")}
              </>
            )}
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden md:flex items-center gap-2">
              <ThemeToggler />
              <button
                type="button"
                className={headerIconButtonClass}
                onClick={() => setLanguage(language === "zh-CN" ? "en-US" : "zh-CN")}
                aria-label="切换语言"
              >
                <FiGlobe />
              </button>
              <Dropdown
                 classNames={{
                   content: "bg-[var(--bg-elevated)]! border border-[var(--primary-color)]/20! shadow-2xl! rounded-xl min-w-[140px] p-1.5"
                 }}
               >
                <DropdownTrigger>
                  <button
                    type="button"
                    className={headerIconButtonClass}
                    aria-label="主题配色"
                  >
                    <div
                      className="w-3.5 h-3.5 rounded-full border border-current"
                      style={{ backgroundColor: primaryColor }}
                    />
                  </button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="选择主题色"
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
                  onAction={key => setPrimaryColor(key as string)}
                >
                  {[
                    { key: "#537BF9", label: "默认蓝" },
                    { key: "#54B83E", label: "清新绿" },
                    { key: "#7E0DF5", label: "神秘紫" },
                    { key: "#FF7416", label: "活力橙" },
                    { key: "#FF98C3", label: "少女粉" }
                  ].map(color => (
                    <DropdownItem
                      key={color.key}
                      startContent={
                        <div
                          className="w-4 h-4 rounded-full border border-default-200"
                          style={{ backgroundColor: color.key }}
                        />
                      }
                    >
                      {color.label}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
            </div>
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
                    name="用户"
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
                  if (key === "admin") {
                    navigate(routes.admin);
                  } else if (key === "profile") {
                    navigate(routes.profile);
                  } else if (key === "logout") {
                    try {
                      window.localStorage.removeItem("token");
                      window.localStorage.removeItem("permissions");
                      window.localStorage.removeItem("userInfo");
                    } catch {
                      void 0;
                    }
                    resetUser();
                    navigate(routes.home);
                  }
                }}
              >
                <DropdownItem
                  key="admin"
                  startContent={<FiShield className="w-4 h-4" />}
                >
                  后台管理
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
        </div>
      </motion.header>
      {effectiveMultiTabEnabled && (
        <div className="h-9 flex items-center gap-2 px-6 border-b border-[var(--border-color)] bg-[var(--bg-elevated)]">
          {tabs.map(item => (
            <button
              key={item.path}
              type="button"
              className={
                "flex items-center gap-1 px-3 py-1 rounded-full text-xs border " +
                (item.path === activePath
                  ? "border-[var(--primary-color)] text-[var(--primary-color)] bg-[color-mix(in_srgb,var(--primary-color)_10%,transparent)]"
                  : "border-[var(--border-color)] text-[var(--text-color-secondary)]")
              }
              onClick={() => handleNavClick(item.path)}
            >
              <span>{item.label}</span>
              {item.path !== routes.home && (
                <span
                  className="ml-1 cursor-pointer"
                  onClick={event => {
                    event.stopPropagation();
                    handleTabClose(item.path);
                  }}
                >
                  ×
                </span>
              )}
            </button>
          ))}
        </div>
      )}
      {effectiveBreadcrumbEnabled && (
        <div className="h-8 flex items-center px-6 text-xs text-[var(--text-color-secondary)]">
          <span
            className="cursor-pointer"
            onClick={() => handleNavClick(routes.home)}
          >
            首页
          </span>
          <span className="mx-1">/</span>
          <span>{navItems.find(item => item.path === activePath)?.label ?? "页面"}</span>
        </div>
      )}
      <main
        className={
          "flex-1 relative " +
          (location.pathname === routes.home
            ? "px-0 py-0"
            : "px-[var(--content-padding)] py-[var(--content-padding)]")
        }
      >
        <div
          className={
            location.pathname === routes.home
              ? "w-full flex gap-4"
              : "max-w-6xl mx-auto flex gap-4"
          }
        >
          {(effectiveLayoutMode === "vertical" ||
            effectiveLayoutMode === "mixed" ||
            effectiveLayoutMode === "double") && (
            <aside
              className="shrink-0"
              style={{ width: menuWidth }}
            >
              {renderSidebarNav()}
            </aside>
          )}
          <PageTransitionWrapper
            className={containerClassName}
            style={
              effectiveBoxShadowEnabled
                ? { boxShadow: "var(--shadow-color)" }
                : undefined
            }
          >
            <Outlet />
          </PageTransitionWrapper>
        </div>
      </main>
      <footer className="border-t border-[var(--border-color)] bg-[var(--bg-elevated)] text-[var(--text-color-secondary)] text-xs">
        <div className="max-w-6xl mx-auto py-6 md:py-8 flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="md:basis-3/5 space-y-3">
              <div className="text-sm">
                <span className="font-semibold">© 2026 知识库小破站</span>
                <span className="ml-2">
                  一个专注知识整理和成长记录的小站。
                </span>
              </div>
              <div className="flex flex-wrap gap-4 text-[11px]">
                <div className="flex items-center gap-2">
                  <FiClock className="text-[var(--primary-color)]" />
                  <span>
                    站点已运行{" "}
                    <span className="font-semibold">{initialRunDays}</span> 天
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FiHelpCircle className="text-[var(--primary-color)]" />
                  <span>累计访问人数：开发中</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiHelpCircle className="text-[var(--primary-color)]" />
                  <span>累计访问次数：开发中</span>
                </div>
              </div>
              <div className="text-[11px] leading-relaxed">
                本站内容仅用于个人学习与作品展示，暂未接入真实备案信息。如需商用或引用，请保留来源标注。
              </div>
            </div>
            <div className="md:basis-2/5 grid grid-cols-3 gap-4 text-[11px]">
              <div className="space-y-2">
                <div className="font-semibold text-[var(--text-color)]">
                  支持
                </div>
                <button
                  type="button"
                  className="flex items-center gap-1 hover:text-[var(--primary-color)]"
                >
                  <FiHelpCircle />
                  <span>问题解答</span>
                </button>
                <button
                  type="button"
                  className="flex items-center gap-1 hover:text-[var(--primary-color)]"
                >
                  <FiMail />
                  <span>联系方式</span>
                </button>
                <button
                  type="button"
                  className="flex items-center gap-1 hover:text-[var(--primary-color)]"
                >
                  <FiMessageSquare />
                  <span>反馈</span>
                </button>
                <button
                  type="button"
                  className="flex items-center gap-1 hover:text-[var(--primary-color)]"
                >
                  <FiFileText />
                  <span>更新日志</span>
                </button>
              </div>
              <div className="space-y-2">
                <div className="font-semibold text-[var(--text-color)]">
                  社交
                </div>
                <a
                  href="https://github.com/MmzMing/zsk-ui"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 hover:text-[var(--primary-color)]"
                >
                  <FiGithub />
                  <span>GitHub</span>
                </a>
                <button
                  type="button"
                  className="flex items-center gap-1 hover:text-[var(--primary-color)]"
                >
                  <FiMessageSquare />
                  <span>QQ</span>
                </button>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 hover:text-[var(--primary-color)]"
                >
                  <FiTwitter />
                  <span>推特</span>
                </a>
                <a
                  href="https://discord.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 hover:text-[var(--primary-color)]"
                >
                  <FiMessageSquare />
                  <span>Discord</span>
                </a>
              </div>
              <div className="space-y-2">
                <div className="font-semibold text-[var(--text-color)]">
                  更多
                </div>
                <button
                  type="button"
                  className="flex items-center gap-1 hover:text-[var(--primary-color)]"
                >
                  <FiShield />
                  <span>隐私政策</span>
                </button>
                <button
                  type="button"
                  className="flex items-center gap-1 hover:text-[var(--primary-color)]"
                >
                  <FiFileText />
                  <span>用户协议</span>
                </button>
                <button
                  type="button"
                  className="flex items-center gap-1 hover:text-[var(--primary-color)]"
                >
                  <FiBox />
                  <span>扩展</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </footer>
      <SystemSettingsPanel
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
      />
    </div>
  );
}

export default BasicLayout;
