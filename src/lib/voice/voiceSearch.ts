import type { EnvironmentOption, QuickVoiceControl, VoiceCategoryFilter, VoiceOption } from "@/types/voiceOption";

function normalize(s: string): string {
  return s.toLowerCase().trim();
}

// Collect all searchable strings for an option: English label, prompt, every localized hint,
// commonGenres (informational, never a filter), and every language's search keywords
// (so a Thai or Swedish query can find an English option).
function searchableText(option: VoiceOption | EnvironmentOption | QuickVoiceControl): string[] {
  const parts: string[] = [option.label, option.prompt, ...(Object.values(option.hint).filter(Boolean) as string[])];
  if ("commonGenres" in option && option.commonGenres) {
    parts.push(...option.commonGenres);
  }
  if (option.searchKeywords) {
    for (const list of Object.values(option.searchKeywords)) {
      if (list) parts.push(...list);
    }
  }
  return parts.map(normalize);
}

export function matchesQuery(option: VoiceOption | EnvironmentOption | QuickVoiceControl, query: string): boolean {
  const q = normalize(query);
  if (!q) return true;
  return searchableText(option).some((text) => text.includes(q));
}

export function filterVoiceOptions(
  options: VoiceOption[],
  query: string,
  category: VoiceCategoryFilter
): VoiceOption[] {
  return options.filter((o) => {
    if (category !== "All" && category !== "Environment" && o.category !== category) return false;
    if (category === "Environment") return false;
    return matchesQuery(o, query);
  });
}

export function filterEnvironments(options: EnvironmentOption[], query: string): EnvironmentOption[] {
  return options.filter((o) => matchesQuery(o, query));
}

export function filterQuickControls(options: QuickVoiceControl[], query: string): QuickVoiceControl[] {
  return options.filter((o) => matchesQuery(o, query));
}
