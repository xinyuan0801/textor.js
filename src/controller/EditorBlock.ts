interface blockContent {
  textType: string;
  textContent: string;
  linkHref?: string;
}

interface Iblock {
  key: number;
  type: string;
  blockContents: blockContent[];
  ref: HTMLElement;

  setFocused(): void;

}

abstract class EditorBlock implements Iblock {
  key: number;
  type: string;
  blockContents: blockContent[];
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

  abstract setFocused(): void;


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
    this.blockContents = blockContents;
  }

  getKey(): number {
    return this.key;
  }

  getType(): string {
    return this.type;
  }
}

export { blockContent, Iblock, EditorBlock };
