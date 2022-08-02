import { IEditorBlock } from "../EditorBlock/IEditorBlock";

enum TEXT_BLOCK_ACTION {
  input,
  delete,
}

interface ITextBlock extends Omit<IEditorBlock, 'blockContents' | 'sync'> {
  prevAction: TEXT_BLOCK_ACTION | TEXT_STYLE_ACTION;
  blockContents: ITextBlockContent[];

  getContents(): ITextBlockContent[];
  getTotalContentLength(): number;
  setPrevAction(newAction: TEXT_BLOCK_ACTION): void;
  sync(currentContent: ChildNode): ITextBlockContent[];
  generateCopyContent(
    contentIndex: number,
    contentStart: number,
    selectionStart: number,
    selectionEnd: number
  ): ITextBlockContent | undefined;
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
  list, // text with list format
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
  headingSize?: HeadingTypeCode;
}

enum HeadingTypeCode {
  one = "H1",
  two = "H2",
  three = "H3",
}

export {
  ITextBlockContent,
  TEXT_TYPE,
  TEXT_STYLE_ACTION,
  ITextBlock,
  HeadingTypeCode,
  TEXT_BLOCK_ACTION,
};
