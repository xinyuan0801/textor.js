import { EditorBlock } from "../EditorBlock/EditorBlock";
import { normalTextConverter } from "../../Cursor/utilts";
import { setCursorPos } from "../../Cursor/CursorManager";
import { CursorPos } from "../../Cursor/ICursorManager";
import {
  ITextBlock,
  ITextBlockContent, TEXT_BLOCK_ACTION,
  TEXT_STYLE_ACTION,
  TEXT_TYPE,
} from "./ITextBlock";
import {
  blockContentDeepClone,
  checkInSelection,
  findFirstContent,
  generateNewContent,
} from "../utils";
import { LinkedList } from "../../../utils/LinkedList/LinkedList";
import { LinkedListNode } from "../../../utils/LinkedList/LinkedListNode";
import { IEditorBlock } from "../EditorBlock/IEditorBlock";

export class TextBlock extends EditorBlock implements IEditorBlock, ITextBlock {
  history: LinkedList<ITextBlockContent[]>;
  historyPtr: number;
  currentEra: LinkedListNode<ITextBlockContent[]>;
  prevAction: TEXT_BLOCK_ACTION;

  constructor(key, type, blockContents) {
    super(key, type, blockContents);
    this.history = new LinkedList<ITextBlockContent[]>(blockContents);
    this.currentEra = this.history.head.next;
    this.historyPtr = 0;
    this.prevAction = null;
  }

  setFocused(position: CursorPos): void {
    setCursorPos(this.ref, position);
  }

  setPrevAction(newAction: TEXT_BLOCK_ACTION): void {
    this.prevAction = newAction;
  }

  getPrevAction(): TEXT_BLOCK_ACTION | TEXT_STYLE_ACTION {
    return this.prevAction;
  }

  getTotalContentLength(): number {
    let totalLength = 0;
    this.blockContents.forEach((blockContent) => {
      totalLength = totalLength + blockContent.textContent.length;
    });
    return totalLength;
  }

  sync(currentContent: HTMLElement): void {
    const newRenderBlockContent: ITextBlockContent[] = [];
    const childNodes = currentContent.childNodes;
    childNodes.forEach((child) => {
      if (child.nodeName === "#text") {
        newRenderBlockContent.push({
          textType: TEXT_TYPE.normal,
          textContent: normalTextConverter(child.textContent),
          isMarked: false,
          isBold: false,
          isUnderline: false,
        });
      } else if (child.nodeName === "MARK") {
        const isBold = child.childNodes[0].nodeName === "B";
        const isUnderline =
          child.childNodes[0]?.childNodes[0]?.nodeName === "U";
        newRenderBlockContent.push({
          textType: TEXT_TYPE.normal,
          textContent: normalTextConverter(child.textContent),
          isMarked: true,
          isBold: isBold,
          isUnderline: isUnderline,
        });
      } else if (child.nodeName === "B") {
        const isUnderline = child.childNodes[0].nodeName === "U";
        newRenderBlockContent.push({
          textType: TEXT_TYPE.normal,
          textContent: normalTextConverter(child.textContent),
          isMarked: false,
          isBold: true,
          isUnderline: isUnderline,
        });
      } else if (child.nodeName === "U") {
        newRenderBlockContent.push({
          textType: TEXT_TYPE.normal,
          textContent: normalTextConverter(child.textContent),
          isMarked: false,
          isBold: false,
          isUnderline: true,
        });
      } else if (child.nodeName === "A") {
        newRenderBlockContent.push({
          textType: TEXT_TYPE.normal,
          textContent: normalTextConverter(child.textContent),
          // @ts-ignore
          linkHref: child.getAttribute("href"),
          isMarked: false,
          isBold: false,
          isUnderline: false,
        });
      }
    });
    this.blockContents = newRenderBlockContent;
    console.log(newRenderBlockContent.slice());
  }

  recordHistory(): void {
    console.log(this.history);
    if (this.historyPtr !== this.history.length - 1) {
      const newEraNode = new LinkedListNode(
        blockContentDeepClone(this.getContents())
      );
      console.log(
        "new route",
        blockContentDeepClone(this.currentEra.val),
        blockContentDeepClone(this.getContents())
      );
      this.currentEra.next = newEraNode;
      newEraNode.prev = this.currentEra;
      newEraNode.next = this.history.tail;
      this.history.tail.prev = newEraNode;
      this.currentEra = newEraNode;
    } else {
      this.history.append(blockContentDeepClone(this.getContents()));
      this.currentEra = this.currentEra.next;
    }
    this.historyPtr++;
    console.log("current era", this.currentEra);
  }

  undoHistory(): void {
    if (this.historyPtr === 0) {
      return;
    }
    this.historyPtr--;
    this.currentEra = this.currentEra.prev;
    this.setContent(blockContentDeepClone(this.currentEra.val));
    console.log("current era", this.currentEra);
  }

  redoHistory(): void {
    if (this.historyPtr === this.history.length - 1) {
      return;
    }
    this.historyPtr++;
    this.currentEra = this.currentEra.next;
    this.setContent(blockContentDeepClone(this.currentEra.val));
    console.log("current era", this.currentEra);
  }

  makeBlockContent(
    contentIndex: number,
    contentStart: number,
    selectionStart: number,
    selectionEnd: number,
    newType: TEXT_STYLE_ACTION
  ): void {
    const blockContent = this.getContents();
    const targetContent = blockContent[contentIndex];
    const contentEnd =
      contentStart + blockContent[contentIndex].textContent.length;
    if (selectionStart <= contentStart && selectionEnd >= contentEnd) {
      if (newType === TEXT_STYLE_ACTION.bold) {
        targetContent.isBold = true;
      } else if (newType === TEXT_STYLE_ACTION.marked) {
        targetContent.isMarked = true;
      } else if (newType === TEXT_STYLE_ACTION.unbold) {
        targetContent.isBold = false;
      } else if (newType === TEXT_STYLE_ACTION.unmarked) {
        targetContent.isMarked = false;
      } else if (newType === TEXT_STYLE_ACTION.underline) {
        targetContent.isUnderline = true;
      } else if (newType === TEXT_STYLE_ACTION.removeUnderline) {
        targetContent.isUnderline = false;
      }
    } else if (
      contentStart <= selectionStart &&
      contentEnd <= selectionEnd &&
      contentEnd - 1 >= selectionStart
    ) {
      const newContentText = targetContent.textContent.slice(
        selectionStart - contentStart
      );
      targetContent.textContent = targetContent.textContent.slice(
        0,
        selectionStart - contentStart
      );
      const newContent = generateNewContent(
        targetContent,
        newContentText,
        newType
      );
      blockContent.splice(contentIndex + 1, 0, newContent);
    } else if (
      selectionStart <= contentStart &&
      selectionEnd - 1 >= contentStart &&
      selectionEnd <= contentEnd
    ) {
      const newContentText = targetContent.textContent.slice(
        0,
        selectionEnd - contentStart
      );
      targetContent.textContent = targetContent.textContent.slice(
        selectionEnd - contentStart
      );
      const newContent = generateNewContent(
        targetContent,
        newContentText,
        newType
      );
      blockContent.splice(contentIndex, 0, newContent);
    } else if (contentStart <= selectionStart && contentEnd >= selectionEnd) {
      const targetText = targetContent.textContent;
      const newContentText = targetText.slice(
        selectionStart - contentStart,
        selectionEnd - contentStart
      );
      const newContent = generateNewContent(
        targetContent,
        newContentText,
        newType
      );
      const thirdContent: ITextBlockContent = {
        textContent: targetText.slice(selectionEnd - contentStart),
        textType: TEXT_TYPE.normal,
        isMarked: targetContent.isMarked,
        isBold: targetContent.isBold,
        isUnderline: targetContent.isUnderline,
      };
      targetContent.textContent = targetContent.textContent.slice(
        0,
        selectionStart - contentStart
      );
      blockContent.splice(contentIndex + 1, 0, newContent, thirdContent);
    }
    this.setContent(blockContent);
  }

  getCopiedText(
    contentIndex: number,
    contentStart: number,
    selectionStart: number,
    selectionEnd: number
  ): ITextBlockContent | undefined {
    const blockContent = this.getContents();
    const targetContent = blockContent[contentIndex];
    const contentEnd =
      contentStart + blockContent[contentIndex].textContent.length;
    if (selectionStart <= contentStart && selectionEnd >= contentEnd) {
      console.log("case 1");
      return targetContent;
    } else if (
      contentStart <= selectionStart &&
      contentEnd <= selectionEnd &&
      contentEnd - 1 >= selectionStart
    ) {
      console.log("case 2");
      const newContentText = targetContent.textContent.slice(
        selectionStart - contentStart
      );
      return generateNewContent(targetContent, newContentText);
    } else if (
      selectionStart <= contentStart &&
      selectionEnd - 1 >= contentStart &&
      selectionEnd <= contentEnd
    ) {
      console.log("case 3");
      const newContentText = targetContent.textContent.slice(
        0,
        selectionEnd - contentStart
      );
      return generateNewContent(targetContent, newContentText);
    } else if (contentStart <= selectionStart && contentEnd >= selectionEnd) {
      console.log("case 4");
      const targetText = targetContent.textContent;
      const newContentText = targetText.slice(
        selectionStart - contentStart,
        selectionEnd - contentStart
      );
      return generateNewContent(targetContent, newContentText);
    }
  }

  copySelectedText(startIndex: number, endIndex: number): ITextBlockContent[] {
    const currentContent = this.getContents();
    let {
      firstContentStart: leftBound,
      firstContentIndex: currentContentIndex,
    } = findFirstContent(startIndex, currentContent);
    const selectedTexts = [];
    while (
      currentContent[currentContentIndex] &&
      checkInSelection(
        leftBound,
        leftBound + currentContent[currentContentIndex]?.textContent.length,
        startIndex,
        endIndex
      )
    ) {
      selectedTexts.push(
        this.getCopiedText(currentContentIndex, leftBound, startIndex, endIndex)
      );
      leftBound += currentContent[currentContentIndex].textContent.length;
      currentContentIndex++;
    }
    return selectedTexts;
  }

  markSelectedText(
    type: TEXT_STYLE_ACTION,
    startIndex: number,
    endIndex: number
  ): void {
    const currentContent = this.getContents();
    let {
      firstContentStart: leftBound,
      firstContentIndex: currentContentIndex,
    } = findFirstContent(startIndex, currentContent);
    while (
      currentContent[currentContentIndex] &&
      checkInSelection(
        leftBound,
        leftBound + currentContent[currentContentIndex]?.textContent.length,
        startIndex,
        endIndex
      )
    ) {
      const currentContentOriginLength =
        currentContent[currentContentIndex].textContent.length;
      const rightBound = leftBound + currentContentOriginLength;
      this.makeBlockContent(
        currentContentIndex,
        leftBound,
        startIndex,
        endIndex,
        type
      );
      if (startIndex <= leftBound && rightBound <= endIndex) {
        console.log("+1 loader");
        currentContentIndex++;
      } else if (
        leftBound <= startIndex &&
        rightBound <= endIndex &&
        rightBound >= startIndex
      ) {
        console.log("+2 loaded");
        currentContentIndex += 2;
      } else if (leftBound <= startIndex && rightBound >= endIndex) {
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

  insertBlockContents(newContents: ITextBlockContent[], index: number): void {
    const blockContents = this.getContents();
    if (blockContents.length === 0) {
      this.setContent(newContents);
      return;
    }
    const { firstContentIndex, firstContentStart } = findFirstContent(
      index,
      blockContents,
      true
    );
    if (firstContentIndex === -1) {
      this.setContent([...blockContents, ...newContents]);
      return;
    }
    const targetContent = blockContents[firstContentIndex];
    const targetContentText = targetContent.textContent;
    const firstHalfText = targetContentText.slice(0, index - firstContentStart);
    const firstHalfContent = generateNewContent(targetContent, firstHalfText);
    const secondHalfText = targetContentText.slice(index - firstContentStart);
    const secondHalfContent = generateNewContent(targetContent, secondHalfText);
    const newContentsArray: ITextBlockContent[] = [];
    if (firstHalfText.length > 0) {
      newContentsArray.push(firstHalfContent);
    }
    newContentsArray.push(...newContents);
    if (secondHalfText.length > 0) {
      newContentsArray.push(secondHalfContent);
    }
    blockContents.splice(firstContentIndex, 1, ...newContentsArray);
    this.setContent(blockContents);
  }
}
