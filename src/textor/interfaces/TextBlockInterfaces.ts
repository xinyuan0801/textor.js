import {IEditorBlock} from "./EditorBlockInterfaces";
import {HeadingTypeCode} from "../Block/TextBlock/HeadingBlock";

enum TEXT_BLOCK_ACTION {
  input = "input",
  delete = "delete",
  origin = "origin"
}

interface ITextBlock extends IEditorBlock<ITextBlockContent[]> {
  prevAction: TEXT_BLOCK_ACTION | TEXT_STYLE_ACTION;
  blockContents: ITextBlockContent[];

  // getContents(): ITextBlockContent[];
  getTotalContentLength(): number;
  setPrevAction(newAction: TEXT_BLOCK_ACTION): void;
  getPrevAction(): TEXT_BLOCK_ACTION | TEXT_STYLE_ACTION
  // sync(currentContent: ChildNode): ITextBlockContent[];
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
  normal = "text", // text with different styles
  heading = "heading", // heading text
  list = "list", // text with list format
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

export {
  ITextBlockContent,
  TEXT_TYPE,
  TEXT_STYLE_ACTION,
  TEXT_BLOCK_ACTION,
  ITextBlock,
};
