import { useCallback, useMemo, useState } from "react";
import { voiceOptions, environmentOptions } from "@/data/voice";
import type { EnvironmentOption, VoiceOption } from "@/types/voiceOption";

// Voice: multi-select. Environment: single-select.
export function useVoiceSelection() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [environmentId, setEnvironmentId] = useState<string | null>(null);

  const toggleVoice = useCallback((id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  const selectEnvironment = useCallback((id: string) => {
    setEnvironmentId((prev) => (prev === id ? null : id));
  }, []);

  const clear = useCallback(() => {
    setSelectedIds([]);
    setEnvironmentId(null);
  }, []);

  const selectedOptions: VoiceOption[] = useMemo(
    () => selectedIds.map((id) => voiceOptions.find((o) => o.id === id)).filter((o): o is VoiceOption => !!o),
    [selectedIds]
  );

  const selectedEnvironment: EnvironmentOption | null = useMemo(
    () => environmentOptions.find((e) => e.id === environmentId) ?? null,
    [environmentId]
  );

  const isVoiceSelected = useCallback((id: string) => selectedIds.includes(id), [selectedIds]);

  return {
    selectedIds,
    environmentId,
    selectedOptions,
    selectedEnvironment,
    hasSelection: selectedIds.length > 0 || environmentId !== null,
    toggleVoice,
    selectEnvironment,
    isVoiceSelected,
    clear,
  };
}
