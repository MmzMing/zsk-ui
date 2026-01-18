import React from "react";
import AppRouter from "./router";
import { useTheme } from "./hooks/useTheme";
import { useAppStore } from "./store";
import PageTransition from "./components/PageTransition";
import ClickSpark from "./components/Motion/ClickSpark";

function App() {
  useTheme();
  const { clickSparkEnabled } = useAppStore();
  return (
    <>
      <PageTransition />
      {clickSparkEnabled && <ClickSpark />}
      <AppRouter />
    </>
  );
}

export default App;
