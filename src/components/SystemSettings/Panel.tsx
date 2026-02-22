import React from "react";
import { Button, Input, Switch, SelectItem, Accordion, AccordionItem } from "@heroui/react";
import { AdminSelect } from "../Admin/AdminSelect";
import { useLocation } from "react-router-dom";
import { FiSun, FiMoon, FiMonitor, FiRotateCcw } from "react-icons/fi";
import { useAppStore } from "../../store";
import { routes } from "../../router/routes";
import StaggeredMenu from "../Motion/StaggeredMenu";

type Props = {
  visible: boolean;
  onClose: () => void;
};

function CollapsibleSection({ title, children, defaultExpanded = true }: { title: string; children: React.ReactNode; defaultExpanded?: boolean }) {
  return (
    <Accordion
      variant="light"
      className="px-0"
      itemClasses={{
        base: "py-0 w-full",
        title: "text-sm font-medium",
        trigger: "py-2 px-0 hover:bg-transparent",
        content: "pb-3 pt-0",
        indicator: "text-[var(--text-color-secondary)]"
      }}
      defaultExpandedKeys={defaultExpanded ? ["section"] : []}
    >
      <AccordionItem key="section" aria-label={title} title={title}>
        {children}
      </AccordionItem>
    </Accordion>
  );
}

const buttonClassNames = {
  base: [
    "border",
    "border-[var(--border-color)]",
    "dark:border-white/20",
    "transition-colors",
    "data-[hover=true]:bg-transparent!",
    "data-[hover=true]:border-[var(--primary-color)]/80!"
  ].join(" "),
  selected: [
    "bg-[color-mix(in_srgb,var(--primary-color)_15%,transparent)]!",
    "border-[var(--primary-color)]!",
    "text-[var(--primary-color)]!",
    "dark:border-[var(--primary-color)]!"
  ].join(" ")
};

function Panel(props: Props) {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith(routes.admin);
  const {
    themeMode,
    layoutMode,
    language,
    primaryColor,
    boxBorderEnabled,
    boxShadowEnabled,
    multiTabEnabled,
    breadcrumbEnabled,
    sidebarAccordion,
    textSelectable,
    colorWeakMode,
    menuWidth,
    borderRadius,
    fontSize,
    contentPadding,
    pageTransition,
    clickSparkEnabled,
    showTopNav,
    setThemeMode,
    setLayoutMode,
    setLanguage,
    setPrimaryColor,
    setBoxBorderEnabled,
    setBoxShadowEnabled,
    setMultiTabEnabled,
    setBreadcrumbEnabled,
    setSidebarAccordion,
    setTextSelectable,
    setColorWeakMode,
    setMenuWidth,
    setBorderRadius,
    setFontSize,
    setContentPadding,
    setPageTransition,
    setClickSparkEnabled,
    setShowTopNav,
    resetSettings
  } = useAppStore();

  return (
    <StaggeredMenu
      isOpen={props.visible}
      onClose={props.onClose}
      position="right"
      colors={[primaryColor, "#B19EEF"]}
      items={[]}
      accentColor={primaryColor}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-[var(--text-color)]">系统设置</h3>
        <Button
          isIconOnly
          size="sm"
          variant="light"
          className="h-7 w-7 min-w-7 text-[var(--text-color-secondary)]"
          onPress={resetSettings}
          aria-label="重置设置"
        >
          <FiRotateCcw className="text-sm" />
        </Button>
      </div>

      <div className="space-y-1 text-sm">
        <CollapsibleSection title="主题风格">
          <div className="flex gap-2">
            <Button
              isIconOnly
              size="sm"
              variant="bordered"
              className={`${buttonClassNames.base} h-8 w-8 min-w-8 ${themeMode === "light" ? buttonClassNames.selected : ""}`}
              onPress={() => setThemeMode("light")}
              aria-label="浅色模式"
            >
              <FiSun className="text-sm" />
            </Button>
            <Button
              isIconOnly
              size="sm"
              variant="bordered"
              className={`${buttonClassNames.base} h-8 w-8 min-w-8 ${themeMode === "dark" ? buttonClassNames.selected : ""}`}
              onPress={() => setThemeMode("dark")}
              aria-label="深色模式"
            >
              <FiMoon className="text-sm" />
            </Button>
            <Button
              isIconOnly
              size="sm"
              variant="bordered"
              className={`${buttonClassNames.base} h-8 w-8 min-w-8 ${themeMode === "system" ? buttonClassNames.selected : ""}`}
              onPress={() => setThemeMode("system")}
              aria-label="跟随系统"
            >
              <FiMonitor className="text-sm" />
            </Button>
          </div>
        </CollapsibleSection>

        {isAdmin && (
          <CollapsibleSection title="菜单布局（仅后台管理）">
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="bordered"
                className={`${buttonClassNames.base} h-7 px-3 text-xs ${layoutMode === "vertical" ? buttonClassNames.selected : ""}`}
                onPress={() => setLayoutMode("vertical")}
              >
                垂直
              </Button>
              <Button
                size="sm"
                variant="bordered"
                className={`${buttonClassNames.base} h-7 px-3 text-xs ${layoutMode === "horizontal" ? buttonClassNames.selected : ""}`}
                onPress={() => setLayoutMode("horizontal")}
              >
                水平
              </Button>
              <Button
                size="sm"
                variant="bordered"
                className={`${buttonClassNames.base} h-7 px-3 text-xs ${layoutMode === "mixed" ? buttonClassNames.selected : ""}`}
                onPress={() => setLayoutMode("mixed")}
              >
                混合
              </Button>
              <Button
                size="sm"
                variant="bordered"
                className={`${buttonClassNames.base} h-7 px-3 text-xs ${layoutMode === "double" ? buttonClassNames.selected : ""}`}
                onPress={() => setLayoutMode("double")}
              >
                双列
              </Button>
              <Button
                size="sm"
                variant="bordered"
                className={`${buttonClassNames.base} h-7 px-3 text-xs ${layoutMode === "dock" ? buttonClassNames.selected : ""}`}
                onPress={() => setLayoutMode("dock")}
              >
                Dock
              </Button>
            </div>
          </CollapsibleSection>
        )}

        <CollapsibleSection title="国际化">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="bordered"
              className={`${buttonClassNames.base} flex-1 h-8 text-xs ${language === "zh-CN" ? buttonClassNames.selected : ""}`}
              onPress={() => setLanguage("zh-CN")}
            >
              中文
            </Button>
            <Button
              size="sm"
              variant="bordered"
              className={`${buttonClassNames.base} flex-1 h-8 text-xs ${language === "en-US" ? buttonClassNames.selected : ""}`}
              onPress={() => setLanguage("en-US")}
            >
              English
            </Button>
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="主题配色">
          <div className="flex items-center gap-3 mb-2">
            <input
              type="color"
              value={primaryColor}
              onChange={event => setPrimaryColor(event.target.value)}
              className="w-8 h-8 border border-[var(--border-color)] rounded"
            />
            <Input
              size="sm"
              variant="bordered"
              value={primaryColor}
              onValueChange={value => setPrimaryColor(value)}
              className="flex-1"
              classNames={{
                inputWrapper:
                  "h-8 text-xs bg-[var(--bg-elevated)] border-[var(--border-color)]",
                input: "text-xs"
              }}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {["#537BF9", "#54B83E", "#7E0DF5", "#FF7416", "#FF98C3"].map(
              color => (
                <button
                  key={color}
                  type="button"
                  className={
                    primaryColor.toLowerCase() === color.toLowerCase()
                      ? "w-6 h-6 rounded-full border-2 border-[var(--border-color)]"
                      : "w-6 h-6 rounded-full border border-[var(--border-color)]"
                  }
                  style={{ backgroundColor: color }}
                  onClick={() => setPrimaryColor(color)}
                />
              )
            )}
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="盒子样式">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--text-color-secondary)]">启用边框</span>
              <Switch
                size="sm"
                isSelected={boxBorderEnabled}
                onValueChange={setBoxBorderEnabled}
                className="scale-90"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--text-color-secondary)]">启用阴影</span>
              <Switch
                size="sm"
                isSelected={boxShadowEnabled}
                onValueChange={setBoxShadowEnabled}
                className="scale-90"
              />
            </div>
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="自定义布局模式">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--text-color-secondary)]">多标签页</span>
              <Switch
                size="sm"
                isSelected={multiTabEnabled}
                onValueChange={setMultiTabEnabled}
                className="scale-90"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--text-color-secondary)]">显示顶栏</span>
              <Switch
                size="sm"
                isSelected={showTopNav}
                onValueChange={setShowTopNav}
                className="scale-90"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--text-color-secondary)]">面包屑导航</span>
              <Switch
                size="sm"
                isSelected={breadcrumbEnabled}
                onValueChange={setBreadcrumbEnabled}
                className="scale-90"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--text-color-secondary)]">侧边栏手风琴</span>
              <Switch
                size="sm"
                isSelected={sidebarAccordion}
                onValueChange={setSidebarAccordion}
                className="scale-90"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--text-color-secondary)]">允许选择文字</span>
              <Switch
                size="sm"
                isSelected={textSelectable}
                onValueChange={setTextSelectable}
                className="scale-90"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--text-color-secondary)]">色弱模式</span>
              <Switch
                size="sm"
                isSelected={colorWeakMode}
                onValueChange={setColorWeakMode}
                className="scale-90"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--text-color-secondary)]">点击动效</span>
              <Switch
                size="sm"
                isSelected={clickSparkEnabled}
                onValueChange={setClickSparkEnabled}
                className="scale-90"
              />
            </div>
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="菜单宽度">
          <input
            type="range"
            min={160}
            max={300}
            value={menuWidth}
            onChange={event =>
              setMenuWidth(Number.parseInt(event.target.value, 10))
            }
            className="w-full"
            style={{ accentColor: primaryColor }}
          />
          <div className="mt-1 text-[11px] text-[var(--text-color-secondary)]">
            当前宽度: {menuWidth}px
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="圆角与字体">
          <div className="mb-2 text-xs">
            <div className="mb-1">全局圆角: {borderRadius}px</div>
            <input
              type="range"
              min={0}
              max={24}
              value={borderRadius}
              onChange={event =>
                setBorderRadius(
                  Number.parseInt(event.target.value, 10)
                )
              }
              className="w-full"
              style={{ accentColor: primaryColor }}
            />
          </div>
          <div className="mb-2 text-xs">
            <div className="mb-1">字体大小</div>
            <div className="flex flex-wrap gap-2">
              {[12, 14, 16, 18].map(size => (
                <Button
                  key={size}
                  size="sm"
                  variant="bordered"
                  className={`${buttonClassNames.base} px-2 py-1 rounded-full text-xs h-7 min-w-0 ${fontSize === size ? buttonClassNames.selected : ""}`}
                  onPress={() => setFontSize(size as 12 | 14 | 16 | 18)}
                >
                  {size}px
                </Button>
              ))}
            </div>
          </div>
          <div className="text-xs">
            <div className="mb-1">内容区边距</div>
            <div className="flex flex-wrap gap-2">
              {[8, 16, 24].map(padding => (
                <Button
                  key={padding}
                  size="sm"
                  variant="bordered"
                  className={`${buttonClassNames.base} px-2 py-1 rounded-full text-[11px] h-7 min-w-0 ${contentPadding === padding ? buttonClassNames.selected : ""}`}
                  onPress={() =>
                    setContentPadding(padding as 8 | 16 | 24)
                  }
                >
                  {padding}px
                </Button>
              ))}
            </div>
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="页面切换动效">
          <AdminSelect
            selectedKeys={[pageTransition]}
            onSelectionChange={keys => {
              const value = Array.from(keys)[0] as typeof pageTransition;
              if (value) setPageTransition(value);
            }}
            disallowEmptySelection
            aria-label="页面切换动效"
          >
            <SelectItem key="none" textValue="关闭">
              关闭
            </SelectItem>
            <SelectItem key="fade" textValue="淡入淡出">
              淡入淡出
            </SelectItem>
            <SelectItem key="slide" textValue="滑入滑出">
              滑入滑出
            </SelectItem>
            <SelectItem key="scale" textValue="缩放渐变">
              缩放渐变
            </SelectItem>
            <SelectItem key="layer" textValue="层级切换">
              层级切换
            </SelectItem>
          </AdminSelect>
        </CollapsibleSection>

        <p className="text-[11px] text-[var(--text-color-secondary)] px-1">
          当前版本已接入所有配置字段，点击动效与页面动效已生效，其他功能会在对应布局和页面中逐步完善。
        </p>
      </div>
    </StaggeredMenu>
  );
}

export default Panel;
