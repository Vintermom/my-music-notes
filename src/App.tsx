import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { SplashScreen } from "@/components/SplashScreen";
import { getSettings } from "@/storage/settingsRepo";
import { ThemeOption } from "@/domain/types";
import { PrivacyAcceptanceNotice } from "@/components/PrivacyAcceptanceNotice";
import LandingPage from "./pages/LandingPage";
import HomePage from "./pages/HomePage";
import EditorPage from "./pages/EditorPage";
import DemoPage from "./pages/DemoPage";
import SettingsPage from "./pages/SettingsPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import NotFound from "./pages/NotFound";

// Check if running as installed PWA (standalone mode)
function isStandaloneMode(): boolean {
  // Check display-mode media query
  if (window.matchMedia("(display-mode: standalone)").matches) {
    return true;
  }
  // Check iOS standalone
  if ((navigator as unknown as { standalone?: boolean }).standalone === true) {
    return true;
  }
  return false;
}

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

// Wrapper for landing page that redirects if in standalone mode
function LandingOrRedirect() {
  const isStandalone = isStandaloneMode();
  if (isStandalone) {
    return <Navigate to="/app" replace />;
  }
  return <LandingPage />;
}

// Wrapper for demo page that redirects if in standalone mode
function DemoOrRedirect() {
  const isStandalone = isStandaloneMode();
  if (isStandalone) {
    return <Navigate to="/app" replace />;
  }
  return <DemoPage />;
}

// Routes component
function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingOrRedirect />} />
      <Route path="/app" element={<HomePage />} />
      <Route path="/demo" element={<DemoOrRedirect />} />
      <Route path="/edit/:id" element={<EditorPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/privacy" element={<PrivacyPolicyPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
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
        <PrivacyAcceptanceNotice />
        <HashRouter>
          <AppRoutes />
        </HashRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
