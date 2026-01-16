import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getCurrentLang } from "@/i18n";
import { Monitor, Smartphone } from "lucide-react";

interface InstallHintDialogProps {
  open: boolean;
  onClose: () => void;
  isInstalled: boolean;
}

type Platform = "desktop" | "android" | "ios";

function detectPlatform(): Platform {
  const ua = navigator.userAgent.toLowerCase();
  
  // iOS detection
  if (/iphone|ipad|ipod/.test(ua)) {
    return "ios";
  }
  
  // Android detection
  if (/android/.test(ua)) {
    return "android";
  }
  
  // Default to desktop
  return "desktop";
}

// Translations for install hints
const installHintTexts = {
  en: {
    title: "Install My Music Notes",
    alreadyInstalled: "The app is already installed on your device.",
    desktop: "Click the Install icon in the address bar, or open the browser menu and choose \"Install App\".",
    android: "Open the browser menu and tap \"Install app\" or \"Add to Home screen\".",
    ios: "Tap Share, then choose \"Add to Home Screen\".",
    close: "OK",
  },
  sv: {
    title: "Installera My Music Notes",
    alreadyInstalled: "Appen är redan installerad på din enhet.",
    desktop: "Klicka på Installera-ikonen i adressfältet eller välj \"Installera app\" i webbläsarens meny.",
    android: "Öppna webbläsarens meny och välj \"Installera app\" eller \"Lägg till på startskärmen\".",
    ios: "Tryck på Dela och välj \"Lägg till på hemskärmen\".",
    close: "OK",
  },
  th: {
    title: "ติดตั้ง My Music Notes",
    alreadyInstalled: "แอปนี้ถูกติดตั้งบนอุปกรณ์ของคุณแล้ว",
    desktop: "คลิกไอคอนติดตั้งที่แถบที่อยู่ หรือเปิดเมนูแล้วเลือก \"ติดตั้งแอป\"",
    android: "เปิดเมนูแล้วเลือก \"ติดตั้งแอป\" หรือ \"เพิ่มไปยังหน้าจอหลัก\"",
    ios: "กดปุ่มแชร์ แล้วเลือก \"เพิ่มไปยังหน้าจอหลัก\"",
    close: "ตกลง",
  },
};

export function InstallHintDialog({ open, onClose, isInstalled }: InstallHintDialogProps) {
  const lang = getCurrentLang();
  const texts = installHintTexts[lang] || installHintTexts.en;
  const platform = detectPlatform();

  const getHintText = () => {
    if (isInstalled) {
      return texts.alreadyInstalled;
    }
    return texts[platform];
  };

  const getIcon = () => {
    if (platform === "desktop") {
      return <Monitor className="w-5 h-5 mr-2" />;
    }
    return <Smartphone className="w-5 h-5 mr-2" />;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            {getIcon()}
            {texts.title}
          </DialogTitle>
          <DialogDescription className="pt-4 text-base">
            {getHintText()}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end pt-4">
          <Button onClick={onClose} variant="default">
            {texts.close}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
