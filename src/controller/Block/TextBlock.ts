import { EditorBlock } from "./EditorBlock";
import { normalTextConverter } from "../Cursor/utilts";
import {setCursorPos} from "../Cursor/CursorManager";
import {CursorPos} from "../Cursor/ICursorManager";
import {blockContent} from "./IEditorBlock";

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
          textType: "normal",
          textContent: normalTextConverter(child.textContent),
        });
      } else if (child.nodeName === "MARK") {
        newRenderBlockContent.push({
          textType: "mark",
          textContent: normalTextConverter(child.textContent),
        });
      } else if (child.nodeName === "B") {
        newRenderBlockContent.push({
          textType: "bold",
          textContent: normalTextConverter(child.textContent),
        });
      } else if (child.nodeName === "A") {
        newRenderBlockContent.push({
          textType: "link",
          textContent: normalTextConverter(child.textContent),
          // @ts-ignore
          linkHref: child.getAttribute("href"),
        });
      }
    });
    // @ts-ignore
    this.blockContents = newRenderBlockContent;
  }

  blockTypesManipulation(start, end, type): any {
    let startIndex: number = 0;
    let totalLength: number = 0;
    let found: boolean = false;
    const blockContents: blockContent[] = this.getContent();
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

  renderBlock(): String {
    let htmlString = "";
    const parser = new DOMParser();
    this.blockContents.forEach((content) => {
      if (content.textType === "normal") {
        htmlString = htmlString.concat(content.textContent);
      } else if (content.textType === "bold") {
        const boldHtmlString = `<b>${content.textContent}</b>`;
        htmlString = htmlString.concat(boldHtmlString);
      } else if (content.textType === "link") {
        const linkHtmlString = `<a href="${content.linkHref}" contentEditable={false}>${content.textContent}</a>`;
        htmlString = htmlString.concat(linkHtmlString);
      } else if (content.textType === "mark") {
        const markHtmlString = `<mark>${content.textContent}</mark>`;
        htmlString = htmlString.concat(markHtmlString);
      }
    });
    return htmlString;
  }
}
