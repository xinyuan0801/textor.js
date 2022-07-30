import { CursorPos } from "../../Cursor/ICursorManager";

interface IEditorBlock {
  key: number;
  type: BLOCK_TYPE;
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
  getType(): BLOCK_TYPE;
}

enum BLOCK_TYPE {
  text, // text with different styles
  heading, // heading text
  list, // list text
  image, // image text
}

export { IEditorBlock, BLOCK_TYPE };