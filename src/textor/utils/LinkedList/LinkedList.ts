import {LinkedListNode} from "./LinkedListNode";

export class LinkedList<NodeType> {
  head: LinkedListNode<NodeType>;
  tail: LinkedListNode<NodeType>;
  _length: number;

  constructor(...values: NodeType[]) {
    // dummy head and tail node for easier manipulation
    this.head = new LinkedListNode<NodeType>(undefined, true);
    this.tail = new LinkedListNode<NodeType>(undefined, true);
    this._length = 0;
    values.forEach((value) => {
        this.append(value);
    })
  }

  get length(): number {
    return this._length;
  }

  set length(newLength) {
    this._length = newLength;
  }

  prepend(newNodeVal: NodeType) {
    const newHead = new LinkedListNode(newNodeVal);
    if (this.length === 0) {
      this.head.next = newHead;
      newHead.prev = this.head;
      newHead.next = this.tail;
      this.tail.prev = newHead;
    } else {
      newHead.next = this.head.next;
      this.head.next = newHead;
    }
    this.length++;
  }

  append(newNodeVal: NodeType) {
    const newTail = new LinkedListNode(newNodeVal);
    if (this.length === 0) {
      this.head.next = newTail;
      newTail.prev = this.head;
      newTail.next = this.tail;
      this.tail.prev = newTail;
    } else {
      const originPrevNode = this.tail.prev;
      originPrevNode.next = newTail;
      newTail.prev = originPrevNode;
      newTail.next = this.tail;
      this.tail.prev = newTail;
    }
    this.length++;
  }

  addAtIndex(newNodeVal: NodeType, index: number) {
    const newNode = new LinkedListNode(newNodeVal);
    if (index > this.length) {
      throw new Error("index out of range");
    }
    if (index === 0) {
      this.prepend(newNodeVal);
      return;
    }
    if (index === this.length - 1) {
      this.append(newNodeVal);
      return;
    }
    let tempNode = this.head;
    let loopCounter = 0;
    while (loopCounter < index - 1) {
      tempNode = tempNode.next;
      loopCounter++;
    }
    const originNextNode = tempNode.next;
    tempNode.next = newNode;
    newNode.prev = tempNode;
    originNextNode.prev = newNode;
    newNode.next = originNextNode;
  }
}
