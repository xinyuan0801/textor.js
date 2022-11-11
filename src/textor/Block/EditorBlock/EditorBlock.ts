import { CursorPos } from "../../interfaces/CursorInterfaces";
import {
  BLOCK_TYPE,
  IEditorBlock,
} from "../../interfaces/EditorBlockInterfaces";
import { LinkedList } from "../../utils/LinkedList/LinkedList";
import { LinkedListNode } from "../../utils/LinkedList/LinkedListNode";
import { basicDeepClone } from "../../utils/Block/EditorBlockManagement";

abstract class EditorBlock<T> implements IEditorBlock<T> {
  //unique identifier for each text block
  key: string;
  type: BLOCK_TYPE;
  blockContents: T;
  // block dom element
  ref: HTMLElement;
  // block current state in undo/redo system
  currentEra: LinkedListNode<T>;
  // doubly linked list for all undo/redo history
  history: LinkedList<T>;
  // index of the current state in undo/redo history
  historyPtr: number;
  // use native copy if true, else use custom copy
  nativeCopy: boolean;

  protected constructor(
    key: string,
    type: BLOCK_TYPE,
    blockContents: T,
    ref?: HTMLElement
  ) {
    this.key = key;
    this.type = type;
    this.blockContents = blockContents;
    this.ref = ref;
    this.historyPtr = 0;
    this.nativeCopy = true;
    this.history = new LinkedList<T>(blockContents);
    this.currentEra = this.history.head.next;
  }

  /**
   * set block as focused, in the position provided
   * @param position
   */
  abstract setFocused(position: CursorPos): void;

  /**
   * sync current dom element into blockContents structure
   * @param currentContent
   */
  abstract sync(currentContent: ChildNode): T;

  /**
   * copy content within startIndex and endIndex and return in blockContents format
   * @param startIndex
   * @param endIndex
   */
  abstract copyContent(
    startIndex?: number,
    endIndex?: number
  ): T;

  /**
   * return true if block is empty, else return false
   */
  abstract isEmpty(): boolean;

  saveCurrentContent() {
    const newContents = this.sync(this.ref);
    this.setContent(newContents);
    console.log("content saved");
  }

  /**
   * record newest state in undo/redo history, use newHistory or current block contents if not provided.
   * @param newHistory
   */
  recordHistory(newHistory?: T): void {
    const currentHistory = newHistory || basicDeepClone(this.getContents());
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
    console.log("recorded", this.currentEra);
  }

  redoHistory(): void {
    console.log("redo");
    if (this.historyPtr === this.history.length - 1) {
      return;
    }
    this.historyPtr++;
    this.currentEra = this.currentEra.next;
    this.setContent(basicDeepClone(this.currentEra.val));
    console.log("current era", this.currentEra);
  }

  undoHistory(): void {
    console.log("undo");
    if (this.historyPtr === 0) {
      return;
    }
    this.historyPtr--;
    this.currentEra = this.currentEra.prev;
    this.setContent(basicDeepClone(this.currentEra.val));
    console.log("current era", this.currentEra);
  }

  getRef(): HTMLElement {
    return this.ref;
  }

  setRef(blockRef: HTMLElement): void {
    this.ref = blockRef;
  }

  getContents(): T {
    return this.blockContents;
  }

  setContent(blockContents: T): void {
    this.blockContents = blockContents;
  }

  getKey(): string {
    return this.key;
  }

  setKey(newKey: string) {
    this.key = newKey;
  }

  getType(): BLOCK_TYPE {
    return this.type;
  }

  setType(newType: BLOCK_TYPE) {
    this.type = newType;
  }

  getCurrEra(): LinkedListNode<T> {
    return this.currentEra;
  }

  getNativeCopy(): boolean {
    return this.nativeCopy;
  }
}

export { EditorBlock };
