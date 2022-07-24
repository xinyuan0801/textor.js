import { CursorPos } from "../Cursor/ICursorManager";
import type {blockContent} from "./IEditorBlock";

abstract class EditorBlock {
  key: number;
  type: string;
  blockContents: blockContent[];
  contentSetter: any;
  ref: HTMLElement;

  protected constructor(
    key: number,
    type: string,
    blockContents: blockContent[],
    contentSetter?: any,
    ref?: HTMLElement
  ) {
    this.key = key;
    this.type = type;
    this.blockContents = blockContents;
    this.contentSetter = contentSetter;
    this.ref = ref;
  }

  abstract setFocused(position: CursorPos): void;

  abstract sync(currentContent: HTMLElement): void;

  getRef(): HTMLElement {
    return this.ref;
  }

  getTotalSum(): number {
    let cnt = 0;
    this.blockContents.forEach((blockContent) => {
      cnt = cnt + blockContent.textContent.length;
    });
    return cnt;
  }

  setRef(blockRef: HTMLElement): void {
    this.ref = blockRef;
  }

  getContent(): blockContent[] {
    return this.blockContents;
  }

  setContent(blockContents: blockContent[]): void {
    console.log('new content', blockContents);
    this.blockContents = blockContents;
  }

  getKey(): number {
    return this.key;
  }

  setKey(newKey: number) {
    this.key = newKey;
  }

  getType(): string {
    return this.type;
  }

  configContentSetter(contentSetter: any) {
    this.contentSetter = contentSetter;
  }

  renderContent() {
    console.log('block self render', this.blockContents.slice());
    this.contentSetter(this.blockContents);
  }
}

export { blockContent, EditorBlock };
