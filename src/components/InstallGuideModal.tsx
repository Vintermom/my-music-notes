import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { t } from "@/i18n";

interface InstallGuideModalProps {
  open: boolean;
  onClose: () => void;
}

export function InstallGuideModal({ open, onClose }: InstallGuideModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl font-semibold text-gray-800">
            {t("landing.installGuide.title")}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(85vh-80px)] px-6 pb-6">
          <div className="text-left">
            <p className="text-gray-600 mb-6 text-sm leading-relaxed">
              {t("landing.installGuide.intro")}
            </p>

            {/* Android */}
            <div className="mb-5">
              <h3 className="font-medium text-gray-700 mb-2">
                {t("landing.installGuide.androidTitle")}
              </h3>
              <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                <li>{t("landing.installGuide.androidStep1")}</li>
                <li>{t("landing.installGuide.androidStep2")}</li>
                <li>{t("landing.installGuide.androidStep3")}</li>
              </ol>
            </div>

            {/* iPhone / iPad */}
            <div className="mb-5">
              <h3 className="font-medium text-gray-700 mb-2">
                {t("landing.installGuide.iphoneTitle")}
              </h3>
              <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                <li>{t("landing.installGuide.iphoneStep1")}</li>
                <li>{t("landing.installGuide.iphoneStep2")}</li>
                <li>{t("landing.installGuide.iphoneStep3")}</li>
              </ol>
            </div>

            {/* Desktop */}
            <div className="mb-5">
              <h3 className="font-medium text-gray-700 mb-2">
                {t("landing.installGuide.desktopTitle")}
              </h3>
              <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                <li>{t("landing.installGuide.desktopStep1")}</li>
                <li>{t("landing.installGuide.desktopStep2")}</li>
                <li>{t("landing.installGuide.desktopStep3")}</li>
              </ol>
            </div>

            {/* Important Note */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h3 className="font-medium text-gray-700 mb-2">
                {t("landing.installGuide.noteTitle")}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {t("landing.installGuide.note1")}
              </p>
              <p className="text-sm text-gray-600 leading-relaxed mt-2">
                {t("landing.installGuide.note2")}
              </p>
              <p className="text-sm text-gray-600 leading-relaxed mt-3 font-medium">
                {t("landing.installGuide.recommendation")}
              </p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
