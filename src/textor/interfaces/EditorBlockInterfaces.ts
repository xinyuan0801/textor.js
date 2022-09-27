import { CursorPos } from "../Cursor/interfaces";
import {LinkedList} from "../utils/LinkedList/LinkedList";
import {LinkedListNode} from "../utils/LinkedList/LinkedListNode";

interface IEditorBlock {
  key: string;
  type: BLOCK_TYPE;
  blockContents: any;
  ref: HTMLElement;
  history: LinkedList<any>;
  historyPtr: number;
  currentEra: LinkedListNode<any>;

  setFocused(position: CursorPos): void;
  sync(currentContent: ChildNode): any;
  getRef(): HTMLElement;
  setRef(blockRef: HTMLElement): void;
  getContents(): any;
  setContent(blockContents: any): void;
  copyContent(startIndex?: number, endIndex?: number): any;
  getKey(): string;
  setKey(newKey: string);
  getType(): BLOCK_TYPE;
  recordHistory(): void;
  undoHistory(): void;
  redoHistory(newHistory?: any[]): void;
}

enum BLOCK_TYPE {
  text = "text", // text with different styles
  heading = "heading", // heading text
  list = "list", // list text
  image = "image", // image
}

export { IEditorBlock, BLOCK_TYPE };
