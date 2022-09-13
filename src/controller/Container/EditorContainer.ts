import {EditorBlock} from "../Block/EditorBlock/EditorBlock";
import {TextBlock} from "../Block/TextBlock/TextBlock";
import {CursorPos} from "../Cursor/interfaces";
import {IClipboardInfo, ISelectedBlock} from "./interfaces";
import {BLOCK_TYPE} from "../Block/EditorBlock/interfaces";

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

  /**
   * insert insertBlock or defaultBlock if not provided and return 1 if success and 0 if failed
   * @param index
   * @param insertBlock
   */
  insertBlock(index: number, insertBlock?: EditorBlock): number {
    const newBlock = insertBlock
      ? insertBlock
      : new TextBlock(Date.now(), BLOCK_TYPE.text, []);
    if (index === -1 || index === this.blocks.length) {
      this.blocks.push(newBlock);
      return 1;
    }
    if (typeof this.blocks[index] === "undefined") {
      return 0;
    }
    this.blocks.splice(index, 0, newBlock);
    return 1;
  }

  /**
   * delete block with given blockKey, return 1 if success else return 0
   * @param blockKey
   */
  deleteBlockByKey(blockKey: number): number {
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

  /**
   * return block with given blockKey or return 0 if given block can not be found
   * @param blockKey
   */
  getBlockByKey(blockKey: number): EditorBlock | 0 {
    return this.blocks.find((block) => block.key === blockKey) || 0;
  }

  /**
   * return block's index with given blockKey
   * @param blockKey
   */
  getBlockIndex(blockKey: number): number {
    console.log(this.blocks.slice(), blockKey);
    return this.blocks.findIndex((block) => block.key === blockKey);
  }

  /**
   * set focus on block with given index, and set the cursor at given position
   * @param index
   * @param position
   */
  setFocusByIndex(index: number, position: CursorPos): void {
    this.blocks[index].setFocused(position);
  }

  /**
   * set block with key on focus and set cursor at given position
   * @param key
   * @param position
   */
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

  exportContents() {
    return this.blocks.map((block) => {
      return {
        key: block.key,
        contents: block.blockContents,
        type: block.type
      }
    })
  }
}
