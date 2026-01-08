import { Settings, ThemeOption } from "@/domain/types";
import { t } from "@/i18n";
import { ArrowLeft, Check, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getSettings, updateSettings } from "@/storage/settingsRepo";
import { useState, useEffect } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

// Theme config with color dots (HSL values matching index.css)
const themes: { 
  value: ThemeOption; 
  labelKey: "settings.themeA" | "settings.themeB" | "settings.themeD";
  dotColor: string;
}[] = [
  { value: "theme-a", labelKey: "settings.themeA", dotColor: "#EED3A1" },  // Warm cream
  { value: "theme-b", labelKey: "settings.themeB", dotColor: "#7A8A9A" },  // Cool slate
  { value: "theme-d", labelKey: "settings.themeD", dotColor: "#3A4552" },  // Soft dark
];

export default function SettingsPage() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<Settings>(getSettings);

  // Apply theme class
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("theme-a", "theme-b", "theme-c", "theme-d", "theme-e");
    if (settings.theme !== "theme-a") {
      root.classList.add(settings.theme);
    }
  }, [settings.theme]);

  const handleThemeChange = (theme: ThemeOption) => {
    const updated = updateSettings({ theme });
    setSettings(updated);
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
        {/* Theme Selection */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            {t("settings.theme")}
          </h2>
          <div className="space-y-1.5">
            {themes.map((theme) => (
              <button
                key={theme.value}
                onClick={() => handleThemeChange(theme.value)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md border transition-colors ${
                  settings.theme === theme.value
                    ? "border-primary/50 bg-accent/50"
                    : "border-transparent hover:bg-accent/30"
                }`}
              >
                {/* Color dot */}
                <span 
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: theme.dotColor }}
                />
                <span className="text-sm flex-1 text-left">{t(theme.labelKey)}</span>
                {settings.theme === theme.value && (
                  <Check className="h-4 w-4 text-primary shrink-0" />
                )}
              </button>
            ))}
          </div>
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

        {/* About */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            {t("settings.about")}
          </h2>
          <div className="p-4 rounded-lg border border-border bg-card space-y-2">
            <p className="text-foreground font-medium">{t("app.name")}</p>
            <p className="text-sm text-muted-foreground">{t("settings.version")}</p>
            <p className="text-xs text-muted-foreground mt-3">{t("settings.privacyNote")}</p>
          </div>
        </section>
      </main>
    </div>
  );
}
