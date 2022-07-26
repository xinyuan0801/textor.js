import { CursorPos } from "../Cursor/ICursorManager";
import type { blockContent } from "./IEditorBlock";

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

  getContents(): blockContent[] {
    return this.blockContents;
  }

  setContent(blockContents: blockContent[]): void {
    console.log("new content", blockContents.slice());
    this.blockContents = blockContents;
  }

  getKey(): number {
    return this.key;
  }

  setKey(newKey: number) {
    console.log("changing key", this.key, newKey);
    this.key = newKey;
  }

  getType(): string {
    return this.type;
  }

  setContentSetter(contentSetter: any) {
    this.contentSetter = contentSetter;
  }

  renderContent() {
    this.contentSetter(this.blockContents);
  }
}

export { EditorBlock };
