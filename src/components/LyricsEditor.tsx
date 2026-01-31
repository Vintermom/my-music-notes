import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { t } from "@/i18n";
import { cn } from "@/lib/utils";
import { List, ChevronRight, ChevronDown, Copy, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface LyricsEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  expanded?: boolean;
  textareaRef?: React.RefObject<HTMLTextAreaElement>;
}

// Section options for quick insert dropdown
const SECTION_OPTIONS = [
  "Intro",
  "Verse 1",
  "Verse 2",
  "Verse 3",
  "Pre-Chorus",
  "Chorus",
  "Post-Chorus",
  "Hook",
  "Bridge",
  "Outro",
];

// Parse sections from lyrics
interface Section {
  id: string;
  name: string;
  startLine: number;
  endLine: number;
}

const parseSections = (lyrics: string): Section[] => {
  const lines = lyrics.split("\n");
  const sections: Section[] = [];
  let currentSection: Section | null = null;

  lines.forEach((line, index) => {
    const sectionMatch = line.match(/^\s*[\[(]([^\]\)]+)[\])]/);
    if (sectionMatch) {
      if (currentSection) {
        currentSection.endLine = index - 1;
        sections.push(currentSection);
      }
      currentSection = {
        id: `section-${index}`,
        name: sectionMatch[1].trim(),
        startLine: index,
        endLine: lines.length - 1,
      };
    }
  });

  if (currentSection) {
    sections.push(currentSection);
  }

  return sections;
};

// Check if a line is a comment
const isCommentLine = (line: string): boolean => {
  const trimmed = line.trim();
  return trimmed.startsWith("//") || trimmed.startsWith("#note:");
};

// Check if a line is a section header
const isSectionHeader = (line: string): boolean => {
  return /^\s*[\[(][^\]\)]+[\])]/.test(line);
};

export function LyricsEditor({
  value,
  onChange,
  placeholder,
  className,
  expanded = true,
  textareaRef: externalRef,
}: LyricsEditorProps) {
  const internalRef = useRef<HTMLTextAreaElement>(null);
  const textareaRef = externalRef || internalRef;
  const containerRef = useRef<HTMLDivElement>(null);

  // Quick section dropdown state
  const [showSectionDropdown, setShowSectionDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [triggerBracket, setTriggerBracket] = useState<"[" | "(">("["  );
  const [triggerPosition, setTriggerPosition] = useState<number>(0);

  // Outline view state
  const [showOutline, setShowOutline] = useState(false);

  // Collapsed sections state (visual only - does not modify text)
  const [collapsedSections, setCollapsedSections] = useState<Set<number>>(new Set());

  // Styled view mode (shows collapsible preview)
  const [showStyledView, setShowStyledView] = useState(false);

  // Parse sections from lyrics
  const sections = useMemo(() => parseSections(value), [value]);

  // Get caret coordinates for dropdown positioning
  const getCaretCoordinates = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return { top: 0, left: 0 };

    const { selectionStart } = textarea;
    const textBeforeCursor = value.substring(0, selectionStart);
    const lines = textBeforeCursor.split("\n");
    const currentLineIndex = lines.length - 1;
    
    const lineHeight = parseInt(window.getComputedStyle(textarea).lineHeight) || 20;
    const top = (currentLineIndex + 1) * lineHeight + textarea.offsetTop - textarea.scrollTop + 4;
    const left = textarea.offsetLeft + 12;

    return { top: Math.min(top, 200), left };
  }, [value, textareaRef]);

  // Handle keydown for "[" or "(" at start of line
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      // Close dropdown on Escape
      if (e.key === "Escape" && showSectionDropdown) {
        e.preventDefault();
        setShowSectionDropdown(false);
        return;
      }

      // Check for "[" or "(" trigger
      if (e.key === "[" || e.key === "(") {
        const { selectionStart } = textarea;
        const textBefore = value.substring(0, selectionStart);
        const lastNewlineIndex = textBefore.lastIndexOf("\n");
        const lineStart = lastNewlineIndex === -1 ? 0 : lastNewlineIndex + 1;
        const textOnCurrentLine = textBefore.substring(lineStart);

        // Only trigger at start of line (empty or only whitespace before cursor)
        if (textOnCurrentLine.trim() === "") {
          e.preventDefault();
          setTriggerBracket(e.key as "[" | "(");
          setTriggerPosition(selectionStart);
          
          // Get position for dropdown
          setTimeout(() => {
            const coords = getCaretCoordinates();
            setDropdownPosition(coords);
            setShowSectionDropdown(true);
          }, 0);
        }
      }
    },
    [value, textareaRef, showSectionDropdown, getCaretCoordinates]
  );

  // Handle section selection from dropdown
  const handleSectionSelect = useCallback(
    (sectionName: string) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const closingBracket = triggerBracket === "[" ? "]" : ")";
      const insertText = `${triggerBracket}${sectionName}${closingBracket}\n`;

      const before = value.substring(0, triggerPosition);
      const after = value.substring(triggerPosition);
      const newValue = before + insertText + after;

      onChange(newValue);
      setShowSectionDropdown(false);

      // Move cursor to new line after insertion
      setTimeout(() => {
        const newPosition = triggerPosition + insertText.length;
        textarea.focus();
        textarea.setSelectionRange(newPosition, newPosition);
      }, 0);
    },
    [value, onChange, triggerBracket, triggerPosition, textareaRef]
  );

  // Close dropdown on outside click
  useEffect(() => {
    if (!showSectionDropdown) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSectionDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showSectionDropdown]);

  // Close outline on outside click
  useEffect(() => {
    if (!showOutline) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowOutline(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showOutline]);

  // Duplicate section handler
  const duplicateSection = useCallback(
    (sectionIndex: number) => {
      const section = sections[sectionIndex];
      if (!section) return;

      const lines = value.split("\n");
      const endLine = sections[sectionIndex + 1]?.startLine ?? lines.length;
      const sectionLines = lines.slice(section.startLine, endLine);
      const sectionText = sectionLines.join("\n");

      // Insert after the section
      const newLines = [...lines];
      newLines.splice(endLine, 0, ...sectionLines);

      onChange(newLines.join("\n"));
      toast.success(t("lyricsEditor.sectionDuplicated"));
    },
    [value, onChange, sections]
  );

  // Toggle section collapse
  const toggleSectionCollapse = useCallback((lineIndex: number) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(lineIndex)) {
        next.delete(lineIndex);
      } else {
        next.add(lineIndex);
      }
      return next;
    });
  }, []);

  // Jump to section from outline
  const jumpToSection = useCallback(
    (lineIndex: number) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      // If in styled view, switch back to edit mode
      if (showStyledView) {
        setShowStyledView(false);
        setCollapsedSections(new Set());
      }

      const lines = value.split("\n");
      let charIndex = 0;
      for (let i = 0; i < lineIndex && i < lines.length; i++) {
        charIndex += lines[i].length + 1; // +1 for newline
      }

      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(charIndex, charIndex);
        
        // Scroll to position
        const lineHeight = parseInt(window.getComputedStyle(textarea).lineHeight) || 20;
        textarea.scrollTop = Math.max(0, lineIndex * lineHeight - 50);
      }, 10);
    },
    [value, textareaRef, showStyledView]
  );

  // Render styled preview with comments and collapsible sections
  const renderStyledContent = useMemo(() => {
    if (!value) return null;

    const lines = value.split("\n");
    const result: React.ReactNode[] = [];
    let skipUntilNextSection = false;
    let currentCollapsedSection: number | null = null;

    lines.forEach((line, index) => {
      const isComment = isCommentLine(line);
      const isHeader = isSectionHeader(line);

      // Check if we're entering a new section
      if (isHeader) {
        skipUntilNextSection = false;
        currentCollapsedSection = null;
        
        if (collapsedSections.has(index)) {
          currentCollapsedSection = index;
          skipUntilNextSection = true;
        }

        const isThisCollapsed = collapsedSections.has(index);
        const sectionIdx = sections.findIndex(s => s.startLine === index);
        
        result.push(
          <div
            key={index}
            className="flex items-center gap-1 cursor-pointer hover:bg-muted/50 rounded px-1 -mx-1 group"
            onClick={() => toggleSectionCollapse(index)}
          >
            {isThisCollapsed ? (
              <ChevronRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            ) : (
              <ChevronDown className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            )}
            <span className="font-medium">{line}</span>
            {sectionIdx !== -1 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 ml-auto"
                onClick={(e) => {
                  e.stopPropagation();
                  duplicateSection(sectionIdx);
                }}
                title={t("lyricsEditor.duplicateSection")}
              >
                <Copy className="h-3 w-3" />
              </Button>
            )}
          </div>
        );
        return;
      }

      // Skip content if we're in a collapsed section
      if (skipUntilNextSection && currentCollapsedSection !== null) {
        return;
      }

      // Render comment lines with distinct styling
      if (isComment) {
        result.push(
          <div key={index} className="text-muted-foreground italic opacity-60 text-sm">
            {line || "\u00A0"}
          </div>
        );
        return;
      }

      // Render normal lines
      result.push(
        <div key={index} className="whitespace-pre-wrap min-h-[1.5em]">
          {line || "\u00A0"}
        </div>
      );
    });

    return result;
  }, [value, collapsedSections, sections, toggleSectionCollapse, duplicateSection]);

  return (
    <div ref={containerRef} className="relative">
      {/* Toolbar - positioned inside the textarea area */}
      <div className="absolute right-2 top-2 z-10 flex gap-0.5 bg-background/80 backdrop-blur-sm rounded-md border border-border/50 p-0.5">
        {/* Styled View Toggle - only show when there are sections */}
        {sections.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-muted"
            onClick={() => {
              setShowStyledView(!showStyledView);
              if (showStyledView) {
                setCollapsedSections(new Set());
              }
            }}
            title={showStyledView ? t("editor.collapse") : t("editor.expand")}
          >
            {showStyledView ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          </Button>
        )}
        {/* Outline Toggle */}
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 hover:bg-muted"
          onClick={() => setShowOutline(!showOutline)}
          title={t("lyricsEditor.toggleOutline")}
        >
          <List className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Outline Panel */}
      {showOutline && sections.length > 0 && (
        <div className="absolute right-0 top-8 z-20 w-40 max-h-48 overflow-y-auto bg-popover border border-border rounded-md shadow-lg p-2">
          <div className="text-xs font-medium text-muted-foreground mb-2">
            {t("lyricsEditor.outline")}
          </div>
          {sections.map((section) => (
            <button
              key={section.id}
              className="w-full text-left text-sm px-2 py-1 rounded hover:bg-muted truncate"
              onClick={() => {
                jumpToSection(section.startLine);
                setShowOutline(false);
              }}
            >
              {section.name}
            </button>
          ))}
        </div>
      )}

      {/* Styled View (collapsible sections) */}
      {showStyledView ? (
        <div
          className={cn(
            "rounded-md border border-input bg-background px-3 py-2 text-sm overflow-y-auto",
            expanded ? "min-h-[180px] max-h-[400px]" : "min-h-[50px] max-h-[150px]",
            className
          )}
        >
          {renderStyledContent}
          {collapsedSections.size > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 h-6 text-xs"
              onClick={() => setCollapsedSections(new Set())}
            >
              {t("lyricsEditor.expandAll")}
            </Button>
          )}
        </div>
      ) : (
        /* Main Textarea */
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none transition-all",
            expanded ? "min-h-[180px]" : "min-h-[50px] max-h-[50px]",
            className
          )}
        />
      )}

      {/* Quick Section Dropdown */}
      {showSectionDropdown && !showStyledView && (
        <div
          className="absolute z-50 w-40 bg-popover border border-border rounded-md shadow-lg py-1 max-h-64 overflow-y-auto"
          style={{
            top: dropdownPosition.top,
            left: dropdownPosition.left,
          }}
        >
          {SECTION_OPTIONS.map((section) => (
            <button
              key={section}
              className="w-full text-left px-3 py-1.5 text-sm hover:bg-muted focus:bg-muted focus:outline-none"
              onClick={() => handleSectionSelect(section)}
            >
              {section}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
