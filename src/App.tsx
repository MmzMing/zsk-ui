import React from "react";
import AppRouter from "./router";
import { useTheme } from "./hooks/useTheme";
import { useAppStore } from "./store";
import PageTransition from "./components/PageTransition";
import ClickSpark from "./components/Motion/ClickSpark";
import { ToastProvider } from "@heroui/react";

function App() {
  useTheme();
  const { clickSparkEnabled } = useAppStore();
  return (
    <>
      <ToastProvider />
      <PageTransition />
      {clickSparkEnabled && <ClickSpark />}
      <AppRouter />
    </>
  );
}

export default App;
