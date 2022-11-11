import { CursorPos } from "./CursorInterfaces";
import {LinkedList} from "../utils/LinkedList/LinkedList";
import {LinkedListNode} from "../utils/LinkedList/LinkedListNode";

interface IEditorBlock<T> {
  key: string;
  type: BLOCK_TYPE;
  blockContents: T;
  ref: HTMLElement;
  history: LinkedList<T>;
  historyPtr: number;
  currentEra: LinkedListNode<T>;

  setFocused(position: CursorPos): void;
  sync(currentContent: ChildNode): T;
  getRef(): HTMLElement;
  setRef(blockRef: HTMLElement): void;
  getContents(): T;
  setContent(blockContents: T): void;
  copyContent(startIndex?: number, endIndex?: number): T;
  getKey(): string;
  setKey(newKey: string);
  getType(): BLOCK_TYPE;
  recordHistory(): void;
  undoHistory(): void;
  redoHistory(newHistory?: T[]): void;
}

enum BLOCK_TYPE {
  text = "text", // text with different styles
  heading = "heading", // heading text
  list = "list", // list text
  image = "image", // image
}

export { IEditorBlock, BLOCK_TYPE };
