export interface StyleChip {
  id: string;
  label: string;
}

export const voiceTypes: StyleChip[] = [
  { id: "female-vocal", label: "Female vocal" },
  { id: "male-vocal", label: "Male vocal" },
  { id: "child-vocal", label: "Child vocal" },
  { id: "choir-vocal", label: "Choir vocal" },
  { id: "group-vocal", label: "Group vocal" },
  { id: "duet-vocal", label: "Duet male–female vocal" },
  { id: "solo-vocal", label: "Solo vocal" },
];
