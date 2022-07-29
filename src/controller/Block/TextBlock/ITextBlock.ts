import { LinkedList } from "../../../utils/LinkedList/LinkedList";
import { LinkedListNode } from "../../../utils/LinkedList/LinkedListNode";

interface ITextBlock {
  history: LinkedList<ITextBlockContent[]>;
  historyPtr: number;
  currentEra: LinkedListNode<ITextBlockContent[]>;

  getTotalContentLength(): number;
  sync(currentContent: HTMLElement): void;
  recordHistory(): void;
  undoHistory(): void;
  redoHistory(): void;
  makeBlockContent(
    contentIndex: number,
    contentStart: number,
    selectionStart: number,
    selectionEnd: number,
    newType: TEXT_STYLE_ACTION
  ): void;
  getCopiedText(
    contentIndex: number,
    contentStart: number,
    selectionStart: number,
    selectionEnd: number
  ): ITextBlockContent | undefined;
  copySelectedText(startIndex: number, endIndex: number): ITextBlockContent[];
  markSelectedText(
    type: TEXT_STYLE_ACTION,
    startIndex: number,
    endIndex: number
  ): void;
  insertBlockContents(newContents: ITextBlockContent[], index: number): void;
}

enum TEXT_TYPE {
  normal, // text with different styles
  link, // link text
}

// different text annotation style
enum TEXT_STYLE_ACTION {
  bold,
  marked,
  underline,
  unbold,
  unmarked,
  removeUnderline,
}

// Data structure for content in each block
interface ITextBlockContent {
  textType: TEXT_TYPE;
  isMarked?: boolean;
  isBold?: boolean;
  isUnderline?: boolean;
  textContent: string;
  linkHref?: string;
}

export { ITextBlockContent, TEXT_TYPE, TEXT_STYLE_ACTION, ITextBlock };
