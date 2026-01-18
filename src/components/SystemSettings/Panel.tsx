import React from "react";
import { Button, Input, Switch, Select, SelectItem } from "@heroui/react";
import { useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { FiSun, FiMoon, FiMonitor, FiRotateCcw } from "react-icons/fi";
import { useAppStore } from "../../store";
import { routes } from "../../router/routes";
import StaggeredMenu from "../Motion/StaggeredMenu";

type Props = {
  visible: boolean;
  onClose: () => void;
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
    resetSettings
  } = useAppStore();

  return (
    <AnimatePresence>
      {props.visible && (
        <motion.div
          className="fixed inset-0 z-40 flex justify-end bg-black/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={props.onClose}
        >
          <motion.div
            className="w-80 max-w-full h-full bg-[var(--bg-elevated)] border-l border-[var(--border-color)] p-4"
            initial={{ x: 320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 320, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            onClick={event => event.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold">系统设置</h3>
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
            <div className="space-y-4 text-sm overflow-y-auto h-full pb-10">
              <StaggeredMenu>
                <div>
                  <div className="mb-2 font-medium">主题风格</div>
                  <div className="flex gap-2">
                    <Button
                      isIconOnly
                      size="sm"
                      variant={themeMode === "light" ? "solid" : "bordered"}
                      className="h-8 w-8 min-w-8"
                      onPress={() => setThemeMode("light")}
                      aria-label="浅色模式"
                    >
                      <FiSun className="text-sm" />
                    </Button>
                    <Button
                      isIconOnly
                      size="sm"
                      variant={themeMode === "dark" ? "solid" : "bordered"}
                      className="h-8 w-8 min-w-8"
                      onPress={() => setThemeMode("dark")}
                      aria-label="深色模式"
                    >
                      <FiMoon className="text-sm" />
                    </Button>
                    <Button
                      isIconOnly
                      size="sm"
                      variant={themeMode === "system" ? "solid" : "bordered"}
                      className="h-8 w-8 min-w-8"
                      onPress={() => setThemeMode("system")}
                      aria-label="跟随系统"
                    >
                      <FiMonitor className="text-sm" />
                    </Button>
                  </div>
                </div>
                {isAdmin && (
                  <div>
                    <div className="mb-2 font-medium">菜单布局（仅后台管理）</div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant={layoutMode === "vertical" ? "solid" : "bordered"}
                        className="h-7 px-3 text-xs"
                        onPress={() => setLayoutMode("vertical")}
                      >
                        垂直
                      </Button>
                      <Button
                        size="sm"
                        variant={layoutMode === "horizontal" ? "solid" : "bordered"}
                        className="h-7 px-3 text-xs"
                        onPress={() => setLayoutMode("horizontal")}
                      >
                        水平
                      </Button>
                      <Button
                        size="sm"
                        variant={layoutMode === "mixed" ? "solid" : "bordered"}
                        className="h-7 px-3 text-xs"
                        onPress={() => setLayoutMode("mixed")}
                      >
                        混合
                      </Button>
                      <Button
                        size="sm"
                        variant={layoutMode === "double" ? "solid" : "bordered"}
                        className="h-7 px-3 text-xs"
                        onPress={() => setLayoutMode("double")}
                      >
                        双列
                      </Button>
                    </div>
                  </div>
                )}
                <div>
                  <div className="mb-2 font-medium">国际化</div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={language === "zh-CN" ? "solid" : "bordered"}
                      className="flex-1 h-8 text-xs"
                      onPress={() => setLanguage("zh-CN")}
                    >
                      中文
                    </Button>
                    <Button
                      size="sm"
                      variant={language === "en-US" ? "solid" : "bordered"}
                      className="flex-1 h-8 text-xs"
                      onPress={() => setLanguage("en-US")}
                    >
                      English
                    </Button>
                  </div>
                </div>
                <div>
                  <div className="mb-2 font-medium">主题配色</div>
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
                </div>
                <div>
                  <div className="mb-2 font-medium">盒子样式</div>
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
                </div>
                <div>
                  <div className="mb-2 font-medium">自定义布局模式</div>
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
                </div>
                <div>
                  <div className="mb-2 font-medium">菜单宽度</div>
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
                </div>
                <div>
                  <div className="mb-2 font-medium">圆角与字体</div>
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
                          variant={fontSize === size ? "solid" : "bordered"}
                          className="px-2 py-1 rounded-full text-xs h-7 min-w-0"
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
                          variant={contentPadding === padding ? "solid" : "bordered"}
                          className="px-2 py-1 rounded-full text-[11px] h-7 min-w-0"
                          onPress={() =>
                            setContentPadding(padding as 8 | 16 | 24)
                          }
                        >
                          {padding}px
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="mb-2 font-medium">页面切换动效</div>
                  <Select
                    size="sm"
                    variant="bordered"
                    value={pageTransition}
                    onChange={event =>
                      setPageTransition(
                        event.target.value as
                          | "none"
                          | "fade"
                          | "slide"
                          | "scale"
                          | "layer"
                      )
                    }
                    classNames={{
                      trigger: "h-8 min-h-8 bg-[var(--bg-elevated)] border-[var(--border-color)]",
                      value: "text-xs"
                    }}
                    aria-label="页面切换动效"
                  >
                    <SelectItem key="none" id="none" textValue="关闭">
                      关闭
                    </SelectItem>
                    <SelectItem key="fade" id="fade" textValue="淡入淡出">
                      淡入淡出
                    </SelectItem>
                    <SelectItem key="slide" id="slide" textValue="滑入滑出">
                      滑入滑出
                    </SelectItem>
                    <SelectItem key="scale" id="scale" textValue="缩放渐变">
                      缩放渐变
                    </SelectItem>
                    <SelectItem key="layer" id="layer" textValue="层级切换">
                      层级切换
                    </SelectItem>
                  </Select>
                </div>
                <p className="text-[11px] text-[var(--text-color-secondary)]">
                  当前版本已接入所有配置字段，点击动效与页面动效已生效，其他功能会在对应布局和页面中逐步完善。
                </p>
              </StaggeredMenu>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default Panel;
