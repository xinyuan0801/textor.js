import {
  ITextBlockContent,
  TEXT_BLOCK_ACTION,
  TEXT_STYLE_ACTION,
} from "../TextBlock/interfaces";
import { EditorBlock } from "../EditorBlock/EditorBlock";
import { CursorPos } from "../../Cursor/interfaces";
import { IListBlock } from "./interfaces";
import { findMarkedListElement, getListElementLength } from "./utils";
import { checkInSelection, findFirstContent } from "../TextBlock/utils";
import { TextBlock } from "../TextBlock/TextBlock";
import { setCursorPos } from "../../Cursor/CursorManager";

export class ListBlock extends EditorBlock implements IListBlock {
  blockContents: ITextBlockContent[][];
  prevAction: TEXT_BLOCK_ACTION | TEXT_STYLE_ACTION;

  constructor(key, type, blockContents) {
    super(key, type, blockContents);
    this.blockContents = blockContents;
    this.prevAction = null;
  }

  setPrevAction(newAction: TEXT_BLOCK_ACTION): void {
    this.prevAction = newAction;
  }

  getPrevAction(): TEXT_BLOCK_ACTION | TEXT_STYLE_ACTION {
    return this.prevAction;
  }

  getContents(): ITextBlockContent[][] {
    return this.blockContents;
  }

  copyContent(startIndex?: number, endIndex?: number): ITextBlockContent[] {

    return [];
  }

  setFocused(position: CursorPos): void {
    setCursorPos(this.ref, position);
  }

  sync(currentContent: ChildNode): ITextBlockContent[][] {
    const listElements = currentContent.childNodes[0];
    const newListContents = [];
    listElements.childNodes.forEach((child) => {
      const currentListSync = TextBlock.parseTextHTML(child);
      newListContents.push(currentListSync);
    });
    return newListContents;
  }

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
      if (
        startIndex - targetContentStartIndex <= leftBound &&
        rightBound <= endIndex - targetContentStartIndex
      ) {
        console.log("+1 loader");
        currentContentIndex++;
      } else if (
        leftBound <= startIndex - targetContentStartIndex &&
        rightBound <= endIndex - targetContentStartIndex &&
        rightBound >= startIndex - targetContentStartIndex
      ) {
        console.log("+2 loaded");
        currentContentIndex += 2;
      } else if (
        leftBound <= startIndex - targetContentStartIndex &&
        rightBound >= endIndex - targetContentStartIndex
      ) {
        console.log("+3 loaded");
        currentContentIndex += 3;
      } else {
        console.log("+1 loaded");
        currentContentIndex++;
      }
      leftBound += currentContentOriginLength;
    }
    console.log(this.getContents().slice());
    this.recordHistory();
  }

  getTotalContentLength(): number {
    let count = 0;
    const listContents = this.getContents();
    listContents.forEach((content) => {
      count += getListElementLength(content);
    });
    return count;
  }

  isEmpty(): boolean {
    const listContents = this.ref.innerText;
    return listContents.length === 0;
  }
}
