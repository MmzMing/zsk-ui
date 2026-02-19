/**
 * QQBot扩展控制台页面
 * @module pages/Admin/Bot/QQBot
 * @description QQBot扩展管理控制台，嵌入第三方管理界面
 */

import React, { useState } from "react";
import { Card, Button } from "@heroui/react";
import { FiExternalLink } from "react-icons/fi";
import { Loading } from "@/components/Loading";

function QQBotPage() {
  const [isLoading, setIsLoading] = useState(true);
  const targetUrl = "http://127.0.0.1:6185/#/extension";

  return (
    <div className="space-y-4 h-full">
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 rounded-full bg-[color-mix(in_srgb,var(--primary-color)_10%,transparent)] px-3 py-1 text-[11px] text-[var(--primary-color)]">
          <span>BOT 控制台 · QQBot 扩展</span>
        </div>
        <div className="flex items-center justify-between">
          <h1 className="text-lg md:text-xl font-semibold tracking-tight">
            QQBot 扩展控制台
          </h1>
          <Button
            size="sm"
            variant="light"
            startContent={<FiExternalLink />}
            as="a"
            href={targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--text-color-secondary)]"
          >
            新窗口打开
          </Button>
        </div>
      </div>
      <Card className="border border-[var(--border-color)] bg-[var(--bg-elevated)]/95 h-[calc(100vh-220px)] relative">
        {isLoading && (
          <Loading 
            className="absolute inset-0 z-10 bg-[var(--bg-elevated)]/50 backdrop-blur-sm"
          />
        )}
        <div className="w-full h-full rounded-[var(--radius-base)] overflow-hidden">
          <iframe
            title="QQBot 扩展"
            src={targetUrl}
            className="w-full h-full"
            style={{ border: "none" }}
            onLoad={() => setIsLoading(false)}
          />
        </div>
      </Card>
    </div>
  );
}

export default QQBotPage;

