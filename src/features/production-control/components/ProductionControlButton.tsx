import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { pcT } from "../i18n";

interface ProductionControlButtonProps {
  onClick: () => void;
}

// Matches the existing "+ Voice" / "+ Environment" control styling exactly.
export function ProductionControlButton({ onClick }: ProductionControlButtonProps) {
  return (
    <Button variant="ghost" size="sm" onClick={onClick} className="h-6 px-1.5 text-xs no-print">
      <Plus className="h-3 w-3 mr-0.5" />
      {pcT("pc.button")}
    </Button>
  );
}
