import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { t, getCurrentLang } from "@/i18n";

const AUTO_UPDATE_POPUP_ENABLED = false;

const DISMISS_KEY = "mmn:update-dismissed-session";
const DISMISS_TIME_KEY = "mmn:update-dismissed-at";
const DISMISS_HOURS = 6;

const TEXT = {
  en: {
    title: "New update available",
    message: "A new version of My Music Notes is ready. Please update, then close and reopen the app to use the latest version.",
    update: "Update now",
    later: "Later",
  },
  th: {
    title: "มีอัปเดตใหม่",
    message: "My Music Notes เวอร์ชันใหม่พร้อมใช้งานแล้ว กรุณากดอัปเดต จากนั้นปิดแอพแล้วเปิดใหม่เพื่อใช้เวอร์ชันล่าสุด",
    update: "อัปเดตตอนนี้",
    later: "ภายหลัง",
  },
  sv: {
    title: "Ny uppdatering finns",
    message: "En ny version av My Music Notes är klar. Uppdatera och stäng sedan appen och öppna den igen för att använda den senaste versionen.",
    update: "Uppdatera nu",
    later: "Senare",
  },
};

function getCopy() {
  const lang = getCurrentLang();
  if (lang === "th") return TEXT.th;
  if (lang === "sv") return TEXT.sv;
  return TEXT.en;
}

export function UpdateNotification() {
  const [open, setOpen] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    let cancelled = false;

    const shouldShow = () => {
      if (sessionStorage.getItem(DISMISS_KEY) === "1") return false;
      const ts = localStorage.getItem(DISMISS_TIME_KEY);
      if (ts) {
        const elapsed = Date.now() - Number(ts);
        if (elapsed < DISMISS_HOURS * 3600 * 1000) return false;
      }
      return true;
    };

    const promote = (worker: ServiceWorker | null) => {
      if (cancelled || !worker) return;
      setWaitingWorker(worker);
      if (shouldShow()) setOpen(true);
    };

    navigator.serviceWorker.getRegistration().then((reg) => {
      if (!reg || cancelled) return;

      if (reg.waiting && navigator.serviceWorker.controller) {
        promote(reg.waiting);
      }

      reg.addEventListener("updatefound", () => {
        const installing = reg.installing;
        if (!installing) return;
        installing.addEventListener("statechange", () => {
          if (installing.state === "installed" && navigator.serviceWorker.controller) {
            promote(reg.waiting || installing);
          }
        });
      });

      // Periodic check
      const interval = window.setInterval(() => {
        reg.update().catch(() => {});
      }, 60 * 60 * 1000);

      // Initial check soon after load
      const initial = window.setTimeout(() => {
        reg.update().catch(() => {});
      }, 5000);

      return () => {
        window.clearInterval(interval);
        window.clearTimeout(initial);
      };
    }).catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  const handleUpdate = () => {
    sessionStorage.removeItem(DISMISS_KEY);
    localStorage.removeItem(DISMISS_TIME_KEY);

    if (waitingWorker) {
      const reload = () => window.location.reload();
      navigator.serviceWorker.addEventListener("controllerchange", reload, { once: true });
      try {
        waitingWorker.postMessage({ type: "SKIP_WAITING" });
      } catch {
        // ignore
      }
      // Fallback: reload after a short delay if controllerchange doesn't fire
      window.setTimeout(reload, 1500);
    } else {
      window.location.reload();
    }
    setOpen(false);
  };

  const handleLater = () => {
    sessionStorage.setItem(DISMISS_KEY, "1");
    localStorage.setItem(DISMISS_TIME_KEY, String(Date.now()));
    setOpen(false);
  };

  const copy = getCopy();

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleLater(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{copy.title}</DialogTitle>
          <DialogDescription>{copy.message}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={handleLater}>{copy.later}</Button>
          <Button onClick={handleUpdate}>{copy.update}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
