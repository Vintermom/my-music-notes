import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { SplashScreen } from "@/components/SplashScreen";
import { getSettings } from "@/storage/settingsRepo";
import { ThemeOption } from "@/domain/types";
import LandingPage from "./pages/LandingPage";
import HomePage from "./pages/HomePage";
import EditorPage from "./pages/EditorPage";
import DemoPage from "./pages/DemoPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Resolve system theme to actual theme class
function resolveSystemTheme(): "theme-n" | "theme-d" {
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "theme-d" : "theme-n";
  }
  return "theme-n";
}

// Get effective theme class
function getEffectiveTheme(theme: ThemeOption): "theme-n" | "theme-a" | "theme-c" | "theme-d" {
  if (theme === "system") {
    return resolveSystemTheme();
  }
  return theme;
}

// Apply theme to document
function applyTheme(theme: ThemeOption) {
  const root = document.documentElement;
  root.classList.remove("theme-n", "theme-a", "theme-c", "theme-d");
  const effectiveTheme = getEffectiveTheme(theme);
  // theme-n uses :root (no class needed)
  if (effectiveTheme !== "theme-n") {
    root.classList.add(effectiveTheme);
  }
}

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  // Apply theme on initial load
  useEffect(() => {
    const settings = getSettings();
    applyTheme(settings.theme);

    // Listen for system theme changes when using system theme
    if (settings.theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => applyTheme(settings.theme);
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, []);

  useEffect(() => {
    // Show splash for 1 second
    const timer = setTimeout(() => setShowSplash(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <HashRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/app" element={<HomePage />} />
            <Route path="/demo" element={<DemoPage />} />
            <Route path="/edit/:id" element={<EditorPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </HashRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
