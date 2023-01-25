import { LinkedList } from "../../textor-core/utils/linked-list/linked-list";
import { basicDeepClone } from "../../utils/json-tool";
import { LinkedListNode } from "../../textor-core/utils/linked-list/linked-list-node";

export function HistoryPlugin() {
  this.historyPtr = 0;
  this.history = new LinkedList<any>(this.getContents());
  this.currentEra = this.history.head.next;
}

/**
 * record newest state in undo/redo history, use newHistory or current block contents if not provided.
 * @param newHistory
 */
HistoryPlugin.prototype.recordHistory = function (newHistory?: any): void {
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
};

HistoryPlugin.prototype.redoHistory = function (): void {
  console.log("redo");
  if (this.historyPtr === this.history.length - 1) {
    return;
  }
  this.historyPtr++;
  this.currentEra = this.currentEra.next;
  this.setContent(basicDeepClone(this.currentEra.val));
  console.log("current era", this.currentEra);
}

HistoryPlugin.prototype.undoHistory = function(): void {
  console.log("undo", this.historyPtr);
  if (this.historyPtr === 0) {
    return;
  }
  console.log("what")
  this.historyPtr--;
  this.currentEra = this.currentEra.prev;
  this.setContent(basicDeepClone(this.currentEra.val));
  console.log("current era", this.currentEra);
}

HistoryPlugin.prototype.getCurrEra = function(): LinkedListNode<any> {
  return this.currentEra;
}
