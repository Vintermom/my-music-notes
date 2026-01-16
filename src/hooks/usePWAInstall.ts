import { useState, useEffect, useCallback, useRef } from "react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

type InstallState = "idle" | "installable" | "installed" | "not-supported";

// Global storage for the deferred prompt to persist across component mounts
let globalDeferredPrompt: BeforeInstallPromptEvent | null = null;
let globalListenerAdded = false;

export function usePWAInstall() {
  const [installState, setInstallState] = useState<InstallState>(() => {
    // Check if already installed on initial render
    if (window.matchMedia("(display-mode: standalone)").matches) {
      return "installed";
    }
    if ((navigator as unknown as { standalone?: boolean }).standalone === true) {
      return "installed";
    }
    // If we already have a stored prompt, we're installable
    if (globalDeferredPrompt) {
      return "installable";
    }
    return "idle";
  });
  
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(globalDeferredPrompt);

  useEffect(() => {
    // Skip if already installed
    if (installState === "installed") return;

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Store the event globally and in ref
      const promptEvent = e as BeforeInstallPromptEvent;
      globalDeferredPrompt = promptEvent;
      deferredPromptRef.current = promptEvent;
      setInstallState("installable");
    };

    const handleAppInstalled = () => {
      setInstallState("installed");
      globalDeferredPrompt = null;
      deferredPromptRef.current = null;
    };

    // Only add global listener once
    if (!globalListenerAdded) {
      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.addEventListener("appinstalled", handleAppInstalled);
      globalListenerAdded = true;
    }

    // Listen for display mode changes
    const displayModeQuery = window.matchMedia("(display-mode: standalone)");
    const handleDisplayModeChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setInstallState("installed");
        globalDeferredPrompt = null;
        deferredPromptRef.current = null;
      }
    };
    displayModeQuery.addEventListener("change", handleDisplayModeChange);

    // After a delay, if no prompt event and still idle, mark as not-supported
    // Use longer timeout to give browser time to fire the event
    const timeout = setTimeout(() => {
      if (!globalDeferredPrompt && installState === "idle") {
        setInstallState("not-supported");
      }
    }, 5000);

    return () => {
      displayModeQuery.removeEventListener("change", handleDisplayModeChange);
      clearTimeout(timeout);
    };
  }, [installState]);

  const promptInstall = useCallback(async (): Promise<boolean> => {
    const prompt = deferredPromptRef.current || globalDeferredPrompt;
    if (!prompt) {
      return false;
    }

    try {
      await prompt.prompt();
      const { outcome } = await prompt.userChoice;
      
      if (outcome === "accepted") {
        setInstallState("installed");
        globalDeferredPrompt = null;
        deferredPromptRef.current = null;
        return true;
      }
      return false;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("[PWA] Install prompt error:", error);
      }
      return false;
    }
  }, []);

  return {
    installState,
    canInstall: installState === "installable",
    isInstalled: installState === "installed",
    promptInstall,
  };
}
