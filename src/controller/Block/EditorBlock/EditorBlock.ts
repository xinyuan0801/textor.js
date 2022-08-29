import {CursorPos} from "../../Cursor/interfaces";
import {BLOCK_STATUS, BLOCK_TYPE, IEditorBlock} from "./interfaces";
import {ITextBlockContent} from "../TextBlock/interfaces";
import {LinkedList} from "../../../utils/LinkedList/LinkedList";
import {LinkedListNode} from "../../../utils/LinkedList/LinkedListNode";
import {blockContentDeepClone} from "./utils";

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
    this.ref = ref;
    this.historyPtr = 0;
    this.history = new LinkedList<(ITextBlockContent | ITextBlockContent[])[]>(
      blockContents
    );
    console.log(this.history);
    this.currentEra = this.history.head.next;
  }

  abstract setFocused(position: CursorPos): void;

  abstract sync(currentContent: ChildNode): any;

  abstract copyContent(
    startIndex?: number,
    endIndex?: number
  ): ITextBlockContent[];

  abstract isEmpty(): boolean;

  saveCurrentContent() {
    const newContents = this.sync(this.ref);
    this.setContent(newContents);
  }

  recordHistory(newHistory?: any[]): void {
    const currentHistory =
      newHistory || blockContentDeepClone(this.getContents());
    console.log(currentHistory);
    // if pointer is not at latest history, create new history follow the era that pointer currently on
    if (this.historyPtr !== this.history.length - 1) {
      const newEraNode = new LinkedListNode(currentHistory);
      this.currentEra.next = newEraNode;
      newEraNode.prev = this.currentEra;
      newEraNode.next = this.history.tail;
      this.history.tail.prev = newEraNode;
      this.currentEra = newEraNode;
    }
    // if pointer is at latest history, create a new history
    else {
      this.history.append(currentHistory);
      this.currentEra = this.currentEra.next;
    }
    this.historyPtr++;
    console.log("current era", this.currentEra);
  }


  redoHistory(): void {
    console.log("redo");
    if (this.historyPtr === this.history.length - 1) {
      return;
    }
    this.historyPtr++;
    this.currentEra = this.currentEra.next;
    this.setContent(blockContentDeepClone(this.currentEra.val));
    console.log("current era", this.currentEra);
  }

  undoHistory(): void {
    console.log("undo");
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

  getCurrEra(): LinkedListNode<(ITextBlockContent | ITextBlockContent[])[]> {
    return this.currentEra;
  }
}

export { EditorBlock };
