export class LinkedListNode<NodeType> {
    _prev: LinkedListNode<NodeType> | null;
    _next: LinkedListNode<NodeType> | null;
    _val: NodeType
    isDummy: boolean

    constructor(val?: NodeType, isDummy?: boolean) {
        this._val = val;
        this._prev = null;
        this._next = null;
        this.isDummy = isDummy;
    }

    get val(): NodeType {
        return this._val;
    }

    set val(newVal: NodeType) {
        this._val = newVal;
    }

    get prev(): LinkedListNode<NodeType> | null {
        return this._prev;
    }

    set prev(newPrev: LinkedListNode<NodeType>) {
        this._prev = newPrev;
    }

    get next(): LinkedListNode<NodeType> |null {
        return this._next;
    }

    set next(newNext: LinkedListNode<NodeType>) {
        this._next = newNext;
    }
}