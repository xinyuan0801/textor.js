import { Iblock } from "../Block/EditorBlock";
import { TextBlock } from "../Block/TextBlock";
import {CursorPos} from "../Cursor/ICursorManager";

export class EditorContainer {
  // blocks of editor
  blocks: Iblock[];

  constructor(initialBlock: Iblock[] = []) {
    this.blocks = initialBlock;
  }

  getBlocks(): Iblock[] {
    return this.blocks;
  }

  insertBlock(index: number, insertBlock?: Iblock): number {
    const defaultBlock = new TextBlock(Date.now(), "text", []);
    if (index === -1 || index === this.blocks.length) {
      this.blocks.push(insertBlock || defaultBlock);
      return 1;
    }
    if (typeof this.blocks[index] === "undefined") {
      return 0;
    }
    this.blocks.splice(index, 0, insertBlock || defaultBlock);
    return 1;
  }

  deleteBlock(blockKey: number): number {
    const targetIndex = this.blocks.findIndex(
      (block) => block.key === blockKey
    );
    if (targetIndex === -1) {
      return 0;
    }
    this.blocks.splice(targetIndex, 1);
    return 1;
  }

  setBlocks(newBlocks: Iblock[]): void {
    this.blocks = newBlocks;
}

  getBlock(blockKey: number): Iblock | 0 {
    return this.blocks.find((block) => block.key === blockKey) || 0;
  }

  getBlockIndex(blockKey: number): number {
    return this.blocks.findIndex((block) => block.key === blockKey);
  }

  setFocusByIndex(index: number, position: CursorPos): void {
    this.blocks[index].setFocused(position);
  }

  setFocusByKey(key: number, position: CursorPos): void {
    const targetBlock = this.blocks.find((block) => block.key === key);
    targetBlock.setFocused(position);
  }
}
