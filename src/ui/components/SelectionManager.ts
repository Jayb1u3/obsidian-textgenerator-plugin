/**
 * SelectionManager - Centralized editor selection state management
 * Prevents focus loss during toolbar interactions and reliably reads/writes text
 */

import { Editor } from "obsidian";

export class SelectionManager {
  private editor: Editor;

  constructor(editor: Editor) {
    this.editor = editor;
  }

  /**
   * Gets the currently selected text from the editor.
   * Uses the internal CodeMirror state, so it works even if focus is lost.
   */
  getSelection(): string {
    if (!this.editor) return "";
    return this.editor.getSelection();
  }

  /**
   * Gets all selections (multi-cursor mode support)
   */
  getSelections(): string[] {
    if (!this.editor) return [];
    return this.editor.listSelections().map((sel: any) => 
      this.editor.getRange(sel.from(), sel.to())
    );
  }

  /**
   * Restores focus to the editor.
   * Use this after a button click in the toolbar to prevent focus loss.
   */
  restoreFocus(): void {
    if (this.editor && !this.editor.hasFocus()) {
      this.editor.focus();
    }
  }

  /**
   * Replaces the current selection with new text.
   * Handles the transaction ensuring history (Undo/Redo) works.
   */
  replaceSelection(text: string): void {
    if (!this.editor) return;
    this.editor.replaceSelection(text);
  }

  /**
   * Inserts text at the cursor without replacing selection
   */
  insertText(text: string): void {
    if (!this.editor) return;
    const cursor = this.editor.getCursor();
    this.editor.replaceRange(text, cursor);
  }

  /**
   * Gets the current cursor position
   */
  getCursor(pos?: "from" | "to") {
    if (!this.editor) return null;
    return this.editor.getCursor(pos);
  }

  /**
   * Sets a new cursor position
   */
  setCursor(pos: { line: number; ch: number }): void {
    if (!this.editor) return;
    this.editor.setCursor(pos);
  }

  /**
   * Clears any selection (collapses to cursor)
   */
  clearSelection(): void {
    if (!this.editor) return;
    const cursor = this.editor.getCursor();
    this.editor.setCursor(cursor);
  }

  /**
   * Returns true if text is currently selected
   */
  hasSelection(): boolean {
    if (!this.editor) return false;
    return this.getSelection().length > 0;
  }
}
