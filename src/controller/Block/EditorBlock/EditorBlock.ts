import { CursorPos } from "../../Cursor/ICursorManager";
import { BLOCK_TYPE, IEditorBlock } from "./IEditorBlock";
import { ITextBlockContent } from "../TextBlock/ITextBlock";
import { LinkedList } from "../../../utils/LinkedList/LinkedList";
import { LinkedListNode } from "../../../utils/LinkedList/LinkedListNode";
import { blockContentDeepClone } from "./utils";

abstract class EditorBlock implements IEditorBlock {
  key: number;
  type: BLOCK_TYPE;
  blockContents: (ITextBlockContent | ITextBlockContent[])[];
  ref: HTMLElement;
  currentEra: LinkedListNode<(ITextBlockContent | ITextBlockContent[])[]>;
  history: LinkedList<(ITextBlockContent | ITextBlockContent[])[]>;
  historyPtr: number;

  protected constructor(
    key: number,
    type: BLOCK_TYPE,
    blockContents: (ITextBlockContent | ITextBlockContent[])[],
    ref?: HTMLElement
  ) {
    this.key = key;
    this.type = type;
    this.blockContents = blockContents;
    console.log("from parent", this.blockContents);
    this.ref = ref;
    this.historyPtr = 0;
    this.history = new LinkedList<(ITextBlockContent | ITextBlockContent[])[]>(
      blockContents
    );
    this.currentEra = this.history.head.next;
  }

  abstract setFocused(position: CursorPos): void;

  abstract sync(currentContent: ChildNode): any;

  abstract copyContent(
    startIndex?: number,
    endIndex?: number
  ): ITextBlockContent[];

  recordHistory(): void {
    console.log(this.history);
    if (this.historyPtr !== this.history.length - 1) {
      const newEraNode = new LinkedListNode(
        blockContentDeepClone(this.getContents())
      );
      console.log(
        "new route",
        blockContentDeepClone(this.currentEra.val),
        blockContentDeepClone(this.getContents())
      );
      this.currentEra.next = newEraNode;
      newEraNode.prev = this.currentEra;
      newEraNode.next = this.history.tail;
      this.history.tail.prev = newEraNode;
      this.currentEra = newEraNode;
    } else {
      this.history.append(blockContentDeepClone(this.getContents()));
      this.currentEra = this.currentEra.next;
    }
    this.historyPtr++;
    console.log("current era", this.currentEra);
  }

  redoHistory(): void {
    if (this.historyPtr === this.history.length - 1) {
      return;
    }
    this.historyPtr++;
    this.currentEra = this.currentEra.next;
    this.setContent(blockContentDeepClone(this.currentEra.val));
    console.log("current era", this.currentEra);
  }

  undoHistory(): void {
    if (this.historyPtr === 0) {
      return;
    }
    this.historyPtr--;
    this.currentEra = this.currentEra.prev;
    this.setContent(blockContentDeepClone(this.currentEra.val));
    console.log("current era", this.currentEra);
  }

  getRef(): HTMLElement {
    return this.ref;
  }

  setRef(blockRef: HTMLElement): void {
    this.ref = blockRef;
  }

  getContents(): (ITextBlockContent | ITextBlockContent[])[] {
    return this.blockContents;
  }

  setContent(blockContents: (ITextBlockContent | ITextBlockContent[])[]): void {
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

  setType(newType: BLOCK_TYPE) {
    this.type = newType;
  }
}

export { EditorBlock };
