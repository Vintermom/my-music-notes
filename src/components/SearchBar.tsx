import { SortOption } from "@/domain/types";
import { t } from "@/i18n";
import { Search, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  sortOption: SortOption;
  onSortChange: (option: SortOption) => void;
}

const sortOptions: { value: SortOption; labelKey: "sort.updatedDesc" | "sort.createdDesc" | "sort.titleAsc" }[] = [
  { value: "updatedDesc", labelKey: "sort.updatedDesc" },
  { value: "createdDesc", labelKey: "sort.createdDesc" },
  { value: "titleAsc", labelKey: "sort.titleAsc" },
];

export function SearchBar({ value, onChange, sortOption, onSortChange }: SearchBarProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={t("home.searchPlaceholder")}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-9 bg-card border-border"
        />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0">
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {sortOptions.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => onSortChange(option.value)}
              className={sortOption === option.value ? "bg-accent" : ""}
            >
              {t(option.labelKey)}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
