import { getCurrentLang } from "@/i18n";
import type { ProductionControlStrings } from "../types/productionControl.types";
import { productionControlEn } from "./productionControl.en";
import { productionControlTh } from "./productionControl.th";
import { productionControlSv } from "./productionControl.sv";

// Feature-local translations so the existing global locale files stay untouched.
const strings: Record<string, ProductionControlStrings> = {
  en: productionControlEn,
  th: productionControlTh,
  sv: productionControlSv,
};

// Production Control translator. Falls back to English for other app languages.
export function pcT(key: string, lang: string = getCurrentLang()): string {
  return strings[lang]?.[key] || productionControlEn[key] || key;
}
