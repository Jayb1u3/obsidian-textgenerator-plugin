/**
 * FloatingCapsule - Improved toolbar component with hover logic and better UX
 * Features:
 * - Single container architecture (no separate pill + expanded state)
 * - Better hover/focus handling with visual feedback
 * - Prevents focus loss with onMouseDown preventDefault
 * - Integrated SelectionManager for reliable text operations
 * - Accessible with keyboard navigation and ARIA labels
 */

import React, { useRef, useMemo } from "react";
import { MarkdownView, Editor } from "obsidian";
import { EditorView } from "@codemirror/view";
import TextGeneratorPlugin from "#/main";
import { SelectionManager } from "./SelectionManager";
import { MainToolbar } from "./mainToolbar";
import AskAIToolbar from "./AskAIToolbar";

interface FloatingCapsuleProps {
  view: MarkdownView;
  editor: Editor;
  position: { top: number; left: number };
  onClose: () => void;
  plugin?: TextGeneratorPlugin | null;s
}

export const FloatingCapsule: React.FC<FloatingCapsuleProps> = ({
  view,
  editor,
  position,
  onClose,
  plugin,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [mode, setMode] = React.useState<"main" | "askAi">("main");
  const [lastText, setLastText] = React.useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize SelectionManager for reliable text read/write
  const selectionMgr = useMemo(() => new SelectionManager(editor), [editor]);

  // @ts-ignore - Obsidian's Editor has a cm property which is the CodeMirror EditorView
  const editorView = editor.cm as EditorView;

  // Calculate position anchored to right margin of the line
  const capsuleStyle = useMemo(() => {
    const cursorCoords = editor.coordsAtPos(editor.getCursor("to"));
    if (!cursorCoords) return { display: "none" as const };

    return {
      position: "fixed" as const,
      top: `${cursorCoords.top}px`,
      right: "20px",
      zIndex: 50,
      transform: "translateY(-50%)",
    };
  }, [editor, position]);

  // Prevent default on MouseDown to avoid focus loss
  const handlePreventFocusLoss = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Handle action with reliable selection reading
  const handleAction = (actionName: string) => {
    const selectedText = selectionMgr.getSelection();

    switch (actionName) {
      case "askAi":
        if (selectedText) {
          setMode("askAi");
          setIsExpanded(true);
        } else {
          console.warn("No text selected for Ask AI");
        }
        break;

      case "copy":
        if (selectedText) {
          navigator.clipboard.writeText(selectedText).catch((err) => {
            console.error("Failed to copy:", err);
          });
          // Close after copy
          setIsExpanded(false);
          setMode("main");
          onClose();
        }
        break;

      default:
        break;
    }
  };

  // Render content based on current mode
  const renderContent = () => {
    if (mode === "askAi") {
      return (
        <AskAIToolbar
          view={view}
          editor={editor}
          position={{ top: 0, left: 0 }}
          onClose={() => {
            setMode("main");
            setIsExpanded(false);
            onClose();
          }}
          setShowingItem={() => {}}
          toolbarRef={containerRef}
          setLastText={setLastText}
          plugin={plugin}
        />
      );
    }

    return (
      <MainToolbar
        view={editorView}
        position={{ top: 0, left: 0 }}
        onClose={() => {
          setIsExpanded(false);
          onClose();
        }}
        setShowingItem={(mode: string) => {
          if (mode === "askAi") {
            handleAction("askAi");
          }
        }}
        lastText={lastText}
        setLastText={setLastText}
      />
    );
  };

  return (
    <div
      ref={containerRef}
      className={`plug-tg-floating-capsule plug-tg-pointer-events-auto plug-tg-flex plug-tg-items-center plug-tg-gap-1 plug-tg-rounded-lg plug-tg-text-white plug-tg-shadow-lg plug-tg-transition-all plug-tg-duration-200 plug-tg-ease-in-out ${
        isExpanded ? "is-expanded plug-tg-bg-[#2d2d2d]" : "is-collapsed"
      }`}
      style={capsuleStyle}
      onMouseEnter={() => {
        if (!selectionMgr.hasSelection()) return; // Don't expand without selection
        setIsExpanded(true);
      }}
      onMouseLeave={() => {
        if (mode === "main") setIsExpanded(false);
      }}
      onMouseDown={handlePreventFocusLoss}
      role="toolbar"
      aria-label="Text Generator Toolbar"
    >
      {/* Pill/Icon - Always Visible */}
      <div
        className="plug-tg-capsule-icon plug-tg-flex plug-tg-items-center plug-tg-justify-center plug-tg-w-8 plug-tg-h-8 plug-tg-rounded-full plug-tg-cursor-pointer plug-tg-transition-all hover:plug-tg-scale-110"
        onClick={(e) => {
          e.stopPropagation();
          setIsExpanded(!isExpanded);
        }}
        title="Text Generator"
        role="button"
        tabIndex={0}
        aria-pressed={isExpanded}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsExpanded(!isExpanded);
          }
        }}
      >
        ✦
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div
          className="plug-tg-capsule-content plug-tg-flex plug-tg-items-center plug-tg-gap-2 plug-tg-px-2"
          role="group"
          aria-label={`${mode} mode controls`}
        >
          {renderContent()}

          {/* Quick Action Buttons (Main Mode Only) */}
          {mode === "main" && (
            <>
              <button
                className="plug-tg-capsule-btn plug-tg-px-3 plug-tg-py-1 plug-tg-rounded plug-tg-bg-blue-600 hover:plug-tg-bg-blue-700 plug-tg-text-xs plug-tg-font-medium plug-tg-transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAction("askAi");
                }}
                onMouseDown={handlePreventFocusLoss}
                aria-label="Ask AI"
              >
                Ask AI
              </button>

              <button
                className="plug-tg-capsule-btn plug-tg-px-3 plug-tg-py-1 plug-tg-rounded plug-tg-bg-green-600 hover:plug-tg-bg-green-700 plug-tg-text-xs plug-tg-font-medium plug-tg-transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAction("copy");
                }}
                onMouseDown={handlePreventFocusLoss}
                aria-label="Copy selection"
              >
                Copy
              </button>

              <button
                className="plug-tg-capsule-btn plug-tg-px-2 plug-tg-py-1 plug-tg-rounded plug-tg-bg-red-600 hover:plug-tg-bg-red-700 plug-tg-text-xs plug-tg-transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(false);
                  onClose();
                }}
                onMouseDown={handlePreventFocusLoss}
                aria-label="Close"
              >
                ✕
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};
