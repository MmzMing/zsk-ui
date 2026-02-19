/**
 * 空白布局组件
 * 提供最基础的页面容器，仅包含背景色和文本颜色设置
 *
 * @module layouts/BlankLayout
 * @author wuhuaming
 * @date 2026-02-18
 * @version 1.0
 */

import React from "react";
import { Outlet } from "react-router-dom";

/**
 * 空白布局组件
 * 适用于登录页、错误页等不需要导航和侧边栏的页面
 *
 * @returns 空白布局组件
 */
function BlankLayout() {
  return (
    <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)]">
      <Outlet />
    </div>
  );
}

export default BlankLayout;
