import { CursorPos } from "../../Cursor/ICursorManager";
import {BLOCK_TYPE, IEditorBlock} from "./IEditorBlock";
import {ITextBlockContent} from "../TextBlock/ITextBlock";

abstract class EditorBlock implements IEditorBlock {
  key: number;
  type: BLOCK_TYPE;
  blockContents: ITextBlockContent[];
  ref: HTMLElement;

  protected constructor(
    key: number,
    type: BLOCK_TYPE,
    blockContents: ITextBlockContent[],
    ref?: HTMLElement
  ) {
    this.key = key;
    this.type = type;
    this.blockContents = blockContents;
    this.ref = ref;
  }

  abstract setFocused(position: CursorPos): void;

  abstract sync(currentContent: HTMLElement): void;

  getRef(): HTMLElement {
    return this.ref;
  }

  setRef(blockRef: HTMLElement): void {
    this.ref = blockRef;
  }

  getContents(): ITextBlockContent[] {
    return this.blockContents;
  }

  setContent(blockContents: ITextBlockContent[]): void {
    this.blockContents = blockContents;
  }

  getKey(): number {
    return this.key;
  }

  setKey(newKey: number) {
    this.key = newKey;
  }

  getType(): BLOCK_TYPE {
    return this.type;
  }
}

export { EditorBlock };
