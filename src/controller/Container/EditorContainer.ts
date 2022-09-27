import { EditorBlock } from "../Block/EditorBlock/EditorBlock";
import { TextBlock } from "../Block/TextBlock/TextBlock";
import { CursorPos } from "../Cursor/interfaces";
import { IClipboardInfo, ISelectedBlock } from "./interfaces";
import { BLOCK_TYPE } from "../Block/EditorBlock/interfaces";

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
   * insert insertBlock at given index, return editor contents after the insertion
   * @param index
   * @param insertBlock
   */
  insertBlock(index: number, insertBlock: EditorBlock): EditorBlock[] {
    if (index === -1 || index === this.blocks.length) {
      this.blocks.push(insertBlock);
      return this.blocks.slice();
    }
    if (typeof this.blocks[index] === "undefined") {
      return this.blocks.slice();
    }
    this.blocks.splice(index, 0, insertBlock);
    return this.blocks.slice();
  }

  /**
   * delete block with given blockKey, return editor contents after the deletion
   * @param blockKey
   */
  deleteBlockByKey(blockKey: string): EditorBlock[] {
    const targetIndex = this.blocks.findIndex(
      (block) => block.key === blockKey
    );
    if (targetIndex === -1) {
      return this.blocks.slice();
    }
    this.blocks.splice(targetIndex, 1);
    return this.blocks.slice();
  }

  setBlocks(newBlocks: EditorBlock[]): void {
    this.blocks = newBlocks;
  }

  /**
   * return block with given blockKey or return 0 if given block can not be found
   * @param blockKey
   */
  getBlockByKey(blockKey: string): EditorBlock | 0 {
    return this.blocks.find((block) => block.key === blockKey) || 0;
  }

  /**
   * return block's index with given blockKey
   * @param blockKey
   */
  getBlockIndex(blockKey: string): number {
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
  setFocusByKey(key: string, position: CursorPos): void {
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

  createBlock(
    blockContent: any,
    type: BLOCK_TYPE,
    blockKey?: number
  ): EditorBlock {
    const newBlockKey = blockKey ? blockKey : Date.now();
    if (type === BLOCK_TYPE.text) {
      return new TextBlock(newBlockKey, type, blockContent);
    }
  }

  /**
   * import content in importedBlock and render the editor
   * @param importedBlock
   */
  importContents(importedBlock: any[]) {
    const newEditorContent = [];
    importedBlock.forEach((block) => {
      const newBlock = this.createBlock(block.contents, block.type, block.key);
      newEditorContent.push(newBlock);
    });
    this.setBlocks(newEditorContent);
  }

  /**
   * return export data of container content
   */
  exportContents() {
    console.log("raw data", this.getBlocks().slice());
    return this.blocks.map((block) => {
      const cleanBlock = (block as TextBlock).contentCleanUp(
        block.blockContents
      );
      console.log("exported data", {
        key: block.key,
        contents: cleanBlock,
        type: block.type,
        nativeCopy: block.nativeCopy,
      });
      return {
        key: block.key,
        contents: cleanBlock,
        type: block.type,
        nativeCopy: block.nativeCopy,
      };
    });
  }
}
