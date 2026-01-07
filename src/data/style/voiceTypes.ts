export interface StyleChip {
  id: string;
  label: string;
}

export const voiceTypes: StyleChip[] = [
  { id: "female", label: "Female" },
  { id: "male", label: "Male" },
  { id: "child", label: "Child" },
  { id: "choir", label: "Choir" },
  { id: "group", label: "Group" },
  { id: "duet", label: "Duet Male-Female" },
  { id: "solo", label: "Solo" },
];
