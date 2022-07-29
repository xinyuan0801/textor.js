import { CursorPos } from "../../Cursor/ICursorManager";

interface IEditorBlock {
  key: number;
  type: string;
  blockContents: any[];
  ref: HTMLElement;

  setFocused(position: CursorPos): void;
  sync(currentContent: HTMLElement): void;
  getRef(): HTMLElement;
  setRef(blockRef: HTMLElement): void;
  getContents(): any[];
  setContent(blockContents: any[]): void;
  getKey(): number;
  setKey(newKey: number);
  getType(): string;
}

export { IEditorBlock };
