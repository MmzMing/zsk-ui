import React from "react";
import ReactDOM from "react-dom/client";
import { HeroUIProvider } from "@heroui/react";
import App from "./App";
import "./assets/styles/index.css";
import { bindDebugConsole } from "./lib/utils";

declare global {
  interface Window {
    global?: typeof globalThis;
  }
}

bindDebugConsole();
window.global = window;

if ("scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <HeroUIProvider>
      <main className="min-h-screen bg-background text-foreground">
        <App />
      </main>
    </HeroUIProvider>
  </React.StrictMode>
);
