import {IEditorBlock} from "./EditorBlockInterfaces";
import {ITextBlockContent, TEXT_BLOCK_ACTION, TEXT_STYLE_ACTION} from "./TextBlockInterfaces";

export interface IListBlock extends IEditorBlock<ITextBlockContent[][]> {
  blockContents: ITextBlockContent[][];
  prevAction: TEXT_BLOCK_ACTION | TEXT_STYLE_ACTION;

  setPrevAction(newAction: TEXT_BLOCK_ACTION): void;
  getPrevAction(): TEXT_BLOCK_ACTION | TEXT_STYLE_ACTION
  markSelectedText(
    type: TEXT_STYLE_ACTION,
    startIndex: number,
    endIndex: number
  ): void;
  getTotalContentLength(): number;
}
