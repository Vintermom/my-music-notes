import { NoteColor } from "@/domain/types";
import { t } from "@/i18n";
import { Check } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface ColorPickerProps {
  value: NoteColor;
  onChange: (color: NoteColor) => void;
  children: React.ReactNode;
}

const colors: { value: NoteColor; labelKey: "color.default" | "color.cream" | "color.pink" | "color.blue" | "color.green" | "color.yellow" | "color.purple" | "color.orange"; class: string }[] = [
  { value: "default", labelKey: "color.default", class: "bg-note-default" },
  { value: "cream", labelKey: "color.cream", class: "bg-note-cream" },
  { value: "pink", labelKey: "color.pink", class: "bg-note-pink" },
  { value: "blue", labelKey: "color.blue", class: "bg-note-blue" },
  { value: "green", labelKey: "color.green", class: "bg-note-green" },
  { value: "yellow", labelKey: "color.yellow", class: "bg-note-yellow" },
  { value: "purple", labelKey: "color.purple", class: "bg-note-purple" },
  { value: "orange", labelKey: "color.orange", class: "bg-note-orange" },
];

export function ColorPicker({ value, onChange, children }: ColorPickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-auto p-3" align="start">
        <p className="text-xs font-medium text-muted-foreground mb-2">
          {t("editor.backgroundColor")}
        </p>
        <div className="flex gap-2">
          {colors.map((color) => (
            <Button
              key={color.value}
              variant="ghost"
              size="icon"
              className={`h-8 w-8 rounded-full ${color.class} border-2 ${
                value === color.value
                  ? "border-primary"
                  : "border-transparent hover:border-border"
              }`}
              onClick={() => onChange(color.value)}
            >
              {value === color.value && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
