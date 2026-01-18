import React from "react";
import ScrollVelocityText from "../Motion/ScrollVelocityText";

function UndevelopedPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[calc(100vh-200px)] overflow-hidden bg-[var(--bg-color)]">
      <ScrollVelocityText
        text="尚未开发"
        className="text-6xl md:text-8xl font-bold text-[var(--text-color-secondary)] opacity-20"
      />
      <div className="mt-8 text-center text-[var(--text-color-secondary)]">
        <p className="text-lg">功能正在建设中，敬请期待...</p>
      </div>
    </div>
  );
}

export default UndevelopedPage;
