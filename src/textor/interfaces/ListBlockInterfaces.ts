import {IEditorBlock} from "./EditorBlockInterfaces";
import {ITextBlockContent, TEXT_BLOCK_ACTION, TEXT_STYLE_ACTION} from "./TextBlockInterfaces";

export interface IListBlock extends Omit<IEditorBlock, 'blockContents' | 'sync'> {
  blockContents: ITextBlockContent[][];
  prevAction: TEXT_BLOCK_ACTION | TEXT_STYLE_ACTION;

  setPrevAction(newAction: TEXT_BLOCK_ACTION): void;
  getPrevAction(): TEXT_BLOCK_ACTION | TEXT_STYLE_ACTION
  sync(currentContent: ChildNode): ITextBlockContent[][];
  markSelectedText(
    type: TEXT_STYLE_ACTION,
    startIndex: number,
    endIndex: number
  ): void;
  getTotalContentLength(): number;
}
