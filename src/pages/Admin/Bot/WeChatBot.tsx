import React from "react";
import UndevelopedPage from "@/components/Undeveloped";

function WeChatBotPage() {
  return (
    <div className="space-y-4 h-full">
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 rounded-full bg-[color-mix(in_srgb,var(--primary-color)_10%,transparent)] px-3 py-1 text-[11px] text-[var(--primary-color)]">
          <span>BOT 控制台 · WeChatBot</span>
        </div>
        <h1 className="text-lg md:text-xl font-semibold tracking-tight">
          WeChatBot 控制台
        </h1>
        <p className="text-xs text-[var(--text-color-secondary)]">
          当前功能尚未接入，仅作为占位页面展示，不会跳转到 404。
        </p>
      </div>
      <UndevelopedPage 
        title="WeChatBot" 
        description="WeChatBot 功能开发中，敬请期待。" 
        className="h-[calc(100vh-220px)] border border-[var(--border-color)] bg-[var(--bg-elevated)]/95"
      />
    </div>
  );
}

export default WeChatBotPage;
