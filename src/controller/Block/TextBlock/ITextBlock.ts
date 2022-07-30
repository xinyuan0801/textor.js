import { LinkedList } from "../../../utils/LinkedList/LinkedList";
import { LinkedListNode } from "../../../utils/LinkedList/LinkedListNode";
import { IEditorBlock } from "../EditorBlock/IEditorBlock";

enum TEXT_BLOCK_ACTION  {
  input,
  delete
}

interface ITextBlock extends IEditorBlock {
  history: LinkedList<ITextBlockContent[]>;
  historyPtr: number;
  currentEra: LinkedListNode<ITextBlockContent[]>;
  prevAction: TEXT_BLOCK_ACTION | TEXT_STYLE_ACTION;

  getTotalContentLength(): number;
  setPrevAction(newAction: TEXT_BLOCK_ACTION): void
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
  heading, // heading text
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
  textContent: string;
  isMarked?: boolean;
  isBold?: boolean;
  isUnderline?: boolean;
  linkHref?: string;
}

enum HeadingTypeCode {
  one,
  two,
  three,
}

export {
  ITextBlockContent,
  TEXT_TYPE,
  TEXT_STYLE_ACTION,
  ITextBlock,
  HeadingTypeCode,
  TEXT_BLOCK_ACTION
};
