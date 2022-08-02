import {IEditorBlock} from "../EditorBlock/IEditorBlock";
import {ITextBlockContent, TEXT_STYLE_ACTION} from "../TextBlock/ITextBlock";

export interface IListBlock extends Omit<IEditorBlock, 'blockContents' | 'sync'> {
  blockContents: ITextBlockContent[][];

  sync(currentContent: ChildNode): ITextBlockContent[][];
  markSelectedText(
    type: TEXT_STYLE_ACTION,
    startIndex: number,
    endIndex: number
  ): void;
  getTotalContentLength(): number;
}
