import { CursorPos } from "../../Cursor/interfaces";
import { ITextBlockContent } from "../TextBlock/interfaces";
import {LinkedList} from "../../../utils/LinkedList/LinkedList";
import {LinkedListNode} from "../../../utils/LinkedList/LinkedListNode";

interface IEditorBlock {
  key: number;
  type: BLOCK_TYPE;
  blockContents: (ITextBlockContent | ITextBlockContent[])[];
  ref: HTMLElement;
  history: LinkedList<(ITextBlockContent | ITextBlockContent[])[]>;
  historyPtr: number;
  currentEra: LinkedListNode<(ITextBlockContent | ITextBlockContent[])[]>;

  setFocused(position: CursorPos): void;
  sync(currentContent: ChildNode): any;
  getRef(): HTMLElement;
  setRef(blockRef: HTMLElement): void;
  getContents(): (ITextBlockContent | ITextBlockContent[])[];
  setContent(blockContents: ITextBlockContent[]): void;
  copyContent(startIndex?: number, endIndex?: number): ITextBlockContent[];
  getKey(): number;
  setKey(newKey: number);
  getType(): BLOCK_TYPE;
  recordHistory(): void;
  undoHistory(): void;
  redoHistory(newHistory?: any[]): void;
}

enum BLOCK_TYPE {
  text, // text with different styles
  heading, // heading text
  list, // list text
  image, // image text
}



export { IEditorBlock, BLOCK_TYPE };
