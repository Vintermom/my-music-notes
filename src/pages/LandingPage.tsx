import { useNavigate } from "react-router-dom";
import { Download, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { t, getCurrentLang, setLanguage, type SupportedLang } from "@/i18n";
import { useState } from "react";
import appIcon from "@/assets/app-icon.png";

export default function LandingPage() {
  const navigate = useNavigate();
  const [currentLang, setCurrentLang] = useState<SupportedLang>(getCurrentLang());

  const handleLanguageChange = (lang: SupportedLang) => {
    setLanguage(lang);
    setCurrentLang(lang);
    // Force re-render by updating state
    window.location.reload();
  };

  const handleInstall = () => {
    navigate("/app");
  };

  const handleDemo = () => {
    navigate("/demo");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-orange-50 to-purple-50 flex flex-col">
      {/* Language Switcher */}
      <header className="absolute top-4 right-4 z-10">
        <div className="flex items-center gap-1 bg-white/60 backdrop-blur-sm rounded-full px-2 py-1 shadow-sm">
          {(["en", "sv", "th"] as SupportedLang[]).map((lang) => (
            <button
              key={lang}
              onClick={() => handleLanguageChange(lang)}
              className={`px-2 py-1 text-xs font-medium rounded-full transition-all ${
                currentLang === lang
                  ? "bg-gradient-to-r from-rose-500 to-orange-500 text-white"
                  : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
              }`}
            >
              {lang.toUpperCase()}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Logo / Icon */}
        <div className="mb-12">
          <img 
            src={appIcon} 
            alt="My Music Notes" 
            className="w-[100px] h-[100px] md:w-[130px] md:h-[130px] rounded-3xl shadow-2xl shadow-orange-500/30"
          />
        </div>

        {/* App Name */}
        <h1 className="text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-600 via-orange-600 to-purple-700 mb-4 text-center">
          {t("app.name")}
        </h1>

        {/* Tagline */}
        <p className="text-xl md:text-2xl font-medium text-gray-700 mb-2 text-center">
          {t("landing.tagline")}
        </p>

        {/* Supporting line */}
        <p className="text-base md:text-lg text-gray-500 mb-12 text-center max-w-md">
          {t("landing.supporting")}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs sm:max-w-md">
          <Button
            onClick={handleInstall}
            size="lg"
            className="flex-1 h-14 text-lg font-semibold bg-gradient-to-r from-rose-500 via-orange-500 to-purple-600 hover:from-rose-600 hover:via-orange-600 hover:to-purple-700 shadow-lg shadow-orange-500/25 transition-all hover:shadow-xl hover:shadow-orange-500/30 hover:scale-[1.02]"
          >
            <Download className="w-5 h-5 mr-2" />
            {t("landing.installApp")}
          </Button>
          <Button
            onClick={handleDemo}
            variant="outline"
            size="lg"
            className="flex-1 h-14 text-lg font-semibold border-2 border-orange-300 text-orange-700 hover:bg-orange-50 hover:border-orange-400 transition-all hover:scale-[1.02]"
          >
            <Play className="w-5 h-5 mr-2" />
            {t("landing.tryDemo")}
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center">
        <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
          <span>{t("landing.copyright")}</span>
          <span className="text-gray-300">•</span>
          <a href="#" className="hover:text-gray-700 transition-colors">
            {t("landing.about")}
          </a>
        </div>
      </footer>
    </div>
  );
}
