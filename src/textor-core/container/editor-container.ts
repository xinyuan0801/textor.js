import { CursorPosEnum } from "../interfaces/cursor";
import { IClipboardInfo, ISelectedBlock } from "../interfaces/editor-container";
import { BLOCK_TYPE } from "../interfaces/editor-block";

export class EditorContainer {
  blocks: any[];
  currentSelectedBlock: any;
  clipboardInfo: IClipboardInfo;
  defaultBlock: any;
  blockMap: Map<string, Function>;

  constructor(initialBlock: any[] = []) {
    this.blocks = initialBlock;
    this.clipboardInfo = { plainText: "", textContext: "" };
    this.defaultBlock = null;
    this.blockMap = null;
  }

  getBlocks(): any[] {
    return this.blocks;
  }

  getDefaultBlock(): any {
    return this.defaultBlock;
  }

  setDefaultBlock(newBlock: any) {
    this.defaultBlock = newBlock;
  }

  getBlockMap(): Map<string, Function> {
    return this.blockMap;
  }

  setBlockMap(newBlockMap: Map<string, Function>) {
    this.blockMap = newBlockMap;
  }

  /**
   * insert insertBlock at given index, return editor contents after the insertion
   * @param index
   * @param insertBlock
   */
  insertBlock(index: number, insertBlock: any): any[] {
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
  deleteBlockByKey(blockKey: string): any[] {
    const targetIndex = this.blocks.findIndex(
      (block) => block.key === blockKey
    );
    if (targetIndex === -1) {
      return this.blocks.slice();
    }
    this.blocks.splice(targetIndex, 1);
    return this.blocks.slice();
  }

  setBlocks(newBlocks: any[]): void {
    this.blocks = newBlocks;
  }

  /**
   * return block with given blockKey or return 0 if given block can not be found
   * @param blockKey
   */
  getBlockByKey(blockKey: string): any | 0 {
    return this.blocks.find((block) => block.key === blockKey) || 0;
  }

  /**
   * return block's index with given blockKey
   * @param blockKey
   */
  getBlockIndex(blockKey: string): number {
    return this.blocks.findIndex((block) => block.key === blockKey);
  }

  /**
   * set focus on block with given index, and set the cursor at given position
   * @param index
   * @param position
   */
  setFocusByIndex(index: number, position: CursorPosEnum): void {
    this.blocks[index].setFocused(position);
  }

  /**
   * set block with key on focus and set cursor at given position
   * @param key
   * @param position
   */
  setFocusByKey(key: string, position: CursorPosEnum): void {
    const targetBlock = this.blocks.find((block) => block.key === key);
    targetBlock.setFocused(position);
  }

  setCurrentSelectedBlock(selectedBlockInfo: ISelectedBlock): void {
    console.log(selectedBlockInfo);
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

  createBlock(blockContent: any, type: BLOCK_TYPE, blockKey?: number): any {
    const newBlockKey = blockKey ? blockKey : Date.now();
    const blockConstructor = this.getBlockMap().get(type);
    // @ts-ignore
    return new blockConstructor([newBlockKey], [], [type, blockContent]);
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
      let exportBlockContent;
      if (block.hasOwnProperty("contentCleanUp")) {
        exportBlockContent = block.contentCleanUp(block.blockContents);
        block.setContent(exportBlockContent);
      } else {
        exportBlockContent = block.getContents();
      }

      console.log("exported data", {
        key: block.key,
        contents: exportBlockContent,
        type: block.type,
        nativeCopy: block.nativeCopy,
      });
      return {
        key: block.key,
        contents: exportBlockContent,
        type: block.type,
        nativeCopy: block.nativeCopy,
      };
    });
  }
}
