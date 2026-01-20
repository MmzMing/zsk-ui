import React from "react";
import { Card } from "@heroui/react";

function QQBotPage() {
  return (
    <div className="space-y-4 h-full">
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 rounded-full bg-[color-mix(in_srgb,var(--primary-color)_10%,transparent)] px-3 py-1 text-[11px] text-[var(--primary-color)]">
          <span>BOT 控制台 · QQBot 扩展</span>
        </div>
        <h1 className="text-lg md:text-xl font-semibold tracking-tight">
          QQBot 扩展控制台
        </h1>
      </div>
      <Card className="border border-[var(--border-color)] bg-[var(--bg-elevated)]/95 h-[calc(100vh-220px)]">
        <div className="w-full h-full rounded-[var(--radius-base)] overflow-hidden">
          <iframe
            title="QQBot 扩展"
            src="http://localhost:6185/#/extension"
            className="w-full h-full"
            style={{ border: "none" }}
          />
        </div>
      </Card>
    </div>
  );
}

export default QQBotPage;

