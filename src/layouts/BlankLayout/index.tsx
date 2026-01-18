import React from "react";
import { Outlet } from "react-router-dom";

function BlankLayout() {
  return (
    <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)]">
      <Outlet />
    </div>
  );
}

export default BlankLayout;
