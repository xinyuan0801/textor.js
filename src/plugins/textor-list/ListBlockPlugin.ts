import {ITextBlockContent, TEXT_BLOCK_ACTION, TEXT_STYLE_ACTION} from "../textor-text/TextBlockInterfaces";
import {CursorPosEnum} from "../../textor/interfaces/CursorInterfaces";
import {setCursorPos} from "../../textor/Cursor/CursorManager";
import {findMarkedListElement, getListElementLength} from "./utils/ListBlockManagement";
import {checkInSelection, findFirstContent} from "../textor-text/utils/TextBlockManagementCore";
import {annotateBlockContent, parseTextHTML} from "../textor-text/TextBlockPlugin";

export function ListBlockPlugin(type: string, blockContents: ITextBlockContent[][]) {
  this.type = type;
  this.blockContents = blockContents;
  this.prevAction = null;
  this.nativeCopy = false;
}

ListBlockPlugin.prototype.setPrevAction = function(newAction: TEXT_BLOCK_ACTION): void {
  this.prevAction = newAction;
}

ListBlockPlugin.prototype.getPrevAction = function(): TEXT_BLOCK_ACTION {
  return this.prevAction;
}

ListBlockPlugin.prototype.getContents = function(): ITextBlockContent[][] {
  return this.blockContents;
}

ListBlockPlugin.prototype.copyContent = function(startIndex?: number, endIndex?: number): ITextBlockContent[][] {
  return [];
}

ListBlockPlugin.prototype.setFocused = function(position: CursorPosEnum): void {
  const listElements = this.ref.childNodes[0];
  setCursorPos(listElements, position);
}

ListBlockPlugin.prototype.sync = function(currentContent: ChildNode): ITextBlockContent[][] {
  const listElements = currentContent.childNodes[0];
  const newListContents = [];
  listElements.childNodes.forEach((child) => {
    const currentListSync = parseTextHTML(child);
    newListContents.push(currentListSync);
  });
  return newListContents;
}

ListBlockPlugin.prototype.saveCurrentContent = function() {
  const newContent = this.sync(this.ref);
  this.setContent(newContent);
}

/**
 * Mark text contents in list block within range from startIndex and endIndex into type
 * @param type
 * @param startIndex
 * @param endIndex
 */
ListBlockPlugin.prototype.markSelectedText = function(
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
    const newBlockContent = annotateBlockContent(
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
ListBlockPlugin.prototype.getTotalContentLength = function(): number {
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
ListBlockPlugin.prototype.isEmpty = function(): boolean {
  const listContents = this.ref.innerText;
  return listContents.length === 0;
}

ListBlockPlugin.prototype.getNativeCopy = function() {
  return this.nativeCopy;
}
