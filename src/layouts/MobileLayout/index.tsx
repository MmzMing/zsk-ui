/**
 * 移动端布局组件
 * 提供移动端专用的页面容器，包含最小内边距
 *
 * @module layouts/MobileLayout
 * @author wuhuaming
 * @date 2026-02-18
 * @version 1.0
 */

import React, { ReactNode } from "react";

/**
 * 移动端布局组件属性
 */
type Props = {
  /** 子组件内容 */
  children: ReactNode;
};

/**
 * 移动端布局组件
 * 适用于移动端设备，提供紧凑的内边距布局
 *
 * @param props 组件属性
 * @returns 移动端布局组件
 */
function MobileLayout(props: Props) {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-color)] text-[var(--text-color)]">
      <main className="flex-1 px-3 py-3">{props.children}</main>
    </div>
  );
}

export default MobileLayout;
