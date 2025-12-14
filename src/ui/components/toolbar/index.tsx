import React from "react";
import { MarkdownView, Editor } from "obsidian";
import TextGeneratorPlugin from "#/main";
import { FloatingCapsule } from "../FloatingCapsule";

interface MainToolbarProps {
  view: MarkdownView;
  editor: Editor;
  position: { top: number; left: number };
  onClose: () => void;
  plugin?: TextGeneratorPlugin | null; // Allow null as a valid type
}

/**
 * Toolbar component - now delegates to FloatingCapsule for better UX
 * Maintains backward compatibility while providing improved hover/focus behavior
 */
export const Toolbar: React.FC<MainToolbarProps> = ({
  view,
  editor,
  position,
  onClose,
  plugin,
}) => {
  return (
    <FloatingCapsule
      view={view}
      editor={editor}
      position={position}
      onClose={onClose}
      plugin={plugin}
    />
  );
};
