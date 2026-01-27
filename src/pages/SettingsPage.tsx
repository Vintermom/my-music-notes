import { Settings, ThemeOption } from "@/domain/types";
import { t } from "@/i18n";
import { APP_VERSION } from "@/lib/appVersion";
import { ArrowLeft, Check, ChevronRight, Upload, Monitor, Sun, Moon, Leaf, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getSettings, updateSettings } from "@/storage/settingsRepo";
import { useState, useEffect } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { ImportDialog } from "@/components/ImportDialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

// Theme config with color dots and icons
const themes: { 
  value: ThemeOption; 
  labelKey: "settings.themeSystem" | "settings.themeA" | "settings.themeC" | "settings.themeD";
  dotColor: string;
  icon: React.ElementType;
}[] = [
  { value: "system", labelKey: "settings.themeSystem", dotColor: "#888888", icon: Monitor },
  { value: "theme-a", labelKey: "settings.themeA", dotColor: "#F2EFDB", icon: Sun },
  { value: "theme-c", labelKey: "settings.themeC", dotColor: "#D2DEBF", icon: Leaf },
  { value: "theme-d", labelKey: "settings.themeD", dotColor: "#1a1d24", icon: Moon },
];

// Resolve system theme to actual theme class
// System Light → Neutral (no class = :root), System Dark → theme-d
function resolveSystemTheme(): "theme-n" | "theme-d" {
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "theme-d" : "theme-n";
  }
  return "theme-n";
}

// Get the effective theme class (resolved from system if needed)
function getEffectiveTheme(theme: ThemeOption): "theme-n" | "theme-a" | "theme-c" | "theme-d" {
  if (theme === "system") {
    return resolveSystemTheme();
  }
  return theme;
}

// Get display label for current theme
function getThemeDisplayLabel(theme: ThemeOption): string {
  if (theme === "system") {
    const resolved = resolveSystemTheme();
    const resolvedLabel = resolved === "theme-d" ? t("settings.themeD") : "Light";
    return `${t("settings.themeSystem")} (${resolvedLabel})`;
  }
  const themeConfig = themes.find(th => th.value === theme);
  return themeConfig ? t(themeConfig.labelKey) : t("settings.themeA");
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<Settings>(getSettings);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [themePickerOpen, setThemePickerOpen] = useState(false);

  // Apply theme class and listen for system theme changes
  useEffect(() => {
    const applyTheme = () => {
      const root = document.documentElement;
      root.classList.remove("theme-n", "theme-a", "theme-c", "theme-d");
      const effectiveTheme = getEffectiveTheme(settings.theme);
      // theme-n uses :root (no class needed), others add class
      if (effectiveTheme !== "theme-n") {
        root.classList.add(effectiveTheme);
      }
    };

    applyTheme();

    // Listen for system theme changes when using system theme
    if (settings.theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => applyTheme();
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [settings.theme]);

  const handleThemeChange = (theme: ThemeOption) => {
    const updated = updateSettings({ theme });
    setSettings(updated);
    setThemePickerOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="container max-w-xl mx-auto px-4 h-14 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">{t("settings.title")}</h1>
        </div>
      </header>

      {/* Content */}
      <main className="container max-w-xl mx-auto px-4 py-6 space-y-8">
        {/* Theme Selection - Single menu item with drawer */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            {t("settings.theme")}
          </h2>
          <Drawer open={themePickerOpen} onOpenChange={setThemePickerOpen}>
            <DrawerTrigger asChild>
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md border border-border bg-card hover:bg-accent/30 transition-colors">
                <span className="text-sm flex-1 text-left">{t("settings.theme")}</span>
                <span className="text-sm text-muted-foreground">{getThemeDisplayLabel(settings.theme)}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>{t("settings.theme")}</DrawerTitle>
              </DrawerHeader>
              <div className="px-4 pb-6 space-y-1">
                {themes.map((theme) => {
                  const Icon = theme.icon;
                  return (
                    <button
                      key={theme.value}
                      onClick={() => handleThemeChange(theme.value)}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-md transition-colors ${
                        settings.theme === theme.value
                          ? "bg-accent"
                          : "hover:bg-accent/50"
                      }`}
                    >
                      {/* Color dot */}
                      <span 
                        className="w-4 h-4 rounded-full shrink-0 border border-border/50"
                        style={{ backgroundColor: theme.dotColor }}
                      />
                      {/* Icon */}
                      <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-sm flex-1 text-left">{t(theme.labelKey)}</span>
                      {settings.theme === theme.value && (
                        <Check className="h-4 w-4 text-primary shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </DrawerContent>
          </Drawer>
        </section>

        {/* Import JSON */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            {t("menu.importJson")}
          </h2>
          <button
            onClick={() => setImportDialogOpen(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md border border-border bg-card hover:bg-accent/30 transition-colors"
          >
            <Upload className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm flex-1 text-left">{t("menu.importJson")}</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </section>

        {/* Help */}
        <section className="space-y-4">
          <Collapsible>
            <CollapsibleTrigger className="w-full flex items-center justify-between text-sm font-semibold text-muted-foreground uppercase tracking-wider group">
              <span>{t("settings.help")}</span>
              <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4">
              <div className="p-4 rounded-lg border border-border bg-card space-y-3 text-sm text-foreground">
                <p className="font-medium">{t("settings.quickGuide")}</p>
                <ul className="space-y-2 text-muted-foreground list-disc list-inside">
                  <li>{t("settings.helpLocal")}</li>
                  <li>{t("settings.helpSection")}</li>
                  <li>{t("settings.helpVocal")}</li>
                  <li>{t("settings.helpStyle")}</li>
                  <li>{t("settings.helpExport")}</li>
                  <li>{t("settings.helpBackup")}</li>
                </ul>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </section>

        {/* Privacy Policy */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Privacy
          </h2>
          <button
            onClick={() => navigate("/privacy")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md border border-border bg-card hover:bg-accent/30 transition-colors"
          >
            <Shield className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm flex-1 text-left">Privacy Policy</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </section>

        {/* About */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            {t("settings.about")}
          </h2>
          <div className="p-4 rounded-lg border border-border bg-card space-y-2">
            <p className="text-foreground font-medium">{t("app.name")}</p>
            <p className="text-sm text-muted-foreground">{t("settings.version")} {APP_VERSION}</p>
            <p className="text-xs text-muted-foreground mt-3">{t("settings.privacyNote")}</p>
          </div>
        </section>
      </main>

      {/* Import Dialog */}
      <ImportDialog open={importDialogOpen} onOpenChange={setImportDialogOpen} />
    </div>
  );
}
