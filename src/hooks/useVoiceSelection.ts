import { useCallback, useMemo, useState } from "react";
import { voiceOptions, environmentOptions, quickVoiceControls } from "@/data/voice";
import type { EnvironmentOption, QuickVoiceControl, VoiceOption } from "@/types/voiceOption";

// Voice + Quick controls: multi-select. Environment: single-select.
export function useVoiceSelection() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [environmentId, setEnvironmentId] = useState<string | null>(null);
  const [selectedQuickIds, setSelectedQuickIds] = useState<string[]>([]);

  const toggleVoice = useCallback((id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  const toggleQuick = useCallback((id: string) => {
    setSelectedQuickIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  const selectEnvironment = useCallback((id: string) => {
    setEnvironmentId((prev) => (prev === id ? null : id));
  }, []);

  const clear = useCallback(() => {
    setSelectedIds([]);
    setEnvironmentId(null);
    setSelectedQuickIds([]);
  }, []);

  const selectedOptions: VoiceOption[] = useMemo(
    () => selectedIds.map((id) => voiceOptions.find((o) => o.id === id)).filter((o): o is VoiceOption => !!o),
    [selectedIds]
  );

  const selectedQuickControls: QuickVoiceControl[] = useMemo(
    () =>
      selectedQuickIds
        .map((id) => quickVoiceControls.find((q) => q.id === id))
        .filter((q): q is QuickVoiceControl => !!q),
    [selectedQuickIds]
  );

  const selectedEnvironment: EnvironmentOption | null = useMemo(
    () => environmentOptions.find((e) => e.id === environmentId) ?? null,
    [environmentId]
  );

  const isVoiceSelected = useCallback((id: string) => selectedIds.includes(id), [selectedIds]);
  const isQuickSelected = useCallback((id: string) => selectedQuickIds.includes(id), [selectedQuickIds]);

  return {
    selectedIds,
    environmentId,
    selectedQuickIds,
    selectedOptions,
    selectedQuickControls,
    selectedEnvironment,
    hasSelection: selectedIds.length > 0 || environmentId !== null || selectedQuickIds.length > 0,
    toggleVoice,
    toggleQuick,
    selectEnvironment,
    isVoiceSelected,
    isQuickSelected,
    clear,
  };
}
