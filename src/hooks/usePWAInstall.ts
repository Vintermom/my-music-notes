import { useState, useEffect, useCallback } from "react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

type InstallState = "idle" | "installable" | "installed" | "not-supported";

export function usePWAInstall() {
  const [installState, setInstallState] = useState<InstallState>("idle");
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  // Check if app is already installed
  const checkInstalled = useCallback(() => {
    // Check display-mode
    if (window.matchMedia("(display-mode: standalone)").matches) {
      return true;
    }
    // Check iOS standalone
    if ((navigator as unknown as { standalone?: boolean }).standalone === true) {
      return true;
    }
    return false;
  }, []);

  useEffect(() => {
    // Initial check
    if (checkInstalled()) {
      setInstallState("installed");
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Store the event for later use
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setInstallState("installable");
    };

    const handleAppInstalled = () => {
      setInstallState("installed");
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    // Listen for display mode changes
    const displayModeQuery = window.matchMedia("(display-mode: standalone)");
    const handleDisplayModeChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setInstallState("installed");
      }
    };
    displayModeQuery.addEventListener("change", handleDisplayModeChange);

    // After a short delay, if no prompt event, mark as not-supported
    const timeout = setTimeout(() => {
      if (!deferredPrompt && installState === "idle") {
        setInstallState("not-supported");
      }
    }, 3000);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
      displayModeQuery.removeEventListener("change", handleDisplayModeChange);
      clearTimeout(timeout);
    };
  }, [checkInstalled, deferredPrompt, installState]);

  const promptInstall = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt) {
      return false;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === "accepted") {
        setInstallState("installed");
        setDeferredPrompt(null);
        return true;
      }
      return false;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("[PWA] Install prompt error:", error);
      }
      return false;
    }
  }, [deferredPrompt]);

  return {
    installState,
    canInstall: installState === "installable",
    isInstalled: installState === "installed",
    promptInstall,
  };
}
