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
  }

  makeBlockContent(
    contentIndex: number,
    contentStart: number,
    selectionStart: number,
    selectionEnd: number,
    newType: TEXT_STYLE
  ) {
    console.log(contentStart);
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
        contentStart - selectionStart
      );
      targetContent.textContent = targetContent.textContent.slice(
        0,
        contentStart - selectionStart
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
      this.setContent(blockContent);
    }
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
      const rightBound =
        leftBound + currentContent[currentContentIndex].textContent.length;
      console.log("in while", currentContent[currentContentIndex]);
      this.makeBlockContent(
        currentContentIndex,
        leftBound,
        startIndex,
        endIndex,
        type
      );
      if (
        leftBound <= startIndex &&
        rightBound <= endIndex &&
        rightBound >= startIndex
      ) {
        console.log("+2 loaded");
        currentContentIndex += 2;
      } else if (leftBound <= startIndex && rightBound >= endIndex) {
        console.log("+4 loaded");
        currentContentIndex += 3;
      } else {
        console.log("+1 loaded");
        currentContentIndex++;
      }
      leftBound += currentContent[currentContentIndex]?.textContent.length;
    }
  }

  blockTypesManipulation(start, end, type): any {
    let startIndex: number = 0;
    let totalLength: number = 0;
    let found: boolean = false;
    const blockContents: blockContent[] = this.getContents();
    while (startIndex < blockContents.length - 1 && !found) {
      if (
        totalLength <= start &&
        start < totalLength + blockContents[startIndex].textContent.length
      ) {
        found = true;
      } else {
        totalLength += blockContents[startIndex].textContent.length;
        startIndex++;
      }
    }
    console.log("starting at ", startIndex);
    let loopIndex = startIndex;
    if (found) {
      let finished: boolean = false;
      let removeStartIndex = false;
      let deleteCount = 0;
      let newBlocksContent: string = "";
      let leftOverBlock;
      while (!finished) {
        const blockContentEnd =
          blockContents[loopIndex].textContent.length + totalLength;
        const newContentBlockStart = Math.max(start, totalLength) - totalLength;
        const newContentBlockEnd = Math.min(end, blockContentEnd) - totalLength;
        newBlocksContent = newBlocksContent.concat(
          blockContents[loopIndex].textContent.slice(
            newContentBlockStart,
            newContentBlockEnd
          )
        );
        const originBlockContent: string = blockContents[loopIndex].textContent;
        if (totalLength < start) {
          blockContents[loopIndex].textContent = blockContents[
            loopIndex
          ].textContent.slice(0, start - totalLength);
        } else {
          removeStartIndex = true;
        }
        if (end <= blockContentEnd) {
          if (end < blockContentEnd) {
            leftOverBlock = {
              textType: blockContents[loopIndex].textType,
              textContent: originBlockContent.slice(end - totalLength),
            };
          }
          if (loopIndex !== startIndex) {
            deleteCount++;
          }
          finished = true;
        } else {
          if (start === totalLength && blockContentEnd < end) {
            if (loopIndex !== startIndex) {
              deleteCount++;
            }
          }
          totalLength =
            totalLength + blockContents[loopIndex].textContent.length;
          start = totalLength;
          loopIndex++;
        }
      }
      console.log(
        "deleteCount 删除",
        blockContents.splice(startIndex + 1, deleteCount)
      );
      console.log(
        "newBlocks",
        newBlocksContent,
        blockContents.slice(),
        deleteCount
      );
      const blockInserted = leftOverBlock
        ? [{ textType: type, textContent: newBlocksContent }, leftOverBlock]
        : [{ textType: type, textContent: newBlocksContent }];
      // @ts-ignore
      blockContents.splice(startIndex + 1, 0, ...blockInserted);
      if (removeStartIndex) {
        console.log("start删除", blockContents.splice(startIndex, 1));
      }

      return blockContents;
    }
  }

  // renderBlock(): String {
  //   let htmlString = "";
  //   const parser = new DOMParser();
  //   this.blockContents.forEach((content) => {
  //     if (content.textType === TEXT_TYPE.normal) {
  //       htmlString = htmlString.concat(content.textContent);
  //     } else if (content.textType === TEXT_TYPE.bold) {
  //       const boldHtmlString = `<b>${content.textContent}</b>`;
  //       htmlString = htmlString.concat(boldHtmlString);
  //     } else if (content.textType === TEXT_TYPE.link) {
  //       const linkHtmlString = `<a href="${content.linkHref}" contentEditable={false}>${content.textContent}</a>`;
  //       htmlString = htmlString.concat(linkHtmlString);
  //     } else if (content.textType === TEXT_TYPE.mark) {
  //       const markHtmlString = `<mark>${content.textContent}</mark>`;
  //       htmlString = htmlString.concat(markHtmlString);
  //     }
  //   });
  //   return htmlString;
  // }
}
