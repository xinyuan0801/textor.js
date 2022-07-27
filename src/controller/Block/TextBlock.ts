import { EditorBlock } from "./EditorBlock";
import { normalTextConverter } from "../Cursor/utilts";
import { setCursorPos } from "../Cursor/CursorManager";
import { CursorPos } from "../Cursor/ICursorManager";
import { blockContent, TEXT_STYLE, TEXT_TYPE } from "./IEditorBlock";
import { checkInSelection } from "./utils";

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
        });
      } else if (child.nodeName === "MARK") {
        const isBold = child.childNodes[0].nodeName === "B";
        newRenderBlockContent.push({
          textType: TEXT_TYPE.normal,
          textContent: normalTextConverter(child.textContent),
          isMarked: true,
          isBold: isBold,
        });
      } else if (child.nodeName === "B") {
        newRenderBlockContent.push({
          textType: TEXT_TYPE.normal,
          textContent: normalTextConverter(child.textContent),
          isMarked: false,
          isBold: true,
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
    console.log("new content", newRenderBlockContent);
  }

  makeBlockContent(
    contentIndex: number,
    contentStart: number,
    selectionStart: number,
    selectionEnd: number,
    newType: TEXT_STYLE
  ) {
    const blockContent = this.getContents();
    const targetContent = blockContent[contentIndex];
    const contentEnd =
      contentStart + blockContent[contentIndex].textContent.length;
    if (selectionStart <= contentStart && selectionEnd >= contentEnd) {
      console.log("case 1");
      if (newType === TEXT_STYLE.bold) {
        targetContent.isBold = true;
      } else if (newType === TEXT_STYLE.marked) {
        targetContent.isMarked = true;
      }
    } else if (
      contentStart <= selectionStart &&
      contentEnd <= selectionEnd &&
      contentEnd >= selectionStart
    ) {
      console.log("case 2");
      const selectedText = targetContent.textContent.slice(
        selectionStart - contentStart
      );
      console.log(selectedText, contentStart, selectionStart);
      targetContent.textContent = targetContent.textContent.slice(
        0,
        selectionStart - contentStart
      );
      const newContent: blockContent = {
        textContent: selectedText,
        textType: TEXT_TYPE.normal,
        isMarked: targetContent.isMarked,
        isBold: targetContent.isBold,
      };
      if (newType === TEXT_STYLE.bold) {
        newContent.isBold = true;
      } else if (newType === TEXT_STYLE.marked) {
        newContent.isMarked = true;
      }
      blockContent.splice(contentIndex + 1, 0, newContent);
    } else if (
      selectionStart <= contentStart &&
      selectionEnd >= contentStart &&
      selectionEnd <= contentEnd
    ) {
      console.log("case 3");
      const selectedText = targetContent.textContent.slice(
        0,
        selectionEnd - contentStart
      );
      targetContent.textContent = targetContent.textContent.slice(
        selectionEnd - contentStart
      );
      const newContent: blockContent = {
        textContent: selectedText,
        textType: TEXT_TYPE.normal,
        isMarked: targetContent.isMarked,
        isBold: targetContent.isBold,
      };
      if (newType === TEXT_STYLE.bold) {
        newContent.isBold = true;
      } else if (newType === TEXT_STYLE.marked) {
        newContent.isMarked = true;
      }
      blockContent.splice(contentIndex, 0, newContent);
    } else if (contentStart <= selectionStart && contentEnd >= selectionEnd) {
      console.log("case 4");
      const targetText = targetContent.textContent;
      const newContentText = targetText.slice(
        selectionStart - contentStart,
        selectionEnd - contentStart
      );
      const newContent: blockContent = {
        textContent: newContentText,
        textType: TEXT_TYPE.normal,
        isMarked: targetContent.isMarked,
        isBold: targetContent.isBold,
      };
      if (newType === TEXT_STYLE.bold) {
        newContent.isBold = true;
      } else if (newType === TEXT_STYLE.marked) {
        newContent.isMarked = true;
      }
      const thirdContent: blockContent = {
        textContent: targetText.slice(selectionEnd - contentStart),
        textType: TEXT_TYPE.normal,
        isMarked: targetContent.isMarked,
        isBold: targetContent.isBold,
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

  markSelectedText(type: TEXT_STYLE, startIndex: number, endIndex: number) {
    const currentContent = this.getContents();
    let firstContent: blockContent;
    let currentContentStart = 0;
    let currentContentIndex = 0;
    for (let i = 0; i < currentContent.length; i++) {
      const currentContentEnd =
        currentContentStart + currentContent[i].textContent.length;
      if (
        currentContentStart <= startIndex &&
        startIndex <= currentContentEnd
      ) {
        firstContent = currentContent[i];
        currentContentIndex = i;
        break;
      }
      currentContentStart += currentContent[i].textContent.length;
    }
    let leftBound = currentContentStart;
    while (
      currentContent[currentContentIndex] &&
      checkInSelection(
        leftBound,
        leftBound + currentContent[currentContentIndex]?.textContent.length,
        startIndex,
        endIndex
      )
    ) {
      const currentContentOriginLength = currentContent[currentContentIndex].textContent.length
      const rightBound =
        leftBound + currentContentOriginLength;
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
      }
      else if (
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
      console.log('new leftbound', leftBound);
    }
  }
}
