import {
  ITextBlockContent,
  TEXT_BLOCK_ACTION,
  TEXT_STYLE_ACTION,
} from "../../interfaces/TextBlockInterfaces";
import { EditorBlock } from "../EditorBlock/EditorBlock";
import { CursorPos } from "../../interfaces/CursorInterfaces";
import { IListBlock } from "../../interfaces/ListBlockInterfaces";
import { findMarkedListElement, getListElementLength } from "../../utils/Block/ListBlockManagement";
import { checkInSelection, findFirstContent } from "../../utils/Block/TextBlockManagement";
import { TextBlock } from "../TextBlock/TextBlock";
import { setCursorPos } from "../../Cursor/CursorManager";

export class ListBlock extends EditorBlock<ITextBlockContent[][]> implements IListBlock {
  blockContents: ITextBlockContent[][];
  prevAction: TEXT_BLOCK_ACTION;

  constructor(key, type, blockContents) {
    super(key, type, blockContents);
    this.blockContents = blockContents;
    this.prevAction = null;
  }

  setPrevAction(newAction: TEXT_BLOCK_ACTION): void {
    this.prevAction = newAction;
  }

  getPrevAction(): TEXT_BLOCK_ACTION {
    return this.prevAction;
  }

  getContents(): ITextBlockContent[][] {
    return this.blockContents;
  }

  copyContent(startIndex?: number, endIndex?: number): ITextBlockContent[][] {
    return [];
  }

  setFocused(position: CursorPos): void {
    const listElements = this.ref.childNodes[0];
    setCursorPos(listElements, position);
  }

  /**
   * return block content form of data structure from list block's dom element
   * @param currentContent
   */
  sync(currentContent: ChildNode): ITextBlockContent[][] {
    const listElements = currentContent.childNodes[0];
    const newListContents = [];
    listElements.childNodes.forEach((child) => {
      const currentListSync = TextBlock.parseTextHTML(child);
      newListContents.push(currentListSync);
    });
    return newListContents;
  }

  /**
   * Mark text contents in list block within range from startIndex and endIndex into type
   * @param type
   * @param startIndex
   * @param endIndex
   */
  markSelectedText(
    type: TEXT_STYLE_ACTION,
    startIndex: number,
    endIndex: number
  ): void {
    console.log(this.getContents());
    const { targetIndex: targetListElement, targetContentStartIndex } =
      findMarkedListElement(this.getContents(), startIndex);
    const currentContent = this.getContents()[targetListElement];
    let {
      firstContentStart: leftBound,
      firstContentIndex: currentContentIndex,
    } = findFirstContent(startIndex - targetContentStartIndex, currentContent);
    while (
      currentContent[currentContentIndex] &&
      checkInSelection(
        leftBound,
        leftBound + currentContent[currentContentIndex]?.textContent.length,
        startIndex - targetContentStartIndex,
        endIndex - targetContentStartIndex
      )
    ) {
      const currentContentOriginLength =
        currentContent[currentContentIndex].textContent.length;
      const rightBound = leftBound + currentContentOriginLength;
      const newBlockContent = TextBlock.annotateBlockContent(
        currentContentIndex,
        leftBound,
        startIndex - targetContentStartIndex,
        endIndex - targetContentStartIndex,
        type,
        currentContent
      );
      const newListContents = this.getContents();
      newListContents[targetListElement] = newBlockContent;
      this.setContent(newListContents);
      if (leftBound >= startIndex && rightBound <= endIndex) {
        console.log("+1")
        currentContentIndex++;
      }
      else if (
        leftBound <= startIndex - targetContentStartIndex &&
        rightBound <= endIndex - targetContentStartIndex &&
        rightBound >= startIndex - targetContentStartIndex
      ) {
        console.log("+2");
        currentContentIndex += 2;
      } else if (
        leftBound <= startIndex - targetContentStartIndex &&
        rightBound >= endIndex - targetContentStartIndex
      ) {
        console.log("+3");
        currentContentIndex += 3;
      } else {
        console.log("+1");
        currentContentIndex++;
      }
      leftBound += currentContentOriginLength;
    }
    console.log(this.getContents().slice());
    this.recordHistory();
  }

  /**
   * Get total length of all list elements combined in a list block
   */
  getTotalContentLength(): number {
    let count = 0;
    const listContents = this.getContents();
    listContents.forEach((content) => {
      count += getListElementLength(content);
    });
    return count;
  }

  /**
   * return true if a list element is empty else return false
   */
  isEmpty(): boolean {
    const listContents = this.ref.innerText;
    return listContents.length === 0;
  }
}
