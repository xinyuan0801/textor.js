import {EditorBlock} from "../Block/EditorBlock/EditorBlock";
import {TextBlock} from "../Block/TextBlock/TextBlock";
import {CursorPos} from "../Cursor/ICursorManager";
import {IClipboardInfo, ISelectedBlock} from "./IEditorContainer";
import {BLOCK_TYPE} from "../Block/EditorBlock/IEditorBlock";

export class EditorContainer {
  blocks: EditorBlock[];
  currentSelectedBlock: ISelectedBlock;
  clipboardInfo: IClipboardInfo;

  constructor(initialBlock: EditorBlock[] = []) {
    this.blocks = initialBlock;
  }

  getBlocks(): EditorBlock[] {
    return this.blocks;
  }

  insertBlock(index: number, insertBlock?: EditorBlock): number {
    const defaultBlock = insertBlock ? insertBlock : new TextBlock(Date.now(), BLOCK_TYPE.text, []);
    if (index === -1 || index === this.blocks.length) {
      this.blocks.push(defaultBlock);
      return 1;
    }
    if (typeof this.blocks[index] === "undefined") {
      return 0;
    }
    this.blocks.splice(index, 0, defaultBlock);
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

  setBlocks(newBlocks: EditorBlock[]): void {
    this.blocks = newBlocks;
  }

  getBlockByKey(blockKey: number): EditorBlock | 0 {
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

  setCurrentSelectedBlock(selectedBlockInfo: ISelectedBlock): void {
    this.currentSelectedBlock = selectedBlockInfo;
  }

  getCurrentSelectedBlock(): ISelectedBlock {
    return this.currentSelectedBlock;
  }

  setClipboardInfo(newClipboardInfo: IClipboardInfo): void {
    this.clipboardInfo = newClipboardInfo;
  }

  getClipboardInfo(): IClipboardInfo {
    return this.clipboardInfo;
  }
}
