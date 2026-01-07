import { Settings, ThemeOption, SortOption } from "@/domain/types";
import { t } from "@/i18n";
import { ArrowLeft, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getSettings, updateSettings } from "@/storage/settingsRepo";
import { useState, useEffect } from "react";

const themes: { value: ThemeOption; labelKey: "settings.themeA" | "settings.themeB" | "settings.themeC" }[] = [
  { value: "theme-a", labelKey: "settings.themeA" },
  { value: "theme-b", labelKey: "settings.themeB" },
  { value: "theme-c", labelKey: "settings.themeC" },
];

const sortOptions: { value: SortOption; labelKey: "sort.updatedDesc" | "sort.createdDesc" | "sort.titleAsc" }[] = [
  { value: "updatedDesc", labelKey: "sort.updatedDesc" },
  { value: "createdDesc", labelKey: "sort.createdDesc" },
  { value: "titleAsc", labelKey: "sort.titleAsc" },
];

export default function SettingsPage() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<Settings>(getSettings);

  // Apply theme class
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("theme-a", "theme-b", "theme-c");
    if (settings.theme !== "theme-a") {
      root.classList.add(settings.theme);
    }
  }, [settings.theme]);

  const handleThemeChange = (theme: ThemeOption) => {
    const updated = updateSettings({ theme });
    setSettings(updated);
  };

  const handleSortChange = (defaultSort: SortOption) => {
    const updated = updateSettings({ defaultSort });
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
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            {t("settings.theme")}
          </h2>
          <div className="space-y-2">
            {themes.map((theme) => (
              <button
                key={theme.value}
                onClick={() => handleThemeChange(theme.value)}
                className={`w-full flex items-center justify-between p-4 rounded-lg border transition-colors ${
                  settings.theme === theme.value
                    ? "border-primary bg-accent"
                    : "border-border bg-card hover:bg-accent/50"
                }`}
              >
                <span className="font-medium">{t(theme.labelKey)}</span>
                {settings.theme === theme.value && (
                  <Check className="h-5 w-5 text-primary" />
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Default Sort */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            {t("settings.defaultSort")}
          </h2>
          <div className="space-y-2">
            {sortOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSortChange(option.value)}
                className={`w-full flex items-center justify-between p-4 rounded-lg border transition-colors ${
                  settings.defaultSort === option.value
                    ? "border-primary bg-accent"
                    : "border-border bg-card hover:bg-accent/50"
                }`}
              >
                <span className="font-medium">{t(option.labelKey)}</span>
                {settings.defaultSort === option.value && (
                  <Check className="h-5 w-5 text-primary" />
                )}
              </button>
            ))}
          </div>
        </section>

        {/* About */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            {t("settings.about")}
          </h2>
          <div className="p-4 rounded-lg border border-border bg-card">
            <p className="text-foreground font-medium">{t("app.name")}</p>
            <p className="text-sm text-muted-foreground">{t("settings.version")}</p>
          </div>
        </section>
      </main>
    </div>
  );
}
