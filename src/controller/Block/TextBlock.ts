import { EditorBlock } from "./EditorBlock";
import { normalTextConverter } from "../Cursor/utilts";
import { setCursorPos } from "../Cursor/CursorManager";
import { CursorPos } from "../Cursor/ICursorManager";
import { blockContent, TEXT_STYLE_ACTION, TEXT_TYPE } from "./IEditorBlock";
import {
  checkInSelection,
  findFirstContent,
  generateNewContent,
} from "./utils";

export class TextBlock extends EditorBlock {
  constructor(key, type, blockContents, ref?) {
    super(key, type, blockContents, ref);
  }

  setFocused(position: CursorPos): void {
    setCursorPos(this.ref, position);
  }

  sync(currentContent: HTMLElement): void {
    const newRenderBlockContent: blockContent[] = [];
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
          textType: TEXT_TYPE.link,
          textContent: normalTextConverter(child.textContent),
          // @ts-ignore
          linkHref: child.getAttribute("href"),
          isMarked: false,
          isBold: false,
        });
      }
    });
    this.blockContents = newRenderBlockContent;
  }

  makeBlockContent(
    contentIndex: number,
    contentStart: number,
    selectionStart: number,
    selectionEnd: number,
    newType: TEXT_STYLE_ACTION
  ) {
    const blockContent = this.getContents();
    const targetContent = blockContent[contentIndex];
    const contentEnd =
      contentStart + blockContent[contentIndex].textContent.length;
    if (selectionStart <= contentStart && selectionEnd >= contentEnd) {
      console.log("case 1");
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
      console.log("case 2");
      const newContentText = targetContent.textContent.slice(
        selectionStart - contentStart
      );
      console.log(newContentText, contentStart, selectionStart);
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
      console.log("case 3");
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
      console.log("case 4");
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
      const thirdContent: blockContent = {
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
      console.log(thirdContent);
      blockContent.splice(contentIndex + 1, 0, newContent, thirdContent);
    }
    this.setContent(blockContent);
  }

  getCopiedText(
    contentIndex: number,
    contentStart: number,
    selectionStart: number,
    selectionEnd: number
  ): blockContent | undefined {
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

  copySelectedText(startIndex: number, endIndex: number): blockContent[] {
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
  ) {
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
      console.log("in while", currentContent[currentContentIndex]);
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
      console.log("new leftbound", leftBound);
    }
  }

  insertBlockContents(newContents: blockContent[], index: number) {
    console.log(index);
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
    console.log(blockContents[firstContentIndex]);
    const targetContent = blockContents[firstContentIndex];
    const targetContentText = targetContent.textContent;
    const firstHalfText = targetContentText.slice(0, index - firstContentStart);
    const firstHalfContent = generateNewContent(targetContent, firstHalfText);
    const secondHalfText = targetContentText.slice(index - firstContentStart);
    const secondHalfContent = generateNewContent(targetContent, secondHalfText);
    const newContentsArray: blockContent[] = [];
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
