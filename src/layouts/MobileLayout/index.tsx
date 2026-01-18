import React, { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

function MobileLayout(props: Props) {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-color)] text-[var(--text-color)]">
      <main className="flex-1 px-3 py-3">{props.children}</main>
    </div>
  );
}

export default MobileLayout;

