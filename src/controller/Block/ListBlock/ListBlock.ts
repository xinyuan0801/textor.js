import { ITextBlockContent, TEXT_STYLE_ACTION } from "../TextBlock/ITextBlock";
import { EditorBlock } from "../EditorBlock/EditorBlock";
import { CursorPos } from "../../Cursor/ICursorManager";
import { IListBlock } from "./IListBlock";
import {findMarkedListElement, getListElementLength} from "./utils";
import { checkInSelection, findFirstContent } from "../TextBlock/utils";
import { TextBlock } from "../TextBlock/TextBlock";
import {setCursorPos} from "../../Cursor/CursorManager";

export class ListBlock extends EditorBlock implements IListBlock {
  blockContents: ITextBlockContent[][];

  constructor(key, type, blockContents) {
    super(key, type, blockContents);
    this.blockContents = blockContents;
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
    console.log(currentContent.childNodes);
    const listElements = currentContent.childNodes[0];
    const newListContents = [];
    listElements.childNodes.forEach((child) => {
      const currentListSync = TextBlock.parseTextHTML(child);
      newListContents.push(currentListSync);
    });
    console.log(newListContents);
    return newListContents;
  }

  markSelectedText(
    type: TEXT_STYLE_ACTION,
    startIndex: number,
    endIndex: number
  ): void {
    const { targetIndex: targetListElement, targetContentStartIndex } =
      findMarkedListElement(this.getContents(), startIndex);
    const currentContent = this.getContents()[targetListElement];
    let {
      firstContentStart: leftBound,
      firstContentIndex: currentContentIndex,
    } = findFirstContent(startIndex - targetContentStartIndex, currentContent);
    console.log(targetContentStartIndex);
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
    this.recordHistory();
  }

  getTotalContentLength(): number {
    let count = 0;
    const listContents = this.getContents();
    listContents.forEach((content) => {
      count += getListElementLength(content);
    })
    return count;
  }
}
